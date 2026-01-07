import { database } from '../config/database';
import { messages } from '../db/schema';
import { IMessage, QueryOptions } from '../types';
import { asc, desc, eq, count, and } from 'drizzle-orm';

export const MessageService = {
  async createMessage(messageData: Omit<IMessage, 'id' | 'createdAt' | 'updatedAt' | 'read'>): Promise<IMessage> {
    const db = database.getDb();
    const newMessage = await db.insert(messages).values(messageData as any).returning();
    return newMessage[0] as IMessage;
  },

  async getMessages(options: QueryOptions): Promise<{ messages: IMessage[], total: number }> {
    const db = database.getDb();
    const { page = 1, limit = 10, senderId, receiverId } = options as any;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (senderId) conditions.push(eq(messages.senderId, senderId));
    if (receiverId) conditions.push(eq(messages.receiverId, receiverId));

    const query = db.select().from(messages)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalResult = await db.select({ count: count() }).from(messages)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0].count;

    // Default sort by createdAt
    const sortedQuery = query.orderBy(desc(messages.createdAt));

    const pagedMessages = await sortedQuery.limit(limit).offset(offset);

    return { messages: pagedMessages as IMessage[], total };
  },

  async getMessageById(id: string): Promise<IMessage | undefined> {
    const db = database.getDb();
    const message = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return message[0] as IMessage | undefined;
  },

  async updateMessage(id: string, messageData: Partial<Omit<IMessage, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IMessage | undefined> {
    const db = database.getDb();
    const updatedMessage = await db.update(messages).set({ ...messageData as any, updatedAt: new Date() }).where(eq(messages.id, id)).returning();
    return updatedMessage[0] as IMessage | undefined;
  },

  async deleteMessage(id: string): Promise<boolean> {
    const db = database.getDb();
    const result = await db.delete(messages).where(eq(messages.id, id)).returning();
    return result.length > 0;
  },
};
