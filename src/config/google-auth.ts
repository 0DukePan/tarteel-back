import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID) {
    console.warn('⚠️ GOOGLE_CLIENT_ID not found. Google OAuth will not work.');
}

export const googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
);

export interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

// Verify Google ID token from frontend
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo | null> {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return null;
        }

        return {
            id: payload.sub,
            email: payload.email || '',
            verified_email: payload.email_verified || false,
            name: payload.name || '',
            given_name: payload.given_name || '',
            family_name: payload.family_name || '',
            picture: payload.picture || '',
        };
    } catch (error) {
        console.error('Error verifying Google token:', error);
        return null;
    }
}

// Generate auth URL for server-side OAuth flow (optional)
export function getGoogleAuthUrl(state?: string): string {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state,
    });
}

// Exchange authorization code for tokens (server-side flow)
export async function getGoogleTokens(code: string) {
    const { tokens } = await googleClient.getToken(code);
    return tokens;
}
