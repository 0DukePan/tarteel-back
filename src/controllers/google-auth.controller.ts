import { Request, Response } from 'express';
import { verifyGoogleToken, GoogleUserInfo } from '../config/google-auth';
import { database } from '../config/database';
import { parents } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Handle Google Sign-In from frontend
export async function googleSignIn(req: Request, res: Response): Promise<Response> {
    try {
        const { credential } = req.body;
        const db = database.getDb();

        if (!credential) {
            return res.status(400).json({ error: 'Missing Google credential' });
        }

        // Verify the Google token
        const googleUser = await verifyGoogleToken(credential);

        if (!googleUser) {
            return res.status(401).json({ error: 'Invalid Google token' });
        }

        logger.info(`Google sign-in attempt for: ${googleUser.email}`);

        // Check if parent already exists with this email
        let parent = await db.select()
            .from(parents)
            .where(eq(parents.fatherEmail, googleUser.email))
            .limit(1);

        let parentId: string;
        let isNewUser = false;

        if (parent.length === 0) {
            // Create new parent account
            const newParent = await db.insert(parents).values({
                fatherFirstName: googleUser.given_name || googleUser.name.split(' ')[0],
                fatherLastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || 'Parent',
                fatherEmail: googleUser.email,
                fatherPhone: '', // To be filled later
            }).returning();

            parentId = newParent[0].id;
            isNewUser = true;

            logger.info(`New parent created via Google: ${parentId}`);
        } else {
            parentId = parent[0].id;
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: parentId,
                email: googleUser.email,
                role: 'parent',
                authProvider: 'google',
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.json({
            success: true,
            user: {
                id: parentId,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
                isNewUser,
            },
            token, // Also send token in body for client storage if needed
        });
    } catch (error: any) {
        logger.error('Google sign-in error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
}

// Check if email is already registered
export async function checkEmail(req: Request, res: Response): Promise<Response> {
    try {
        const { email } = req.query;
        const db = database.getDb();

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Email is required' });
        }

        const parent = await db.select({ id: parents.id })
            .from(parents)
            .where(eq(parents.fatherEmail, email.toLowerCase()))
            .limit(1);

        return res.json({
            exists: parent.length > 0,
        });
    } catch (error: any) {
        logger.error('Check email error:', error);
        return res.status(500).json({ error: 'Failed to check email' });
    }
}

// Get current user from token
export async function getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
        const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');
        const db = database.getDb();

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const parent = await db.select()
            .from(parents)
            .where(eq(parents.id, decoded.userId))
            .limit(1);

        if (parent.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            id: parent[0].id,
            email: parent[0].fatherEmail,
            firstName: parent[0].fatherFirstName,
            lastName: parent[0].fatherLastName,
            phone: parent[0].fatherPhone,
        });
    } catch (error: any) {
        logger.error('Get current user error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Logout
export async function logout(req: Request, res: Response): Promise<Response> {
    res.clearCookie('auth_token');
    return res.json({ success: true });
}
