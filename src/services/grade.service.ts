import { database } from '../config/database';
import { grades } from '../db/schema';
import { IGrade, QueryOptions } from '../types';
import { asc, desc, eq, ilike, count, and } from 'drizzle-orm';

export const GradeService = {
  async createGrade(gradeData: Omit<IGrade, 'id' | 'createdAt' | 'updatedAt' | 'gradedAt'>): Promise<IGrade> {
    const db = database.getDb();
    const newGrade = await db.insert(grades).values(gradeData).returning();
    return newGrade[0];
  },

  async getGrades(options: QueryOptions): Promise<{ grades: IGrade[], total: number }> {
    const db = database.getDb();
    const { page = 1, limit = 10, sort = 'gradedAt', studentId, assignmentId, teacherId } = options;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (studentId) conditions.push(eq(grades.studentId, studentId));
    if (assignmentId) conditions.push(eq(grades.assignmentId, assignmentId));
    if (teacherId) conditions.push(eq(grades.teacherId, teacherId));

    const query = db.select().from(grades)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const totalResult = await db.select({ count: count() }).from(grades)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0].count;

    const sortedQuery = sort.startsWith('-')
      ? query.orderBy(desc(grades[sort.substring(1) as keyof IGrade]))
      : query.orderBy(asc(grades[sort as keyof IGrade]));

    const pagedGrades = await sortedQuery.limit(limit).offset(offset);

    return { grades: pagedGrades, total };
  },

  async getGradeById(id: string): Promise<IGrade | undefined> {
    const db = database.getDb();
    const grade = await db.select().from(grades).where(eq(grades.id, id)).limit(1);
    return grade[0];
  },

  async updateGrade(id: string, gradeData: Partial<Omit<IGrade, 'id' | 'createdAt' | 'updatedAt' | 'gradedAt'>>): Promise<IGrade | undefined> {
    const db = database.getDb();
    const updatedGrade = await db.update(grades).set({ ...gradeData, updatedAt: new Date() }).where(eq(grades.id, id)).returning();
    return updatedGrade[0];
  },

  async deleteGrade(id: string): Promise<boolean> {
    const db = database.getDb();
    const result = await db.delete(grades).where(eq(grades.id, id)).returning();
    return result.length > 0;
  },
};

