import { database } from '../config/database';
import { students } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { logger } from '../config/logger';

// XP rewards for different actions
export const XP_REWARDS = {
    COMPLETE_LESSON: 50,
    SUBMIT_ASSIGNMENT: 30,
    CORRECT_ANSWER: 10,
    ATTENDANCE: 20,
    STREAK_BONUS_7_DAYS: 100,
    STREAK_BONUS_30_DAYS: 500,
    MEMORIZE_VERSE: 25,
    MEMORIZE_PAGE: 250,
    MEMORIZE_JUZ: 2500,
    PERFECT_TAJWEED: 75,
    COMPETITION_WIN: 300,
    COMPETITION_TOP_3: 150,
    DAILY_LOGIN: 5,
    COMPLETE_GOAL: 100,
};

// Level thresholds (XP required for each level)
export const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    300,    // Level 3
    600,    // Level 4
    1000,   // Level 5
    1500,   // Level 6
    2200,   // Level 7
    3000,   // Level 8
    4000,   // Level 9
    5200,   // Level 10
    6600,   // Level 11
    8200,   // Level 12
    10000,  // Level 13
    12000,  // Level 14
    14500,  // Level 15
    17500,  // Level 16
    21000,  // Level 17
    25000,  // Level 18
    30000,  // Level 19
    36000,  // Level 20
    43000,  // Level 21
    51000,  // Level 22
    60000,  // Level 23
    70000,  // Level 24
    82000,  // Level 25
    95000,  // Level 26
    110000, // Level 27
    128000, // Level 28
    150000, // Level 29
    175000, // Level 30 (Hafiz Master)
];

