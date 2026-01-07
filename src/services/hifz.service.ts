import { database } from "../config/database";
import { hifzProgress, hifzGoals, revisionSchedules, students, parents } from "../db/schema";
import { IHifzProgress, IHifzGoal, IRevisionSchedule } from "../types";
import { eq, and, asc, lte, sql } from "drizzle-orm";
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

function getDb() {
  return database.getDb();
}

export class HifzService {
  // Hifz Progress
  async createHifzProgress(progressData: Omit<IHifzProgress, "id" | "createdAt" | "updatedAt">): Promise<IHifzProgress> {
    const db = getDb();
    const [newProgress] = await db.insert(hifzProgress).values({
      ...progressData as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    return newProgress as IHifzProgress;
  }

  async getHifzProgressById(id: string): Promise<IHifzProgress | undefined> {
    const db = getDb();
    const [progress] = await db.select().from(hifzProgress).where(eq(hifzProgress.id, id));
    return progress as IHifzProgress | undefined;
  }

  async getHifzProgressByStudentId(studentId: string): Promise<IHifzProgress[]> {
    const db = getDb();
    const progressList = await db.select().from(hifzProgress).where(eq(hifzProgress.studentId, studentId)).orderBy(asc(hifzProgress.suraNumber), asc(hifzProgress.ayaNumber));
    return progressList as IHifzProgress[];
  }

  async updateHifzProgress(id: string, updateData: Partial<Omit<IHifzProgress, "id" | "studentId" | "createdAt">>): Promise<IHifzProgress | undefined> {
    const db = getDb();
    const [updatedProgress] = await db.update(hifzProgress).set({
      ...updateData as any,
      updatedAt: new Date(),
    }).where(eq(hifzProgress.id, id)).returning();

    // If nextReview is updated and it's today or in the past, trigger a reminder
    if (updatedProgress?.nextReview && new Date(updatedProgress.nextReview) <= new Date()) {
      await this.createReminderForSchedule(updatedProgress as any);
    }

    return updatedProgress as IHifzProgress | undefined;
  }

  async deleteHifzProgress(id: string): Promise<void> {
    const db = getDb();
    await db.delete(hifzProgress).where(eq(hifzProgress.id, id));
  }

  // Hifz Goals
  async createHifzGoal(goalData: Omit<IHifzGoal, "id" | "createdAt" | "updatedAt">): Promise<IHifzGoal> {
    const db = getDb();
    const [newGoal] = await db.insert(hifzGoals).values({
      ...goalData as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    return newGoal as IHifzGoal;
  }

  async getHifzGoalById(id: string): Promise<IHifzGoal | undefined> {
    const db = getDb();
    const [goal] = await db.select().from(hifzGoals).where(eq(hifzGoals.id, id));
    return goal as IHifzGoal | undefined;
  }

  async getHifzGoalsByStudentId(studentId: string): Promise<IHifzGoal[]> {
    const db = getDb();
    const goals = await db.select().from(hifzGoals).where(eq(hifzGoals.studentId, studentId)).orderBy(asc(hifzGoals.targetDate));
    return goals as IHifzGoal[];
  }

  async updateHifzGoal(id: string, updateData: Partial<Omit<IHifzGoal, "id" | "studentId" | "createdAt">>): Promise<IHifzGoal | undefined> {
    const db = getDb();
    const [updatedGoal] = await db.update(hifzGoals).set({
      ...updateData as any,
      updatedAt: new Date(),
    }).where(eq(hifzGoals.id, id)).returning();
    return updatedGoal as IHifzGoal | undefined;
  }

  async deleteHifzGoal(id: string): Promise<void> {
    const db = getDb();
    await db.delete(hifzGoals).where(eq(hifzGoals.id, id));
  }

  // Revision Schedules
  async createRevisionSchedule(scheduleData: Omit<IRevisionSchedule, "id" | "createdAt" | "updatedAt">): Promise<IRevisionSchedule> {
    const db = getDb();
    const [newSchedule] = await db.insert(revisionSchedules).values({
      ...scheduleData as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    return newSchedule as IRevisionSchedule;
  }

  async getRevisionScheduleById(id: string): Promise<IRevisionSchedule | undefined> {
    const db = getDb();
    const [schedule] = await db.select().from(revisionSchedules).where(eq(revisionSchedules.id, id));
    return schedule as IRevisionSchedule | undefined;
  }

  async getRevisionSchedulesByStudentId(studentId: string): Promise<IRevisionSchedule[]> {
    const db = getDb();
    const schedules = await db.select().from(revisionSchedules).where(eq(revisionSchedules.studentId, studentId)).orderBy(asc(revisionSchedules.nextReviewDate));
    return schedules as IRevisionSchedule[];
  }

  async updateRevisionSchedule(id: string, updateData: Partial<Omit<IRevisionSchedule, "id" | "studentId" | "createdAt">>): Promise<IRevisionSchedule | undefined> {
    const db = getDb();
    const [updatedSchedule] = await db.update(revisionSchedules).set({
      ...updateData as any,
      updatedAt: new Date(),
    }).where(eq(revisionSchedules.id, id)).returning();

    // If nextReviewDate is updated and it's today or in the past, trigger a reminder
    if (updatedSchedule?.nextReviewDate && new Date(updatedSchedule.nextReviewDate) <= new Date()) {
      await this.createReminderForSchedule(updatedSchedule as any);
    }

    return updatedSchedule as IRevisionSchedule | undefined;
  }

  async deleteRevisionSchedule(id: string): Promise<void> {
    const db = getDb();
    await db.delete(revisionSchedules).where(eq(revisionSchedules.id, id));
  }

  // Notification logic for Hifz reminders
  private async createReminderForSchedule(schedule: IRevisionSchedule): Promise<void> {
    const db = getDb();
    // Fetch student details along with parent details
    const studentWithParent = await db.select({ student: students, parent: parents })
      .from(students)
      .leftJoin(parents, eq(students.parentId, parents.id))
      .where(eq(students.id, schedule.studentId))
      .limit(1);

    if (!studentWithParent || studentWithParent.length === 0 || !studentWithParent[0].student) {
      console.error(`Student with ID ${schedule.studentId} not found. Cannot send reminder.`);
      return;
    }

    const studentData = studentWithParent[0].student;
    const parentData = studentWithParent[0].parent;

    const title = "تذكير مراجعة الحفظ!";
    const message = `حان وقت مراجعة سورة ${schedule.suraNumber}, آية ${schedule.ayaNumber || 'بأكملها'}.`;

    // Create in-app notification
    await notificationService.createNotification({
      studentId: schedule.studentId,
      title: title,
      message: message,
      type: "reminder",
      read: false,
    });

    // Send email notification to parent if email is available
    try {
      if (parentData?.fatherEmail) {
        const emailSubject = `تذكير بمراجعة حفظ القرآن - سورة ${schedule.suraNumber}`;
        const emailHtml = `
          <p>السلام عليكم ورحمة الله وبركاته،</p>
          <p>مرحباً ولي أمر الطالب/ة ${studentData.firstName || 'العزيز/ة'}،</p>
          <p>هذا تذكير من تطبيق ترتيل القرآن بأن موعد مراجعة حفظ ${studentData.firstName || 'طالبك/طالبتك'} قد حان!</p>
          <p>الآية/السورة للمراجعة: <strong>سورة ${schedule.suraNumber}، آية ${schedule.ayaNumber || 'بأكملها'}</strong></p>
          <p>نوصيكم بمراجعة هذه الآيات مع ${studentData.firstName || 'طالبك/طالبتك'} لتعزيز حفظه/حفظها. جزاكم الله خيراً!</p>
          <p>مع تحيات فريق تطبيق ترتيل القرآن.</p>
        `;
        await notificationService.sendEmailNotification(parentData.fatherEmail, emailSubject, emailHtml);
      } else if (parentData?.motherEmail) {
        const emailSubject = `تذكير بمراجعة حفظ القرآن - سورة ${schedule.suraNumber}`;
        const emailHtml = `
          <p>السلام عليكم ورحمة الله وبركاته،</p>
          <p>مرحباً ولي أمر الطالب/ة ${studentData.firstName || 'العزيز/ة'}،</p>
          <p>هذا تذكير من تطبيق ترتيل القرآن بأن موعد مراجعة حفظ ${studentData.firstName || 'طالبك/طالبتك'} قد حان!</p>
          <p>الآية/السورة للمراجعة: <strong>سورة ${schedule.suraNumber}، آية ${schedule.ayaNumber || 'بأكملها'}</strong></p>
          <p>نوصيكم بمراجعة هذه الآيات مع ${studentData.firstName || 'طالبك/طالبتك'} لتعزيز حفظه/حفظها. جزاكم الله خيراً!</p>
          <p>مع تحيات فريق تطبيق ترتيل القرآن.</p>
        `;
        await notificationService.sendEmailNotification(parentData.motherEmail, emailSubject, emailHtml);
      }
    } catch (emailError) {
      console.error("Failed to send email for hifz reminder:", emailError);
      // Continue processing even if email fails
    }
  }

  // This function will be called by an API endpoint to simulate a daily cron job
  async checkAndCreateReminders(): Promise<void> {
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    const upcomingSchedules = await db.select()
      .from(revisionSchedules)
      .where(sql`${revisionSchedules.nextReviewDate} <= ${todayStr}`);

    for (const schedule of upcomingSchedules) {
      // Create reminder notification
      await this.createReminderForSchedule(schedule as IRevisionSchedule);

      // Update nextReviewDate for the schedule
      const newNextReviewDate = new Date(schedule.nextReviewDate);
      newNextReviewDate.setDate(newNextReviewDate.getDate() + schedule.intervalDays);

      await db.update(revisionSchedules)
        .set({
          nextReviewDate: newNextReviewDate.toISOString().split('T')[0],
          lastReviewedDate: new Date().toISOString(),
          updatedAt: new Date(),
        } as any)
        .where(eq(revisionSchedules.id, schedule.id));
    }
  }
}
