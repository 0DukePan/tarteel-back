import { database } from '../config/database';
import { logger } from '../config/logger';
import { gamificationService } from './gamificationService';

/**
 * Spaced Repetition Service using SM-2 Algorithm
 * Optimized for Quran memorization (Hifz)
 * 
 * SM-2 Algorithm:
 * - Quality ratings: 0-5 (0-2 = failed, 3-5 = successful)
 * - EF (Ease Factor): 1.3 - 2.5 (how easy the verse is to remember)
 * - Interval: days until next review
 */

// Review quality ratings
export const REVIEW_QUALITY = {
    COMPLETE_BLACKOUT: 0,      // No memory at all
    WRONG_SERIOUS: 1,          // Wrong, serious difficulty
    WRONG_HESITATED: 2,        // Wrong after hesitation
    CORRECT_DIFFICULTY: 3,     // Correct with difficulty
    CORRECT_HESITATION: 4,     // Correct after hesitation
    PERFECT: 5,                // Perfect recall
};

// Minimum ease factor (prevents intervals from getting too short)
const MIN_EASE_FACTOR = 1.3;

// Maximum ease factor
const MAX_EASE_FACTOR = 2.5;

// Initial ease factor for new verses
const INITIAL_EASE_FACTOR = 2.5;

// Maximum interval in days
const MAX_INTERVAL = 365;

export interface HifzProgress {
    id: string;
    studentId: string;
    verseKey: string;      // e.g., "2:255" for Ayatul Kursi
    surahNumber: number;
    verseNumber: number;
    interval: number;       // Days until next review
    easeFactor: number;     // SM-2 ease factor
    repetitions: number;    // Number of successful reviews
    nextReviewDate: Date;
    lastReviewDate: Date | null;
    status: 'new' | 'learning' | 'review' | 'mature';
    createdAt: Date;
    updatedAt: Date;
}

export interface ReviewResult {
    newInterval: number;
    newEaseFactor: number;
    newRepetitions: number;
    status: 'new' | 'learning' | 'review' | 'mature';
    xpAwarded: number;
}

// In-memory storage for now (would be database in production)
const hifzProgressStore: Map<string, HifzProgress[]> = new Map();

