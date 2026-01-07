import { database } from "../config/database";
import { comments, posts, admins, teachers, parents, students } from "../db/schema";
import { IComment } from "../types";
import { logger } from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { eq, asc } from "drizzle-orm";

export class CommentService {
  private getDb() {
    return database.getDb();
  }

  async createComment(commentData: Omit<IComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<IComment> {
    try {
      const db = this.getDb();

      // Validate postId
      const postExists = await db.select().from(posts).where(eq(posts.id, commentData.postId)).limit(1);
      if (postExists.length === 0) {
        throw new AppError('Post not found', 404);
      }

      // Validate authorId and authorRole
      let authorExists = false;
      if (commentData.authorRole === 'admin') {
        const admin = await db.select().from(admins).where(eq(admins.id, commentData.authorId)).limit(1);
        authorExists = admin.length > 0;
      } else if (commentData.authorRole === 'teacher') {
        const teacher = await db.select().from(teachers).where(eq(teachers.id, commentData.authorId)).limit(1);
        authorExists = teacher.length > 0;
      } else if (commentData.authorRole === 'parent') {
        const parent = await db.select().from(parents).where(eq(parents.id, commentData.authorId)).limit(1);
        authorExists = parent.length > 0;
      } else if (commentData.authorRole === 'student') {
        const student = await db.select().from(students).where(eq(students.id, commentData.authorId)).limit(1);
        authorExists = student.length > 0;
      }

      if (!authorExists) {
        throw new AppError(`Author with ID ${commentData.authorId} and role ${commentData.authorRole} not found`, 404);
      }

      const newComment = await db.insert(comments).values(commentData as any).returning();
      logger.info(`New comment created: ${newComment[0].id}`);
      return newComment[0] as IComment;
    } catch (error) {
      logger.error('Error creating comment:', error);
      throw error;
    }
  }

  async getComments(postId?: string): Promise<IComment[]> {
    try {
      const db = this.getDb();
      const allComments = postId
        ? await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(asc(comments.createdAt))
        : await db.select().from(comments).orderBy(asc(comments.createdAt));
      return allComments as IComment[];
    } catch (error) {
      logger.error('Error fetching comments:', error);
      throw error;
    }
  }

  async getCommentById(id: string): Promise<IComment> {
    try {
      const db = this.getDb();
      const comment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
      if (comment.length === 0) {
        throw new AppError('Comment not found', 404);
      }
      return comment[0] as IComment;
    } catch (error) {
      logger.error(`Error fetching comment with ID ${id}:`, error);
      throw error;
    }
  }

  async updateComment(id: string, updateData: Partial<Omit<IComment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IComment> {
    try {
      const db = this.getDb();
      const existingComment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
      if (existingComment.length === 0) {
        throw new AppError('Comment not found', 404);
      }

      if (updateData.postId) {
        const postExists = await db.select().from(posts).where(eq(posts.id, updateData.postId)).limit(1);
        if (postExists.length === 0) {
          throw new AppError('Post not found', 404);
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

      const updatedComment = await db.update(comments).set({
        ...updateData as any,
        updatedAt: new Date(),
      }).where(eq(comments.id, id)).returning();

      logger.info(`Comment updated: ${id}`);
      return updatedComment[0] as IComment;
    } catch (error) {
      logger.error(`Error updating comment with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteComment(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const existingComment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
      if (existingComment.length === 0) {
        throw new AppError('Comment not found', 404);
      }

      await db.delete(comments).where(eq(comments.id, id));
      logger.info(`Comment deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting comment with ID ${id}:`, error);
      throw error;
    }
  }
}
