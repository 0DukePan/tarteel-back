import { logger } from '../config/logger';
import { gamificationService } from './gamificationService';

/**
 * Video Lessons Service - Pre-recorded tajweed lessons library
 */

export type LessonCategory = 'tajweed' | 'quran-recitation' | 'arabic' | 'islamic-studies' | 'hifz-tips';
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';

export interface VideoLesson {
    id: string;
    title: string;
    description: string;
    category: LessonCategory;
    level: LessonLevel;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number; // seconds
    teacherId?: string;
    teacherName?: string;
    sequenceOrder: number;
    objectives: string[];
    createdAt: Date;
}

export interface LessonProgress {
    lessonId: string;
    studentId: string;
    watchedDuration: number; // seconds
    completed: boolean;
    completedAt?: Date;
    lastWatchedAt: Date;
    xpAwarded: number;
}

// In-memory storage
const lessonsStore: Map<string, VideoLesson> = new Map();
const progressStore: Map<string, LessonProgress[]> = new Map();

// Category metadata
export const LESSON_CATEGORIES = {
    'tajweed': { label: 'Tajweed Rules', icon: '🎤', description: 'Learn proper Quran pronunciation' },
    'quran-recitation': { label: 'Quran Recitation', icon: '📖', description: 'Practice reciting with experts' },
    'arabic': { label: 'Arabic Language', icon: '🔤', description: 'Learn Arabic basics' },
    'islamic-studies': { label: 'Islamic Studies', icon: '🕌', description: 'Understand Islamic teachings' },
    'hifz-tips': { label: 'Hifz Tips', icon: '🧠', description: 'Memorization techniques' },
};

