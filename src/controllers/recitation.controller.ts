import { Request, Response } from 'express';
import { RecitationService } from '../services/recitation.service';
import { ApiResponse } from '../types';
import { IRecitation } from '../types';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';

const recitationService = new RecitationService();

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Configure Multer for file uploads to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

const createRecitationSchema = z.object({
  studentId: z.string().uuid("Invalid student ID format."),
  suraNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1).max(114)
  ),
  ayaNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1)
  ),
});

const updateRecitationSchema = z.object({
  suraNumber: z.number().int().min(1).max(114).optional(),
  ayaNumber: z.number().int().min(1).optional(),
  transcribedText: z.string().optional(),
  tajweedFeedback: z.string().optional(),
  score: z.number().int().min(0).max(100).optional(),
});

export class RecitationController {
  uploadAudio = upload.single('audio'); // Middleware for single audio file upload

  async createRecitation(req: Request, res: Response<ApiResponse<IRecitation>>): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No audio file uploaded.",
        });
        return;
      }

      const { studentId, suraNumber, ayaNumber } = req.body;

      const validatedData = createRecitationSchema.parse({
        studentId,
        suraNumber,
        ayaNumber,
      });

      const newRecitation = await recitationService.createRecitation({
        studentId: validatedData.studentId,
        suraNumber: validatedData.suraNumber,
        ayaNumber: validatedData.ayaNumber,
      }, req.file.path, req.file.mimetype);

      res.status(201).json({
        success: true,
        message: "Recitation created successfully",
        data: newRecitation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Failed to create recitation",
        error: error.message,
      });
    }
  }

  async getRecitationById(req: Request, res: Response<ApiResponse<IRecitation>>): Promise<void> {
    try {
      const { id } = req.params;
      const recitation = await recitationService.getRecitationById(id);

      if (!recitation) {
        res.status(404).json({
          success: false,
          message: "Recitation not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: recitation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve recitation",
        error: error.message,
      });
    }
  }

  async getRecitationsByStudentId(req: Request, res: Response<ApiResponse<IRecitation[]>>) {
    try {
      const { studentId } = req.params;
      const recitations = await recitationService.getRecitationsByStudentId(studentId);
      res.status(200).json({
        success: true,
        data: recitations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve recitations",
        error: error.message,
      });
    }
  }

  async updateRecitation(req: Request, res: Response<ApiResponse<IRecitation>>): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateRecitationSchema.parse(req.body);

      const updatedRecitation = await recitationService.updateRecitation(id, validatedData);

      if (!updatedRecitation) {
        res.status(404).json({
          success: false,
          message: "Recitation not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Recitation updated successfully",
        data: updatedRecitation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "Failed to update recitation",
        error: error.message,
      });
    }
  }

  async deleteRecitation(req: Request, res: Response<ApiResponse<null>>): Promise<void> {
    try {
      const { id } = req.params;
      const recitation = await recitationService.getRecitationById(id);

      if (!recitation) {
        res.status(404).json({
          success: false,
          message: "Recitation not found",
        });
        return;
      }

      await recitationService.deleteRecitation(id);
      res.status(200).json({
        success: true,
        message: "Recitation deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete recitation",
        error: error.message,
      });
    }
  }
}
