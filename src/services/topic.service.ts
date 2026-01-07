import { database } from "../config/database";
import { topics, forums, admins, teachers, parents, students } from "../db/schema";
import { ITopic } from "../types";
import { logger } from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { eq, inArray } from "drizzle-orm";

export class TopicService {
  private getDb() {
    return database.getDb();
  }

  async createTopic(topicData: Omit<ITopic, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITopic> {
    try {
      const db = this.getDb();

      // Validate forumId
      const forumExists = await db.select().from(forums).where(eq(forums.id, topicData.forumId)).limit(1);
      if (forumExists.length === 0) {
        throw new AppError('Forum not found', 404);
      }

      // Validate authorId and authorRole
      let authorExists = false;
      if (topicData.authorRole === 'admin') {
        const admin = await db.select().from(admins).where(eq(admins.id, topicData.authorId)).limit(1);
        authorExists = admin.length > 0;
      } else if (topicData.authorRole === 'teacher') {
        const teacher = await db.select().from(teachers).where(eq(teachers.id, topicData.authorId)).limit(1);
        authorExists = teacher.length > 0;
      } else if (topicData.authorRole === 'parent') {
        const parent = await db.select().from(parents).where(eq(parents.id, topicData.authorId)).limit(1);
        authorExists = parent.length > 0;
      } else if (topicData.authorRole === 'student') {
        const student = await db.select().from(students).where(eq(students.id, topicData.authorId)).limit(1);
        authorExists = student.length > 0;
      }

      if (!authorExists) {
        throw new AppError(`Author with ID ${topicData.authorId} and role ${topicData.authorRole} not found`, 404);
      }

      const newTopic = await db.insert(topics).values(topicData as any).returning();
      logger.info(`New topic created: ${newTopic[0].id}`);
      return newTopic[0] as ITopic;
    } catch (error) {
      logger.error('Error creating topic:', error);
      throw error;
    }
  }

  async getTopics(forumId?: string): Promise<ITopic[]> {
    try {
      const db = this.getDb();
      const allTopics = forumId
        ? await db.select().from(topics).where(eq(topics.forumId, forumId))
        : await db.select().from(topics);
      return allTopics as ITopic[];
    } catch (error) {
      logger.error('Error fetching topics:', error);
      throw error;
    }
  }

  async getTopicById(id: string): Promise<ITopic> {
    try {
      const db = this.getDb();
      const topic = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
      if (topic.length === 0) {
        throw new AppError('Topic not found', 404);
      }
      return topic[0] as ITopic;
    } catch (error) {
      logger.error(`Error fetching topic with ID ${id}:`, error);
      throw error;
    }
  }

  async updateTopic(id: string, updateData: Partial<Omit<ITopic, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ITopic> {
    try {
      const db = this.getDb();
      const existingTopic = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
      if (existingTopic.length === 0) {
        throw new AppError('Topic not found', 404);
      }

      if (updateData.forumId) {
        const forumExists = await db.select().from(forums).where(eq(forums.id, updateData.forumId)).limit(1);
        if (forumExists.length === 0) {
          throw new AppError('Forum not found', 404);
        }
      }

      if (updateData.authorId && updateData.authorRole) {
        let authorExists = false;
        if (updateData.authorRole === 'admin') {
          const admin = await db.select().from(admins).where(eq(admins.id, updateData.authorId)).limit(1);
          authorExists = admin.length > 0;
        } else if (updateData.authorRole === 'teacher') {
          const teacher = await db.select().from(teachers).where(eq(teachers.id, updateData.authorId)).limit(1);
          authorExists = teacher.length > 0;
        } else if (updateData.authorRole === 'parent') {
          const parent = await db.select().from(parents).where(eq(parents.id, updateData.authorId)).limit(1);
          authorExists = parent.length > 0;
        } else if (updateData.authorRole === 'student') {
          const student = await db.select().from(students).where(eq(students.id, updateData.authorId)).limit(1);
          authorExists = student.length > 0;
        }

        if (!authorExists) {
          throw new AppError(`Author with ID ${updateData.authorId} and role ${updateData.authorRole} not found`, 404);
        }
      }

      const updatedTopic = await db.update(topics).set({
        ...updateData as any,
        updatedAt: new Date(),
      }).where(eq(topics.id, id)).returning();

      logger.info(`Topic updated: ${id}`);
      return updatedTopic[0] as ITopic;
    } catch (error) {
      logger.error(`Error updating topic with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteTopic(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const existingTopic = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
      if (existingTopic.length === 0) {
        throw new AppError('Topic not found', 404);
      }

      await db.delete(topics).where(eq(topics.id, id));
      logger.info(`Topic deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting topic with ID ${id}:`, error);
      throw error;
    }
  }
}

