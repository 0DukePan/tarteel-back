import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { PaymentService } from '../services/payment.service';
import { ApiResponse, IPayment } from '../types';
import { logger } from '../config/logger';

const paymentService = new PaymentService();

export const createPayment = asyncHandler(async (req: Request, res: Response<ApiResponse<IPayment>>, next: NextFunction) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    res.status(201).json({ success: true, message: 'Payment created successfully', data: payment });
  } catch (error) {
    logger.error('Error creating payment:', error);
    next(error);
  }
});

export const getPayments = asyncHandler(async (req: Request, res: Response<ApiResponse<IPayment[]>>, next: NextFunction) => {
  try {
    const { enrollmentId } = req.query;
    const payments = await paymentService.getPayments(enrollmentId as string);
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    next(error);
  }
});

export const getPaymentById = asyncHandler(async (req: Request, res: Response<ApiResponse<IPayment>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id);
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    logger.error(`Error fetching payment with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const updatePayment = asyncHandler(async (req: Request, res: Response<ApiResponse<IPayment>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedPayment = await paymentService.updatePayment(id, req.body);
    res.status(200).json({ success: true, message: 'Payment updated successfully', data: updatedPayment });
  } catch (error) {
    logger.error(`Error updating payment with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const deletePayment = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await paymentService.deletePayment(id);
    res.status(200).json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting payment with ID ${req.params.id}:`, error);
    next(error);
  }
});

