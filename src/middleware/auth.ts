import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import jwt from 'jsonwebtoken';
import { JWTPayload } from "../types";
import { database } from '../config/database'; // Fixed import path
import { eq } from "drizzle-orm";
import { admins, teachers, parents } from "../db/schema";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.auth_token || req.header("Authorization")?.replace("Bearer ", "");
    logger.info(`authenticate: Processing token for request to ${req.path}`);
    
    if (!token) {
      logger.error("authenticate: No token provided");
      res.status(401).json({ 
        success: false, 
        error: "Access denied. No token provided." 
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error("authenticate: JWT_SECRET is not defined");
      res.status(500).json({ 
        success: false, 
        error: "Server configuration error" 
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    logger.info(`authenticate: Token decoded for user ID: ${decoded.userId}, Role: ${decoded.role}`);

    const db = database.getDb();
    let user: any;

    switch (decoded.role) {
      case 'admin':
        const adminResult = await db.select().from(admins).where(eq(admins.id, decoded.userId)).limit(1);
        user = adminResult[0];
        if (user) user.type = 'admin';
        break;
      case 'teacher':
        const teacherResult = await db.select().from(teachers).where(eq(teachers.id, decoded.userId)).limit(1);
        user = teacherResult[0];
        if (user) user.type = 'teacher';
        break;
      case 'parent':
        const parentResult = await db.select().from(parents).where(eq(parents.id, decoded.userId)).limit(1);
        user = parentResult[0];
        if (user) user.type = 'parent';
        break;
      default:
        logger.error(`authenticate: Unknown user role: ${decoded.role}`);
        res.status(401).json({ 
          success: false, 
          error: "Invalid token: Unknown role" 
        });
        return;
    }
    
    if (!user || !user.isActive && user.type === 'admin') { // Only admins have isActive field
      logger.error(`authenticate: Invalid token or inactive user for ID: ${decoded.userId}`);
      res.status(401).json({ 
        success: false, 
        error: "Invalid token or account is inactive" 
      });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    req.user = { ...userWithoutPassword, role: decoded.role }; // Attach user and role to request
    next();
  } catch (error) {
    logger.error(`authenticate: Authentication error for ${req.path}:`, error);
    res.status(401).json({ 
      success: false, 
      error: "Invalid token" 
    });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Access denied. Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions'
      });
      return;
    }

    next();
  };
};