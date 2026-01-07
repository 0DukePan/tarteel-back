import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { InvoiceService } from '../services/invoice.service';
import { ApiResponse, IInvoice } from '../types';
import { logger } from '../config/logger';

const invoiceService = new InvoiceService();

export const createInvoice = asyncHandler(async (req: Request, res: Response<ApiResponse<IInvoice>>, next: NextFunction) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({ success: true, message: 'Invoice created successfully', data: invoice });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    next(error);
  }
});

export const getInvoices = asyncHandler(async (req: Request, res: Response<ApiResponse<IInvoice[]>>, next: NextFunction) => {
  try {
    const { parentId, enrollmentId } = req.query;
    const invoices = await invoiceService.getInvoices(parentId as string, enrollmentId as string);
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    next(error);
  }
});

export const getInvoiceById = asyncHandler(async (req: Request, res: Response<ApiResponse<IInvoice>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoiceById(id);
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    logger.error(`Error fetching invoice with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const updateInvoice = asyncHandler(async (req: Request, res: Response<ApiResponse<IInvoice>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedInvoice = await invoiceService.updateInvoice(id, req.body);
    res.status(200).json({ success: true, message: 'Invoice updated successfully', data: updatedInvoice });
  } catch (error) {
    logger.error(`Error updating invoice with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const deleteInvoice = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await invoiceService.deleteInvoice(id);
    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting invoice with ID ${req.params.id}:`, error);
    next(error);
  }
});

