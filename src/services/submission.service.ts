import { database } from '../config/database';
import { submissions } from '../db/schema';
import { ISubmission, QueryOptions } from '../types';
import { asc, desc, eq, ilike, count, and } from 'drizzle-orm';

export const SubmissionService = {
  async createSubmission(submissionData: Omit<ISubmission, 'id' | 'createdAt' | 'updatedAt' | 'submittedAt'>): Promise<ISubmission> {
    const db = database.getDb();
    const newSubmission = await db.insert(submissions).values(submissionData).returning();
    return newSubmission[0];
  },

  async getSubmissions(options: QueryOptions): Promise<{ submissions: ISubmission[], total: number }> {
    const db = database.getDb();
    const { page = 1, limit = 10, sort = 'submittedAt', search = '', assignmentId, studentId, gradeId } = options;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (assignmentId) conditions.push(eq(submissions.assignmentId, assignmentId));
    if (studentId) conditions.push(eq(submissions.studentId, studentId));
    if (gradeId) conditions.push(eq(submissions.gradeId, gradeId));
    // Add search for submission text or URL if needed

    const query = db.select().from(submissions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const totalResult = await db.select({ count: count() }).from(submissions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0].count;

    const sortedQuery = sort.startsWith('-')
      ? query.orderBy(desc(submissions[sort.substring(1) as keyof ISubmission]))
      : query.orderBy(asc(submissions[sort as keyof ISubmission]));

    const pagedSubmissions = await sortedQuery.limit(limit).offset(offset);

    return { submissions: pagedSubmissions, total };
  },

  async getSubmissionById(id: string): Promise<ISubmission | undefined> {
    const db = database.getDb();
    const submission = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    return submission[0];
  },

  async updateSubmission(id: string, submissionData: Partial<Omit<ISubmission, 'id' | 'createdAt' | 'updatedAt' | 'submittedAt'>>): Promise<ISubmission | undefined> {
    const db = database.getDb();
    const updatedSubmission = await db.update(submissions).set({ ...submissionData, updatedAt: new Date() }).where(eq(submissions.id, id)).returning();
    return updatedSubmission[0];
  },

  async deleteSubmission(id: string): Promise<boolean> {
    const db = database.getDb();
    const result = await db.delete(submissions).where(eq(submissions.id, id)).returning();
    return result.length > 0;
  },
};
