import { logger } from '../config/logger';
import { gamificationService } from './gamificationService';

/**
 * Ramadan Challenge Service - 30-day Quran completion during Ramadan
 */

export interface RamadanChallenge {
    id: string;
    year: number;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: 'upcoming' | 'active' | 'completed';
    totalJuz: number; // 30
    dailyTarget: number; // 1 juz per day
    participants: number;
    createdAt: Date;
}

export interface RamadanParticipant {
    id: string;
    challengeId: string;
    studentId: string;
    studentName: string;
    juzCompleted: number[];  // Array of completed juz numbers [1,2,3...]
    currentJuz: number;
    streak: number;
    lastActivityDate: Date | null;
    joinedAt: Date;
    completedAt: Date | null;
}

export interface DailyProgress {
    day: number;
    juzNumber: number;
    pages: { start: number; end: number };
    surahRange: string;
    completed: boolean;
}

// In-memory storage
const challengesStore: Map<string, RamadanChallenge> = new Map();
const participantsStore: Map<string, RamadanParticipant[]> = new Map();

// Juz page mapping (approximate)
const JUZ_INFO: Array<{ juz: number; pages: string; surahs: string }> = [
    { juz: 1, pages: '1-21', surahs: 'Al-Fatiha to Al-Baqarah (141)' },
    { juz: 2, pages: '22-41', surahs: 'Al-Baqarah (142-252)' },
    { juz: 3, pages: '42-61', surahs: 'Al-Baqarah (253) to Al-Imran (92)' },
    { juz: 4, pages: '62-81', surahs: 'Al-Imran (93) to An-Nisa (23)' },
    { juz: 5, pages: '82-101', surahs: 'An-Nisa (24-147)' },
    { juz: 6, pages: '102-121', surahs: 'An-Nisa (148) to Al-Maidah (81)' },
    { juz: 7, pages: '122-141', surahs: 'Al-Maidah (82) to Al-Anam (110)' },
    { juz: 8, pages: '142-161', surahs: 'Al-Anam (111) to Al-Araf (87)' },
    { juz: 9, pages: '162-181', surahs: 'Al-Araf (88) to Al-Anfal (40)' },
    { juz: 10, pages: '182-201', surahs: 'Al-Anfal (41) to At-Tawbah (92)' },
    { juz: 11, pages: '202-221', surahs: 'At-Tawbah (93) to Hud (5)' },
    { juz: 12, pages: '222-241', surahs: 'Hud (6) to Yusuf (52)' },
    { juz: 13, pages: '242-261', surahs: 'Yusuf (53) to Ibrahim (52)' },
    { juz: 14, pages: '262-281', surahs: 'Al-Hijr to An-Nahl (128)' },
    { juz: 15, pages: '282-301', surahs: 'Al-Isra to Al-Kahf (74)' },
    { juz: 16, pages: '302-321', surahs: 'Al-Kahf (75) to Ta-Ha (135)' },
    { juz: 17, pages: '322-341', surahs: 'Al-Anbiya to Al-Hajj (78)' },
    { juz: 18, pages: '342-361', surahs: 'Al-Muminun to Al-Furqan (20)' },
    { juz: 19, pages: '362-381', surahs: 'Al-Furqan (21) to An-Naml (55)' },
    { juz: 20, pages: '382-401', surahs: 'An-Naml (56) to Al-Ankabut (45)' },
    { juz: 21, pages: '402-421', surahs: 'Al-Ankabut (46) to Al-Ahzab (30)' },
    { juz: 22, pages: '422-441', surahs: 'Al-Ahzab (31) to Ya-Sin (27)' },
    { juz: 23, pages: '442-461', surahs: 'Ya-Sin (28) to Az-Zumar (31)' },
    { juz: 24, pages: '462-481', surahs: 'Az-Zumar (32) to Fussilat (46)' },
    { juz: 25, pages: '482-501', surahs: 'Fussilat (47) to Al-Jathiyah (37)' },
    { juz: 26, pages: '502-521', surahs: 'Al-Ahqaf to Adh-Dhariyat (30)' },
    { juz: 27, pages: '522-541', surahs: 'Adh-Dhariyat (31) to Al-Hadid (29)' },
    { juz: 28, pages: '542-561', surahs: 'Al-Mujadila to At-Tahrim' },
    { juz: 29, pages: '562-581', surahs: 'Al-Mulk to Al-Mursalat' },
    { juz: 30, pages: '582-604', surahs: 'An-Naba to An-Nas' },
];

