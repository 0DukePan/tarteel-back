import { database } from '../config/database';
import { attendance } from '../db/schema';
import { IAttendance, QueryOptions } from '../types';
import { asc, desc, eq, count, and } from 'drizzle-orm';

export const AttendanceService = {
  async createAttendance(attendanceData: Omit<IAttendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAttendance> {
    const db = database.getDb();
    const newAttendance = await db.insert(attendance).values(attendanceData as any).returning();
    return newAttendance[0] as IAttendance;
  },

  async getAttendanceRecords(options: QueryOptions): Promise<{ attendance: IAttendance[], total: number }> {
    const db = database.getDb();
    const { page = 1, limit = 10, studentId, classId, status } = options;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (studentId) conditions.push(eq(attendance.studentId, studentId));
    if (classId) conditions.push(eq(attendance.classId, classId));
    if (status) conditions.push(eq(attendance.status, status));

    const query = db.select().from(attendance)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalResult = await db.select({ count: count() }).from(attendance)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0].count;

    // Default sort by date
    const sortedQuery = query.orderBy(desc(attendance.date));

    const pagedAttendance = await sortedQuery.limit(limit).offset(offset);

    return { attendance: pagedAttendance as IAttendance[], total };
  },

  async getAttendanceById(id: string): Promise<IAttendance | undefined> {
    const db = database.getDb();
    const attendanceRecord = await db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
    return attendanceRecord[0] as IAttendance | undefined;
  },

  async updateAttendance(id: string, attendanceData: Partial<Omit<IAttendance, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IAttendance | undefined> {
    const db = database.getDb();
    const updatedAttendance = await db.update(attendance).set({ ...attendanceData as any, updatedAt: new Date() }).where(eq(attendance.id, id)).returning();
    return updatedAttendance[0] as IAttendance | undefined;
  },

  async deleteAttendance(id: string): Promise<boolean> {
    const db = database.getDb();
    const result = await db.delete(attendance).where(eq(attendance.id, id)).returning();
    return result.length > 0;
  },
};
