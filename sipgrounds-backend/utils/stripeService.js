const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
    
    // Create payment intent for order
    static async createPaymentIntent(orderData) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(orderData.totalAmount * 100), // Convert to cents
                currency: 'usd',
                metadata: {
                    orderId: orderData.orderId,
                    userId: orderData.userId,
                    cafeId: orderData.cafeId || '',
                    orderType: orderData.orderType || 'pickup',
                    pointsToEarn: orderData.totalPointsEarned?.toString() || '0'
                },
                description: `Sip Grounds Order ${orderData.orderNumber}`,
                receipt_email: orderData.customerEmail,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                success: true,
                paymentIntent,
                clientSecret: paymentIntent.client_secret
            };
        } catch (error) {
            console.error('Stripe payment intent creation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Confirm payment and update order
    static async confirmPayment(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            return {
                success: paymentIntent.status === 'succeeded',
                paymentIntent,
                paid: paymentIntent.status === 'succeeded',
                failureReason: paymentIntent.last_payment_error?.message
            };
        } catch (error) {
            console.error('Stripe payment confirmation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create refund
    static async createRefund(paymentIntentId, refundAmount, reason = 'Customer requested refund') {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: Math.round(refundAmount * 100), // Convert to cents
                reason: 'requested_by_customer',
                metadata: {
                    refund_reason: reason
                }
            });

            return {
                success: true,
                refund,
                refundId: refund.id,
                amount: refund.amount / 100, // Convert back to dollars
                status: refund.status
            };
        } catch (error) {
            console.error('Stripe refund creation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get refund status
    static async getRefundStatus(refundId) {
        try {
            const refund = await stripe.refunds.retrieve(refundId);
            return {
                success: true,
                refund,
                status: refund.status
            };
        } catch (error) {
            console.error('Stripe refund status error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Handle webhook events
    static constructEvent(payload, signature) {
        try {
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
            if (!endpointSecret) {
                throw new Error('Stripe webhook secret not configured');
            }

            const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
            return { success: true, event };
        } catch (error) {
            console.error('Stripe webhook signature verification failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Create customer for recurring payments
    static async createCustomer(userData) {
        try {
            const customer = await stripe.customers.create({
                email: userData.email,
                name: userData.name,
                metadata: {
                    userId: userData.userId
                }
            });

            return {
                success: true,
                customer,
                customerId: customer.id
            };
        } catch (error) {
            console.error('Stripe customer creation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create setup intent for saving payment methods
    static async createSetupIntent(customerId) {
        try {
            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
                usage: 'off_session'
            });

            return {
                success: true,
                setupIntent,
                clientSecret: setupIntent.client_secret
            };
        } catch (error) {
            console.error('Stripe setup intent creation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get saved payment methods for customer
    static async getPaymentMethods(customerId) {
        try {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });

            return {
                success: true,
                paymentMethods: paymentMethods.data
            };
        } catch (error) {
            console.error('Stripe payment methods retrieval error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create payment intent with saved payment method
    static async createPaymentIntentWithSavedMethod(orderData, paymentMethodId) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(orderData.totalAmount * 100),
                currency: 'usd',
                customer: orderData.customerId,
                payment_method: paymentMethodId,
                confirmation_method: 'manual',
                confirm: true,
                return_url: `${process.env.FRONTEND_URL}/orders/${orderData.orderId}`,
                metadata: {
                    orderId: orderData.orderId,
                    userId: orderData.userId,
                    cafeId: orderData.cafeId || '',
                    orderType: orderData.orderType || 'pickup',
                    pointsToEarn: orderData.totalPointsEarned?.toString() || '0'
                }
            });

            return {
                success: true,
                paymentIntent,
                requiresAction: paymentIntent.status === 'requires_action',
                clientSecret: paymentIntent.client_secret
            };
        } catch (error) {
            console.error('Stripe payment with saved method error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = StripeService;
