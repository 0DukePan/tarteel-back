import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path"; // Added for path manipulation
import http from "http"; // Import http module
import { Server as SocketIOServer } from "socket.io"; // Import Socket.IO Server

import { database } from "./config/database";
import { logger } from "./config/logger";
import { notFound, errorHandler } from "./middleware/errorHandler";

import registrationRoutes from "./routes/registration.routes";
import classRoutes from "./routes/class.routes";
import teacherRoutes from "./routes/teacher.routes";
import { courseRoutes } from "./routes/course.routes";
import { enrollmentRoutes } from "./routes/enrollment.routes";
import { assignmentRoutes } from "./routes/assignment.routes";
import { submissionRoutes } from "./routes/submission.routes";
import { gradeRoutes } from "./routes/grade.routes";
import { attendanceRoutes } from "./routes/attendance.routes";
import { messageRoutes } from "./routes/message.routes";
import learningMaterialRoutes from "./routes/learningMaterial.routes";
import curriculumRoutes from "./routes/curriculum.routes";
import curriculumLessonRoutes from "./routes/curriculumLesson.routes";
import forumRoutes from "./routes/forum.routes";
import topicRoutes from "./routes/topic.routes";
import postRoutes from "./routes/post.routes";
import commentRoutes from "./routes/comment.routes";
import paymentRoutes from "./routes/payment.routes";
import invoiceRoutes from "./routes/invoice.routes";
import badgeRoutes from "./routes/badge.routes";
import recitationRoutes from "./routes/recitation.routes";
import hifzRoutes from "./routes/hifz.routes"; // New import
import notificationRoutes from "./routes/notification.routes"; // New import
import tafsirRoutes from "./routes/tafsir.routes"; // New import
import virtualClassroomRoutes from "./routes/virtualClassroom.routes"; // New import
import authRoutes from "./routes/auth.routes";
import stripeRoutes from "./routes/stripe.routes"; // Stripe payments
import quranRoutes from "./routes/quranRoutes"; // Quran.com API
import tajweedRoutes from "./routes/tajweedRoutes"; // AI Tajweed Analysis
import gamificationRoutes from "./routes/gamificationRoutes"; // Gamification Engine
import hifzSpacedRoutes from "./routes/hifzSpacedRoutes"; // Hifz Spaced Repetition
import certificateRoutes from "./routes/certificateRoutes"; // Certificate Generation
import goalsRoutes from "./routes/goalsRoutes"; // Daily/Weekly Goals
import schedulingRoutes from "./routes/schedulingRoutes"; // Teacher Scheduling
import competitionRoutes from "./routes/competitionRoutes"; // Quran Competitions
import videoLessonRoutes from "./routes/videoLessonRoutes"; // Video Lessons
import ramadanRoutes from "./routes/ramadanRoutes"; // Ramadan Challenge
import familyRoutes from "./routes/familyRoutes"; // Family Dashboard & Pricing
import schoolRoutes from "./routes/schoolRoutes"; // School Licenses B2B
import googleAuthRoutes from "./routes/googleAuthRoutes"; // Google OAuth

dotenv.config();

const app = express();
const httpServer = http.createServer(app); // Create HTTP server
const io = new SocketIOServer(httpServer, { // Initialize Socket.IO with HTTP server
  cors: {
    origin: [
      "http://localhost:3000",
      "https://tarteel-front.vercel.app",
      "https://tarteel-front-git-main-0dukepans-projects.vercel.app",
      "https://tarteel-front-dy2zc1yne-0dukepans-projects.vercel.app"
    ],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, enable in production
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: { policy: "no-referrer" },
}));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "https://tarteel-front.vercel.app",
  "https://tarteel-front-git-main-0dukepans-projects.vercel.app",
  "https://tarteel-front-dy2zc1yne-0dukepans-projects.vercel.app"
];
const vercelPreviewRegex = /^https:\/\/tarteel-front-[a-z0-9]+-0dukepans-projects\.vercel\.app$/;

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        vercelPreviewRegex.test(origin)
      ) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Cookie"],
  })
);

