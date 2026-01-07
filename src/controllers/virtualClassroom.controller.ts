import { Request, Response } from 'express';
import { VirtualClassroomService } from '../services/virtualClassroom.service';
import { ApiResponse } from '../types';
import { IVirtualClassroom, ISessionParticipant, IChatMessage } from '../types';
import { z } from 'zod';

const virtualClassroomService = new VirtualClassroomService();

// Zod schemas for validation
const createVirtualClassroomSchema = z.object({
  title: z.string().min(1, "Title cannot be empty."),
  description: z.string().optional(),
  scheduledTime: z.string().datetime("Invalid date-time format."),
  durationMinutes: z.number().int().min(1).max(360), // Max 6 hours
  teacherId: z.string().uuid("Invalid teacher ID format.").optional(),
  classId: z.string().uuid("Invalid class ID format.").optional(),
  meetingLink: z.string().url("Invalid URL format.").optional(),
  status: z.enum(["scheduled", "live", "ended", "cancelled"]).default("scheduled"),
});

const updateVirtualClassroomSchema = createVirtualClassroomSchema.partial();

const createSessionParticipantSchema = z.object({
  classroomId: z.string().uuid("Invalid classroom ID format."),
  userId: z.string().uuid("Invalid user ID format."),
  userRole: z.enum(["student", "teacher"]), // Assuming these are the only roles for participants
  leftAt: z.string().datetime("Invalid date-time format.").optional(),
});

const updateSessionParticipantSchema = createSessionParticipantSchema.partial();

const createChatMessageSchema = z.object({
  classroomId: z.string().uuid("Invalid classroom ID format."),
  senderId: z.string().uuid("Invalid sender ID format."),
  senderRole: z.enum(["student", "teacher"]), // Assuming these are the only roles for senders
  message: z.string().min(1, "Message cannot be empty."),
});

export class VirtualClassroomController {

  // --- Virtual Classroom Management ---
  async createVirtualClassroom(req: Request, res: Response<ApiResponse<IVirtualClassroom>>) {
    try {
      const validatedData = createVirtualClassroomSchema.parse(req.body);
      const newClassroom = await virtualClassroomService.createVirtualClassroom({ ...validatedData, scheduledTime: new Date(validatedData.scheduledTime) });
      res.status(201).json({ success: true, message: "Virtual classroom created successfully", data: newClassroom });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Failed to create virtual classroom", error: error.message });
    }
  }

  async getVirtualClassroomById(req: Request, res: Response<ApiResponse<IVirtualClassroom>>): Promise<void> {
    try {
      const { id } = req.params;
      const classroom = await virtualClassroomService.getVirtualClassroomById(id);
      if (!classroom) {
        res.status(404).json({ success: false, message: "Virtual classroom not found" });
        return;
      }
      res.status(200).json({ success: true, data: classroom });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to fetch virtual classroom", error: error.message });
    }
  }

  async getVirtualClassroomsByTeacherId(req: Request, res: Response<ApiResponse<IVirtualClassroom[]>>) {
    try {
      const { teacherId } = req.params;
      const classrooms = await virtualClassroomService.getVirtualClassroomsByTeacherId(teacherId);
      res.status(200).json({ success: true, data: classrooms });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to fetch virtual classrooms", error: error.message });
    }
  }

  async getVirtualClassroomsByClassId(req: Request, res: Response<ApiResponse<IVirtualClassroom[]>>) {
    try {
      const { classId } = req.params;
      const classrooms = await virtualClassroomService.getVirtualClassroomsByClassId(classId);
      res.status(200).json({ success: true, data: classrooms });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to fetch virtual classrooms", error: error.message });
    }
  }

  async getAllVirtualClassrooms(req: Request, res: Response<ApiResponse<IVirtualClassroom[]>>) {
    try {
      const classrooms = await virtualClassroomService.getAllVirtualClassrooms();
      res.status(200).json({ success: true, data: classrooms });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to fetch all virtual classrooms", error: error.message });
    }
  }

