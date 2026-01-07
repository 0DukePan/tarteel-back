import { curriculums, curriculumLessons, courses } from '../db/schema';
import { database } from '../config/database';
import { eq, asc, desc, and } from 'drizzle-orm';
import { logger } from '../config/logger';
import { ICurriculum, QueryOptions } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CurriculumService {
  private getDb() {
    return database.getDb();
  }

  async getAllCurriculums(options?: QueryOptions) {
    try {
      const db = this.getDb();
      const { page = 1, limit = 10, courseId } = options || {};
      const offset = (page - 1) * limit;

      // Build conditions first
      const conditions: any[] = [];
      if (courseId) {
        conditions.push(eq(curriculums.courseId, courseId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db.select({
        id: curriculums.id,
        courseId: curriculums.courseId,
        name: curriculums.name,
        description: curriculums.description,
        createdAt: curriculums.createdAt,
        updatedAt: curriculums.updatedAt,
        course: {
          name: courses.name,
        },
      })
        .from(curriculums)
        .leftJoin(courses, eq(curriculums.courseId, courses.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(curriculums.createdAt));

      const totalResult = await db.select().from(curriculums).where(whereClause);

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
      logger.error('Error fetching curriculums', error);
      throw error;
    }
  }

  async getCurriculumById(id: string) {
    try {
      const db = this.getDb();
      const result = await db.select({
        id: curriculums.id,
        courseId: curriculums.courseId,
        name: curriculums.name,
        description: curriculums.description,
        createdAt: curriculums.createdAt,
        updatedAt: curriculums.updatedAt,
        course: {
          name: courses.name,
        },
      })
        .from(curriculums)
        .leftJoin(courses, eq(curriculums.courseId, courses.id))
        .where(eq(curriculums.id, id))
        .limit(1);

      if (result.length === 0) {
        throw new AppError('Curriculum not found', 404);
      }
      return result[0];
    } catch (error) {
      logger.error('Error fetching curriculum by ID', error);
      throw error;
    }
  }

  async createCurriculum(data: Omit<ICurriculum, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const db = this.getDb();
      const newCurriculum = await db.insert(curriculums).values(data as any).returning();
      return newCurriculum[0];
    } catch (error) {
      logger.error('Error creating curriculum', error);
      throw error;
    }
  }

  async updateCurriculum(id: string, data: Partial<ICurriculum>) {
    try {
      const db = this.getDb();
      const updatedCurriculum = await db.update(curriculums).set({
        ...data as any,
        updatedAt: new Date(),
      })
        .where(eq(curriculums.id, id))
        .returning();

      if (updatedCurriculum.length === 0) {
        throw new AppError('Curriculum not found', 404);
      }
      return updatedCurriculum[0];
    } catch (error) {
      logger.error('Error updating curriculum', error);
      throw error;
    }
  }

  async deleteCurriculum(id: string) {
    try {
      const db = this.getDb();
      const deletedCurriculum = await db.delete(curriculums).where(eq(curriculums.id, id)).returning();
      if (deletedCurriculum.length === 0) {
        throw new AppError('Curriculum not found', 404);
      }
      return { message: 'Curriculum deleted successfully' };
    } catch (error) {
      logger.error('Error deleting curriculum', error);
      throw error;
    }
  }
}


