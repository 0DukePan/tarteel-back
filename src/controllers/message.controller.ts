import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';
import { ApiResponse, PaginatedResponse, IMessage } from '../types';
import { logger } from '../config/logger';

export const MessageController = {
  async createMessage(req: Request, res: Response<ApiResponse<IMessage>>, next: NextFunction): Promise<void> {
    try {
      const message = await MessageService.createMessage(req.body);
      res.status(201).json({ success: true, message: 'Message sent successfully', data: message });
    } catch (error) {
      logger.error('Error sending message:', error);
      next(error);
    }
  },

  async getMessages(req: Request, res: Response<PaginatedResponse<IMessage>>, next: NextFunction): Promise<void> {
    try {
      const options = req.query;
      const { messages, total } = await MessageService.getMessages(options);
      res.status(200).json({
        success: true,
        data: messages,
        pagination: {
          page: Number(options.page) || 1,
          limit: Number(options.limit) || 10,
          total,
          pages: Math.ceil(total / (Number(options.limit) || 10)),
        },
      });
    } catch (error) {
      logger.error('Error fetching messages:', error);
      next(error);
    }
  },

  async getMessageById(req: Request, res: Response<ApiResponse<IMessage>>, next: NextFunction): Promise<void> {
    try {
      const message = await MessageService.getMessageById(req.params.id);
      if (!message) {
        res.status(404).json({ success: false, error: 'Message not found' });
        return;
      }
      res.status(200).json({ success: true, data: message });
    } catch (error) {
      logger.error('Error fetching message by ID:', error);
      next(error);
    }
  },

  async updateMessage(req: Request, res: Response<ApiResponse<IMessage>>, next: NextFunction): Promise<void> {
    try {
      const message = await MessageService.updateMessage(req.params.id, req.body);
      if (!message) {
        res.status(404).json({ success: false, error: 'Message not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Message updated successfully', data: message });
    } catch (error) {
      logger.error('Error updating message:', error);
      next(error);
    }
  },

  async deleteMessage(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const success = await MessageService.deleteMessage(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Message not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
      logger.error('Error deleting message:', error);
      next(error);
    }
  },
};

