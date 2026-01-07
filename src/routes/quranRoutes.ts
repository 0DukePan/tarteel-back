import { Router } from 'express';
import { quranController } from '../controllers/quranController';

const router = Router();

// Surah routes
router.get('/surahs', quranController.getSurahs);
router.get('/surahs/:id', quranController.getSurahDetails);
router.get('/surahs/:id/verses', quranController.getSurahVerses);

// Verse routes
router.get('/verses/:verseKey', quranController.getVerse);

// Audio routes
router.get('/audio/:surahId', quranController.getSurahAudio);
router.get('/reciters', quranController.getReciters);

// Search
router.get('/search', quranController.searchQuran);

// Resources
router.get('/translations', quranController.getTranslations);
router.get('/juzs', quranController.getJuzs);

export default router;