// Badge definitions
export const BADGES = {
    FIRST_STEPS: { id: 'first_steps', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', xpReward: 50 },
    WEEK_WARRIOR: { id: 'week_warrior', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 100 },
    MONTH_MASTER: { id: 'month_master', name: 'Month Master', description: 'Maintain a 30-day streak', icon: '🏆', xpReward: 500 },
    SURAH_STARTER: { id: 'surah_starter', name: 'Surah Starter', description: 'Memorize your first surah', icon: '📖', xpReward: 100 },
    JUZ_CHAMPION: { id: 'juz_champion', name: 'Juz Champion', description: 'Memorize a complete juz', icon: '🌟', xpReward: 1000 },
    TAJWEED_EXPERT: { id: 'tajweed_expert', name: 'Tajweed Expert', description: 'Get 10 perfect tajweed scores', icon: '🎤', xpReward: 200 },
    EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', description: 'Login before Fajr 5 times', icon: '🌅', xpReward: 75 },
    COMPETITION_WINNER: { id: 'competition_winner', name: 'Competition Winner', description: 'Win a Quran competition', icon: '🥇', xpReward: 300 },
    CONSISTENT_LEARNER: { id: 'consistent_learner', name: 'Consistent Learner', description: 'Complete 100 lessons', icon: '📚', xpReward: 250 },
    HAFIZ_JOURNEY: { id: 'hafiz_journey', name: 'Hafiz Journey', description: 'Memorize 5 juz', icon: '🌙', xpReward: 2500 },
    HALF_QURAN: { id: 'half_quran', name: 'Half Quran', description: 'Memorize 15 juz', icon: '⭐', xpReward: 5000 },
    HAFIZ: { id: 'hafiz', name: 'Hafiz', description: 'Complete Quran memorization', icon: '👑', xpReward: 10000 },
};

export const gamificationService = {
    /**
     * Calculate level from XP
     */
    calculateLevel(xp: number): number {
        let level = 1;
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (xp >= LEVEL_THRESHOLDS[i]) {
                level = i + 1;
                break;
            }
        }
        return Math.min(level, 30);
    },

    /**
     * Get XP required for next level
     */
    getXPForNextLevel(currentLevel: number): number {
        if (currentLevel >= 30) return 0;
        return LEVEL_THRESHOLDS[currentLevel];
    },

    /**
     * Get progress percentage to next level
     */
    getLevelProgress(xp: number, level: number): number {
        if (level >= 30) return 100;
        const currentLevelXP = LEVEL_THRESHOLDS[level - 1];
        const nextLevelXP = LEVEL_THRESHOLDS[level];
        const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        return Math.min(Math.max(progress, 0), 100);
    },

    /**
     * Award XP to a student
     */
    async awardXP(studentId: string, action: keyof typeof XP_REWARDS, multiplier: number = 1): Promise<{
        xpAwarded: number;
        newXP: number;
        newLevel: number;
        leveledUp: boolean;
        previousLevel: number;
    }> {
        const db = database.getDb();

        // Get current student data
        const studentResult = await db.select().from(students).where(eq(students.id, studentId)).limit(1);

        if (studentResult.length === 0) {
            throw new Error('Student not found');
        }

        const student = studentResult[0] as any;
        const currentXP = student.xp || 0;
        const currentLevel = student.level || 1;

        const xpAwarded = Math.floor(XP_REWARDS[action] * multiplier);
        const newXP = currentXP + xpAwarded;
        const newLevel = this.calculateLevel(newXP);
        const leveledUp = newLevel > currentLevel;

        // Update student
        await db.update(students)
            .set({
                xp: newXP,
                level: newLevel,
                updatedAt: new Date()
            } as any)
            .where(eq(students.id, studentId));

        logger.info(`Awarded ${xpAwarded} XP to student ${studentId} for ${action}. New XP: ${newXP}, Level: ${newLevel}`);

        return {
            xpAwarded,
            newXP,
            newLevel,
            leveledUp,
            previousLevel: currentLevel
        };
    },

    /**
     * Update daily streak
     */
    async updateStreak(studentId: string): Promise<{
        streak: number;
        streakBroken: boolean;
        bonusAwarded: boolean;
        xpAwarded: number;
    }> {
        const db = database.getDb();

        const studentResult = await db.select().from(students).where(eq(students.id, studentId)).limit(1);

        if (studentResult.length === 0) {
            throw new Error('Student not found');
        }

        const student = studentResult[0] as any;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActivity = student.lastActivityDate ? new Date(student.lastActivityDate) : null;
        if (lastActivity) lastActivity.setHours(0, 0, 0, 0);

        let newStreak = student.streak || 0;
        let streakBroken = false;
        let bonusAwarded = false;
        let xpAwarded = 0;

        if (!lastActivity) {
            // First activity ever
            newStreak = 1;
        } else {
            const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day, no change
            } else if (daysDiff === 1) {
                // Consecutive day
                newStreak += 1;

                // Check for streak bonuses
                if (newStreak === 7) {
                    const result = await this.awardXP(studentId, 'STREAK_BONUS_7_DAYS');
                    xpAwarded = result.xpAwarded;
                    bonusAwarded = true;
                } else if (newStreak === 30) {
                    const result = await this.awardXP(studentId, 'STREAK_BONUS_30_DAYS');
                    xpAwarded = result.xpAwarded;
                    bonusAwarded = true;
                }
            } else {
                // Streak broken
                streakBroken = true;
                newStreak = 1;
            }
        }

        // Daily login XP
        if (lastActivity?.getTime() !== today.getTime()) {
            const loginResult = await this.awardXP(studentId, 'DAILY_LOGIN');
            xpAwarded += loginResult.xpAwarded;
        }

        // Update student
        await db.update(students)
            .set({
                streak: newStreak,
                lastActivityDate: today,
                updatedAt: new Date()
            } as any)
            .where(eq(students.id, studentId));

        logger.info(`Updated streak for student ${studentId}: ${newStreak} days`);

        return {
            streak: newStreak,
            streakBroken,
            bonusAwarded,
            xpAwarded
        };
    },

    /**
     * Get student stats
     */
    async getStudentStats(studentId: string): Promise<{
        xp: number;
        level: number;
        levelProgress: number;
        xpToNextLevel: number;
        streak: number;
        lastActivityDate: Date | null;
    }> {
        const db = database.getDb();

        const studentResult = await db.select().from(students).where(eq(students.id, studentId)).limit(1);

        if (studentResult.length === 0) {
            throw new Error('Student not found');
        }

        const student = studentResult[0] as any;
        const xp = student.xp || 0;
        const level = student.level || 1;

        return {
            xp,
            level,
            levelProgress: this.getLevelProgress(xp, level),
            xpToNextLevel: this.getXPForNextLevel(level) - xp,
            streak: student.streak || 0,
            lastActivityDate: student.lastActivityDate || null
        };
    },

    /**
     * Get leaderboard
     */
    async getLeaderboard(type: 'xp' | 'streak' = 'xp', limit: number = 10): Promise<Array<{
        rank: number;
        studentId: string;
        firstName: string;
        lastName: string;
        xp: number;
        level: number;
        streak: number;
    }>> {
        const db = database.getDb();

        const orderColumn = type === 'xp' ? 'xp' : 'streak';

        const result = await db.select({
            id: students.id,
            firstName: students.firstName,
            lastName: students.lastName,
            xp: sql<number>`COALESCE(${students}.xp, 0)`,
            level: sql<number>`COALESCE(${students}.level, 1)`,
            streak: sql<number>`COALESCE(${students}.streak, 0)`,
        })
            .from(students)
            .orderBy(desc(sql`COALESCE(${students}.${sql.raw(orderColumn)}, 0)`))
            .limit(limit);

        return result.map((row, index) => ({
            rank: index + 1,
            studentId: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            xp: row.xp || 0,
            level: row.level || 1,
            streak: row.streak || 0
        }));
    },

    /**
     * Get available badges
     */
    getAvailableBadges() {
        return Object.values(BADGES);
    },

    /**
     * Get XP rewards configuration
     */
    getXPRewards() {
        return XP_REWARDS;
    },

    /**
     * Get level thresholds
     */
    getLevelThresholds() {
        return LEVEL_THRESHOLDS;
    }
};
