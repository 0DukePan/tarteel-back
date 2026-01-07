import { database } from '../config/database';
import { students, parents } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../config/logger';

/**
 * Family Service - Family management and pricing
 * 
 * Pricing Structure:
 * - 1 child:  €220/year
 * - 2 children: €420/year (save €20)
 * - 3 children: €620/year (save €40)
 * - 4+ children: €620 + €180/additional child
 * - Scholarship (low-income): €100/year (requires application)
 */

export interface FamilyPricing {
    childCount: number;
    basePrice: number;
    discount: number;
    totalPrice: number;
    perChildPrice: number;
    savingsPercent: number;
}

export interface ChildProgress {
    childId: string;
    name: string;
    xp: number;
    level: number;
    streak: number;
    versesMemorized: number;
    lessonsCompleted: number;
    lastActivityDate: Date | null;
}

export interface FamilyStats {
    totalChildren: number;
    totalXP: number;
    averageStreak: number;
    totalVersesMemorized: number;
    activeThisWeek: number;
    subscriptionType: 'standard' | 'scholarship';
    subscriptionEnd: Date | null;
    amountPaid: number;
}

export interface ScholarshipApplication {
    id: string;
    parentId: string;
    reason: string;
    monthlyIncome?: number;
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: Date;
    reviewedAt?: Date;
    reviewNotes?: string;
}

// Pricing configuration
export const FAMILY_PRICING = {
    ONE_CHILD: 220,
    TWO_CHILDREN: 420,
    THREE_CHILDREN: 620,
    ADDITIONAL_CHILD: 180,  // Price for 4th, 5th, etc.
    SCHOLARSHIP: 100,
};

// In-memory storage for scholarships
const scholarshipsStore: Map<string, ScholarshipApplication> = new Map();

export const familyService = {
    /**
     * Calculate family pricing based on number of children
     */
    calculatePricing(childCount: number, isScholarship: boolean = false): FamilyPricing {
        if (isScholarship) {
            return {
                childCount,
                basePrice: FAMILY_PRICING.SCHOLARSHIP,
                discount: 0,
                totalPrice: FAMILY_PRICING.SCHOLARSHIP,
                perChildPrice: FAMILY_PRICING.SCHOLARSHIP / childCount,
                savingsPercent: Math.round((1 - FAMILY_PRICING.SCHOLARSHIP / (childCount * FAMILY_PRICING.ONE_CHILD)) * 100),
            };
        }

        let totalPrice: number;
        let basePrice: number;

        switch (childCount) {
            case 1:
                totalPrice = FAMILY_PRICING.ONE_CHILD;
                basePrice = FAMILY_PRICING.ONE_CHILD;
                break;
            case 2:
                totalPrice = FAMILY_PRICING.TWO_CHILDREN;
                basePrice = FAMILY_PRICING.ONE_CHILD * 2;
                break;
            case 3:
                totalPrice = FAMILY_PRICING.THREE_CHILDREN;
                basePrice = FAMILY_PRICING.ONE_CHILD * 3;
                break;
            default:
                // 4+ children: Base for 3 + additional children
                totalPrice = FAMILY_PRICING.THREE_CHILDREN + (childCount - 3) * FAMILY_PRICING.ADDITIONAL_CHILD;
                basePrice = FAMILY_PRICING.ONE_CHILD * childCount;
        }

        return {
            childCount,
            basePrice,
            discount: basePrice - totalPrice,
            totalPrice,
            perChildPrice: Math.round(totalPrice / childCount),
            savingsPercent: Math.round(((basePrice - totalPrice) / basePrice) * 100),
        };
    },

    /**
     * Get all pricing tiers
     */
    getPricingTiers(): Array<FamilyPricing & { label: string }> {
        return [
            { ...this.calculatePricing(1), label: '1 Child' },
            { ...this.calculatePricing(2), label: '2 Children' },
            { ...this.calculatePricing(3), label: '3 Children' },
            { ...this.calculatePricing(4), label: '4 Children' },
        ];
    },

    /**
     * Get children for a parent
     */
    async getChildren(parentId: string): Promise<any[]> {
        const db = database.getDb();

        const children = await db.select()
            .from(students)
            .where(eq(students.parentId, parentId));

        return children;
    },

    /**
     * Get aggregated family stats
     */
    async getFamilyStats(parentId: string): Promise<FamilyStats> {
        const children = await this.getChildren(parentId);

        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        let totalXP = 0;
        let totalStreak = 0;
        let totalVerses = 0;
        let activeCount = 0;

        for (const child of children) {
            const c = child as any;
            totalXP += c.xp || 0;
            totalStreak += c.streak || 0;
            totalVerses += c.versesMemorized || 0;

            if (c.lastActivityDate && new Date(c.lastActivityDate) > weekAgo) {
                activeCount++;
            }
        }

        return {
            totalChildren: children.length,
            totalXP,
            averageStreak: children.length > 0 ? Math.round(totalStreak / children.length) : 0,
            totalVersesMemorized: totalVerses,
            activeThisWeek: activeCount,
            subscriptionType: 'standard', // Would check from payments table
            subscriptionEnd: null, // Would get from subscription
            amountPaid: this.calculatePricing(children.length).totalPrice,
        };
    },

    /**
     * Get progress for all children
     */
    async getAllChildrenProgress(parentId: string): Promise<ChildProgress[]> {
        const children = await this.getChildren(parentId);

        return children.map((child: any) => ({
            childId: child.id,
            name: `${child.firstName} ${child.lastName}`,
            xp: child.xp || 0,
            level: child.level || 1,
            streak: child.streak || 0,
            versesMemorized: child.versesMemorized || 0,
            lessonsCompleted: child.lessonsCompleted || 0,
            lastActivityDate: child.lastActivityDate || null,
        }));
    },

    /**
     * Apply for scholarship
     */
    async applyForScholarship(parentId: string, reason: string, monthlyIncome?: number): Promise<ScholarshipApplication> {
        const application: ScholarshipApplication = {
            id: `scholarship_${Date.now()}`,
            parentId,
            reason,
            monthlyIncome,
            status: 'pending',
            appliedAt: new Date(),
        };

        scholarshipsStore.set(application.id, application);
        logger.info(`Scholarship application ${application.id} submitted by parent ${parentId}`);

        return application;
    },

    /**
     * Get scholarship application status
     */
    async getScholarshipStatus(parentId: string): Promise<ScholarshipApplication | null> {
        for (const app of scholarshipsStore.values()) {
            if (app.parentId === parentId) {
                return app;
            }
        }
        return null;
    },

    /**
     * Review scholarship application (admin only)
     */
    async reviewScholarship(
        applicationId: string,
        status: 'approved' | 'rejected',
        reviewNotes?: string
    ): Promise<ScholarshipApplication | null> {
        const application = scholarshipsStore.get(applicationId);
        if (!application) return null;

        application.status = status;
        application.reviewedAt = new Date();
        application.reviewNotes = reviewNotes;

        scholarshipsStore.set(applicationId, application);
        logger.info(`Scholarship ${applicationId} ${status}`);

        return application;
    },

    /**
     * Get all pending scholarship applications (admin)
     */
    async getPendingScholarships(): Promise<ScholarshipApplication[]> {
        return Array.from(scholarshipsStore.values()).filter(a => a.status === 'pending');
    },
};
