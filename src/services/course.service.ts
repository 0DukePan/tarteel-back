import { database } from '../config/database';
import { courses } from '../db/schema';
import { ICourse, QueryOptions } from '../types';
import { asc, desc, eq, ilike, count } from 'drizzle-orm';

export const CourseService = {
  async createCourse(courseData: Omit<ICourse, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICourse> {
    const db = database.getDb();
    const newCourse = await db.insert(courses).values(courseData).returning();
    return newCourse[0];
  },

  async getCourses(options: QueryOptions): Promise<{ courses: ICourse[], total: number }> {
    const db = database.getDb();
    const { page = 1, limit = 10, sort = 'createdAt', search = '' } = options;
    const offset = (page - 1) * limit;

    const query = db.select().from(courses)
      .where(ilike(courses.name, `%{search}%`));
    
    const totalResult = await db.select({ count: count() }).from(courses)
      .where(ilike(courses.name, `%{search}%`));
    const total = totalResult[0].count;

    const sortedQuery = sort.startsWith('-')
      ? query.orderBy(desc(courses[sort.substring(1) as keyof ICourse]))
      : query.orderBy(asc(courses[sort as keyof ICourse]));

    const pagedCourses = await sortedQuery.limit(limit).offset(offset);

    return { courses: pagedCourses, total };
  },

  async getCourseById(id: string): Promise<ICourse | undefined> {
    const db = database.getDb();
    const course = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return course[0];
  },

  async updateCourse(id: string, courseData: Partial<Omit<ICourse, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ICourse | undefined> {
    const db = database.getDb();
    const updatedCourse = await db.update(courses).set({ ...courseData, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
    return updatedCourse[0];
  },

  async deleteCourse(id: string): Promise<boolean> {
    const db = database.getDb();
    const result = await db.delete(courses).where(eq(courses.id, id)).returning();
    return result.length > 0;
  },
};

