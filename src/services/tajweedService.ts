import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../config/logger';

// Tajweed analysis service
// Uses Tarteel.ai API or falls back to mock analysis for demo

const TARTEEL_API_KEY = process.env.TARTEEL_API_KEY;
const USE_MOCK = !TARTEEL_API_KEY;

export interface TajweedAnalysis {
    id: string;
    transcription: string;
    tajweedScore: number;
    accuracy: number;
    fluency: number;
    issues: TajweedIssue[];
    recommendations: string[];
    overallFeedback: string;
}

export interface TajweedIssue {
    type: string;
    description: string;
    position: number;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
}

export const tajweedService = {
    /**
     * Analyze audio recitation using AI
     */
    async analyzeRecitation(audioBuffer: Buffer, expectedText?: string): Promise<TajweedAnalysis> {
        if (USE_MOCK) {
            return this.mockAnalysis(expectedText);
        }

        try {
            // Using Tarteel.ai API (if available)
            const formData = new FormData();
            formData.append('audio', audioBuffer, {
                filename: 'recitation.webm',
                contentType: 'audio/webm',
            });

            if (expectedText) {
                formData.append('expected_text', expectedText);
            }

            const response = await axios.post('https://api.tarteel.ai/v1/analyze', formData, {
                headers: {
                    'Authorization': `Bearer ${TARTEEL_API_KEY}`,
                    ...formData.getHeaders(),
                },
            });

            return this.formatTarteelResponse(response.data);
        } catch (error: any) {
            logger.error('Tarteel API error, using mock analysis:', error.message);
            return this.mockAnalysis(expectedText);
        }
    },

    /**
     * Format response from Tarteel.ai API
     */
    formatTarteelResponse(data: any): TajweedAnalysis {
        return {
            id: data.id || `analysis_${Date.now()}`,
            transcription: data.transcription || '',
            tajweedScore: data.tajweed_score || 0,
            accuracy: data.accuracy || 0,
            fluency: data.fluency || 0,
            issues: (data.issues || []).map((issue: any) => ({
                type: issue.type || 'unknown',
                description: issue.description || '',
                position: issue.position || 0,
                severity: issue.severity || 'low',
                suggestion: issue.suggestion || '',
            })),
            recommendations: data.recommendations || [],
            overallFeedback: data.overall_feedback || '',
        };
    },

    /**
     * Mock analysis for demo/development
     */
    mockAnalysis(expectedText?: string): TajweedAnalysis {
        // Generate realistic mock scores
        const tajweedScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const accuracy = Math.floor(Math.random() * 20) + 80; // 80-100
        const fluency = Math.floor(Math.random() * 25) + 75; // 75-100

        const possibleIssues: TajweedIssue[] = [
            {
                type: 'madd',
                description: 'Elongation (Madd) not held for correct duration',
                position: 15,
                severity: 'medium',
                suggestion: 'Hold the madd for 4-5 counts when followed by hamza or sukoon',
            },
            {
                type: 'ghunnah',
                description: 'Nasal sound (Ghunnah) needs more emphasis',
                position: 28,
                severity: 'low',
                suggestion: 'Nasalize the noon sakinah for a longer duration',
            },
            {
                type: 'qalqalah',
                description: 'Qalqalah effect missing on قطب جد letters',
                position: 45,
                severity: 'medium',
                suggestion: 'Add a slight bouncing sound when these letters have sukoon',
            },
        ];

        // Randomly select 0-2 issues based on score
        const numIssues = tajweedScore >= 90 ? 0 : tajweedScore >= 80 ? 1 : 2;
        const selectedIssues = possibleIssues.slice(0, numIssues);

        const recommendations = [
            'Practice the elongation rules (Madd) with a metronome',
            'Focus on clear pronunciation of heavy letters (Tafkheem)',
            'Record yourself and compare with a professional reciter',
        ].slice(0, 3 - numIssues);

        let overallFeedback = '';
        if (tajweedScore >= 90) {
            overallFeedback = 'Excellent recitation! Ma sha Allah, your tajweed is very good. Keep practicing to maintain this level.';
        } else if (tajweedScore >= 80) {
            overallFeedback = 'Good recitation with minor areas for improvement. Focus on the highlighted tajweed rules.';
        } else if (tajweedScore >= 70) {
            overallFeedback = 'Decent attempt. Review the basic tajweed rules and practice the specific issues mentioned.';
        } else {
            overallFeedback = 'Keep practicing! Focus on learning the fundamental tajweed rules step by step.';
        }

        return {
            id: `mock_${Date.now()}`,
            transcription: expectedText || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            tajweedScore,
            accuracy,
            fluency,
            issues: selectedIssues,
            recommendations,
            overallFeedback,
        };
    },

    /**
     * Get analysis by ID (for retrieving stored results)
     */
    async getAnalysisById(analysisId: string): Promise<TajweedAnalysis | null> {
        // In a real implementation, this would fetch from database
        // For now, return null to indicate not found
        return null;
    },

    /**
     * Calculate letter-level accuracy
     */
    calculateLetterAccuracy(transcribed: string, expected: string): number {
        if (!expected || !transcribed) return 0;

        const expectedChars = expected.replace(/\s/g, '');
        const transcribedChars = transcribed.replace(/\s/g, '');

        let matches = 0;
        const minLength = Math.min(expectedChars.length, transcribedChars.length);

        for (let i = 0; i < minLength; i++) {
            if (expectedChars[i] === transcribedChars[i]) {
                matches++;
            }
        }

        return Math.round((matches / expectedChars.length) * 100);
    },
};
