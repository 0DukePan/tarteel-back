import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { database } from '../config/database';
import { admins } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../config/logger';
import type { JWTPayload } from '../types';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${BACKEND_URL}/api/auth/google/callback`
);

// Redirect to Google OAuth
router.get('/google', (req: Request, res: Response) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        logger.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
        return res.redirect(`${FRONTEND_URL}/admin/login?error=google_not_configured`);
    }

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
        prompt: 'select_account',
    });

    res.redirect(authUrl);
});

// Handle Google OAuth callback
router.get('/google/callback', async (req: Request, res: Response) => {
    const { code, error } = req.query;

    if (error) {
        logger.error('Google OAuth error:', error);
        return res.redirect(`${FRONTEND_URL}/admin/login?error=google_auth_failed`);
    }

    if (!code || typeof code !== 'string') {
        return res.redirect(`${FRONTEND_URL}/admin/login?error=no_code`);
    }

    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info from Google
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error('No email in Google response');
        }

        const email = payload.email;
        const name = payload.name || email.split('@')[0];

        // Check if admin exists with this email
        const db = database.getDb();
        let admin = await db
            .select()
            .from(admins)
            .where(eq(admins.email, email))
            .limit(1);

        if (admin.length === 0) {
            // Admin doesn't exist - redirect with error (no self-registration)
            logger.warn(`Google login attempted for non-admin email: ${email}`);
            return res.redirect(`${FRONTEND_URL}/admin/login?error=not_admin`);
        }

        const adminUser = admin[0];

        if (!adminUser.isActive) {
            return res.redirect(`${FRONTEND_URL}/admin/login?error=account_disabled`);
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }

        const jwtPayload: JWTPayload = {
            userId: adminUser.id,
            email: adminUser.email,
            role: adminUser.role as 'admin' | 'teacher' | 'parent' | 'student',
        };

        const token = jwt.sign(jwtPayload, jwtSecret, {
            expiresIn: '7d',
        });

        // Set cookie
        res.cookie('auth_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        logger.info(`Google login successful: ${email}`);

        // Redirect to dashboard with token in URL (frontend will save it)
        res.redirect(`${FRONTEND_URL}/admin/dashboard?token=${token}`);
    } catch (error: any) {
        logger.error('Google OAuth callback error:', error);
        res.redirect(`${FRONTEND_URL}/admin/login?error=google_callback_failed`);
    }
});

export default router;
