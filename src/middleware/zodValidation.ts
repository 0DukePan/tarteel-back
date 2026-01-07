import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Zod validation middleware
export const validateZod = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages: Record<string, string> = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    errorMessages[path] = err.message;
                });

                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors: errorMessages,
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: 'Internal server error during validation',
            });
        }
    };
};
