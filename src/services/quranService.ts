import axios from 'axios';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';

// Quran.com API service
export const quranService = {
    /**
     * Get list of all 114 surahs
     */
    async getSurahs() {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/chapters`, {
                params: { language: 'en' }
            });
            return response.data.chapters;
        } catch (error) {
            console.error('Error fetching surahs:', error);
            throw new Error('Failed to fetch surahs from Quran API');
        }
    },

    /**
     * Get surah details with info
     */
    async getSurahDetails(surahId: number) {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/chapters/${surahId}`, {
                params: { language: 'en' }
            });
            return response.data.chapter;
        } catch (error) {
            console.error(`Error fetching surah ${surahId}:`, error);
            throw new Error(`Failed to fetch surah ${surahId}`);
        }
    },

    /**
     * Get verses for a surah with translations
     */
    async getSurahVerses(surahId: number, page: number = 1, perPage: number = 50) {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/verses/by_chapter/${surahId}`, {
                params: {
                    language: 'en',
                    page,
                    per_page: perPage,
                    translations: '131', // Sahih International
                    fields: 'text_uthmani,verse_key',
                    word_fields: 'text_uthmani,text_indopak'
                }
            });
            return {
                verses: response.data.verses,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error(`Error fetching verses for surah ${surahId}:`, error);
            throw new Error(`Failed to fetch verses for surah ${surahId}`);
        }
    },

    /**
     * Get a single verse by key (e.g., "1:1")
     */
    async getVerse(verseKey: string) {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/verses/by_key/${verseKey}`, {
                params: {
                    language: 'en',
                    translations: '131',
                    fields: 'text_uthmani,verse_key'
                }
            });
            return response.data.verse;
        } catch (error) {
            console.error(`Error fetching verse ${verseKey}:`, error);
            throw new Error(`Failed to fetch verse ${verseKey}`);
        }
    },

    /**
     * Get available reciters
     */
    async getReciters() {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/resources/recitations`, {
                params: { language: 'en' }
            });
            return response.data.recitations;
        } catch (error) {
            console.error('Error fetching reciters:', error);
            throw new Error('Failed to fetch reciters');
        }
    },

    /**
     * Get audio files for a surah by reciter
     */
    async getSurahAudio(surahId: number, reciterId: number = 7) {
        try {
            // Reciter 7 = Mishari Rashid al-`Afasy
            const response = await axios.get(`${QURAN_API_BASE}/chapter_recitations/${reciterId}/${surahId}`);
            return response.data.audio_file;
        } catch (error) {
            console.error(`Error fetching audio for surah ${surahId}:`, error);
            throw new Error(`Failed to fetch audio for surah ${surahId}`);
        }
    },

    /**
     * Get verse-by-verse audio timestamps
     */
    async getVerseTimings(surahId: number, reciterId: number = 7) {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/recitations/${reciterId}/by_chapter/${surahId}`, {
                params: { per_page: 286 } // Max verses in a surah
            });
            return response.data.audio_files;
        } catch (error) {
            console.error(`Error fetching verse timings for surah ${surahId}:`, error);
            throw new Error(`Failed to fetch verse timings for surah ${surahId}`);
        }
    },

    /**
     * Search Quran
     */
    async searchQuran(query: string, page: number = 1) {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/search`, {
                params: {
                    q: query,
                    size: 20,
                    page,
                    language: 'en'
                }
            });
            return {
                results: response.data.search.results,
                total: response.data.search.total_results,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error(`Error searching Quran for "${query}":`, error);
            throw new Error(`Failed to search Quran`);
        }
    },

    /**
     * Get available translations
     */
    async getTranslations() {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/resources/translations`, {
                params: { language: 'en' }
            });
            return response.data.translations;
        } catch (error) {
            console.error('Error fetching translations:', error);
            throw new Error('Failed to fetch translations');
        }
    },

    /**
     * Get juz (parts) info
     */
    async getJuzs() {
        try {
            const response = await axios.get(`${QURAN_API_BASE}/juzs`);
            return response.data.juzs;
        } catch (error) {
            console.error('Error fetching juzs:', error);
            throw new Error('Failed to fetch juzs');
        }
    }
};
