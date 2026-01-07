import { Request, Response } from 'express';
import { familyService } from '../services/familyService';
import { logger } from '../config/logger';

export const familyController = {
    /**
     * GET /api/family/pricing
     * Get all pricing tiers
     */
    async getPricing(req: Request, res: Response): Promise<Response> {
        try {
            const tiers = familyService.getPricingTiers();
            return res.json({
                success: true,
                data: {
                    tiers,
                    scholarship: {
                        price: 100,
                        description: 'Available for low-income families upon application'
                    }
                }
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/family/pricing/calculate?children=2
     * Calculate price for specific number of children
     */
    async calculatePricing(req: Request, res: Response): Promise<Response> {
        try {
            const children = parseInt(req.query.children as string) || 1;
            const isScholarship = req.query.scholarship === 'true';
            const pricing = familyService.calculatePricing(children, isScholarship);
            return res.json({ success: true, data: pricing });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/family/children/:parentId
     */
    async getChildren(req: Request, res: Response): Promise<Response> {
        try {
            const children = await familyService.getChildren(req.params.parentId);
            return res.json({ success: true, data: children });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/family/stats/:parentId
     */
    async getFamilyStats(req: Request, res: Response): Promise<Response> {
        try {
            const stats = await familyService.getFamilyStats(req.params.parentId);
            return res.json({ success: true, data: stats });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/family/progress/:parentId
     */
    async getAllChildrenProgress(req: Request, res: Response): Promise<Response> {
        try {
            const progress = await familyService.getAllChildrenProgress(req.params.parentId);
            return res.json({ success: true, data: progress });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/family/scholarship/apply
     */
    async applyForScholarship(req: Request, res: Response): Promise<Response> {
        try {
            const { parentId, reason, monthlyIncome } = req.body;
            if (!parentId || !reason) {
                return res.status(400).json({ success: false, message: 'parentId and reason required' });
            }
            const application = await familyService.applyForScholarship(parentId, reason, monthlyIncome);
            return res.json({ success: true, data: application });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/family/scholarship/status/:parentId
     */
    async getScholarshipStatus(req: Request, res: Response): Promise<Response> {
        try {
            const application = await familyService.getScholarshipStatus(req.params.parentId);
            return res.json({ success: true, data: application });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * PUT /api/family/scholarship/review/:applicationId (admin)
     */
    async reviewScholarship(req: Request, res: Response): Promise<Response> {
        try {
            const { status, reviewNotes } = req.body;
            if (!status || !['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Valid status required' });
            }
            const application = await familyService.reviewScholarship(req.params.applicationId, status, reviewNotes);
            if (!application) {
                return res.status(404).json({ success: false, message: 'Application not found' });
            }
            return res.json({ success: true, data: application });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/family/scholarship/pending (admin)
     */
    async getPendingScholarships(req: Request, res: Response): Promise<Response> {
        try {
            const applications = await familyService.getPendingScholarships();
            return res.json({ success: true, data: applications });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },
};
