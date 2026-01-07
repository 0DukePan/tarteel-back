import { database } from '../config/database';
import { assignments } from '../db/schema';
import { IAssignment, QueryOptions } from '../types';
import { asc, desc, eq, ilike, count, and } from 'drizzle-orm';

export const AssignmentService = {
  async createAssignment(assignmentData: Omit<IAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAssignment> {
    const db = database.getDb();
    const newAssignment = await db.insert(assignments).values(assignmentData).returning();
    return newAssignment[0];
  },

  async getAssignments(options: QueryOptions): Promise<{ assignments: IAssignment[], total: number }> {
    const db = database.getDb();
    const { page = 1, limit = 10, sort = 'dueDate', search = '', courseId, teacherId } = options;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (courseId) conditions.push(eq(assignments.courseId, courseId));
    if (teacherId) conditions.push(eq(assignments.teacherId, teacherId));
    if (search) conditions.push(ilike(assignments.title, `%{search}%`));

    const query = db.select().from(assignments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const totalResult = await db.select({ count: count() }).from(assignments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0].count;

    const sortedQuery = sort.startsWith('-')
      ? query.orderBy(desc(assignments[sort.substring(1) as keyof IAssignment]))
      : query.orderBy(asc(assignments[sort as keyof IAssignment]));

    const pagedAssignments = await sortedQuery.limit(limit).offset(offset);

    return { assignments: pagedAssignments, total };
  },

  async getAssignmentById(id: string): Promise<IAssignment | undefined> {
    const db = database.getDb();
    const assignment = await db.select().from(assignments).where(eq(assignments.id, id)).limit(1);
    return assignment[0];
  },

  async updateAssignment(id: string, assignmentData: Partial<Omit<IAssignment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IAssignment | undefined> {
    const db = database.getDb();
    const updatedAssignment = await db.update(assignments).set({ ...assignmentData, updatedAt: new Date() }).where(eq(assignments.id, id)).returning();
    return updatedAssignment[0];
  },

  async deleteAssignment(id: string): Promise<boolean> {
    const db = database.getDb();
    const result = await db.delete(assignments).where(eq(assignments.id, id)).returning();
    return result.length > 0;
  },
};

