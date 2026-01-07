import { eq } from "drizzle-orm"
import { database } from "../config/database"
import { admins } from "../db/schema"
import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { AppError, asyncHandler } from "../middleware/errorHandler"
import { logger } from "../config/logger"
import type { JWTPayload } from "../types"

dotenv.config()

// Extend Express Request to include user from auth middleware
interface AuthenticatedRequest extends Request {
  user?: JWTPayload
}

// ------------------ LOGIN ------------------
export const login = asyncHandler(async (req: Request, res: Response) => {
  const db = database.getDb()
  const { email, password } = req.body

  // Find admin
  const adminResult = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1)
  const admin = adminResult[0]

  if (!admin || !admin.isActive) {
    throw new AppError("Invalid email or password", 401)
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, admin.password)
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401)
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    logger.error("JWT_SECRET is not defined")
    throw new AppError("Server configuration error", 500)
  }

  const payload: JWTPayload = {
    userId: admin.id,
    email: admin.email,
    role: admin.role as 'admin' | 'teacher' | 'parent' | 'student',
  }

  const jwtOptions: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  }

  const token = jwt.sign(payload, jwtSecret, jwtOptions)

  // Set cookie (for server-side)
  res.cookie("auth_token", token, {
    httpOnly: false, // Allow JS access so frontend can read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Allow cookie in cross-origin requests
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  })

  // Remove password from response
  const { password: _, ...adminResponse } = admin

  logger.info(`Admin login successful: ${admin.email}`)

  res.json({
    success: true,
    message: "Login successful",
    data: {
      admin: adminResponse,
      token, // Include token in response for frontend
    },
  })
})

// ------------------ GET PROFILE ------------------
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const db = database.getDb()

  if (!req.user) {
    throw new AppError("Not authenticated", 401)
  }

  const admin = await db
    .select()
    .from(admins)
    .where(eq(admins.id, req.user.userId))
    .limit(1)

  if (admin.length === 0) {
    throw new AppError("Admin not found", 404)
  }

  const { password, ...adminWithoutPassword } = admin[0]

  res.json({
    success: true,
    data: adminWithoutPassword,
  })
})

// ------------------ UPDATE PROFILE ------------------
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const db = database.getDb()
  const { username, email } = req.body

  if (!req.user) {
    throw new AppError("Not authenticated", 401)
  }

  await db
    .update(admins)
    .set({
      username,
      email,
      updatedAt: new Date(),
    })
    .where(eq(admins.id, req.user.userId))

  const updatedAdminResult = await db
    .select()
    .from(admins)
    .where(eq(admins.id, req.user.userId))
    .limit(1)

  const { password, ...adminWithoutPassword } = updatedAdminResult[0]

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: adminWithoutPassword,
  })
})
