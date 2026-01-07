import { Request, Response } from 'express';
import { createCheckoutSession, createFamilyCheckout, constructWebhookEvent, getSubscription, cancelSubscription, PRICING_PLANS, FAMILY_PRICING, PlanType } from '../config/stripe';
import { database } from '../config/database';
import { parents, students, enrollments, payments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../config/logger';

// Create a checkout session for registration payment
export async function createCheckout(req: Request, res: Response): Promise<Response> {
    try {
        const { planType, isAnnual, parentId, studentId } = req.body;
        const db = database.getDb();

        // Validate plan type
        if (!PRICING_PLANS[planType as PlanType]) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }

        // Get parent email
        const parent = await db.select().from(parents).where(eq(parents.id, parentId)).limit(1);

        if (parent.length === 0) {
            return res.status(404).json({ error: 'Parent not found' });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const session = await createCheckoutSession({
            planType: planType as PlanType,
            isAnnual: isAnnual || false,
            parentEmail: parent[0].fatherEmail,
            parentId,
            studentId,
            successUrl: `${frontendUrl}/registration/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${frontendUrl}/registration/cancel`,
        });

        logger.info(`Checkout session created for parent ${parentId}: ${session.id}`);

        return res.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        logger.error('Error creating checkout session:', error);
        return res.status(500).json({ error: 'Failed to create checkout session' });
    }
}

// Handle Stripe webhooks
export async function handleWebhook(req: Request, res: Response): Promise<Response> {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
        return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    try {
        const event = constructWebhookEvent(req.body, signature);

        logger.info(`Stripe webhook received: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await handleCheckoutComplete(session);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object;
                await handleInvoicePaid(invoice);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await handleSubscriptionCanceled(subscription);
                break;
            }

            default:
                logger.info(`Unhandled webhook event: ${event.type}`);
        }

        return res.json({ received: true });
    } catch (error: any) {
        logger.error('Webhook error:', error);
        return res.status(400).json({ error: 'Webhook error' });
    }
}

// Handle successful checkout
async function handleCheckoutComplete(session: any) {
    const db = database.getDb();
    const { parentId, studentId } = session.metadata || {};

    if (!parentId || !studentId) {
        logger.warn('Missing metadata in checkout session');
        return;
    }

    logger.info(`Checkout completed for parent ${parentId}, student ${studentId}`);

    // Update student registration status to approved
    await db.update(students)
        .set({
            registrationStatus: 'approved',
            updatedAt: new Date()
        })
        .where(eq(students.id, studentId));

    // Create or update enrollment
    const existingEnrollment = await db.select()
        .from(enrollments)
        .where(eq(enrollments.studentId, studentId))
        .limit(1);

    if (existingEnrollment.length === 0) {
        // Create new enrollment
        await db.insert(enrollments).values({
            studentId,
            status: 'active',
            enrollmentDate: new Date(),
        } as any);
    } else {
        // Update existing enrollment
        await db.update(enrollments)
            .set({
                status: 'active',
                updatedAt: new Date()
            })
            .where(eq(enrollments.studentId, studentId));
    }

    // Record payment
    const enrollment = await db.select()
        .from(enrollments)
        .where(eq(enrollments.studentId, studentId))
        .limit(1);

    if (enrollment.length > 0 && session.amount_total) {
        await db.insert(payments).values({
            enrollmentId: enrollment[0].id,
            amount: session.amount_total / 100,
            method: 'stripe',
            status: 'completed',
        } as any);
    }

    logger.info(`Student ${studentId} registration approved and payment recorded`);
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice: any) {
    const db = database.getDb();
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) return;

    try {
        const subscription = await getSubscription(subscriptionId);
        const { studentId } = subscription.metadata || {};

        if (!studentId) return;

        logger.info(`Invoice paid for subscription ${subscriptionId}`);

        // Record recurring payment
        const enrollment = await db.select()
            .from(enrollments)
            .where(eq(enrollments.studentId, studentId))
            .limit(1);

        if (enrollment.length > 0) {
            await db.insert(payments).values({
                enrollmentId: enrollment[0].id,
                amount: invoice.amount_paid / 100,
                method: 'stripe_recurring',
                status: 'completed',
            } as any);
        }
    } catch (error) {
        logger.error('Error handling invoice paid:', error);
    }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: any) {
    const db = database.getDb();
    const { studentId } = subscription.metadata || {};

    if (!studentId) return;

    logger.info(`Subscription ${subscription.id} updated for student ${studentId}`);

    // Update enrollment status based on subscription status
    const status = subscription.status === 'active' ? 'active' : 'inactive';

    await db.update(enrollments)
        .set({
            status,
            updatedAt: new Date()
        })
        .where(eq(enrollments.studentId, studentId));
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription: any) {
    const db = database.getDb();
    const { studentId } = subscription.metadata || {};

    if (!studentId) return;

    logger.info(`Subscription ${subscription.id} canceled for student ${studentId}`);

    await db.update(enrollments)
        .set({
            status: 'canceled',
            updatedAt: new Date()
        } as any)
        .where(eq(enrollments.studentId, studentId));
}

// Get subscription status
export async function getSubscriptionStatus(req: Request, res: Response): Promise<Response> {
    try {
        const { subscriptionId } = req.params;

        const subscription = await getSubscription(subscriptionId);

        return res.json({
            status: subscription.status,
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
    } catch (error: any) {
        logger.error('Error getting subscription:', error);
        return res.status(500).json({ error: 'Failed to get subscription status' });
    }
}

// Cancel a subscription
export async function cancelUserSubscription(req: Request, res: Response): Promise<Response> {
    try {
        const { subscriptionId } = req.params;

        await cancelSubscription(subscriptionId);

        logger.info(`Subscription ${subscriptionId} canceled`);

        return res.json({
            status: 'canceled',
            canceledAt: new Date(),
        });
    } catch (error: any) {
        logger.error('Error canceling subscription:', error);
        return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
}

// Get pricing plans (returns family-based EUR pricing)
export async function getPricingPlans(req: Request, res: Response): Promise<Response> {
    return res.json({
        family: FAMILY_PRICING,
        legacy: PRICING_PLANS,
        currency: 'EUR',
        note: 'All prices are annual. 1 child = €220, 2 children = €420, 3 children = €620, Scholarship = €100',
    });
}
