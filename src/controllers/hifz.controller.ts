import { Request, Response } from 'express';
import { HifzService } from '../services/hifz.service';
import { z } from 'zod';

const hifzService = new HifzService();

// Zod schemas for validation
const hifzProgressSchema = z.object({
    studentId: z.string().uuid("Invalid student ID format."),
    suraNumber: z.number().int().min(1).max(114),
    ayaNumber: z.number().int().min(1),
    status: z.enum(["not_started", "in_progress", "memorized"]).default("not_started"),
    memorizedDate: z.string().datetime().optional(),
    lastReviewed: z.string().datetime().optional(),
    nextReview: z.string().datetime().optional(),
    masteryLevel: z.number().int().min(0).max(5).default(0),
});

const hifzGoalSchema = z.object({
    studentId: z.string().uuid("Invalid student ID format."),
    title: z.string().min(1, "Title cannot be empty."),
    description: z.string().optional(),
    targetSuraNumber: z.number().int().min(1).max(114).optional(),
    targetAyaStart: z.number().int().min(1).optional(),
    targetAyaEnd: z.number().int().optional(),
    targetDate: z.string().datetime().optional(),
    status: z.enum(["active", "completed", "failed"]).default("active"),
});

const revisionScheduleSchema = z.object({
    studentId: z.string().uuid("Invalid student ID format."),
    suraNumber: z.number().int().min(1).max(114).optional(),
    ayaNumber: z.number().int().min(1).optional(),
    nextReviewDate: z.string().datetime(),
    intervalDays: z.number().int().min(1),
    lastReviewedDate: z.string().datetime().optional(),
});

export class HifzController {
    // Hifz Progress
    async createHifzProgress(req: Request, res: Response) {
        try {
            const validatedData = hifzProgressSchema.parse(req.body);
            const newProgress = await hifzService.createHifzProgress(validatedData);
            res.status(201).json({ success: true, message: "Hifz progress created successfully", data: newProgress });
        } catch (error: any) {
            res.status(400).json({ success: false, message: "Failed to create hifz progress", error: error.message });
        }
    }

    async getHifzProgressById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const progress = await hifzService.getHifzProgressById(id);
            if (!progress) {
                res.status(404).json({ success: false, message: "Hifz progress not found" });
                return;
            }
            res.status(200).json({ success: true, data: progress });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to fetch hifz progress", error: error.message });
        }
    }

    async getHifzProgressByStudentId(req: Request, res: Response) {
        try {
            const { studentId } = req.params;
            const progressList = await hifzService.getHifzProgressByStudentId(studentId);
            res.status(200).json({ success: true, data: progressList });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to fetch hifz progress list", error: error.message });
        }
    }

    async updateHifzProgress(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const validatedData = hifzProgressSchema.partial().parse(req.body);
            const updatedProgress = await hifzService.updateHifzProgress(id, validatedData);
            if (!updatedProgress) {
                res.status(404).json({ success: false, message: "Hifz progress not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Hifz progress updated successfully", data: updatedProgress });
        } catch (error: any) {
            res.status(400).json({ success: false, message: "Failed to update hifz progress", error: error.message });
        }
    }

    async deleteHifzProgress(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await hifzService.deleteHifzProgress(id);
            res.status(200).json({ success: true, message: "Hifz progress deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to delete hifz progress", error: error.message });
        }
    }

    // Hifz Goals
    async createHifzGoal(req: Request, res: Response) {
        try {
            const validatedData = hifzGoalSchema.parse(req.body);
            const newGoal = await hifzService.createHifzGoal(validatedData);
            res.status(201).json({ success: true, message: "Hifz goal created successfully", data: newGoal });
        } catch (error: any) {
            res.status(400).json({ success: false, message: "Failed to create hifz goal", error: error.message });
        }
    }

    async getHifzGoalById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const goal = await hifzService.getHifzGoalById(id);
            if (!goal) {
                res.status(404).json({ success: false, message: "Hifz goal not found" });
                return;
            }
            res.status(200).json({ success: true, data: goal });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to fetch hifz goal", error: error.message });
        }
    }

    async getHifzGoalsByStudentId(req: Request, res: Response) {
        try {
            const { studentId } = req.params;
            const goals = await hifzService.getHifzGoalsByStudentId(studentId);
            res.status(200).json({ success: true, data: goals });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to fetch hifz goals list", error: error.message });
        }
    }

    async updateHifzGoal(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const validatedData = hifzGoalSchema.partial().parse(req.body);
            const updatedGoal = await hifzService.updateHifzGoal(id, validatedData);
            if (!updatedGoal) {
                res.status(404).json({ success: false, message: "Hifz goal not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Hifz goal updated successfully", data: updatedGoal });
        } catch (error: any) {
            res.status(400).json({ success: false, message: "Failed to update hifz goal", error: error.message });
        }
    }

    async deleteHifzGoal(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await hifzService.deleteHifzGoal(id);
            res.status(200).json({ success: true, message: "Hifz goal deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to delete hifz goal", error: error.message });
        }
    }

    // Revision Schedules
    async createRevisionSchedule(req: Request, res: Response) {
        try {
            const validatedData = revisionScheduleSchema.parse(req.body);
            const newSchedule = await hifzService.createRevisionSchedule(validatedData);
            res.status(201).json({ success: true, message: "Revision schedule created successfully", data: newSchedule });
        } catch (error: any) {
            res.status(400).json({ success: false, message: "Failed to create revision schedule", error: error.message });
        }
    }

    async getRevisionScheduleById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const schedule = await hifzService.getRevisionScheduleById(id);
            if (!schedule) {
                res.status(404).json({ success: false, message: "Revision schedule not found" });
                return;
            }
            res.status(200).json({ success: true, data: schedule });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to fetch revision schedule", error: error.message });
        }
    }

    async getRevisionSchedulesByStudentId(req: Request, res: Response) {
        try {
            const { studentId } = req.params;
            const schedules = await hifzService.getRevisionSchedulesByStudentId(studentId);
            res.status(200).json({ success: true, data: schedules });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to fetch revision schedules list", error: error.message });
        }
    }

    async updateRevisionSchedule(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const validatedData = revisionScheduleSchema.partial().parse(req.body);
            const updatedSchedule = await hifzService.updateRevisionSchedule(id, validatedData);
            if (!updatedSchedule) {
                res.status(404).json({ success: false, message: "Revision schedule not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Revision schedule updated successfully", data: updatedSchedule });
        } catch (error: any) {
            res.status(400).json({ success: false, message: "Failed to update revision schedule", error: error.message });
        }
    }

    async deleteRevisionSchedule(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await hifzService.deleteRevisionSchedule(id);
            res.status(200).json({ success: true, message: "Revision schedule deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to delete revision schedule", error: error.message });
        }
    }
}
