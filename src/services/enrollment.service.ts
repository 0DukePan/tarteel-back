import { database } from '../config/database';
import { enrollments } from '../db/schema';
import { IEnrollment, QueryOptions } from '../types';
import { asc, desc, eq, count, and } from 'drizzle-orm';

export const EnrollmentService = {
  async createEnrollment(enrollmentData: Omit<IEnrollment, 'id' | 'createdAt' | 'updatedAt' | 'enrollmentDate'>): Promise<IEnrollment> {
    const db = database.getDb();
    const newEnrollment = await db.insert(enrollments).values(enrollmentData as any).returning();
    return newEnrollment[0] as IEnrollment;
  },

  async getEnrollments(options: QueryOptions): Promise<{ enrollments: IEnrollment[], total: number }> {
    const db = database.getDb();
    const { page = 1, limit = 10, sort = 'createdAt', studentId, courseId, status } = options as any;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (studentId) conditions.push(eq(enrollments.studentId, studentId));
    if (courseId) conditions.push(eq(enrollments.courseId, courseId));
    if (status) conditions.push(eq(enrollments.status, status));

    const query = db.select().from(enrollments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalResult = await db.select({ count: count() }).from(enrollments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0].count;

    // Default sort by createdAt
    const sortedQuery = sort.startsWith('-')
      ? query.orderBy(desc(enrollments.createdAt))
      : query.orderBy(asc(enrollments.createdAt));

    const pagedEnrollments = await sortedQuery.limit(limit).offset(offset);

    return { enrollments: pagedEnrollments as IEnrollment[], total };
  },

  async getEnrollmentById(id: string): Promise<IEnrollment | undefined> {
    const db = database.getDb();
    const enrollment = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
    return enrollment[0] as IEnrollment | undefined;
  },

  async updateEnrollment(id: string, enrollmentData: Partial<Omit<IEnrollment, 'id' | 'createdAt' | 'updatedAt' | 'enrollmentDate'>>): Promise<IEnrollment | undefined> {
    const db = database.getDb();
    const updatedEnrollment = await db.update(enrollments).set({ ...enrollmentData as any, updatedAt: new Date() }).where(eq(enrollments.id, id)).returning();
    return updatedEnrollment[0] as IEnrollment | undefined;
  },

  async deleteEnrollment(id: string): Promise<boolean> {
    const db = database.getDb();
    const result = await db.delete(enrollments).where(eq(enrollments.id, id)).returning();
    return result.length > 0;
  },
};
