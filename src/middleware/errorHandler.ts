import { logger } from '../config/logger';
import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorResponse extends ApiResponse {
  error: string;
  details?: { stack?: string };
}

export const errorHandler = (
  error: Error | AppError, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  logger.info('Error handler triggered for:', { 
    url: req.url, 
    method: req.method,
    statusCode: error instanceof AppError ? error.statusCode : 500 
  });

  let statusCode = 500;
  let message = 'Internal Server Error';

  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.message.includes('duplicate key')) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid Token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token Expired';
  } else {
    logger.error('Unknown error type', {
      error: error.message,
      name: error.name,
      stack: error.stack,
    });
  }

  const showStackTrace = process.env.SHOW_STACK_TRACE === 'true' && 
                         process.env.NODE_ENV === 'development';

  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(showStackTrace && { details: { stack: error.stack } }),
  } as ErrorResponse);
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (error instanceof AppError && !error.isOperational) {
        logger.error('Non-operational error', { 
          error: error.message, 
          stack: error.stack 
        });
        process.exit(1);
      }
      next(error);
    });
  };
};