import { database } from "../config/database";
import { virtualClassrooms, sessionParticipants, chatMessages } from "../db/schema";
import { IVirtualClassroom, ISessionParticipant, IChatMessage } from "../types";
import { eq, asc } from "drizzle-orm";
import { logger } from "../config/logger";

function getDb() {
  return database.getDb();
}

export class VirtualClassroomService {

  // --- Virtual Classroom Management ---
  async createVirtualClassroom(classroomData: Omit<IVirtualClassroom, "id" | "createdAt" | "updatedAt">): Promise<IVirtualClassroom> {
    const db = getDb();
    const [newClassroom] = await db.insert(virtualClassrooms).values({
      ...classroomData as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    return newClassroom as IVirtualClassroom;
  }

  async getVirtualClassroomById(id: string): Promise<IVirtualClassroom | undefined> {
    const db = getDb();
    const [classroom] = await db.select().from(virtualClassrooms).where(eq(virtualClassrooms.id, id));
    return classroom as IVirtualClassroom | undefined;
  }

  async getVirtualClassroomsByTeacherId(teacherId: string): Promise<IVirtualClassroom[]> {
    const db = getDb();
    const classrooms = await db.select().from(virtualClassrooms).where(eq(virtualClassrooms.teacherId, teacherId)).orderBy(asc(virtualClassrooms.scheduledTime));
    return classrooms as IVirtualClassroom[];
  }

  async getVirtualClassroomsByClassId(classId: string): Promise<IVirtualClassroom[]> {
    const db = getDb();
    const classrooms = await db.select().from(virtualClassrooms).where(eq(virtualClassrooms.classId, classId)).orderBy(asc(virtualClassrooms.scheduledTime));
    return classrooms as IVirtualClassroom[];
  }

  async getAllVirtualClassrooms(): Promise<IVirtualClassroom[]> {
    const db = getDb();
    const classrooms = await db.select().from(virtualClassrooms).orderBy(asc(virtualClassrooms.scheduledTime));
    return classrooms as IVirtualClassroom[];
  }

  async updateVirtualClassroom(id: string, updateData: Partial<Omit<IVirtualClassroom, "id" | "createdAt" | "updatedAt">>): Promise<IVirtualClassroom | undefined> {
    const db = getDb();
    const [updatedClassroom] = await db.update(virtualClassrooms).set({
      ...updateData as any,
      updatedAt: new Date(),
    }).where(eq(virtualClassrooms.id, id)).returning();
    return updatedClassroom as IVirtualClassroom | undefined;
  }

  async deleteVirtualClassroom(id: string): Promise<void> {
    const db = getDb();
    await db.delete(virtualClassrooms).where(eq(virtualClassrooms.id, id));
  }

  // --- Session Participant Management ---
  async addSessionParticipant(participantData: Omit<ISessionParticipant, "id" | "createdAt" | "updatedAt">): Promise<ISessionParticipant> {
    const db = getDb();
    const [newParticipant] = await db.insert(sessionParticipants).values({
      ...participantData as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    return newParticipant as ISessionParticipant;
  }

  async getSessionParticipantsByClassroomId(classroomId: string): Promise<ISessionParticipant[]> {
    const db = getDb();
    const participants = await db.select().from(sessionParticipants).where(eq(sessionParticipants.classroomId, classroomId)).orderBy(asc(sessionParticipants.joinedAt));
    return participants as ISessionParticipant[];
  }

  async removeSessionParticipant(id: string): Promise<void> {
    const db = getDb();
    await db.delete(sessionParticipants).where(eq(sessionParticipants.id, id));
  }

  async updateSessionParticipant(id: string, updateData: Partial<Omit<ISessionParticipant, "id" | "createdAt" | "updatedAt">>): Promise<ISessionParticipant | undefined> {
    const db = getDb();
    const [updatedParticipant] = await db.update(sessionParticipants).set({
      ...updateData as any,
      updatedAt: new Date(),
    }).where(eq(sessionParticipants.id, id)).returning();
    return updatedParticipant as ISessionParticipant | undefined;
  }

  // --- Chat Message Management ---
  async createChatMessage(messageData: Omit<IChatMessage, "id" | "createdAt" | "updatedAt">): Promise<IChatMessage> {
    const db = getDb();
    const [newMessage] = await db.insert(chatMessages).values({
      ...messageData as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    return newMessage as IChatMessage;
  }

  async getChatMessagesByClassroomId(classroomId: string): Promise<IChatMessage[]> {
    const db = getDb();
    const messages = await db.select().from(chatMessages).where(eq(chatMessages.classroomId, classroomId)).orderBy(asc(chatMessages.sentAt));
    return messages as IChatMessage[];
  }

  async deleteChatMessage(id: string): Promise<void> {
    const db = getDb();
    await db.delete(chatMessages).where(eq(chatMessages.id, id));
  }
}
