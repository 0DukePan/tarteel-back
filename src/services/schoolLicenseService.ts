import { logger } from '../config/logger';

/**
 * School License Service - B2B offering for Islamic schools
 * 
 * Pricing (per year):
 * - Starter: Up to 20 students, 3 teachers = €500/year
 * - Standard: Up to 50 students, 5 teachers = €1,000/year
 * - Premium: Up to 100 students, 10 teachers = €1,800/year
 * - Enterprise: Unlimited = Custom pricing
 */

export type LicenseTier = 'starter' | 'standard' | 'premium' | 'enterprise';

export interface SchoolLicense {
    id: string;
    schoolName: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
    tier: LicenseTier;
    maxStudents: number;
    maxTeachers: number;
    currentStudents: number;
    currentTeachers: number;
    subscriptionStart: Date;
    subscriptionEnd: Date;
    pricePerYear: number;
    status: 'active' | 'expired' | 'pending' | 'cancelled';
    adminIds: string[];  // School admin user IDs
    createdAt: Date;
}

export interface SchoolMember {
    id: string;
    schoolId: string;
    userId: string;
    userName: string;
    role: 'admin' | 'teacher' | 'student';
    joinedAt: Date;
}

export interface SchoolAnalytics {
    totalStudents: number;
    totalTeachers: number;
    activeStudentsThisWeek: number;
    totalVersesMemorized: number;
    totalLessonsCompleted: number;
    averageXP: number;
    topPerformers: Array<{ name: string; xp: number; level: number }>;
}

// Pricing configuration
export const SCHOOL_PRICING = {
    starter: {
        maxStudents: 20,
        maxTeachers: 3,
        pricePerYear: 500,
        pricePerMonth: 50,
    },
    standard: {
        maxStudents: 50,
        maxTeachers: 5,
        pricePerYear: 1000,
        pricePerMonth: 99,
    },
    premium: {
        maxStudents: 100,
        maxTeachers: 10,
        pricePerYear: 1800,
        pricePerMonth: 175,
    },
    enterprise: {
        maxStudents: 999999,
        maxTeachers: 999999,
        pricePerYear: 0, // Custom
        pricePerMonth: 0,
    },
};

// In-memory storage
const schoolsStore: Map<string, SchoolLicense> = new Map();
const membersStore: Map<string, SchoolMember[]> = new Map();

