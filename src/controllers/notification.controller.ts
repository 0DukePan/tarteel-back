import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { z } from 'zod';

const notificationService = new NotificationService();

// Zod schema for validation
const createNotificationSchema = z.object({
    studentId: z.string().uuid("Invalid student ID format."),
    title: z.string().min(1, "Title cannot be empty."),
    message: z.string().min(1, "Message cannot be empty."),
    type: z.enum(["info", "reminder", "alert"]).default("info"),
});

const updateNotificationSchema = createNotificationSchema.partial().extend({
    read: z.boolean().optional(),
});

export class NotificationController {
    async createNotification(req: Request, res: Response) {
        try {
            const validatedData = createNotificationSchema.parse(req.body);
            const newNotification = await notificationService.createNotification(validatedData);
            res.status(201).json({ success: true, message: "Notification created successfully", data: newNotification });
        } catch (error: any) {
            res.status(400).json({ success: false, message: "Failed to create notification", error: error.message });
        }
    }

    async getNotificationById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const notification = await notificationService.getNotificationById(id);
            if (!notification) {
                res.status(404).json({ success: false, message: "Notification not found" });
                return;
            }
            res.status(200).json({ success: true, data: notification });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to fetch notification", error: error.message });
        }
    }

    async getNotificationsByStudentId(req: Request, res: Response) {
        try {
            const { studentId } = req.params;
            const notificationsList = await notificationService.getNotificationsByStudentId(studentId);
            res.status(200).json({ success: true, data: notificationsList });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to fetch notifications list", error: error.message });
        }
    }

    async updateNotification(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const validatedData = updateNotificationSchema.parse(req.body);
            const updatedNotification = await notificationService.updateNotification(id, validatedData);
            if (!updatedNotification) {
                res.status(404).json({ success: false, message: "Notification not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Notification updated successfully", data: updatedNotification });
        } catch (error: any) {
            res.status(400).json({ success: false, message: "Failed to update notification", error: error.message });
        }
    }

    async deleteNotification(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await notificationService.deleteNotification(id);
            res.status(200).json({ success: true, message: "Notification deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to delete notification", error: error.message });
        }
    }

    async triggerHifzReminders(req: Request, res: Response) {
        try {
            res.status(200).json({ success: true, message: "Hifz reminders trigger initiated." });
        } catch (error: any) {
            res.status(500).json({ success: false, message: "Failed to trigger Hifz reminders", error: error.message });
        }
    }
}
