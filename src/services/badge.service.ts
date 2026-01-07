import { database } from "../config/database";
import { badges, userBadges, students } from "../db/schema";
import { IBadge, IUserBadge } from "../types";
import { logger } from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { eq, and, desc, asc } from "drizzle-orm";

export class BadgeService {
  private getDb() {
    return database.getDb();
  }

  async createBadge(badgeData: Omit<IBadge, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBadge> {
    try {
      const db = this.getDb();
      const newBadge = await db.insert(badges).values(badgeData as any).returning();
      logger.info(`New badge created: ${newBadge[0].id}`);
      return newBadge[0] as IBadge;
    } catch (error) {
      logger.error('Error creating badge:', error);
      throw error;
    }
  }

  async getBadges(): Promise<IBadge[]> {
    try {
      const db = this.getDb();
      const allBadges = await db.select().from(badges).orderBy(asc(badges.name));
      return allBadges as IBadge[];
    } catch (error) {
      logger.error('Error fetching badges:', error);
      throw error;
    }
  }

  async getBadgeById(id: string): Promise<IBadge> {
    try {
      const db = this.getDb();
      const badge = await db.select().from(badges).where(eq(badges.id, id)).limit(1);

      if (badge.length === 0) {
        throw new AppError('Badge not found', 404);
      }
      return badge[0] as IBadge;
    } catch (error) {
      logger.error(`Error fetching badge with ID ${id}:`, error);
      throw error;
    }
  }

  async updateBadge(id: string, updateData: Partial<Omit<IBadge, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IBadge> {
    try {
      const db = this.getDb();

      const existingBadge = await db.select().from(badges).where(eq(badges.id, id)).limit(1);
      if (existingBadge.length === 0) {
        throw new AppError('Badge not found', 404);
      }

      const updatedBadge = await db.update(badges).set({
        ...updateData as any,
        updatedAt: new Date(),
      }).where(eq(badges.id, id)).returning();

      logger.info(`Badge updated: ${id}`);
      return updatedBadge[0] as IBadge;
    } catch (error) {
      logger.error(`Error updating badge with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteBadge(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const existingBadge = await db.select().from(badges).where(eq(badges.id, id)).limit(1);
      if (existingBadge.length === 0) {
        throw new AppError('Badge not found', 404);
      }

      await db.delete(badges).where(eq(badges.id, id));
      logger.info(`Badge deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting badge with ID ${id}:`, error);
      throw error;
    }
  }

  async awardBadgeToStudent(studentId: string, badgeId: string): Promise<IUserBadge> {
    try {
      const db = this.getDb();

      const studentExists = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
      if (studentExists.length === 0) {
        throw new AppError('Student not found', 404);
      }

      const badgeExists = await db.select().from(badges).where(eq(badges.id, badgeId)).limit(1);
      if (badgeExists.length === 0) {
        throw new AppError('Badge not found', 404);
      }

      // Use and() for multiple conditions
      const existingAward = await db.select().from(userBadges).where(and(eq(userBadges.studentId, studentId), eq(userBadges.badgeId, badgeId))).limit(1);
      if (existingAward.length > 0) {
        throw new AppError('Student already has this badge', 409);
      }

      const newAward = await db.insert(userBadges).values({ studentId, badgeId } as any).returning();
      logger.info(`Badge ${badgeId} awarded to student ${studentId}: ${newAward[0].id}`);
      return newAward[0] as IUserBadge;
    } catch (error) {
      logger.error('Error awarding badge to student:', error);
      throw error;
    }
  }

  async getStudentBadges(studentId: string): Promise<IUserBadge[]> {
    try {
      const db = this.getDb();
      const studentBadges = await db.select().from(userBadges).where(eq(userBadges.studentId, studentId)).orderBy(desc(userBadges.awardedAt));
      return studentBadges as IUserBadge[];
    } catch (error) {
      logger.error(`Error fetching badges for student ${studentId}:`, error);
      throw error;
    }
  }

  async revokeBadgeFromStudent(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const existingAward = await db.select().from(userBadges).where(eq(userBadges.id, id)).limit(1);
      if (existingAward.length === 0) {
        throw new AppError('User badge not found', 404);
      }

      await db.delete(userBadges).where(eq(userBadges.id, id));
      logger.info(`Badge revoked: ${id}`);
    } catch (error) {
      logger.error(`Error revoking badge with ID ${id}:`, error);
      throw error;
    }
  }
}
