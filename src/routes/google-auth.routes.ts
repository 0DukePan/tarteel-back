import { Router } from 'express';
import {
    googleSignIn,
    checkEmail,
    getCurrentUser,
    logout
} from '../controllers/google-auth.controller';

const router = Router();

// Google OAuth routes
router.post('/google', googleSignIn);
router.get('/check-email', checkEmail);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router;
