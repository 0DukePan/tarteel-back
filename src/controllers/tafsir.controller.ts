import { Request, Response } from 'express';
import { TafsirService } from '../services/tafsir.service';
import { ApiResponse } from '../types';
import { ITranslation, ITafsir, IWordAnalysis } from '../types';
import { z } from 'zod';

const tafsirService = new TafsirService();

// Zod schemas for validation
const getTranslationSchema = z.object({
  suraNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1).max(114)
  ),
  ayaNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1)
  ),
  languageCode: z.string().min(2).max(10),
  translatorName: z.string().min(1),
});

const getTafsirSchema = z.object({
  suraNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1).max(114)
  ),
  ayaNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1)
  ),
  tafsirName: z.string().min(1),
});

const getWordAnalysisSchema = z.object({
  suraNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1).max(114)
  ),
  ayaNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1)
  ),
  wordNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(1)
  ),
});

export class TafsirController {
  async getTranslation(req: Request, res: Response<ApiResponse<ITranslation>>): Promise<void> {
    try {
      const { suraNumber, ayaNumber, languageCode, translatorName } = getTranslationSchema.parse(req.query);
      const translation = await tafsirService.getTranslation(suraNumber, ayaNumber, languageCode, translatorName);

      if (!translation) {
        res.status(404).json({ success: false, message: "Translation not found for the specified criteria." });
        return;
      }

      res.status(200).json({ success: true, data: translation });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Failed to retrieve translation", error: error.message });
    }
  }

  async getTafsir(req: Request, res: Response<ApiResponse<ITafsir>>): Promise<void> {
    try {
      const { suraNumber, ayaNumber, tafsirName } = getTafsirSchema.parse(req.query);
      const tafsir = await tafsirService.getTafsir(suraNumber, ayaNumber, tafsirName);

      if (!tafsir) {
        res.status(404).json({ success: false, message: "Tafsir not found for the specified criteria." });
        return;
      }

      res.status(200).json({ success: true, data: tafsir });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Failed to retrieve tafsir", error: error.message });
    }
  }

  async getWordAnalysis(req: Request, res: Response<ApiResponse<IWordAnalysis>>): Promise<void> {
    try {
      const { suraNumber, ayaNumber, wordNumber } = getWordAnalysisSchema.parse(req.query);
      const wordAnalysis = await tafsirService.getWordAnalysis(suraNumber, ayaNumber, wordNumber);

      if (!wordAnalysis) {
        res.status(404).json({ success: false, message: "Word analysis not found for the specified criteria." });
        return;
      }

      res.status(200).json({ success: true, data: wordAnalysis });
    } catch (error: any) {
      res.status(400).json({ success: false, message: "Failed to retrieve word analysis", error: error.message });
    }
  }

  async getAvailableEditions(req: Request, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const editions = await tafsirService.getAvailableEditions();
      if (!editions) {
        res.status(500).json({ success: false, message: "Failed to retrieve available editions from CDN." });
        return;
      }
      res.status(200).json({ success: true, data: editions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to retrieve available editions", error: error.message });
    }
  }
}

