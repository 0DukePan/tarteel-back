import jwt from 'jsonwebtoken';
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { admins } from "../db/schema";
import { logger } from "../config/logger";
import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  logger.error("JWT_SECRET environment variable is not set");
  process.exit(1);
}

export const generateAuthToken = (userId: string, email: string, role: string): string => {
  return jwt.sign({ userId, email, role }, jwtSecret, { expiresIn: '1h' });
};

const insertAdmin = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const sql = neon(databaseUrl) as NeonQueryFunction<boolean, boolean>;
    const db = drizzle(sql, {
      schema: { admins },
    });

    logger.info("Starting admin insertion...");

    const hashedPassword = await bcrypt.hash("admin123", 12);

    await db.insert(admins).values({
      username: "newAdmin",
      email: "newadmin@quranschool.com",
      password: hashedPassword,
      role: "admin",
    });

    logger.info("Admin inserted successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error inserting admin:", error);
    process.exit(1);
  }
};

insertAdmin();