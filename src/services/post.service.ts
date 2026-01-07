import { database } from "../config/database";
import { posts, topics, admins, teachers, parents, students } from "../db/schema";
import { IPost } from "../types";
import { logger } from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { eq, asc } from "drizzle-orm";

export class PostService {
  private getDb() {
    return database.getDb();
  }

  async createPost(postData: Omit<IPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPost> {
    try {
      const db = this.getDb();

      // Validate topicId
      const topicExists = await db.select().from(topics).where(eq(topics.id, postData.topicId)).limit(1);
      if (topicExists.length === 0) {
        throw new AppError('Topic not found', 404);
      }

      // Validate authorId and authorRole
      let authorExists = false;
      if (postData.authorRole === 'admin') {
        const admin = await db.select().from(admins).where(eq(admins.id, postData.authorId)).limit(1);
        authorExists = admin.length > 0;
      } else if (postData.authorRole === 'teacher') {
        const teacher = await db.select().from(teachers).where(eq(teachers.id, postData.authorId)).limit(1);
        authorExists = teacher.length > 0;
      } else if (postData.authorRole === 'parent') {
        const parent = await db.select().from(parents).where(eq(parents.id, postData.authorId)).limit(1);
        authorExists = parent.length > 0;
      } else if (postData.authorRole === 'student') {
        const student = await db.select().from(students).where(eq(students.id, postData.authorId)).limit(1);
        authorExists = student.length > 0;
      }

      if (!authorExists) {
        throw new AppError(`Author with ID ${postData.authorId} and role ${postData.authorRole} not found`, 404);
      }

      const newPost = await db.insert(posts).values(postData as any).returning();
      logger.info(`New post created: ${newPost[0].id}`);
      return newPost[0] as IPost;
    } catch (error) {
      logger.error('Error creating post:', error);
      throw error;
    }
  }

  async getPosts(topicId?: string): Promise<IPost[]> {
    try {
      const db = this.getDb();
      const allPosts = topicId
        ? await db.select().from(posts).where(eq(posts.topicId, topicId)).orderBy(asc(posts.createdAt))
        : await db.select().from(posts).orderBy(asc(posts.createdAt));
      return allPosts as IPost[];
    } catch (error) {
      logger.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<IPost> {
    try {
      const db = this.getDb();
      const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      if (post.length === 0) {
        throw new AppError('Post not found', 404);
      }
      return post[0] as IPost;
    } catch (error) {
      logger.error(`Error fetching post with ID ${id}:`, error);
      throw error;
    }
  }

  async updatePost(id: string, updateData: Partial<Omit<IPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IPost> {
    try {
      const db = this.getDb();
      const existingPost = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      if (existingPost.length === 0) {
        throw new AppError('Post not found', 404);
      }

      if (updateData.topicId) {
        const topicExists = await db.select().from(topics).where(eq(topics.id, updateData.topicId)).limit(1);
        if (topicExists.length === 0) {
          throw new AppError('Topic not found', 404);
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

      const updatedPost = await db.update(posts).set({
        ...updateData as any,
        updatedAt: new Date(),
      }).where(eq(posts.id, id)).returning();

      logger.info(`Post updated: ${id}`);
      return updatedPost[0] as IPost;
    } catch (error) {
      logger.error(`Error updating post with ID ${id}:`, error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      const db = this.getDb();
      const existingPost = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      if (existingPost.length === 0) {
        throw new AppError('Post not found', 404);
      }

      await db.delete(posts).where(eq(posts.id, id));
      logger.info(`Post deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting post with ID ${id}:`, error);
      throw error;
    }
  }
}
