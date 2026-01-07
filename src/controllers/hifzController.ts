import { Request, Response } from 'express';
import { spacedRepetitionService, REVIEW_QUALITY } from '../services/spacedRepetitionService';
import { logger } from '../config/logger';

export const hifzController = {
    /**
     * POST /api/hifz/add-verse
     * Add a verse to memorization queue
     */
    async addVerse(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, surahNumber, verseNumber } = req.body;

            if (!studentId || !surahNumber || !verseNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId, surahNumber, and verseNumber are required'
                });
            }

            const progress = await spacedRepetitionService.addVerse(
                studentId,
                parseInt(surahNumber),
                parseInt(verseNumber)
            );

            return res.json({
                success: true,
                data: progress
            });
        } catch (error: any) {
            logger.error('Error adding verse:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to add verse'
            });
        }
    },

    /**
     * POST /api/hifz/add-range
     * Add a range of verses (e.g., entire surah)
     */
    async addVerseRange(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, surahNumber, startVerse, endVerse } = req.body;

            if (!studentId || !surahNumber || !startVerse || !endVerse) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId, surahNumber, startVerse, and endVerse are required'
                });
            }

            const progress = await spacedRepetitionService.addVerseRange(
                studentId,
                parseInt(surahNumber),
                parseInt(startVerse),
                parseInt(endVerse)
            );

            return res.json({
                success: true,
                data: {
                    versesAdded: progress.length,
                    verses: progress
                }
            });
        } catch (error: any) {
            logger.error('Error adding verse range:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to add verses'
            });
        }
    },

    /**
     * GET /api/hifz/due/:studentId
     * Get verses due for review
     */
    async getDueReviews(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId } = req.params;
            const limit = parseInt(req.query.limit as string) || 20;

            const dueReviews = await spacedRepetitionService.getDueReviews(studentId, limit);

            return res.json({
                success: true,
                data: {
                    count: dueReviews.length,
                    verses: dueReviews
                }
            });
        } catch (error: any) {
            logger.error('Error getting due reviews:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get due reviews'
            });
        }
    },

    /**
     * POST /api/hifz/review
     * Record a review result
     */
    async recordReview(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, verseKey, quality } = req.body;

            if (!studentId || !verseKey || quality === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId, verseKey, and quality are required'
                });
            }

            if (quality < 0 || quality > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'quality must be between 0 and 5'
                });
            }

            const result = await spacedRepetitionService.recordReview(
                studentId,
                verseKey,
                parseInt(quality)
            );

            return res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            logger.error('Error recording review:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to record review'
            });
        }
    },

    /**
     * GET /api/hifz/progress/:studentId
     * Get memorization progress
     */
    async getProgress(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId } = req.params;

            const progress = await spacedRepetitionService.getProgress(studentId);

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
     * GET /api/hifz/surah/:studentId/:surahNumber
     * Get progress for a specific surah
     */
    async getSurahProgress(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, surahNumber } = req.params;

            const progress = await spacedRepetitionService.getSurahProgress(
                studentId,
                parseInt(surahNumber)
            );

            return res.json({
                success: true,
                data: progress
            });
        } catch (error: any) {
            logger.error('Error getting surah progress:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get surah progress'
            });
        }
    },

    /**
     * GET /api/hifz/quality-ratings
     * Get available quality ratings
     */
    async getQualityRatings(req: Request, res: Response): Promise<Response> {
        return res.json({
            success: true,
            data: REVIEW_QUALITY
        });
    }
};