  async updateVirtualClassroom(req: Request, res: Response<ApiResponse<IVirtualClassroom>>): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateVirtualClassroomSchema.parse(req.body);
      const updatedClassroom = await virtualClassroomService.updateVirtualClassroom(id, { ...validatedData, scheduledTime: validatedData.scheduledTime ? new Date(validatedData.scheduledTime) : undefined });
      if (!updatedClassroom) {
        res.status(404).json({ success: false, message: "Virtual classroom not found" });
        return;
      }
      res.status(200).json({ success: true, message: "Virtual classroom updated successfully", data: updatedClassroom });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Failed to update virtual classroom", error: error.message });
    }
  }

  async deleteVirtualClassroom(req: Request, res: Response<ApiResponse<null>>) {
    try {
      const { id } = req.params;
      await virtualClassroomService.deleteVirtualClassroom(id);
      res.status(200).json({ success: true, message: "Virtual classroom deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to delete virtual classroom", error: error.message });
    }
  }

  // --- Session Participant Management ---
  async addSessionParticipant(req: Request, res: Response<ApiResponse<ISessionParticipant>>) {
    try {
      const validatedData = createSessionParticipantSchema.parse(req.body);
      const newParticipant = await virtualClassroomService.addSessionParticipant({ ...validatedData, leftAt: validatedData.leftAt ? new Date(validatedData.leftAt) : undefined });
      res.status(201).json({ success: true, message: "Session participant added successfully", data: newParticipant });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Failed to add session participant", error: error.message });
    }
  }

  async getSessionParticipantsByClassroomId(req: Request, res: Response<ApiResponse<ISessionParticipant[]>>) {
    try {
      const { classroomId } = req.params;
      const participants = await virtualClassroomService.getSessionParticipantsByClassroomId(classroomId);
      res.status(200).json({ success: true, data: participants });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to fetch session participants", error: error.message });
    }
  }

  async removeSessionParticipant(req: Request, res: Response<ApiResponse<null>>) {
    try {
      const { id } = req.params;
      await virtualClassroomService.removeSessionParticipant(id);
      res.status(200).json({ success: true, message: "Session participant removed successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to remove session participant", error: error.message });
    }
  }

  async updateSessionParticipant(req: Request, res: Response<ApiResponse<ISessionParticipant>>): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateSessionParticipantSchema.parse(req.body);
      const updatedParticipant = await virtualClassroomService.updateSessionParticipant(id, { ...validatedData, leftAt: validatedData.leftAt ? new Date(validatedData.leftAt) : undefined });
      if (!updatedParticipant) {
        res.status(404).json({ success: false, message: "Session participant not found" });
        return;
      }
      res.status(200).json({ success: true, message: "Session participant updated successfully", data: updatedParticipant });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Failed to update session participant", error: error.message });
    }
  }

  // --- Chat Message Management ---
  async createChatMessage(req: Request, res: Response<ApiResponse<IChatMessage>>) {
    try {
      const validatedData = createChatMessageSchema.parse(req.body);
      const newChatMessage = await virtualClassroomService.createChatMessage(validatedData);
      res.status(201).json({ success: true, message: "Chat message sent successfully", data: newChatMessage });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Failed to send chat message", error: error.message });
    }
  }

  async getChatMessagesByClassroomId(req: Request, res: Response<ApiResponse<IChatMessage[]>>) {
    try {
      const { classroomId } = req.params;
      const messages = await virtualClassroomService.getChatMessagesByClassroomId(classroomId);
      res.status(200).json({ success: true, data: messages });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to fetch chat messages", error: error.message });
    }
  }

  async deleteChatMessage(req: Request, res: Response<ApiResponse<null>>) {
    try {
      const { id } = req.params;
      await virtualClassroomService.deleteChatMessage(id);
      res.status(200).json({ success: true, message: "Chat message deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to delete chat message", error: error.message });
    }
  }
}

