import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY not found in environment variables. Stripe payments will not work.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

// Family-based pricing configuration (in EUR cents)
// 1 child = €220/year, 2 children = €420/year, 3 children = €620/year
// Scholarship = €100/year for low-income families
export const FAMILY_PRICING = {
    one_child: {
        name: '1 Child',
        children: 1,
        priceAnnual: 22000, // €220.00 in cents
        pricePerChild: 22000, // €220 per child
        savings: 0,
        features: [
            'Full Quran curriculum',
            'Weekly live classes',
            'AI Tajweed feedback',
            'Spaced repetition for Hifz',
            'Progress tracking & XP',
            'Parent dashboard',
            'Certificate on completion',
        ],
    },
    two_children: {
        name: '2 Children',
        children: 2,
        priceAnnual: 42000, // €420.00 in cents (save €20)
        pricePerChild: 21000, // €210 per child
        savings: 2000, // €20 savings
        features: [
            'All 1-child features',
            'Family dashboard',
            'Siblings can learn together',
            'Priority support',
        ],
    },
    three_children: {
        name: '3 Children',
        children: 3,
        priceAnnual: 62000, // €620.00 in cents (save €40)
        pricePerChild: 20667, // €206.67 per child
        savings: 4000, // €40 savings
        features: [
            'All 2-children features',
            'Dedicated family support',
            'Flexible scheduling',
        ],
    },
    scholarship: {
        name: 'Scholarship',
        children: 99, // Any number of children
        priceAnnual: 10000, // €100.00 in cents
        pricePerChild: 0,
        savings: 0,
        features: [
            'Full access to all features',
            'Available for low-income families',
            'Requires application approval',
        ],
        requiresApproval: true,
    },
};

// Legacy pricing (for backwards compatibility)
export const PRICING_PLANS = {
    starter: FAMILY_PRICING.one_child,
    premium: FAMILY_PRICING.two_children,
    family: FAMILY_PRICING.three_children,
    scholarship: FAMILY_PRICING.scholarship,
};

export type FamilyPlanType = keyof typeof FAMILY_PRICING;
export type PlanType = keyof typeof PRICING_PLANS;

// Create a Stripe Checkout session for family plans
export async function createCheckoutSession({
    planType,
    isAnnual = true, // Now always annual
    parentEmail,
    parentId,
    studentId,
    successUrl,
    cancelUrl,
    childrenCount = 1,
    isScholarship = false,
}: {
    planType: PlanType;
    isAnnual?: boolean;
    parentEmail: string;
    parentId: string;
    studentId: string;
    successUrl: string;
    cancelUrl: string;
    childrenCount?: number;
    isScholarship?: boolean;
}) {
    // Determine the correct plan based on children count or scholarship status
    let plan;
    let actualPlanType: string;

    if (isScholarship) {
        plan = FAMILY_PRICING.scholarship;
        actualPlanType = 'scholarship';
    } else if (childrenCount >= 3) {
        plan = FAMILY_PRICING.three_children;
        actualPlanType = 'three_children';
    } else if (childrenCount === 2) {
        plan = FAMILY_PRICING.two_children;
        actualPlanType = 'two_children';
    } else {
        plan = FAMILY_PRICING.one_child;
        actualPlanType = 'one_child';
    }

    // Use annual price (all plans are annual)
    const price = plan.priceAnnual;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: parentEmail,
        line_items: [
            {
                price_data: {
                    currency: 'eur', // Changed to EUR
                    product_data: {
                        name: `Tarteel ${plan.name} Plan`,
                        description: `${plan.name} - Annual subscription for Quran learning`,
                        images: ['https://tarteel.com/logo.png'],
                    },
                    unit_amount: price,
                    recurring: {
                        interval: 'year',
                    },
                },
                quantity: 1,
            },
        ],
        metadata: {
            parentId,
            studentId,
            planType: actualPlanType,
            childrenCount: childrenCount.toString(),
            isScholarship: isScholarship.toString(),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
            metadata: {
                parentId,
                studentId,
                planType: actualPlanType,
                childrenCount: childrenCount.toString(),
            },
        },
    });

    return session;
}

// Create a checkout session for family (simplified helper)
export async function createFamilyCheckout({
    childrenCount,
    parentEmail,
    parentId,
    successUrl,
    cancelUrl,
    isScholarship = false,
}: {
    childrenCount: number;
    parentEmail: string;
    parentId: string;
    successUrl: string;
    cancelUrl: string;
    isScholarship?: boolean;
}) {
    let plan;

    if (isScholarship) {
        plan = FAMILY_PRICING.scholarship;
    } else if (childrenCount >= 3) {
        plan = FAMILY_PRICING.three_children;
    } else if (childrenCount === 2) {
        plan = FAMILY_PRICING.two_children;
    } else {
        plan = FAMILY_PRICING.one_child;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment', // One-time annual payment
        customer_email: parentEmail,
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: isScholarship ? 'Tarteel Scholarship' : `Tarteel Family (${childrenCount} ${childrenCount === 1 ? 'child' : 'children'})`,
                        description: isScholarship
                            ? 'Scholarship program - Full access for low-income families'
                            : `Annual subscription for ${childrenCount} ${childrenCount === 1 ? 'child' : 'children'}`,
                    },
                    unit_amount: plan.priceAnnual,
                },
                quantity: 1,
            },
        ],
        metadata: {
            parentId,
            childrenCount: childrenCount.toString(),
            isScholarship: isScholarship.toString(),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
    });

    return session;
}

// Create a one-time payment intent (for deposits or single payments)
export async function createPaymentIntent({
    amount,
    parentEmail,
    parentId,
    description,
}: {
    amount: number;
    parentEmail: string;
    parentId: string;
    description: string;
}) {
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        receipt_email: parentEmail,
        metadata: {
            parentId,
        },
        description,
    });

    return paymentIntent;
}

// Verify webhook signature
export function constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId);
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.cancel(subscriptionId);
}

// Update subscription
export async function updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams) {
    return await stripe.subscriptions.update(subscriptionId, params);
}