app.options("*", cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true, // يرسل RateLimit-* headers
  legacyHeaders: false,  // يعطل X-RateLimit-* القديم
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Quran School API - Online");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/learning-materials", learningMaterialRoutes);
app.use("/api/curriculums", curriculumRoutes);
app.use("/api/curriculum-lessons", curriculumLessonRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/recitations", recitationRoutes);
app.use("/api/hifz", hifzRoutes); // New route
app.use("/api/notifications", notificationRoutes); // New route
app.use("/api/tafsir", tafsirRoutes); // New route
app.use("/api/virtual-classrooms", virtualClassroomRoutes); // New route
app.use("/api/stripe", stripeRoutes); // Stripe payments
app.use("/api/auth", googleAuthRoutes); // Google OAuth
app.use("/api/quran", quranRoutes); // Quran.com API
app.use("/api/tajweed", tajweedRoutes); // AI Tajweed Analysis
app.use("/api/gamification", gamificationRoutes); // Gamification Engine
app.use("/api/hifz", hifzSpacedRoutes); // Hifz Spaced Repetition
app.use("/api/certificates", certificateRoutes); // Certificate Generation
app.use("/api/goals", goalsRoutes); // Daily/Weekly Goals
app.use("/api/scheduling", schedulingRoutes); // Teacher Scheduling
app.use("/api/competitions", competitionRoutes); // Quran Competitions
app.use("/api/lessons", videoLessonRoutes); // Video Lessons
app.use("/api/ramadan", ramadanRoutes); // Ramadan Challenge
app.use("/api/family", familyRoutes); // Family Dashboard & Pricing
app.use("/api/schools", schoolRoutes); // School Licenses B2B

app.use(notFound);
app.use(errorHandler);

// Socket.IO event handling
io.on('connection', (socket) => {
  logger.info(`🔌 Socket connected: ${socket.id}`);

  // ============ CLASSROOM EVENTS ============
  socket.on('joinClassroom', (classroomId: string) => {
    socket.join(classroomId);
    socket.to(classroomId).emit('participantJoined', {
      participantId: socket.id,
      timestamp: new Date().toISOString()
    });
    logger.info(`Socket ${socket.id} joined classroom: ${classroomId}`);
  });

  socket.on('leaveClassroom', (classroomId: string) => {
    socket.leave(classroomId);
    socket.to(classroomId).emit('participantLeft', {
      participantId: socket.id,
      timestamp: new Date().toISOString()
    });
    logger.info(`Socket ${socket.id} left classroom: ${classroomId}`);
  });

  socket.on('chatMessage', (data: { classroomId: string; senderId: string; senderRole: string; message: string }) => {
    const messageData = { ...data, timestamp: new Date().toISOString() };
    io.to(data.classroomId).emit('chatMessage', messageData);
    logger.info(`Chat in ${data.classroomId}: ${data.senderId} - ${data.message.substring(0, 50)}`);
  });

  socket.on('whiteboardUpdate', (data: { classroomId: string; update: any }) => {
    socket.to(data.classroomId).emit('whiteboardUpdate', data.update);
    logger.info(`Whiteboard update in ${data.classroomId}`);
  });

  // ============ NOTIFICATION EVENTS ============
  socket.on('joinNotifications', (userId: string) => {
    socket.join(`notifications:${userId}`);
    logger.info(`Socket ${socket.id} subscribed to notifications for user: ${userId}`);
  });

  socket.on('leaveNotifications', (userId: string) => {
    socket.leave(`notifications:${userId}`);
  });

  socket.on('markNotificationRead', (notificationId: string) => {
    // Could persist to DB here
    logger.info(`Notification ${notificationId} marked as read`);
  });

  // ============ DIRECT MESSAGING EVENTS ============
  socket.on('joinMessaging', (userId: string) => {
    socket.join(`messaging:${userId}`);
    logger.info(`Socket ${socket.id} joined messaging for user: ${userId}`);
  });

  socket.on('leaveMessaging', (userId: string) => {
    socket.leave(`messaging:${userId}`);
  });

  socket.on('directMessage', (data: { senderId: string; receiverId: string; message: string; timestamp: string }) => {
    // Send to receiver's room
    io.to(`messaging:${data.receiverId}`).emit('directMessage', data);
    // Also send back to sender to confirm delivery
    io.to(`messaging:${data.senderId}`).emit('directMessage', data);
    logger.info(`DM from ${data.senderId} to ${data.receiverId}`);
  });

  socket.on('typing', (data: { userId: string; receiverId: string }) => {
    io.to(`messaging:${data.receiverId}`).emit('userTyping', { userId: data.userId });
  });

  // ============ GENERIC ROOM EVENTS ============
  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leaveRoom', (roomId: string) => {
    socket.leave(roomId);
    logger.info(`Socket ${socket.id} left room: ${roomId}`);
  });

  // ============ DISCONNECT ============
  socket.on('disconnect', () => {
    logger.info(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await database.connect();
    httpServer.listen(PORT, () => { // Use httpServer.listen instead of app.listen
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🌐 WebSocket server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await database.disconnect();
  httpServer.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
