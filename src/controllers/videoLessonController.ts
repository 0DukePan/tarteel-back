import { Request, Response } from 'express';
import { videoLessonService, LessonCategory, LessonLevel } from '../services/videoLessonService';
import { logger } from '../config/logger';

export const videoLessonController = {
    /**
     * POST /api/lessons
     */
    async createLesson(req: Request, res: Response): Promise<Response> {
        try {
            const { title, description, category, level, videoUrl, thumbnailUrl, duration, teacherId, teacherName, sequenceOrder, objectives } = req.body;

            if (!title || !description || !category || !level || !videoUrl || !duration) {
                return res.status(400).json({
                    success: false,
                    message: 'title, description, category, level, videoUrl, and duration are required'
                });
            }

            const lesson = await videoLessonService.createLesson({
                title,
                description,
                category: category as LessonCategory,
                level: level as LessonLevel,
                videoUrl,
                thumbnailUrl,
                duration: parseInt(duration),
                teacherId,
                teacherName,
                sequenceOrder,
                objectives,
            });

            return res.json({ success: true, data: lesson });
        } catch (error: any) {
            logger.error('Error creating lesson:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/lessons
     */
    async getLessons(req: Request, res: Response): Promise<Response> {
        try {
            const { category, level, teacherId } = req.query;
            const lessons = await videoLessonService.getLessons({
                category: category as LessonCategory | undefined,
                level: level as LessonLevel | undefined,
                teacherId: teacherId as string | undefined,
            });
            return res.json({ success: true, data: lessons });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/lessons/:id
     */
    async getLesson(req: Request, res: Response): Promise<Response> {
        try {
            const lesson = await videoLessonService.getLesson(req.params.id);
            if (!lesson) {
                return res.status(404).json({ success: false, message: 'Lesson not found' });
            }
            return res.json({ success: true, data: lesson });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/lessons/:id/progress
     */
    async trackProgress(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, watchedDuration } = req.body;
            if (!studentId || watchedDuration === undefined) {
                return res.status(400).json({ success: false, message: 'studentId and watchedDuration required' });
            }
            const progress = await videoLessonService.trackProgress(studentId, req.params.id, parseInt(watchedDuration));
            return res.json({ success: true, data: progress });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/lessons/progress/:studentId
     */
    async getStudentProgress(req: Request, res: Response): Promise<Response> {
        try {
            const progress = await videoLessonService.getStudentProgress(req.params.studentId);
            return res.json({ success: true, data: progress });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/lessons/categories
     */
    async getCategories(req: Request, res: Response): Promise<Response> {
        try {
            const categories = videoLessonService.getCategories();
            return res.json({ success: true, data: categories });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/lessons/seed
     */
    async seedLessons(req: Request, res: Response): Promise<Response> {
        try {
            const lessons = await videoLessonService.seedSampleLessons();
            return res.json({ success: true, data: lessons });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};
