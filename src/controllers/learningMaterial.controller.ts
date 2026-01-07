import { asyncHandler } from '../middleware/errorHandler';
import { LearningMaterialService } from '../services/learningMaterial.service';
import { Request, Response } from 'express';

export const getAllLearningMaterials = asyncHandler(async (req: Request, res: Response) => {
  const learningMaterialService = new LearningMaterialService();
  const { page, limit, search, classId } = req.query;

  const options = {
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    search: search as string | undefined,
    classId: classId as string | undefined,
  };

  const result = await learningMaterialService.getAllLearningMaterials(options);
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getLearningMaterialById = asyncHandler(async (req: Request, res: Response) => {
  const learningMaterialService = new LearningMaterialService();
  const { id } = req.params;
  const learningMaterial = await learningMaterialService.getLearningMaterialById(id);
  res.json({
    success: true,
    data: learningMaterial,
  });
});

export const createLearningMaterial = asyncHandler(async (req: Request, res: Response) => {
  const learningMaterialService = new LearningMaterialService();
  const newMaterial = await learningMaterialService.createLearningMaterial(req.body);
  res.status(201).json({
    success: true,
    message: 'Learning material created successfully',
    data: newMaterial,
  });
});

export const updateLearningMaterial = asyncHandler(async (req: Request, res: Response) => {
  const learningMaterialService = new LearningMaterialService();
  const { id } = req.params;
  const updatedMaterial = await learningMaterialService.updateLearningMaterial(id, req.body);
  res.json({
    success: true,
    message: 'Learning material updated successfully',
    data: updatedMaterial,
  });
});

export const deleteLearningMaterial = asyncHandler(async (req: Request, res: Response) => {
  const learningMaterialService = new LearningMaterialService();
  const { id } = req.params;
  await learningMaterialService.deleteLearningMaterial(id);
  res.json({
    success: true,
    message: 'Learning material deleted successfully',
  });
});


