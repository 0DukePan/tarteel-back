import { Server as SocketIOServer } from 'socket.io';

// This module provides utility functions to emit events from anywhere in the backend

let io: SocketIOServer | null = null;

/**
 * Initialize the notification utility with the Socket.IO server instance
 */
export function initializeSocketUtils(socketServer: SocketIOServer) {
    io = socketServer;
}

/**
 * Send a notification to a specific user
 */
export function sendNotificationToUser(
    userId: string,
    notification: {
        type: 'info' | 'message' | 'assignment' | 'class' | 'alert';
        title: string;
        body: string;
        link?: string;
    }
) {
    if (!io) {
        console.warn('Socket.IO not initialized. Call initializeSocketUtils first.');
        return;
    }

    io.to(`notifications:${userId}`).emit('notification', {
        id: `notif_${Date.now()}`,
        ...notification,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Send a notification to multiple users
 */
export function sendNotificationToUsers(
    userIds: string[],
    notification: {
        type: 'info' | 'message' | 'assignment' | 'class' | 'alert';
        title: string;
        body: string;
        link?: string;
    }
) {
    userIds.forEach(userId => sendNotificationToUser(userId, notification));
}

/**
 * Send a notification to all users in a classroom
 */
export function notifyClassroom(
    classroomId: string,
    notification: {
        type: 'info' | 'message' | 'assignment' | 'class' | 'alert';
        title: string;
        body: string;
        link?: string;
    }
) {
    if (!io) {
        console.warn('Socket.IO not initialized.');
        return;
    }

    io.to(classroomId).emit('notification', {
        id: `notif_${Date.now()}`,
        ...notification,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Broadcast a system-wide notification (to all connected users)
 */
export function broadcastNotification(notification: {
    type: 'info' | 'message' | 'assignment' | 'class' | 'alert';
    title: string;
    body: string;
    link?: string;
}) {
    if (!io) {
        console.warn('Socket.IO not initialized.');
        return;
    }

    io.emit('notification', {
        id: `notif_${Date.now()}`,
        ...notification,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Example usage in controllers/services:
 * 
 * import { sendNotificationToUser } from '../utils/socket-utils';
 * 
 * // When a new assignment is created:
 * sendNotificationToUser(studentId, {
 *   type: 'assignment',
 *   title: 'New Assignment',
 *   body: 'Your teacher posted a new assignment',
 *   link: '/student/assignments/123'
 * });
 * 
 * // When a class is about to start:
 * notifyClassroom(classroomId, {
 *   type: 'class',
 *   title: 'Class Starting Soon',
 *   body: 'Your class starts in 5 minutes',
 *   link: '/classroom/abc123'
 * });
 */
