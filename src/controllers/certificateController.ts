import { Request, Response } from 'express';
import { certificateService } from '../services/certificateService';
import { logger } from '../config/logger';

export const certificateController = {
    /**
     * POST /api/certificates/generate
     * Generate a new certificate
     */
    async generateCertificate(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, studentName, type, title, description, issuerName, issuerTitle, details } = req.body;

            if (!studentId || !studentName || !type || !title || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId, studentName, type, title, and description are required'
                });
            }

            const certificate = await certificateService.generateCertificate({
                studentId,
                studentName,
                type,
                title,
                description,
                issuerName: issuerName || 'Tarteel Administration',
                issuerTitle: issuerTitle || 'School Director',
                details
            });

            return res.json({
                success: true,
                data: certificate
            });
        } catch (error: any) {
            logger.error('Error generating certificate:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate certificate'
            });
        }
    },

    /**
     * POST /api/certificates/surah
     * Generate surah completion certificate
     */
    async generateSurahCertificate(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, studentName, surahNumber, surahName, issuerName, issuerTitle } = req.body;

            if (!studentId || !studentName || !surahNumber || !surahName) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId, studentName, surahNumber, and surahName are required'
                });
            }

            const certificate = await certificateService.generateSurahCertificate(
                studentId,
                studentName,
                parseInt(surahNumber),
                surahName,
                issuerName,
                issuerTitle
            );

            return res.json({
                success: true,
                data: certificate
            });
        } catch (error: any) {
            logger.error('Error generating surah certificate:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate certificate'
            });
        }
    },

    /**
     * POST /api/certificates/juz
     * Generate juz completion certificate
     */
    async generateJuzCertificate(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, studentName, juzNumber, issuerName, issuerTitle } = req.body;

            if (!studentId || !studentName || !juzNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId, studentName, and juzNumber are required'
                });
            }

            const certificate = await certificateService.generateJuzCertificate(
                studentId,
                studentName,
                parseInt(juzNumber),
                issuerName,
                issuerTitle
            );

            return res.json({
                success: true,
                data: certificate
            });
        } catch (error: any) {
            logger.error('Error generating juz certificate:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate certificate'
            });
        }
    },

    /**
     * POST /api/certificates/hafiz
     * Generate Quran completion (Hafiz) certificate
     */
    async generateHafizCertificate(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId, studentName, issuerName, issuerTitle } = req.body;

            if (!studentId || !studentName) {
                return res.status(400).json({
                    success: false,
                    message: 'studentId and studentName are required'
                });
            }

            const certificate = await certificateService.generateHafizCertificate(
                studentId,
                studentName,
                issuerName,
                issuerTitle
            );

            return res.json({
                success: true,
                data: certificate
            });
        } catch (error: any) {
            logger.error('Error generating hafiz certificate:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate certificate'
            });
        }
    },

    /**
     * GET /api/certificates/student/:studentId
     * Get all certificates for a student
     */
    async getStudentCertificates(req: Request, res: Response): Promise<Response> {
        try {
            const { studentId } = req.params;

            const certificates = await certificateService.getCertificates(studentId);

            return res.json({
                success: true,
                data: certificates
            });
        } catch (error: any) {
            logger.error('Error getting certificates:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get certificates'
            });
        }
    },

    /**
     * GET /api/certificates/:id
     * Get certificate by ID
     */
    async getCertificateById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const certificate = await certificateService.getCertificateById(id);

            if (!certificate) {
                return res.status(404).json({
                    success: false,
                    message: 'Certificate not found'
                });
            }

            return res.json({
                success: true,
                data: certificate
            });
        } catch (error: any) {
            logger.error('Error getting certificate:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get certificate'
            });
        }
    },

    /**
     * GET /api/certificates/:id/html
     * Get certificate as HTML (for printing/PDF)
     */
    async getCertificateHTML(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const certificate = await certificateService.getCertificateById(id);

            if (!certificate) {
                return res.status(404).json({
                    success: false,
                    message: 'Certificate not found'
                });
            }

            const html = certificateService.generateCertificateHTML(certificate);

            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        } catch (error: any) {
            logger.error('Error getting certificate HTML:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get certificate'
            });
        }
    }
};
