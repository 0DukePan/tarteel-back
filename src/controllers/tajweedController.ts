import { Request, Response } from 'express';
import { tajweedService, TajweedAnalysis } from '../services/tajweedService';
import multer from 'multer';

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    },
});

export const tajweedController = {
    /**
     * Multer middleware for audio upload
     */
    uploadMiddleware: upload.single('audio'),

    /**
     * POST /api/tajweed/analyze
     * Analyze audio recitation
     */
    async analyzeRecitation(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No audio file provided',
                });
            }

            const expectedText = req.body.expectedText || '';

            const analysis = await tajweedService.analyzeRecitation(
                req.file.buffer,
                expectedText
            );

            return res.json({
                success: true,
                data: analysis,
            });
        } catch (error: any) {
            console.error('Tajweed analysis error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to analyze recitation',
            });
        }
    },

    /**
     * GET /api/tajweed/result/:id
     * Get analysis result by ID
     */
    async getAnalysisResult(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const analysis = await tajweedService.getAnalysisById(id);

            if (!analysis) {
                return res.status(404).json({
                    success: false,
                    message: 'Analysis not found',
                });
            }

            return res.json({
                success: true,
                data: analysis,
            });
        } catch (error: any) {
            console.error('Get analysis error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get analysis result',
            });
        }
    },

    /**
     * POST /api/tajweed/demo
     * Get demo analysis without audio (for testing UI)
     */
    async getDemoAnalysis(req: Request, res: Response) {
        try {
            const { expectedText } = req.body;

            // Use mock analysis
            const analysis = tajweedService.mockAnalysis(expectedText);

            return res.json({
                success: true,
                data: analysis,
            });
        } catch (error: any) {
            console.error('Demo analysis error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate demo analysis',
            });
        }
    },
};