export const videoLessonService = {
    /**
     * Create a video lesson
     */
    async createLesson(data: {
        title: string;
        description: string;
        category: LessonCategory;
        level: LessonLevel;
        videoUrl: string;
        thumbnailUrl?: string;
        duration: number;
        teacherId?: string;
        teacherName?: string;
        sequenceOrder?: number;
        objectives?: string[];
    }): Promise<VideoLesson> {
        const lesson: VideoLesson = {
            id: `lesson_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            title: data.title,
            description: data.description,
            category: data.category,
            level: data.level,
            videoUrl: data.videoUrl,
            thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400',
            duration: data.duration,
            teacherId: data.teacherId,
            teacherName: data.teacherName,
            sequenceOrder: data.sequenceOrder || 0,
            objectives: data.objectives || [],
            createdAt: new Date(),
        };

        lessonsStore.set(lesson.id, lesson);
        logger.info(`Video lesson created: ${lesson.id} - ${lesson.title}`);
        return lesson;
    },

    /**
     * Get all lessons, optionally filtered
     */
    async getLessons(filters?: {
        category?: LessonCategory;
        level?: LessonLevel;
        teacherId?: string;
    }): Promise<VideoLesson[]> {
        let lessons = Array.from(lessonsStore.values());

        if (filters?.category) {
            lessons = lessons.filter(l => l.category === filters.category);
        }
        if (filters?.level) {
            lessons = lessons.filter(l => l.level === filters.level);
        }
        if (filters?.teacherId) {
            lessons = lessons.filter(l => l.teacherId === filters.teacherId);
        }

        return lessons.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    },

    /**
     * Get lesson by ID
     */
    async getLesson(lessonId: string): Promise<VideoLesson | null> {
        return lessonsStore.get(lessonId) || null;
    },

    /**
     * Track lesson progress
     */
    async trackProgress(
        studentId: string,
        lessonId: string,
        watchedDuration: number
    ): Promise<LessonProgress> {
        const lesson = lessonsStore.get(lessonId);
        if (!lesson) {
            throw new Error('Lesson not found');
        }

        const studentProgress = progressStore.get(studentId) || [];
        let progress = studentProgress.find(p => p.lessonId === lessonId);

        if (!progress) {
            progress = {
                lessonId,
                studentId,
                watchedDuration: 0,
                completed: false,
                lastWatchedAt: new Date(),
                xpAwarded: 0,
            };
            studentProgress.push(progress);
        }

        progress.watchedDuration = Math.max(progress.watchedDuration, watchedDuration);
        progress.lastWatchedAt = new Date();

        // Check if lesson is completed (watched 90% or more)
        const completionThreshold = lesson.duration * 0.9;
        if (!progress.completed && progress.watchedDuration >= completionThreshold) {
            progress.completed = true;
            progress.completedAt = new Date();

            // Award XP for completing lesson
            try {
                const result = await gamificationService.awardXP(studentId, 'COMPLETE_LESSON');
                progress.xpAwarded = result.xpAwarded;
            } catch (error) {
                logger.warn('Could not award XP for lesson completion:', error);
            }

            logger.info(`Student ${studentId} completed lesson ${lessonId}`);
        }

        progressStore.set(studentId, studentProgress);
        return progress;
    },

    /**
     * Get student's progress for all lessons
     */
    async getStudentProgress(studentId: string): Promise<{
        totalLessons: number;
        completedLessons: number;
        totalWatchTime: number;
        progress: Array<LessonProgress & { lesson?: VideoLesson }>;
    }> {
        const allLessons = Array.from(lessonsStore.values());
        const studentProgress = progressStore.get(studentId) || [];

        const progressWithLessons = studentProgress.map(p => ({
            ...p,
            lesson: lessonsStore.get(p.lessonId),
        }));

        return {
            totalLessons: allLessons.length,
            completedLessons: studentProgress.filter(p => p.completed).length,
            totalWatchTime: studentProgress.reduce((sum, p) => sum + p.watchedDuration, 0),
            progress: progressWithLessons,
        };
    },

    /**
     * Get categories
     */
    getCategories() {
        return LESSON_CATEGORIES;
    },

    /**
     * Seed sample lessons for demo
     */
    async seedSampleLessons(): Promise<VideoLesson[]> {
        const lessons: VideoLesson[] = [];

        // Tajweed lessons
        lessons.push(await this.createLesson({
            title: 'Introduction to Tajweed',
            description: 'Learn the basics of Tajweed and why it is important for proper Quran recitation.',
            category: 'tajweed',
            level: 'beginner',
            videoUrl: 'https://example.com/videos/tajweed-intro.mp4',
            duration: 600, // 10 minutes
            teacherName: 'Sheikh Ahmad',
            sequenceOrder: 1,
            objectives: ['Understand what Tajweed is', 'Learn why Tajweed is important', 'Know the basic rules'],
        }));

        lessons.push(await this.createLesson({
            title: 'Makharij al-Huruf (Letter Articulation)',
            description: 'Master the correct pronunciation points for Arabic letters.',
            category: 'tajweed',
            level: 'beginner',
            videoUrl: 'https://example.com/videos/makharij.mp4',
            duration: 900, // 15 minutes
            teacherName: 'Sheikh Ahmad',
            sequenceOrder: 2,
            objectives: ['Learn the 17 articulation points', 'Practice each letter correctly'],
        }));

        lessons.push(await this.createLesson({
            title: 'Noon Sakinah Rules',
            description: 'Learn Izhar, Idgham, Iqlab, and Ikhfa rules for Noon Sakinah.',
            category: 'tajweed',
            level: 'intermediate',
            videoUrl: 'https://example.com/videos/noon-rules.mp4',
            duration: 1200, // 20 minutes
            teacherName: 'Sheikh Ahmad',
            sequenceOrder: 3,
            objectives: ['Master the 4 rules of Noon Sakinah', 'Apply rules in recitation'],
        }));

        // Hifz tips
        lessons.push(await this.createLesson({
            title: 'Effective Memorization Techniques',
            description: 'Proven strategies for memorizing Quran efficiently.',
            category: 'hifz-tips',
            level: 'beginner',
            videoUrl: 'https://example.com/videos/hifz-techniques.mp4',
            duration: 720, // 12 minutes
            teacherName: 'Ustadh Ibrahim',
            sequenceOrder: 1,
            objectives: ['Learn repetition techniques', 'Create a memorization schedule'],
        }));

        logger.info(`Seeded ${lessons.length} sample video lessons`);
        return lessons;
    }
};
