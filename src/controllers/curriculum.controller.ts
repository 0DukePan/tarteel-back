import { asyncHandler } from '../middleware/errorHandler';
import { CurriculumService } from '../services/curriculum.service';
import { Request, Response } from 'express';

export const getAllCurriculums = asyncHandler(async (req: Request, res: Response) => {
  const curriculumService = new CurriculumService();
  const { page, limit, search, courseId } = req.query;

  const options = {
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    search: search as string | undefined,
    courseId: courseId as string | undefined,
  };

  const result = await curriculumService.getAllCurriculums(options);
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getCurriculumById = asyncHandler(async (req: Request, res: Response) => {
  const curriculumService = new CurriculumService();
  const { id } = req.params;
  const curriculum = await curriculumService.getCurriculumById(id);
  res.json({
    success: true,
    data: curriculum,
  });
});

export const createCurriculum = asyncHandler(async (req: Request, res: Response) => {
  const curriculumService = new CurriculumService();
  const newCurriculum = await curriculumService.createCurriculum(req.body);
  res.status(201).json({
    success: true,
    message: 'Curriculum created successfully',
    data: newCurriculum,
  });
});

export const updateCurriculum = asyncHandler(async (req: Request, res: Response) => {
  const curriculumService = new CurriculumService();
  const { id } = req.params;
  const updatedCurriculum = await curriculumService.updateCurriculum(id, req.body);
  res.json({
    success: true,
    message: 'Curriculum updated successfully',
    data: updatedCurriculum,
  });
});

export const deleteCurriculum = asyncHandler(async (req: Request, res: Response) => {
  const curriculumService = new CurriculumService();
  const { id } = req.params;
  await curriculumService.deleteCurriculum(id);
  res.json({
    success: true,
    message: 'Curriculum deleted successfully',
  });
});


