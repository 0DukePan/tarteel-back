import { Router } from 'express';
import express from 'express';
import {
    createCheckout,
    handleWebhook,
    getSubscriptionStatus,
    cancelUserSubscription,
    getPricingPlans
} from '../controllers/stripe.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/plans', getPricingPlans);

// Webhook route (needs raw body parser)
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    handleWebhook
);

// Protected routes
router.post('/checkout', authenticate, authorize('parent', 'admin'), createCheckout);
router.get('/subscription/:subscriptionId', authenticate, authorize('parent', 'admin'), getSubscriptionStatus);
router.delete('/subscription/:subscriptionId', authenticate, authorize('parent', 'admin'), cancelUserSubscription);

export default router;
