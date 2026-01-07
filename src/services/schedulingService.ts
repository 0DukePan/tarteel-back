import { logger } from '../config/logger';

/**
 * Teacher Scheduling Service - Calendar booking for 1:1 sessions
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0

export interface TimeSlot {
    id: string;
    teacherId: string;
    dayOfWeek: DayOfWeek;
    startTime: string; // HH:mm format
    endTime: string;
    isRecurring: boolean;
    specificDate?: Date; // For non-recurring slots
    isActive: boolean;
}

export interface BookedSession {
    id: string;
    teacherId: string;
    studentId: string;
    scheduledAt: Date;
    duration: number; // in minutes
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    meetingUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AvailableSlot {
    date: Date;
    startTime: string;
    endTime: string;
    teacherId: string;
    teacherName?: string;
}

// In-memory storage (replace with DB in production)
const availabilityStore: Map<string, TimeSlot[]> = new Map();
const sessionsStore: Map<string, BookedSession[]> = new Map();

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const schedulingService = {
    /**
     * Set teacher availability for a day
     */
    async setAvailability(data: {
        teacherId: string;
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
        isRecurring?: boolean;
        specificDate?: Date;
    }): Promise<TimeSlot> {
        const slot: TimeSlot = {
            id: `slot_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            teacherId: data.teacherId,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            isRecurring: data.isRecurring ?? true,
            specificDate: data.specificDate,
            isActive: true,
        };

        const teacherSlots = availabilityStore.get(data.teacherId) || [];
        teacherSlots.push(slot);
        availabilityStore.set(data.teacherId, teacherSlots);

        logger.info(`Availability set for teacher ${data.teacherId}: ${DAY_NAMES[data.dayOfWeek]} ${data.startTime}-${data.endTime}`);
        return slot;
    },

    /**
     * Get teacher's availability
     */
    async getTeacherAvailability(teacherId: string): Promise<TimeSlot[]> {
        return availabilityStore.get(teacherId) || [];
    },

    /**
     * Remove availability slot
     */
    async removeAvailability(teacherId: string, slotId: string): Promise<boolean> {
        const slots = availabilityStore.get(teacherId) || [];
        const index = slots.findIndex(s => s.id === slotId);
        if (index >= 0) {
            slots.splice(index, 1);
            availabilityStore.set(teacherId, slots);
            return true;
        }
        return false;
    },

    /**
     * Get available slots for booking
     * Returns available slots for the next N days
     */
    async getAvailableSlots(teacherId: string, daysAhead: number = 14): Promise<AvailableSlot[]> {
        const slots = availabilityStore.get(teacherId) || [];
        const bookedSessions = sessionsStore.get(teacherId) || [];
        const availableSlots: AvailableSlot[] = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysAhead; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dayOfWeek = date.getDay() as DayOfWeek;

            // Find slots for this day
            const daySlots = slots.filter(s =>
                s.isActive &&
                s.dayOfWeek === dayOfWeek &&
                (s.isRecurring || (s.specificDate && this.isSameDay(s.specificDate, date)))
            );

            for (const slot of daySlots) {
                // Generate 30-minute slots within the availability window
                const [startHour, startMin] = slot.startTime.split(':').map(Number);
                const [endHour, endMin] = slot.endTime.split(':').map(Number);

                let currentHour = startHour;
                let currentMin = startMin;

                while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
                    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
                    const nextMin = currentMin + 30;
                    const nextHour = currentHour + Math.floor(nextMin / 60);
                    const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMin % 60).padStart(2, '0')}`;

                    // Check if this slot is already booked
                    const slotDate = new Date(date);
                    slotDate.setHours(currentHour, currentMin, 0, 0);

                    const isBooked = bookedSessions.some(session =>
                        session.status === 'scheduled' &&
                        this.isSameDay(session.scheduledAt, date) &&
                        session.scheduledAt.getHours() === currentHour &&
                        session.scheduledAt.getMinutes() === currentMin
                    );

                    if (!isBooked) {
                        availableSlots.push({
                            date: slotDate,
                            startTime: slotStart,
                            endTime: slotEnd,
                            teacherId,
                        });
                    }

                    currentMin += 30;
                    if (currentMin >= 60) {
                        currentHour += 1;
                        currentMin = 0;
                    }
                }
            }
        }

        return availableSlots.sort((a, b) => a.date.getTime() - b.date.getTime());
    },

    /**
     * Book a session
     */
    async bookSession(data: {
        teacherId: string;
        studentId: string;
        scheduledAt: Date;
        duration?: number;
        notes?: string;
    }): Promise<BookedSession> {
        // Check if slot is available
        const availableSlots = await this.getAvailableSlots(data.teacherId, 30);
        const isAvailable = availableSlots.some(slot =>
            slot.date.getTime() === data.scheduledAt.getTime()
        );

        if (!isAvailable) {
            throw new Error('This time slot is not available');
        }

        const session: BookedSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            teacherId: data.teacherId,
            studentId: data.studentId,
            scheduledAt: data.scheduledAt,
            duration: data.duration || 30,
            status: 'scheduled',
            meetingUrl: `https://meet.tarteel.school/${data.teacherId.slice(0, 8)}/${Date.now()}`,
            notes: data.notes,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const teacherSessions = sessionsStore.get(data.teacherId) || [];
        teacherSessions.push(session);
        sessionsStore.set(data.teacherId, teacherSessions);

        logger.info(`Session booked: ${session.id} - ${data.studentId} with ${data.teacherId}`);
        return session;
    },

    /**
     * Get sessions for a teacher
     */
    async getTeacherSessions(teacherId: string, upcoming: boolean = true): Promise<BookedSession[]> {
        const sessions = sessionsStore.get(teacherId) || [];
        const now = new Date();

        if (upcoming) {
            return sessions
                .filter(s => s.status === 'scheduled' && s.scheduledAt > now)
                .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
        }
        return sessions.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
    },

    /**
     * Get sessions for a student
     */
    async getStudentSessions(studentId: string, upcoming: boolean = true): Promise<BookedSession[]> {
        const allSessions: BookedSession[] = [];
        for (const sessions of sessionsStore.values()) {
            allSessions.push(...sessions.filter(s => s.studentId === studentId));
        }

        const now = new Date();
        if (upcoming) {
            return allSessions
                .filter(s => s.status === 'scheduled' && s.scheduledAt > now)
                .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
        }
        return allSessions.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
    },

    /**
     * Cancel a session
     */
    async cancelSession(sessionId: string, teacherId: string): Promise<BookedSession | null> {
        const sessions = sessionsStore.get(teacherId) || [];
        const session = sessions.find(s => s.id === sessionId);

        if (session) {
            session.status = 'cancelled';
            session.updatedAt = new Date();
            return session;
        }
        return null;
    },

    /**
     * Complete a session
     */
    async completeSession(sessionId: string, teacherId: string, notes?: string): Promise<BookedSession | null> {
        const sessions = sessionsStore.get(teacherId) || [];
        const session = sessions.find(s => s.id === sessionId);

        if (session) {
            session.status = 'completed';
            session.notes = notes || session.notes;
            session.updatedAt = new Date();
            return session;
        }
        return null;
    },

    // Helper
    isSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }
};
