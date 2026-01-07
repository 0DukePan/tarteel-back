import { Request, Response } from 'express';
import { competitionService, CompetitionStatus, CompetitionType } from '../services/competitionService';
import { logger } from '../config/logger';

export const competitionController = {
    /**
     * POST /api/competitions
     */
    async createCompetition(req: Request, res: Response): Promise<Response> {
        try {
            const { title, description, type, startDate, endDate, requirements, prizes, maxParticipants } = req.body;

            if (!title || !description || !type || !startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'title, description, type, startDate, and endDate are required'
                });
            }

            const competition = await competitionService.createCompetition({
                title,
                description,
                type: type as CompetitionType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                requirements,
                prizes,
                maxParticipants,
            });

            return res.json({ success: true, data: competition });
        } catch (error: any) {
            logger.error('Error creating competition:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/competitions
     */
    async getCompetitions(req: Request, res: Response): Promise<Response> {
        try {
            const status = req.query.status as CompetitionStatus | undefined;
            const competitions = await competitionService.getCompetitions(status);
            return res.json({ success: true, data: competitions });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/competitions/:id
     */
    async getCompetition(req: Request, res: Response): Promise<Response> {
        try {
            const competition = await competitionService.getCompetition(req.params.id);
            if (!competition) {
                return res.status(404).json({ success: false, message: 'Competition not found' });
            }
            return res.json({ success: true, data: competition });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/competitions/:id/join
     */
    async joinCompetition(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, studentName } = req.body;
            if (!studentId || !studentName) {
                return res.status(400).json({ success: false, message: 'studentId and studentName required' });
            }
            const entry = await competitionService.joinCompetition(req.params.id, studentId, studentName);
            return res.json({ success: true, data: entry });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/competitions/:id/submit
     */
    async submitEntry(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, score, verseCount, accuracy } = req.body;
            if (!studentId || score === undefined) {
                return res.status(400).json({ success: false, message: 'studentId and score required' });
            }
            const entry = await competitionService.submitEntry(
                req.params.id,
                studentId,
                score,
                verseCount || 0,
                accuracy || 0
            );
            return res.json({ success: true, data: entry });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/competitions/:id/rankings
     */
    async getRankings(req: Request, res: Response): Promise<Response> {
        try {
            const rankings = await competitionService.getRankings(req.params.id);
            return res.json({ success: true, data: rankings });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/competitions/student/:studentId
     */
    async getStudentCompetitions(req: Request, res: Response): Promise<Response> {
        try {
            const competitions = await competitionService.getStudentCompetitions(req.params.studentId);
            return res.json({ success: true, data: competitions });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/competitions/:id/finalize
     */
    async finalizeCompetition(req: Request, res: Response): Promise<Response> {
        try {
            const result = await competitionService.finalizeCompetition(req.params.id);
            return res.json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/competitions/seed
     * Create sample competitions for demo
     */
    async seedCompetitions(req: Request, res: Response): Promise<Response> {
        try {
            const competitions = await competitionService.createSampleCompetitions();
            return res.json({ success: true, data: competitions });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};
