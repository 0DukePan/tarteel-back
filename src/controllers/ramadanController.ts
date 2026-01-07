import { Request, Response } from 'express';
import { ramadanChallengeService } from '../services/ramadanChallengeService';
import { logger } from '../config/logger';

export const ramadanController = {
    /**
     * GET /api/ramadan/current
     */
    async getCurrentChallenge(req: Request, res: Response): Promise<Response> {
        try {
            const challenge = await ramadanChallengeService.getCurrentChallenge();
            return res.json({ success: true, data: challenge });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/ramadan/join
     */
    async joinChallenge(req: Request, res: Response): Promise<Response> {
        try {
            const { challengeId, studentId, studentName } = req.body;
            if (!challengeId || !studentId || !studentName) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }
            const participant = await ramadanChallengeService.joinChallenge(challengeId, studentId, studentName);
            return res.json({ success: true, data: participant });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/ramadan/complete-juz
     */
    async completeJuz(req: Request, res: Response): Promise<Response> {
        try {
            const { challengeId, studentId, juzNumber } = req.body;
            if (!challengeId || !studentId || !juzNumber) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }
            const participant = await ramadanChallengeService.completeJuz(challengeId, studentId, parseInt(juzNumber));
            return res.json({ success: true, data: participant });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/ramadan/:challengeId/progress/:studentId
     */
    async getProgress(req: Request, res: Response): Promise<Response> {
        try {
            const { challengeId, studentId } = req.params;
            const progress = await ramadanChallengeService.getParticipantProgress(challengeId, studentId);
            return res.json({ success: true, data: progress });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/ramadan/:challengeId/leaderboard
     */
    async getLeaderboard(req: Request, res: Response): Promise<Response> {
        try {
            const { challengeId } = req.params;
            const limit = parseInt(req.query.limit as string) || 20;
            const leaderboard = await ramadanChallengeService.getLeaderboard(challengeId, limit);
            return res.json({ success: true, data: leaderboard });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/ramadan/schedule
     */
    async getSchedule(req: Request, res: Response): Promise<Response> {
        try {
            const schedule = ramadanChallengeService.getFullSchedule();
            return res.json({ success: true, data: schedule });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },
};
