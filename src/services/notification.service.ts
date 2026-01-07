import { database } from "../config/database";
import { notifications } from "../db/schema";
import { INotification } from "../types";
import { eq, desc } from "drizzle-orm";
import dotenv from 'dotenv';

dotenv.config();

// Resend is optional - only initialize if API key is available
let resend: any = null;
try {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.log('Resend module not installed, email notifications disabled');
}

function getDb() {
  return database.getDb();
}

export class NotificationService {
  async createNotification(notificationData: Omit<INotification, "id" | "createdAt" | "updatedAt">): Promise<INotification> {
    const db = getDb();
    const [newNotification] = await db.insert(notifications).values({
      ...notificationData as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    return newNotification as INotification;
  }

  async getNotificationById(id: string): Promise<INotification | undefined> {
    const db = getDb();
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification as INotification | undefined;
  }

  async getNotificationsByStudentId(studentId: string): Promise<INotification[]> {
    const db = getDb();
    const notificationsList = await db.select().from(notifications).where(eq(notifications.studentId, studentId)).orderBy(desc(notifications.createdAt));
    return notificationsList as INotification[];
  }

  async updateNotification(id: string, updateData: Partial<Omit<INotification, "id" | "studentId" | "createdAt">>): Promise<INotification | undefined> {
    const db = getDb();
    const [updatedNotification] = await db.update(notifications).set({
      ...updateData as any,
      updatedAt: new Date(),
    }).where(eq(notifications.id, id)).returning();
    return updatedNotification as INotification | undefined;
  }

  async deleteNotification(id: string): Promise<void> {
    const db = getDb();
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async sendEmailNotification(to: string, subject: string, htmlContent: string): Promise<any> {
    if (!resend) {
      console.log("Resend not configured, skipping email notification");
      return null;
    }

    if (!process.env.SENDER_EMAIL_ADDRESS) {
      console.error("SENDER_EMAIL_ADDRESS is not defined in environment variables. Email will not be sent.");
      throw new Error("Sender email address not configured.");
    }

    try {
      const { data, error } = await resend.emails.send({
        from: `Quran App <${process.env.SENDER_EMAIL_ADDRESS}>`,
        to: [to],
        subject: subject,
        html: htmlContent,
      });

      if (error) {
        console.error("Error sending email:", error);
        throw error;
      }

      console.log("Email sent successfully:", data);
      return data;
    } catch (error) {
      console.error("Failed to send email notification:", error);
      throw error;
    }
  }
}
