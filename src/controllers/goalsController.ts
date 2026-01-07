import { Request, Response } from 'express';
import { goalsService, GoalCategory, GoalType } from '../services/goalsService';
import { logger } from '../config/logger';

export const goalsController = {
    /**
     * POST /api/goals
     * Create a new goal
     */
    async createGoal(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, type, category, target } = req.body;

            if (!studentId || !type || !category || !target) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId, type, category, and target are required'
                });
            }

            const goal = await goalsService.createGoal({
                studentId,
                type: type as GoalType,
                category: category as GoalCategory,
                target: parseInt(target),
            });

            return res.json({
                success: true,
                data: goal
            });
        } catch (error: any) {
            logger.error('Error creating goal:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to create goal'
            });
        }
    },

    /**
     * PUT /api/goals/:goalId/progress
     * Update goal progress
     */
    async updateProgress(req: Request, res: Response): Promise<Response> {
        try {
            const { goalId } = req.params;
            const { studentId, increment } = req.body;

            if (!studentId || !increment) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId and increment are required'
                });
            }

            const goal = await goalsService.updateProgress(studentId, goalId, parseInt(increment));

            return res.json({
                success: true,
                data: goal
            });
        } catch (error: any) {
            logger.error('Error updating goal progress:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to update progress'
            });
        }
    },

    /**
     * POST /api/goals/increment
     * Increment progress by category (for automatic tracking)
     */
    async incrementByCategory(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, category, amount } = req.body;

            if (!studentId || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId and category are required'
                });
            }

            const updatedGoals = await goalsService.incrementByCategory(
                studentId,
                category as GoalCategory,
                amount || 1
            );

            return res.json({
                success: true,
                data: {
                    updatedCount: updatedGoals.length,
                    goals: updatedGoals
                }
            });
        } catch (error: any) {
            logger.error('Error incrementing goal:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to increment progress'
            });
        }
    },

    /**
     * GET /api/goals/:studentId
     * Get active goals for a student
     */
    async getActiveGoals(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId } = req.params;

            const goals = await goalsService.getActiveGoals(studentId);

            return res.json({
                success: true,
                data: goals
            });
        } catch (error: any) {
            logger.error('Error getting goals:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get goals'
            });
        }
    },

    /**
     * GET /api/goals/:studentId/progress
     * Get goal progress summary
     */
    async getProgress(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId } = req.params;

            const progress = await goalsService.getProgress(studentId);

            return res.json({
                success: true,
                data: progress
            });
        } catch (error: any) {
            logger.error('Error getting progress:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get progress'
            });
        }
    },

    /**
     * GET /api/goals/suggestions/:level
     * Get suggested goals based on student level
     */
    async getSuggestedGoals(req: Request, res: Response): Promise<Response> {
        try {
            const { level } = req.params;

            const suggestions = goalsService.getSuggestedGoals(parseInt(level) || 1);

            return res.json({
                success: true,
                data: suggestions
            });
        } catch (error: any) {
            logger.error('Error getting suggestions:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get suggestions'
            });
        }
    },

    /**
     * DELETE /api/goals/:studentId/:goalId
     * Delete a goal
     */
    async deleteGoal(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, goalId } = req.params;

            const deleted = await goalsService.deleteGoal(studentId, goalId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Goal not found'
                });
            }

            return res.json({
                success: true,
                message: 'Goal deleted'
            });
        } catch (error: any) {
            logger.error('Error deleting goal:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete goal'
            });
        }
    },

    /**
     * GET /api/goals/categories
     * Get goal categories configuration
     */
    async getCategories(req: Request, res: Response): Promise<Response> {
        try {
            const categories = goalsService.getCategories();

            return res.json({
                success: true,
                data: categories
            });
        } catch (error: any) {
            logger.error('Error getting categories:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get categories'
            });
        }
    }
};
