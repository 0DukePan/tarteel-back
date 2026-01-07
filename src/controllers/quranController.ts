import { Request, Response } from 'express';
import { quranService } from '../services/quranService';

export const quranController = {
    /**
     * GET /api/quran/surahs
     * List all 114 surahs
     */
    async getSurahs(req: Request, res: Response) {
        try {
            const surahs = await quranService.getSurahs();
            res.json({
                success: true,
                data: surahs
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch surahs'
            });
        }
    },

    /**
     * GET /api/quran/surahs/:id
     * Get surah details
     */
    async getSurahDetails(req: Request, res: Response) {
        try {
            const surahId = parseInt(req.params.id);
            if (isNaN(surahId) || surahId < 1 || surahId > 114) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid surah ID. Must be between 1 and 114.'
                });
            }
            const surah = await quranService.getSurahDetails(surahId);
            return res.json({
                success: true,
                data: surah
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch surah details'
            });
        }
    },

    /**
     * GET /api/quran/surahs/:id/verses
     * Get verses for a surah
     */
    async getSurahVerses(req: Request, res: Response) {
        try {
            const surahId = parseInt(req.params.id);
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.per_page as string) || 50;

            if (isNaN(surahId) || surahId < 1 || surahId > 114) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid surah ID. Must be between 1 and 114.'
                });
            }

            const result = await quranService.getSurahVerses(surahId, page, perPage);
            return res.json({
                success: true,
                data: result.verses,
                pagination: result.pagination
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch verses'
            });
        }
    },

    /**
     * GET /api/quran/verses/:verseKey
     * Get a single verse by key (e.g., "1:1")
     */
    async getVerse(req: Request, res: Response) {
        try {
            const { verseKey } = req.params;
            const verse = await quranService.getVerse(verseKey);
            res.json({
                success: true,
                data: verse
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch verse'
            });
        }
    },

    /**
     * GET /api/quran/audio/:surahId
     * Get audio for a surah
     */
    async getSurahAudio(req: Request, res: Response) {
        try {
            const surahId = parseInt(req.params.surahId);
            const reciterId = parseInt(req.query.reciter as string) || 7;

            if (isNaN(surahId) || surahId < 1 || surahId > 114) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid surah ID. Must be between 1 and 114.'
                });
            }

            const audio = await quranService.getSurahAudio(surahId, reciterId);
            return res.json({
                success: true,
                data: audio
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch audio'
            });
        }
    },

    /**
     * GET /api/quran/reciters
     * Get available reciters
     */
    async getReciters(req: Request, res: Response) {
        try {
            const reciters = await quranService.getReciters();
            res.json({
                success: true,
                data: reciters
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch reciters'
            });
        }
    },

    /**
     * GET /api/quran/search
     * Search Quran
     */
    async searchQuran(req: Request, res: Response) {
        try {
            const query = req.query.q as string;
            const page = parseInt(req.query.page as string) || 1;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const results = await quranService.searchQuran(query, page);
            return res.json({
                success: true,
                data: results.results,
                total: results.total,
                pagination: results.pagination
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to search Quran'
            });
        }
    },

    /**
     * GET /api/quran/translations
     * Get available translations
     */
    async getTranslations(req: Request, res: Response) {
        try {
            const translations = await quranService.getTranslations();
            res.json({
                success: true,
                data: translations
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch translations'
            });
        }
    },

    /**
     * GET /api/quran/juzs
     * Get juz (parts) info
     */
    async getJuzs(req: Request, res: Response) {
        try {
            const juzs = await quranService.getJuzs();
            res.json({
                success: true,
                data: juzs
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch juzs'
            });
        }
    }
};