export const spacedRepetitionService = {
    /**
     * Calculate next review using SM-2 algorithm
     */
    calculateNextReview(
        quality: number,
        repetitions: number,
        easeFactor: number,
        interval: number
    ): { newInterval: number; newEaseFactor: number; newRepetitions: number } {
        let newInterval: number;
        let newEaseFactor: number;
        let newRepetitions: number;

        // Clamp quality to 0-5
        quality = Math.max(0, Math.min(5, quality));

        if (quality < 3) {
            // Failed review - reset
            newRepetitions = 0;
            newInterval = 1;
            newEaseFactor = easeFactor;
        } else {
            // Successful review
            newRepetitions = repetitions + 1;

            if (newRepetitions === 1) {
                newInterval = 1;
            } else if (newRepetitions === 2) {
                newInterval = 6;
            } else {
                newInterval = Math.round(interval * easeFactor);
            }

            // Update ease factor using SM-2 formula
            newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

            // Clamp ease factor
            newEaseFactor = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor));
        }

        // Cap interval
        newInterval = Math.min(newInterval, MAX_INTERVAL);

        return { newInterval, newEaseFactor, newRepetitions };
    },

    /**
     * Determine verse status based on progress
     */
    getStatus(repetitions: number, interval: number): 'new' | 'learning' | 'review' | 'mature' {
        if (repetitions === 0) return 'new';
        if (repetitions < 3) return 'learning';
        if (interval < 21) return 'review';
        return 'mature';
    },

    /**
     * Add a verse to memorization queue
     */
    async addVerse(studentId: string, surahNumber: number, verseNumber: number): Promise<HifzProgress> {
        const verseKey = `${surahNumber}:${verseNumber}`;
        const now = new Date();

        const progress: HifzProgress = {
            id: `hifz_${studentId}_${verseKey}`,
            studentId,
            verseKey,
            surahNumber,
            verseNumber,
            interval: 1,
            easeFactor: INITIAL_EASE_FACTOR,
            repetitions: 0,
            nextReviewDate: now,
            lastReviewDate: null,
            status: 'new',
            createdAt: now,
            updatedAt: now,
        };

        // Store in memory (replace with DB in production)
        const studentProgress = hifzProgressStore.get(studentId) || [];
        const existingIndex = studentProgress.findIndex(p => p.verseKey === verseKey);

        if (existingIndex >= 0) {
            // Already exists
            return studentProgress[existingIndex];
        }

        studentProgress.push(progress);
        hifzProgressStore.set(studentId, studentProgress);

        logger.info(`Added verse ${verseKey} to hifz queue for student ${studentId}`);
        return progress;
    },

    /**
     * Add a range of verses (e.g., an entire surah)
     */
    async addVerseRange(
        studentId: string,
        surahNumber: number,
        startVerse: number,
        endVerse: number
    ): Promise<HifzProgress[]> {
        const results: HifzProgress[] = [];
        for (let verse = startVerse; verse <= endVerse; verse++) {
            const progress = await this.addVerse(studentId, surahNumber, verse);
            results.push(progress);
        }
        return results;
    },

    /**
     * Get verses due for review
     */
    async getDueReviews(studentId: string, limit: number = 20): Promise<HifzProgress[]> {
        const studentProgress = hifzProgressStore.get(studentId) || [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const dueReviews = studentProgress
            .filter(p => new Date(p.nextReviewDate) <= now)
            .sort((a, b) => {
                // Prioritize: new > learning > review > mature
                const statusPriority = { new: 0, learning: 1, review: 2, mature: 3 };
                return statusPriority[a.status] - statusPriority[b.status];
            })
            .slice(0, limit);

        return dueReviews;
    },

    /**
     * Record a review result
     */
    async recordReview(
        studentId: string,
        verseKey: string,
        quality: number
    ): Promise<ReviewResult> {
        const studentProgress = hifzProgressStore.get(studentId) || [];
        const progressIndex = studentProgress.findIndex(p => p.verseKey === verseKey);

        if (progressIndex < 0) {
            throw new Error(`Verse ${verseKey} not found in student's hifz queue`);
        }

        const progress = studentProgress[progressIndex];
        const { newInterval, newEaseFactor, newRepetitions } = this.calculateNextReview(
            quality,
            progress.repetitions,
            progress.easeFactor,
            progress.interval
        );

        const now = new Date();
        const nextReview = new Date(now);
        nextReview.setDate(nextReview.getDate() + newInterval);

        const newStatus = this.getStatus(newRepetitions, newInterval);

        // Update progress
        progress.interval = newInterval;
        progress.easeFactor = newEaseFactor;
        progress.repetitions = newRepetitions;
        progress.nextReviewDate = nextReview;
        progress.lastReviewDate = now;
        progress.status = newStatus;
        progress.updatedAt = now;

        studentProgress[progressIndex] = progress;
        hifzProgressStore.set(studentId, studentProgress);

        // Award XP based on quality
        let xpAwarded = 0;
        if (quality >= 3) {
            try {
                const xpResult = await gamificationService.awardXP(studentId, 'MEMORIZE_VERSE');
                xpAwarded = xpResult.xpAwarded;

                // Bonus for perfect recall
                if (quality === 5) {
                    const bonusResult = await gamificationService.awardXP(studentId, 'PERFECT_TAJWEED', 0.5);
                    xpAwarded += bonusResult.xpAwarded;
                }
            } catch (error) {
                logger.warn('Could not award XP for memorization:', error);
            }
        }

        logger.info(`Review recorded for ${verseKey}: quality=${quality}, interval=${newInterval}d, status=${newStatus}`);

        return {
            newInterval,
            newEaseFactor,
            newRepetitions,
            status: newStatus,
            xpAwarded,
        };
    },

    /**
     * Get memorization progress for a student
     */
    async getProgress(studentId: string): Promise<{
        totalVerses: number;
        newVerses: number;
        learningVerses: number;
        reviewVerses: number;
        matureVerses: number;
        dueToday: number;
        streakDays: number;
        completedSurahs: number[];
    }> {
        const studentProgress = hifzProgressStore.get(studentId) || [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const stats = {
            totalVerses: studentProgress.length,
            newVerses: studentProgress.filter(p => p.status === 'new').length,
            learningVerses: studentProgress.filter(p => p.status === 'learning').length,
            reviewVerses: studentProgress.filter(p => p.status === 'review').length,
            matureVerses: studentProgress.filter(p => p.status === 'mature').length,
            dueToday: studentProgress.filter(p => new Date(p.nextReviewDate) <= now).length,
            streakDays: 0, // Would calculate from review history
            completedSurahs: [] as number[], // Would calculate from progress
        };

        return stats;
    },

    /**
     * Get progress for a specific surah
     */
    async getSurahProgress(studentId: string, surahNumber: number): Promise<{
        totalVerses: number;
        memorizedVerses: number;
        percentComplete: number;
        verses: HifzProgress[];
    }> {
        const studentProgress = hifzProgressStore.get(studentId) || [];
        const surahVerses = studentProgress.filter(p => p.surahNumber === surahNumber);
        const memorizedVerses = surahVerses.filter(p => p.status === 'mature' || p.status === 'review');

        // Surah lengths (simplified - ideally from API)
        const surahLengths: Record<number, number> = {
            1: 7, 2: 286, 3: 200, 36: 83, 67: 30, 78: 40, 112: 4, 113: 5, 114: 6,
        };

        const totalVerses = surahLengths[surahNumber] || surahVerses.length;

        return {
            totalVerses,
            memorizedVerses: memorizedVerses.length,
            percentComplete: totalVerses > 0 ? (memorizedVerses.length / totalVerses) * 100 : 0,
            verses: surahVerses,
        };
    },
};
