import { logger } from '../config/logger';
import { gamificationService } from './gamificationService';

/**
 * Goals Service - Daily/Weekly goal setting and tracking
 */

export type GoalType = 'daily' | 'weekly';
export type GoalCategory = 'verses' | 'minutes' | 'pages' | 'lessons' | 'practice';

export interface Goal {
    id: string;
    studentId: string;
    type: GoalType;
    category: GoalCategory;
    target: number;
    current: number;
    startDate: Date;
    endDate: Date;
    completed: boolean;
    completedAt?: Date;
    xpAwarded: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface GoalProgress {
    daily: {
        goals: Goal[];
        totalGoals: number;
        completedGoals: number;
        percentComplete: number;
    };
    weekly: {
        goals: Goal[];
        totalGoals: number;
        completedGoals: number;
        percentComplete: number;
    };
    streak: number;
}

// In-memory storage (replace with DB in production)
const goalsStore: Map<string, Goal[]> = new Map();

// XP rewards for goal completion
const GOAL_XP_REWARDS = {
    daily: 50,
    weekly: 200,
};

// Goal category labels
export const GOAL_CATEGORIES = {
    verses: { label: 'Verses Memorized', unit: 'verses', icon: '📖' },
    minutes: { label: 'Practice Time', unit: 'minutes', icon: '⏱️' },
    pages: { label: 'Pages Reviewed', unit: 'pages', icon: '📄' },
    lessons: { label: 'Lessons Completed', unit: 'lessons', icon: '📚' },
    practice: { label: 'Practice Sessions', unit: 'sessions', icon: '🎯' },
};

export const goalsService = {
    /**
     * Create a new goal
     */
    async createGoal(data: {
        studentId: string;
        type: GoalType;
        category: GoalCategory;
        target: number;
    }): Promise<Goal> {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        if (data.type === 'daily') {
            endDate.setDate(endDate.getDate() + 1);
        } else {
            endDate.setDate(endDate.getDate() + 7);
        }

        const goal: Goal = {
            id: `goal_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            studentId: data.studentId,
            type: data.type,
            category: data.category,
            target: data.target,
            current: 0,
            startDate,
            endDate,
            completed: false,
            xpAwarded: 0,
            createdAt: now,
            updatedAt: now,
        };

        const studentGoals = goalsStore.get(data.studentId) || [];
        studentGoals.push(goal);
        goalsStore.set(data.studentId, studentGoals);

        logger.info(`Goal created: ${goal.id} for student ${data.studentId}`);
        return goal;
    },

    /**
     * Update goal progress
     */
    async updateProgress(studentId: string, goalId: string, increment: number): Promise<Goal | null> {
        const studentGoals = goalsStore.get(studentId) || [];
        const goalIndex = studentGoals.findIndex(g => g.id === goalId);

        if (goalIndex < 0) {
            throw new Error('Goal not found');
        }

        const goal = studentGoals[goalIndex];

        if (goal.completed) {
            return goal; // Already completed
        }

        goal.current = Math.min(goal.current + increment, goal.target);
        goal.updatedAt = new Date();

        // Check completion
        if (goal.current >= goal.target && !goal.completed) {
            goal.completed = true;
            goal.completedAt = new Date();

            // Award XP
            try {
                const xpResult = await gamificationService.awardXP(studentId, 'COMPLETE_GOAL');
                goal.xpAwarded = xpResult.xpAwarded;
            } catch (error) {
                logger.warn('Could not award XP for goal completion:', error);
            }

            logger.info(`Goal ${goalId} completed by student ${studentId}`);
        }

        studentGoals[goalIndex] = goal;
        goalsStore.set(studentId, studentGoals);

        return goal;
    },

    /**
     * Increment progress by category
     * Use this when student completes an action (e.g., memorize verse, complete lesson)
     */
    async incrementByCategory(studentId: string, category: GoalCategory, amount: number = 1): Promise<Goal[]> {
        const studentGoals = goalsStore.get(studentId) || [];
        const now = new Date();

        const activeGoals = studentGoals.filter(g =>
            g.category === category &&
            !g.completed &&
            new Date(g.endDate) > now
        );

        const updatedGoals: Goal[] = [];
        for (const goal of activeGoals) {
            const updated = await this.updateProgress(studentId, goal.id, amount);
            if (updated) updatedGoals.push(updated);
        }

        return updatedGoals;
    },

    /**
     * Get active goals for a student
     */
    async getActiveGoals(studentId: string): Promise<{ daily: Goal[]; weekly: Goal[] }> {
        const studentGoals = goalsStore.get(studentId) || [];
        const now = new Date();

        const activeGoals = studentGoals.filter(g => new Date(g.endDate) > now);

        return {
            daily: activeGoals.filter(g => g.type === 'daily'),
            weekly: activeGoals.filter(g => g.type === 'weekly'),
        };
    },

    /**
     * Get goal progress summary
     */
    async getProgress(studentId: string): Promise<GoalProgress> {
        const { daily, weekly } = await this.getActiveGoals(studentId);

        const dailyCompleted = daily.filter(g => g.completed).length;
        const weeklyCompleted = weekly.filter(g => g.completed).length;

        return {
            daily: {
                goals: daily,
                totalGoals: daily.length,
                completedGoals: dailyCompleted,
                percentComplete: daily.length > 0 ? (dailyCompleted / daily.length) * 100 : 0,
            },
            weekly: {
                goals: weekly,
                totalGoals: weekly.length,
                completedGoals: weeklyCompleted,
                percentComplete: weekly.length > 0 ? (weeklyCompleted / weekly.length) * 100 : 0,
            },
            streak: 0, // Would calculate from history
        };
    },

    /**
     * Get suggested goals based on student level
     */
    getSuggestedGoals(level: number): Array<{ category: GoalCategory; daily: number; weekly: number }> {
        // Scale targets based on level
        const multiplier = 1 + (level - 1) * 0.1; // 10% increase per level

        return [
            { category: 'verses', daily: Math.ceil(3 * multiplier), weekly: Math.ceil(15 * multiplier) },
            { category: 'minutes', daily: Math.ceil(20 * multiplier), weekly: Math.ceil(120 * multiplier) },
            { category: 'lessons', daily: Math.ceil(1 * multiplier), weekly: Math.ceil(5 * multiplier) },
            { category: 'practice', daily: Math.ceil(2 * multiplier), weekly: Math.ceil(10 * multiplier) },
        ];
    },

    /**
     * Delete a goal
     */
    async deleteGoal(studentId: string, goalId: string): Promise<boolean> {
        const studentGoals = goalsStore.get(studentId) || [];
        const goalIndex = studentGoals.findIndex(g => g.id === goalId);

        if (goalIndex < 0) {
            return false;
        }

        studentGoals.splice(goalIndex, 1);
        goalsStore.set(studentId, studentGoals);

        return true;
    },

    /**
     * Get goal categories configuration
     */
    getCategories() {
        return GOAL_CATEGORIES;
    }
};
