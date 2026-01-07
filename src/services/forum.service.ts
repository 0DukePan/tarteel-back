import { database } from "../config/database";
import { forums } from "../db/schema";
import { IForum } from "../types";
import { logger } from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { eq } from "drizzle-orm";

export class ForumService {
  private getDb() {
    return database.getDb();
  }

  async createForum(forumData: Omit<IForum, 'id' | 'createdAt' | 'updatedAt'>): Promise<IForum> {
    try {
      const db = this.getDb();
      const newForum = await db.insert(forums).values(forumData).returning();
      logger.info(`New forum created: ${newForum[0].id}`);
      return newForum[0];
    } catch (error) {
      logger.error('Error creating forum:', error);
      throw error;
    }
  }

  async getAllForums(): Promise<IForum[]> {
    try {
      const db = this.getDb();
      const allForums = await db.select().from(forums).orderBy(forums.name);
      return allForums;
    } catch (error) {
      logger.error('Error fetching all forums:', error);
      throw error;
    }
  }

  async getForumById(id: string): Promise<IForum> {
    try {
      const db = this.getDb();
      const forum = await db.select().from(forums).where(eq(forums.id, id)).limit(1);
      if (forum.length === 0) {
        throw new AppError('Forum not found', 404);
      }
      return forum[0];
    } catch (error) {
      logger.error(`Error fetching forum with ID ${id}:`, error);
      throw error;
    }
  }

  async updateForum(id: string, updateData: Partial<Omit<IForum, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IForum> {
    try {
      const db = this.getDb();
      const existingForum = await db.select().from(forums).where(eq(forums.id, id)).limit(1);
      if (existingForum.length === 0) {
        throw new AppError('Forum not found', 404);
      }

      const updatedForum = await db.update(forums).set({
        ...updateData,
        updatedAt: new Date(),
      }).where(eq(forums.id, id)).returning();

      logger.info(`Forum updated: ${id}`);
      return updatedForum[0];
    } catch (error) {
      logger.error(`Error updating forum with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteForum(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const existingForum = await db.select().from(forums).where(eq(forums.id, id)).limit(1);
      if (existingForum.length === 0) {
        throw new AppError('Forum not found', 404);
      }

      await db.delete(forums).where(eq(forums.id, id));
      logger.info(`Forum deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting forum with ID ${id}:`, error);
      throw error;
    }
  }
}


