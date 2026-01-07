import { logger } from '../config/logger';
import { gamificationService } from './gamificationService';

/**
 * Competition Service - Weekly/monthly Quran memorization competitions
 */

export type CompetitionType = 'memorization' | 'recitation' | 'tajweed';
export type CompetitionStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Competition {
    id: string;
    title: string;
    description: string;
    type: CompetitionType;
    startDate: Date;
    endDate: Date;
    status: CompetitionStatus;
    requirements: {
        surahNumbers?: number[];
        juzNumbers?: number[];
        minVerses?: number;
        minScore?: number;
    };
    prizes: {
        first: string;
        second: string;
        third: string;
        participation?: string;
    };
    maxParticipants?: number;
    currentParticipants: number;
    createdAt: Date;
}

export interface CompetitionEntry {
    id: string;
    competitionId: string;
    studentId: string;
    studentName: string;
    score: number;
    submittedAt: Date;
    verseCount: number;
    accuracy: number;
    rank?: number;
}

// In-memory storage
const competitionsStore: Map<string, Competition> = new Map();
const entriesStore: Map<string, CompetitionEntry[]> = new Map();

export const competitionService = {
    /**
     * Create a new competition
     */
    async createCompetition(data: {
        title: string;
        description: string;
        type: CompetitionType;
        startDate: Date;
        endDate: Date;
        requirements?: Competition['requirements'];
        prizes?: Competition['prizes'];
        maxParticipants?: number;
    }): Promise<Competition> {
        const competition: Competition = {
            id: `comp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            title: data.title,
            description: data.description,
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,
            status: 'upcoming',
            requirements: data.requirements || {},
            prizes: data.prizes || {
                first: '🥇 100 Bonus XP + Certificate',
                second: '🥈 75 Bonus XP + Certificate',
                third: '🥉 50 Bonus XP + Certificate',
                participation: '⭐ 25 XP for participation',
            },
            maxParticipants: data.maxParticipants,
            currentParticipants: 0,
            createdAt: new Date(),
        };

        competitionsStore.set(competition.id, competition);
        entriesStore.set(competition.id, []);

        logger.info(`Competition created: ${competition.id} - ${competition.title}`);
        return competition;
    },

    /**
     * Get all competitions
     */
    async getCompetitions(status?: CompetitionStatus): Promise<Competition[]> {
        const competitions = Array.from(competitionsStore.values());

        // Update statuses based on current date
        const now = new Date();
        for (const comp of competitions) {
            if (comp.status === 'upcoming' && comp.startDate <= now) {
                comp.status = 'active';
            }
            if (comp.status === 'active' && comp.endDate <= now) {
                comp.status = 'completed';
            }
        }

        if (status) {
            return competitions.filter(c => c.status === status);
        }
        return competitions.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    },

    /**
     * Get competition by ID
     */
    async getCompetition(competitionId: string): Promise<Competition | null> {
        return competitionsStore.get(competitionId) || null;
    },

    /**
     * Join a competition
     */
    async joinCompetition(competitionId: string, studentId: string, studentName: string): Promise<CompetitionEntry> {
        const competition = competitionsStore.get(competitionId);
        if (!competition) {
            throw new Error('Competition not found');
        }

        if (competition.status !== 'active' && competition.status !== 'upcoming') {
            throw new Error('Competition is not open for entries');
        }

        if (competition.maxParticipants && competition.currentParticipants >= competition.maxParticipants) {
            throw new Error('Competition is full');
        }

        const entries = entriesStore.get(competitionId) || [];
        const existingEntry = entries.find(e => e.studentId === studentId);
        if (existingEntry) {
            return existingEntry; // Already joined
        }

        const entry: CompetitionEntry = {
            id: `entry_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            competitionId,
            studentId,
            studentName,
            score: 0,
            submittedAt: new Date(),
            verseCount: 0,
            accuracy: 0,
        };

        entries.push(entry);
        entriesStore.set(competitionId, entries);

        competition.currentParticipants++;
        competitionsStore.set(competitionId, competition);

        logger.info(`Student ${studentId} joined competition ${competitionId}`);
        return entry;
    },

    /**
     * Submit competition entry (update score)
     */
    async submitEntry(
        competitionId: string,
        studentId: string,
        score: number,
        verseCount: number,
        accuracy: number
    ): Promise<CompetitionEntry | null> {
        const entries = entriesStore.get(competitionId) || [];
        const entry = entries.find(e => e.studentId === studentId);

        if (!entry) {
            throw new Error('You must join the competition first');
        }

        // Update with best score
        if (score > entry.score) {
            entry.score = score;
            entry.verseCount = verseCount;
            entry.accuracy = accuracy;
            entry.submittedAt = new Date();
        }

        return entry;
    },

    /**
     * Get competition rankings
     */
    async getRankings(competitionId: string): Promise<CompetitionEntry[]> {
        const entries = entriesStore.get(competitionId) || [];

        return entries
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));
    },

    /**
     * Get student's competitions
     */
    async getStudentCompetitions(studentId: string): Promise<{
        competition: Competition;
        entry: CompetitionEntry;
    }[]> {
        const results: { competition: Competition; entry: CompetitionEntry }[] = [];

        for (const [compId, entries] of entriesStore) {
            const entry = entries.find(e => e.studentId === studentId);
            if (entry) {
                const competition = competitionsStore.get(compId);
                if (competition) {
                    results.push({ competition, entry });
                }
            }
        }

        return results.sort((a, b) => b.competition.startDate.getTime() - a.competition.startDate.getTime());
    },

    /**
     * Finalize competition and award prizes
     */
    async finalizeCompetition(competitionId: string): Promise<{
        winners: Array<{ entry: CompetitionEntry; prize: string; xpAwarded: number }>;
    }> {
        const competition = competitionsStore.get(competitionId);
        if (!competition) {
            throw new Error('Competition not found');
        }

        const rankings = await this.getRankings(competitionId);
        const winners: Array<{ entry: CompetitionEntry; prize: string; xpAwarded: number }> = [];

        for (let i = 0; i < rankings.length; i++) {
            const entry = rankings[i];
            let prize = '';
            let xpAction: 'COMPETITION_WIN' | 'COMPETITION_TOP_3' | null = null;

            if (i === 0) {
                prize = competition.prizes.first;
                xpAction = 'COMPETITION_WIN';
            } else if (i === 1) {
                prize = competition.prizes.second;
                xpAction = 'COMPETITION_TOP_3';
            } else if (i === 2) {
                prize = competition.prizes.third;
                xpAction = 'COMPETITION_TOP_3';
            } else if (competition.prizes.participation) {
                prize = competition.prizes.participation;
            }

            let xpAwarded = 0;
            if (xpAction) {
                try {
                    const result = await gamificationService.awardXP(entry.studentId, xpAction);
                    xpAwarded = result.xpAwarded;
                } catch (error) {
                    logger.warn('Could not award XP for competition:', error);
                }
            }

            if (prize) {
                winners.push({ entry, prize, xpAwarded });
            }
        }

        competition.status = 'completed';
        competitionsStore.set(competitionId, competition);

        logger.info(`Competition ${competitionId} finalized with ${winners.length} winners`);
        return { winners };
    },

    /**
     * Create sample competitions for demo
     */
    async createSampleCompetitions(): Promise<Competition[]> {
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const competitions: Competition[] = [];

        // Weekly memorization challenge
        competitions.push(await this.createCompetition({
            title: 'Weekly Hifz Challenge',
            description: 'Memorize as many verses as you can this week! Top 3 win bonus XP and certificates.',
            type: 'memorization',
            startDate: now,
            endDate: nextWeek,
            requirements: { minVerses: 10 },
            maxParticipants: 100,
        }));

        // Monthly Tajweed competition
        competitions.push(await this.createCompetition({
            title: 'Monthly Tajweed Excellence',
            description: 'Recite Surah Al-Mulk with perfect Tajweed. Highest accuracy wins!',
            type: 'tajweed',
            startDate: now,
            endDate: nextMonth,
            requirements: { surahNumbers: [67], minScore: 80 },
            maxParticipants: 50,
        }));

        return competitions;
    }
};
