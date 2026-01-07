import { curriculumLessons, curriculums } from '../db/schema';
import { database } from '../config/database';
import { eq, asc, desc, and } from 'drizzle-orm';
import { logger } from '../config/logger';
import { ICurriculumLesson, QueryOptions } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CurriculumLessonService {
  private getDb() {
    return database.getDb();
  }

  async getAllCurriculumLessons(options?: QueryOptions) {
    try {
      const db = this.getDb();
      const { page = 1, limit = 10, curriculumId } = options || {};
      const offset = (page - 1) * limit;

      // Build conditions first
      const conditions: any[] = [];
      if (curriculumId) {
        conditions.push(eq(curriculumLessons.curriculumId, curriculumId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db.select({
        id: curriculumLessons.id,
        curriculumId: curriculumLessons.curriculumId,
        title: curriculumLessons.title,
        description: curriculumLessons.description,
        orderIndex: curriculumLessons.orderIndex,
        createdAt: curriculumLessons.createdAt,
        updatedAt: curriculumLessons.updatedAt,
        curriculum: {
          name: curriculums.name,
        },
      })
        .from(curriculumLessons)
        .leftJoin(curriculums, eq(curriculumLessons.curriculumId, curriculums.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(asc(curriculumLessons.orderIndex));

      const totalResult = await db.select().from(curriculumLessons).where(whereClause);

      return {
        data: result,
        pagination: {
          total: totalResult.length,
          page,
          limit,
          pages: Math.ceil(totalResult.length / limit),
        },
      };

    } catch (error) {
      logger.error('Error fetching curriculum lessons', error);
      throw error;
    }
  }

  async getCurriculumLessonById(id: string) {
    try {
      const db = this.getDb();
      const result = await db.select({
        id: curriculumLessons.id,
        curriculumId: curriculumLessons.curriculumId,
        title: curriculumLessons.title,
        description: curriculumLessons.description,
        orderIndex: curriculumLessons.orderIndex,
        createdAt: curriculumLessons.createdAt,
        updatedAt: curriculumLessons.updatedAt,
        curriculum: {
          name: curriculums.name,
        },
      })
        .from(curriculumLessons)
        .leftJoin(curriculums, eq(curriculumLessons.curriculumId, curriculums.id))
        .where(eq(curriculumLessons.id, id))
        .limit(1);

      if (result.length === 0) {
        throw new AppError('Curriculum lesson not found', 404);
      }
      return result[0];
    } catch (error) {
      logger.error('Error fetching curriculum lesson by ID', error);
      throw error;
    }
  }

  async createCurriculumLesson(data: Omit<ICurriculumLesson, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const db = this.getDb();
      const newLesson = await db.insert(curriculumLessons).values(data as any).returning();
      return newLesson[0];
    } catch (error) {
      logger.error('Error creating curriculum lesson', error);
      throw error;
    }
  }

  async updateCurriculumLesson(id: string, data: Partial<ICurriculumLesson>) {
    try {
      const db = this.getDb();
      const updatedLesson = await db.update(curriculumLessons).set({
        ...data as any,
        updatedAt: new Date(),
      })
        .where(eq(curriculumLessons.id, id))
        .returning();

      if (updatedLesson.length === 0) {
        throw new AppError('Curriculum lesson not found', 404);
      }
      return updatedLesson[0];
    } catch (error) {
      logger.error('Error updating curriculum lesson', error);
      throw error;
    }
  }

  async deleteCurriculumLesson(id: string) {
    try {
      const db = this.getDb();
      const deletedLesson = await db.delete(curriculumLessons).where(eq(curriculumLessons.id, id)).returning();
      if (deletedLesson.length === 0) {
        throw new AppError('Curriculum lesson not found', 404);
      }
      return { message: 'Curriculum lesson deleted successfully' };
    } catch (error) {
      logger.error('Error deleting curriculum lesson', error);
      throw error;
    }
  }
}