export const schoolLicenseService = {
    /**
     * Get pricing tiers
     */
    getPricingTiers() {
        return [
            { tier: 'starter', ...SCHOOL_PRICING.starter, name: 'Starter', description: 'Perfect for small weekend schools' },
            { tier: 'standard', ...SCHOOL_PRICING.standard, name: 'Standard', description: 'For growing madrasas' },
            { tier: 'premium', ...SCHOOL_PRICING.premium, name: 'Premium', description: 'For established institutions' },
            { tier: 'enterprise', ...SCHOOL_PRICING.enterprise, name: 'Enterprise', description: 'Custom solutions for large organizations' },
        ];
    },

    /**
     * Register a new school
     */
    async registerSchool(data: {
        schoolName: string;
        contactEmail: string;
        contactPhone?: string;
        address?: string;
        tier: LicenseTier;
        adminId: string;
    }): Promise<SchoolLicense> {
        const tierConfig = SCHOOL_PRICING[data.tier];
        const now = new Date();
        const subscriptionEnd = new Date(now);
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

        const school: SchoolLicense = {
            id: `school_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            schoolName: data.schoolName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            address: data.address,
            tier: data.tier,
            maxStudents: tierConfig.maxStudents,
            maxTeachers: tierConfig.maxTeachers,
            currentStudents: 0,
            currentTeachers: 0,
            subscriptionStart: now,
            subscriptionEnd,
            pricePerYear: tierConfig.pricePerYear,
            status: 'active',
            adminIds: [data.adminId],
            createdAt: now,
        };

        schoolsStore.set(school.id, school);
        membersStore.set(school.id, []);

        logger.info(`School registered: ${school.id} - ${school.schoolName} (${data.tier})`);
        return school;
    },

    /**
     * Get school by ID
     */
    async getSchool(schoolId: string): Promise<SchoolLicense | null> {
        return schoolsStore.get(schoolId) || null;
    },

    /**
     * Get all schools (admin)
     */
    async getAllSchools(): Promise<SchoolLicense[]> {
        return Array.from(schoolsStore.values());
    },

    /**
     * Add member to school
     */
    async addMember(
        schoolId: string,
        userId: string,
        userName: string,
        role: 'admin' | 'teacher' | 'student'
    ): Promise<SchoolMember> {
        const school = schoolsStore.get(schoolId);
        if (!school) throw new Error('School not found');

        // Check limits
        if (role === 'student' && school.currentStudents >= school.maxStudents) {
            throw new Error(`Student limit reached (${school.maxStudents})`);
        }
        if (role === 'teacher' && school.currentTeachers >= school.maxTeachers) {
            throw new Error(`Teacher limit reached (${school.maxTeachers})`);
        }

        const member: SchoolMember = {
            id: `member_${Date.now()}`,
            schoolId,
            userId,
            userName,
            role,
            joinedAt: new Date(),
        };

        const members = membersStore.get(schoolId) || [];

        // Check if already a member
        if (members.find(m => m.userId === userId)) {
            throw new Error('User is already a member of this school');
        }

        members.push(member);
        membersStore.set(schoolId, members);

        // Update counts
        if (role === 'student') school.currentStudents++;
        if (role === 'teacher') school.currentTeachers++;
        if (role === 'admin') school.adminIds.push(userId);
        schoolsStore.set(schoolId, school);

        logger.info(`Member ${userId} added to school ${schoolId} as ${role}`);
        return member;
    },

    /**
     * Remove member from school
     */
    async removeMember(schoolId: string, userId: string): Promise<boolean> {
        const members = membersStore.get(schoolId) || [];
        const index = members.findIndex(m => m.userId === userId);

        if (index < 0) return false;

        const member = members[index];
        members.splice(index, 1);
        membersStore.set(schoolId, members);

        // Update counts
        const school = schoolsStore.get(schoolId);
        if (school) {
            if (member.role === 'student') school.currentStudents--;
            if (member.role === 'teacher') school.currentTeachers--;
            schoolsStore.set(schoolId, school);
        }

        return true;
    },

    /**
     * Get school members
     */
    async getMembers(schoolId: string, role?: 'admin' | 'teacher' | 'student'): Promise<SchoolMember[]> {
        const members = membersStore.get(schoolId) || [];
        if (role) {
            return members.filter(m => m.role === role);
        }
        return members;
    },

    /**
     * Get school analytics
     */
    async getAnalytics(schoolId: string): Promise<SchoolAnalytics> {
        const school = schoolsStore.get(schoolId);
        const members = membersStore.get(schoolId) || [];

        // In production, this would aggregate data from the database
        return {
            totalStudents: school?.currentStudents || 0,
            totalTeachers: school?.currentTeachers || 0,
            activeStudentsThisWeek: Math.floor((school?.currentStudents || 0) * 0.7), // Mock
            totalVersesMemorized: (school?.currentStudents || 0) * 50, // Mock
            totalLessonsCompleted: (school?.currentStudents || 0) * 10, // Mock
            averageXP: 500, // Mock
            topPerformers: [], // Would fetch from gamification data
        };
    },

    /**
     * Check license status
     */
    async checkLicenseStatus(schoolId: string): Promise<{
        isActive: boolean;
        daysRemaining: number;
        studentsRemaining: number;
        teachersRemaining: number;
    }> {
        const school = schoolsStore.get(schoolId);
        if (!school) throw new Error('School not found');

        const now = new Date();
        const daysRemaining = Math.ceil((school.subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
            isActive: school.status === 'active' && daysRemaining > 0,
            daysRemaining: Math.max(0, daysRemaining),
            studentsRemaining: school.maxStudents - school.currentStudents,
            teachersRemaining: school.maxTeachers - school.currentTeachers,
        };
    },

    /**
     * Upgrade school tier
     */
    async upgradeTier(schoolId: string, newTier: LicenseTier): Promise<SchoolLicense | null> {
        const school = schoolsStore.get(schoolId);
        if (!school) return null;

        const tierConfig = SCHOOL_PRICING[newTier];
        school.tier = newTier;
        school.maxStudents = tierConfig.maxStudents;
        school.maxTeachers = tierConfig.maxTeachers;
        school.pricePerYear = tierConfig.pricePerYear;

        schoolsStore.set(schoolId, school);
        logger.info(`School ${schoolId} upgraded to ${newTier}`);

        return school;
    },
};
