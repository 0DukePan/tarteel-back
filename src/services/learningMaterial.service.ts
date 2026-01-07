import { learningMaterials, classes, teachers } from '../db/schema';
import { database } from '../config/database';
import { eq, asc, desc, and } from 'drizzle-orm';
import { logger } from '../config/logger';
import { ILearningMaterial, QueryOptions } from '../types';
import { AppError } from '../middleware/errorHandler';

export class LearningMaterialService {
  private getDb() {
    return database.getDb();
  }

  async getAllLearningMaterials(options?: QueryOptions) {
    try {
      const db = this.getDb();
      const { page = 1, limit = 10, classId } = options || {};
      const offset = (page - 1) * limit;

      // Build conditions first
      const conditions: any[] = [];
      if (classId) {
        conditions.push(eq(learningMaterials.classId, classId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db.select({
        id: learningMaterials.id,
        classId: learningMaterials.classId,
        teacherId: learningMaterials.teacherId,
        title: learningMaterials.title,
        description: learningMaterials.description,
        fileUrl: learningMaterials.fileUrl,
        fileType: learningMaterials.fileType,
        uploadedAt: learningMaterials.uploadedAt,
        createdAt: learningMaterials.createdAt,
        updatedAt: learningMaterials.updatedAt,
        class: {
          name: classes.name,
        },
        teacher: {
          name: teachers.name,
        },
      })
        .from(learningMaterials)
        .leftJoin(classes, eq(learningMaterials.classId, classes.id))
        .leftJoin(teachers, eq(learningMaterials.teacherId, teachers.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(learningMaterials.createdAt));

      const totalResult = await db.select().from(learningMaterials).where(whereClause);

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
      logger.error('Error fetching learning materials', error);
      throw error;
    }
  }

  async getLearningMaterialById(id: string) {
    try {
      const db = this.getDb();
      const result = await db.select({
        id: learningMaterials.id,
        classId: learningMaterials.classId,
        teacherId: learningMaterials.teacherId,
        title: learningMaterials.title,
        description: learningMaterials.description,
        fileUrl: learningMaterials.fileUrl,
        fileType: learningMaterials.fileType,
        uploadedAt: learningMaterials.uploadedAt,
        createdAt: learningMaterials.createdAt,
        updatedAt: learningMaterials.updatedAt,
        class: {
          name: classes.name,
        },
        teacher: {
          name: teachers.name,
        },
      })
        .from(learningMaterials)
        .leftJoin(classes, eq(learningMaterials.classId, classes.id))
        .leftJoin(teachers, eq(learningMaterials.teacherId, teachers.id))
        .where(eq(learningMaterials.id, id))
        .limit(1);

      if (result.length === 0) {
        throw new AppError('Learning material not found', 404);
      }
      return result[0];
    } catch (error) {
      logger.error('Error fetching learning material by ID', error);
      throw error;
    }
  }

  async createLearningMaterial(data: Omit<ILearningMaterial, 'id' | 'uploadedAt' | 'createdAt' | 'updatedAt'>) {
    try {
      const db = this.getDb();
      const newMaterial = await db.insert(learningMaterials).values(data as any).returning();
      return newMaterial[0];
    } catch (error) {
      logger.error('Error creating learning material', error);
      throw error;
    }
  }

  async updateLearningMaterial(id: string, data: Partial<ILearningMaterial>) {
    try {
      const db = this.getDb();
      const updatedMaterial = await db.update(learningMaterials).set({
        ...data as any,
        updatedAt: new Date(),
      })
        .where(eq(learningMaterials.id, id))
        .returning();

      if (updatedMaterial.length === 0) {
        throw new AppError('Learning material not found', 404);
      }
      return updatedMaterial[0];
    } catch (error) {
      logger.error('Error updating learning material', error);
      throw error;
    }
  }

  async deleteLearningMaterial(id: string) {
    try {
      const db = this.getDb();
      const deletedMaterial = await db.delete(learningMaterials).where(eq(learningMaterials.id, id)).returning();
      if (deletedMaterial.length === 0) {
        throw new AppError('Learning material not found', 404);
      }
      return { message: 'Learning material deleted successfully' };
    } catch (error) {
      logger.error('Error deleting learning material', error);
      throw error;
    }
  }
}


