import { Request, Response } from 'express';
import { schoolLicenseService, LicenseTier } from '../services/schoolLicenseService';
import { logger } from '../config/logger';

export const schoolController = {
    /**
     * GET /api/schools/pricing
     */
    async getPricing(req: Request, res: Response): Promise<Response> {
        try {
            const tiers = schoolLicenseService.getPricingTiers();
            return res.json({ success: true, data: tiers });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/schools
     */
    async registerSchool(req: Request, res: Response): Promise<Response> {
        try {
            const { schoolName, contactEmail, contactPhone, address, tier, adminId } = req.body;
            if (!schoolName || !contactEmail || !tier || !adminId) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }
            const school = await schoolLicenseService.registerSchool({
                schoolName,
                contactEmail,
                contactPhone,
                address,
                tier: tier as LicenseTier,
                adminId,
            });
            return res.json({ success: true, data: school });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/schools/:id
     */
    async getSchool(req: Request, res: Response): Promise<Response> {
        try {
            const school = await schoolLicenseService.getSchool(req.params.id);
            if (!school) {
                return res.status(404).json({ success: false, message: 'School not found' });
            }
            return res.json({ success: true, data: school });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/schools
     */
    async getAllSchools(req: Request, res: Response): Promise<Response> {
        try {
            const schools = await schoolLicenseService.getAllSchools();
            return res.json({ success: true, data: schools });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * POST /api/schools/:id/members
     */
    async addMember(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, userName, role } = req.body;
            if (!userId || !userName || !role) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }
            const member = await schoolLicenseService.addMember(req.params.id, userId, userName, role);
            return res.json({ success: true, data: member });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * DELETE /api/schools/:id/members/:userId
     */
    async removeMember(req: Request, res: Response): Promise<Response> {
        try {
            const removed = await schoolLicenseService.removeMember(req.params.id, req.params.userId);
            return res.json({ success: true, data: { removed } });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/schools/:id/members
     */
    async getMembers(req: Request, res: Response): Promise<Response> {
        try {
            const role = req.query.role as 'admin' | 'teacher' | 'student' | undefined;
            const members = await schoolLicenseService.getMembers(req.params.id, role);
            return res.json({ success: true, data: members });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/schools/:id/analytics
     */
    async getAnalytics(req: Request, res: Response): Promise<Response> {
        try {
            const analytics = await schoolLicenseService.getAnalytics(req.params.id);
            return res.json({ success: true, data: analytics });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/schools/:id/license-status
     */
    async getLicenseStatus(req: Request, res: Response): Promise<Response> {
        try {
            const status = await schoolLicenseService.checkLicenseStatus(req.params.id);
            return res.json({ success: true, data: status });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    /**
     * PUT /api/schools/:id/upgrade
     */
    async upgradeTier(req: Request, res: Response): Promise<Response> {
        try {
            const { tier } = req.body;
            if (!tier) {
                return res.status(400).json({ success: false, message: 'Tier required' });
            }
            const school = await schoolLicenseService.upgradeTier(req.params.id, tier as LicenseTier);
            if (!school) {
                return res.status(404).json({ success: false, message: 'School not found' });
            }
            return res.json({ success: true, data: school });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },
};
