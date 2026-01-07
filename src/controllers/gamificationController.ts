import { Request, Response } from 'express';
import { gamificationService, XP_REWARDS, BADGES } from '../services/gamificationService';
import { logger } from '../config/logger';

export const gamificationController = {
    /**
     * GET /api/gamification/stats/:studentId
     * Get student's gamification stats
     */
    async getStats(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId } = req.params;

            const stats = await gamificationService.getStudentStats(studentId);

            return res.json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            logger.error('Error getting gamification stats:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get stats'
            });
        }
    },

    /**
     * POST /api/gamification/award-xp
     * Award XP to a student
     */
    async awardXP(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, action, multiplier } = req.body;

            if (!studentId || !action) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId and action are required'
                });
            }

            if (!XP_REWARDS[action as keyof typeof XP_REWARDS]) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid action. Valid actions: ${Object.keys(XP_REWARDS).join(', ')}`
                });
            }

            const result = await gamificationService.awardXP(studentId, action as keyof typeof XP_REWARDS, multiplier || 1);

            return res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            logger.error('Error awarding XP:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to award XP'
            });
        }
    },

    /**
     * POST /api/gamification/update-streak/:studentId
     * Update student's streak
     */
    async updateStreak(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId } = req.params;

            const result = await gamificationService.updateStreak(studentId);

            return res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            logger.error('Error updating streak:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to update streak'
            });
        }
    },

    /**
     * GET /api/gamification/leaderboard
     * Get leaderboard
     */
    async getLeaderboard(req: Request, res: Response): Promise<Response> {
        try {
            const type = (req.query.type as 'xp' | 'streak') || 'xp';
            const limit = parseInt(req.query.limit as string) || 10;

            const leaderboard = await gamificationService.getLeaderboard(type, limit);

            return res.json({
                success: true,
                data: leaderboard
            });
        } catch (error: any) {
            logger.error('Error getting leaderboard:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get leaderboard'
            });
        }
    },

    /**
     * GET /api/gamification/badges
     * Get all available badges
     */
    async getBadges(req: Request, res: Response): Promise<Response> {
        try {
            const badges = gamificationService.getAvailableBadges();

            return res.json({
                success: true,
                data: badges
            });
        } catch (error: any) {
            logger.error('Error getting badges:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get badges'
            });
        }
    },

    /**
     * GET /api/gamification/xp-rewards
     * Get XP rewards configuration
     */
    async getXPRewards(req: Request, res: Response): Promise<Response> {
        try {
            const rewards = gamificationService.getXPRewards();

            return res.json({
                success: true,
                data: rewards
            });
        } catch (error: any) {
            logger.error('Error getting XP rewards:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get XP rewards'
            });
        }
    },

    /**
     * GET /api/gamification/levels
     * Get level thresholds
     */
    async getLevels(req: Request, res: Response): Promise<Response> {
        try {
            const thresholds = gamificationService.getLevelThresholds();

            const levels = thresholds.map((xp, index) => ({
                level: index + 1,
                xpRequired: xp,
                title: getLevelTitle(index + 1)
            }));

            return res.json({
                success: true,
                data: levels
            });
        } catch (error: any) {
            logger.error('Error getting levels:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get levels'
            });
        }
    }
};

// Helper function for level titles
function getLevelTitle(level: number): string {
    if (level <= 5) return 'Beginner';
    if (level <= 10) return 'Learner';
    if (level <= 15) return 'Reader';
    if (level <= 20) return 'Reciter';
    if (level <= 25) return 'Scholar';
    if (level <= 29) return 'Master';
    return 'Hafiz';
}