export const ramadanChallengeService = {
    /**
     * Create or get current Ramadan challenge
     */
    async createChallenge(year: number): Promise<RamadanChallenge> {
        // Calculate approximate Ramadan dates (would use actual Islamic calendar API in production)
        const startDate = new Date(year, 2, 10); // Approximate - March 10
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        const challenge: RamadanChallenge = {
            id: `ramadan_${year}`,
            year,
            title: `Ramadan Quran Challenge ${year}`,
            description: 'Complete the entire Quran during the blessed month of Ramadan! Read 1 Juz per day for 30 days.',
            startDate,
            endDate,
            status: 'active',
            totalJuz: 30,
            dailyTarget: 1,
            participants: 0,
            createdAt: new Date(),
        };

        challengesStore.set(challenge.id, challenge);
        participantsStore.set(challenge.id, []);

        logger.info(`Ramadan Challenge ${year} created`);
        return challenge;
    },

    /**
     * Get current active challenge
     */
    async getCurrentChallenge(): Promise<RamadanChallenge | null> {
        const currentYear = new Date().getFullYear();
        let challenge = challengesStore.get(`ramadan_${currentYear}`);

        if (!challenge) {
            // Create one for current year if doesn't exist
            challenge = await this.createChallenge(currentYear);
        }

        return challenge;
    },

    /**
     * Join the challenge
     */
    async joinChallenge(challengeId: string, studentId: string, studentName: string): Promise<RamadanParticipant> {
        const challenge = challengesStore.get(challengeId);
        if (!challenge) throw new Error('Challenge not found');

        const participants = participantsStore.get(challengeId) || [];

        // Check if already joined
        const existing = participants.find(p => p.studentId === studentId);
        if (existing) return existing;

        const participant: RamadanParticipant = {
            id: `rp_${Date.now()}`,
            challengeId,
            studentId,
            studentName,
            juzCompleted: [],
            currentJuz: 1,
            streak: 0,
            lastActivityDate: null,
            joinedAt: new Date(),
            completedAt: null,
        };

        participants.push(participant);
        participantsStore.set(challengeId, participants);

        challenge.participants++;
        challengesStore.set(challengeId, challenge);

        logger.info(`Student ${studentId} joined Ramadan Challenge ${challengeId}`);
        return participant;
    },

    /**
     * Mark a Juz as completed
     */
    async completeJuz(challengeId: string, studentId: string, juzNumber: number): Promise<RamadanParticipant | null> {
        const participants = participantsStore.get(challengeId) || [];
        const participant = participants.find(p => p.studentId === studentId);

        if (!participant) throw new Error('Not a participant');

        if (!participant.juzCompleted.includes(juzNumber)) {
            participant.juzCompleted.push(juzNumber);
            participant.juzCompleted.sort((a, b) => a - b);
            participant.currentJuz = Math.max(...participant.juzCompleted) + 1;

            // Update streak
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (participant.lastActivityDate) {
                const lastDate = new Date(participant.lastActivityDate);
                lastDate.setHours(0, 0, 0, 0);
                const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysDiff === 1) {
                    participant.streak++;
                } else if (daysDiff > 1) {
                    participant.streak = 1;
                }
            } else {
                participant.streak = 1;
            }

            participant.lastActivityDate = today;

            // Award XP for completing a Juz
            try {
                await gamificationService.awardXP(studentId, 'MEMORIZE_PAGE', 5); // 5x for juz
            } catch (e) {
                logger.warn('Could not award XP:', e);
            }

            // Check if completed all 30
            if (participant.juzCompleted.length === 30) {
                participant.completedAt = new Date();
                logger.info(`Student ${studentId} completed entire Quran in Ramadan!`);

                // Big XP bonus
                try {
                    await gamificationService.awardXP(studentId, 'COMPETITION_WIN');
                } catch (e) {
                    logger.warn('Could not award completion XP:', e);
                }
            }
        }

        return participant;
    },

    /**
     * Get daily target info
     */
    getDailyTarget(day: number): DailyProgress | null {
        if (day < 1 || day > 30) return null;

        const juzInfo = JUZ_INFO[day - 1];
        const [start, end] = juzInfo.pages.split('-').map(Number);

        return {
            day,
            juzNumber: day,
            pages: { start, end },
            surahRange: juzInfo.surahs,
            completed: false,
        };
    },

    /**
     * Get 30-day schedule
     */
    getFullSchedule(): DailyProgress[] {
        return Array.from({ length: 30 }, (_, i) => this.getDailyTarget(i + 1)!);
    },

    /**
     * Get participant progress
     */
    async getParticipantProgress(challengeId: string, studentId: string): Promise<{
        participant: RamadanParticipant | null;
        schedule: DailyProgress[];
        percentComplete: number;
        daysRemaining: number;
    }> {
        const participants = participantsStore.get(challengeId) || [];
        const participant = participants.find(p => p.studentId === studentId) || null;
        const challenge = challengesStore.get(challengeId);

        const schedule = this.getFullSchedule().map(day => ({
            ...day,
            completed: participant?.juzCompleted.includes(day.juzNumber) || false,
        }));

        const daysRemaining = challenge
            ? Math.max(0, Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : 0;

        return {
            participant,
            schedule,
            percentComplete: participant ? (participant.juzCompleted.length / 30) * 100 : 0,
            daysRemaining,
        };
    },

    /**
     * Get leaderboard
     */
    async getLeaderboard(challengeId: string, limit: number = 20): Promise<RamadanParticipant[]> {
        const participants = participantsStore.get(challengeId) || [];

        return participants
            .sort((a, b) => {
                // Sort by juz completed, then by streak
                if (b.juzCompleted.length !== a.juzCompleted.length) {
                    return b.juzCompleted.length - a.juzCompleted.length;
                }
                return b.streak - a.streak;
            })
            .slice(0, limit);
    },
};
