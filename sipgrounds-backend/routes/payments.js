const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product');
const MenuItem = require('../models/menuItem');
const Cafe = require('../models/cafe');
const Coupon = require('../models/coupon');
const StripeService = require('../utils/stripeService');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware for authentication
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    next();
};

// Reuse authOrToken from server to allow either session or API token
const { authOrToken } = require('../server');

// Create payment intent for order
router.post('/create-payment-intent', isLoggedIn, catchAsync(async (req, res) => {
    const { items, cafeId, couponCode, orderType = 'pickup', pickupTime, deliveryAddress, usePoints } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Order must contain at least one item'
        });
    }
    
    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
        // Try to find the item in Product collection first, then MenuItem collection
        let product = await Product.findById(item.productId);
        if (!product) {
            product = await MenuItem.findById(item.productId);
        }
        if (!product) {
            return res.status(400).json({
                success: false,
                error: `Product not found: ${item.productId}`
            });
        }
        
        if (!product.inStock || product.stockQuantity < item.quantity) {
            return res.status(400).json({
                success: false,
                error: `Insufficient stock for ${product.name}`
            });
        }
        
        // Calculate price with customizations
        const customizations = item.customizations || {};
        const priceCalculation = product.totalPointsWithCustomizations(customizations);
        
        const itemTotal = priceCalculation.totalPrice * item.quantity;
        
        subtotal += itemTotal;
        
        orderItems.push({
            product: product._id,
            quantity: item.quantity,
            price: priceCalculation.totalPrice,
            customizations
        });
    }
    
    // Apply coupon if provided
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
        const coupon = await Coupon.findOne({ 
            code: couponCode.toUpperCase(),
            isActive: true 
        });
        
        if (coupon) {
            const validation = coupon.isValidForUse(req.user._id, subtotal);
            if (validation.valid) {
                discountAmount = coupon.calculateDiscount(subtotal, orderItems);
                couponId = coupon._id;
            }
        }
    }
    
    const totalAmount = Math.max(0, subtotal - discountAmount);
    
    // Amount-based points: 1 point per amount spent
    const totalPointsEarned = Math.floor(totalAmount);
    
    // Create order in database
    const order = new Order({
        user: req.user._id,
        cafe: cafeId,
        items: orderItems,
        subtotal,
        discount: {
            amount: discountAmount,
            coupon: couponId,
            couponCode
        },
        totalAmount,
        totalPointsEarned,
        orderType,
        pickupTime,
        deliveryAddress,
        status: 'pending'
    });
    
    await order.save();

    // If user wants to pay fully with points, handle redemption and finalize without Stripe
    if (usePoints) {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        if (user.points < totalAmount) {
            return res.status(400).json({ success: false, error: 'Insufficient points to complete this purchase' });
        }

        // Points-paid orders do not earn additional points
        order.totalPointsEarned = 0;
        order.payment = { method: 'points', paid: true, paidAt: new Date() };
        order.status = 'confirmed';
        await order.save();

        // Redeem points
        await user.redeemPoints(Math.floor(totalAmount), `Order ${order.orderNumber} - Paid with points`, order._id);

        // Update stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stockQuantity: -item.quantity } });
        }

        // Mark coupon as used if applicable
        if (order.discount.coupon) {
            const coupon = await Coupon.findById(order.discount.coupon);
            if (coupon) {
                await coupon.useCoupon(req.user._id, order._id, order.cafe?._id, order.discount.amount);
            }
        }

        return res.status(201).json({
            success: true,
            data: {
                order: {
                    _id: order._id,
                    orderNumber: order.orderNumber,
                    subtotal,
                    discountAmount,
                    totalAmount,
                    totalPointsEarned: 0,
                    estimatedPrepTime: order.estimatedPrepTime,
                    status: order.status
                }
            },
            message: 'Order completed using points'
        });
    }

    // Create Stripe payment intent
    const user = await User.findById(req.user._id);
    const paymentIntentData = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: req.user._id,
        cafeId,
        totalAmount,
        totalPointsEarned,
        customerEmail: user.email,
        orderType
    };
    
    const paymentResult = await StripeService.createPaymentIntent(paymentIntentData);
    
    if (!paymentResult.success) {
        // Delete the order if payment intent creation failed
        await Order.findByIdAndDelete(order._id);
        return res.status(400).json({
            success: false,
            error: paymentResult.error
        });
    }
    
    // Update order with payment intent details
    order.payment.paymentIntentId = paymentResult.paymentIntent.id;
    order.payment.clientSecret = paymentResult.clientSecret;
    await order.save();
    
    res.status(201).json({
        success: true,
        data: {
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                subtotal,
                discountAmount,
                totalAmount,
                totalPointsEarned,
                estimatedPrepTime: order.estimatedPrepTime
            },
            clientSecret: paymentResult.clientSecret,
            paymentIntentId: paymentResult.paymentIntent.id
        },
        message: 'Order created successfully, proceed with payment'
    });
}));

// Create Stripe Checkout Session (redirect flow)
router.post('/checkout-session', authOrToken, catchAsync(async (req, res) => {
    const { items, successUrl, cancelUrl, orderType = 'pickup', cafeId, pickupTime, usePoints } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'No items to checkout' });
    }
    if (!cafeId) {
        return res.status(400).json({ success: false, error: 'cafeId is required for pickup' });
    }

    // Map cart line items
    const line_items = items.map((i) => ({
        price_data: {
            currency: 'usd',
            product_data: { name: i.name },
            unit_amount: Math.round((i.price || 0) * 100),
        },
        quantity: i.quantity || 1,
    }));

    // Build Order items and totals
    let subtotal = 0;
    const orderItems = [];
    for (const i of items) {
        if (!i.productId) {
            return res.status(400).json({ success: false, error: 'productId is required for each item' });
        }
        // Try to find the item in Product collection first, then MenuItem collection
        let product = await Product.findById(i.productId);
        if (!product) {
            product = await MenuItem.findById(i.productId);
        }
        if (!product) {
            return res.status(400).json({ success: false, error: `Product not found: ${i.productId}` });
        }
        const qty = i.quantity || 1;
        subtotal += (i.price || product.price) * qty;
        orderItems.push({ product: product._id, quantity: qty, price: i.price || product.price });
    }
    const totalAmount = subtotal; // taxes handled by Stripe
    const totalPointsEarned = Math.floor(totalAmount);

    // Create pending Order associated with user
    const order = await Order.create({
        user: req.user._id,
        cafe: cafeId,
        items: orderItems,
        subtotal,
        totalAmount,
        totalPointsEarned,
        orderType,
        pickupTime: pickupTime && pickupTime !== 'ASAP' ? new Date() : undefined,
        status: 'pending',
        payment: { method: 'stripe', paid: false }
    });

    // Points-only payment path: finalize and skip Stripe
    if (usePoints) {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        if (user.points < totalAmount) {
            return res.status(400).json({ success: false, error: 'Insufficient points to complete this purchase' });
        }
        order.payment = { method: 'points', paid: true, paidAt: new Date() };
        order.status = 'confirmed';
        order.totalPointsEarned = 0;
        await order.save();

        await user.redeemPoints(Math.floor(totalAmount), `Order ${order.orderNumber} - Paid with points`, order._id);

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stockQuantity: -item.quantity } });
        }

        return res.json({ success: true, orderId: order._id, message: 'Order completed using points' });
    }

    // Determine frontend origin dynamically (falls back to env, then 5173)
    const origin = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items,
        success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
        cancel_url: cancelUrl || `${origin}/cart?status=cancel`,
        customer_email: req.user?.email,
        payment_intent_data: {
            metadata: {
                orderType,
                cafeId,
                pickupTime: pickupTime || 'ASAP',
                userId: req.user?._id?.toString() || '',
                orderId: order._id.toString()
            }
        }
    });

    res.json({ success: true, sessionId: session.id, url: session.url, orderId: order._id });
}));

// Confirm payment and complete order
router.post('/confirm-payment', isLoggedIn, catchAsync(async (req, res) => {
    let { paymentIntentId, orderId } = req.body;
    
    if (!paymentIntentId || !orderId) {
        return res.status(400).json({
            success: false,
            error: 'Payment Intent ID and Order ID are required'
        });
    }
    
    // If we received a Checkout Session id, resolve it to a Payment Intent id
    if (paymentIntentId && paymentIntentId.startsWith('cs_')) {
        const session = await stripe.checkout.sessions.retrieve(paymentIntentId, { expand: ['payment_intent'] });
        paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    }

    // Get order
    const order = await Order.findById(orderId)
        .populate('user', 'username email')
        .populate('cafe', 'name location')
        .populate('items.product', 'name');
    
    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }
    
    // Verify user owns this order
    if (order.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            error: 'Permission denied'
        });
    }
    
    // Confirm payment with Stripe
    const paymentResult = await StripeService.confirmPayment(paymentIntentId);
    
    if (!paymentResult.success || !paymentResult.paid) {
        order.payment.failureReason = paymentResult.failureReason || paymentResult.error;
        await order.save();
        
        return res.status(400).json({
            success: false,
            error: paymentResult.failureReason || paymentResult.error || 'Payment failed'
        });
    }
    
    // Payment successful - update order and user
    order.payment.paid = true;
    order.payment.paidAt = new Date();
    order.payment.transactionId = paymentResult.paymentIntent.id;
    order.status = 'confirmed';
    
    // Set estimated ready time
    const now = new Date();
    order.estimatedReadyTime = new Date(now.getTime() + (order.estimatedPrepTime * 60000));
    
    await order.save();

    // Amount-based points
    const pointsToAward = Math.floor(order.totalAmount);
    if (order.totalPointsEarned !== pointsToAward) {
        order.totalPointsEarned = pointsToAward;
        await order.save();
    }

    // Award points to user
    const user = await User.findById(req.user._id);
    await user.addPoints(
        pointsToAward,
        `Order ${order.orderNumber} - ${order.cafe?.name || 'Cafe'} purchase`,
        order._id
    );
    
    // Update product stock quantities
    for (const item of order.items) {
        await Product.findByIdAndUpdate(
            item.product._id,
            { $inc: { stockQuantity: -item.quantity } }
        );
    }
    
    // Mark coupon as used if applicable
    if (order.discount.coupon) {
        const coupon = await Coupon.findById(order.discount.coupon);
        if (coupon) {
            await coupon.useCoupon(
                req.user._id,
                order._id,
                order.cafe?._id,
                order.discount.amount
            );
        }
    }
    
    res.json({
        success: true,
        data: {
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                totalAmount: order.totalAmount,
                pointsEarned: pointsToAward,
                estimatedReadyTime: order.estimatedReadyTime,
                cafe: order.cafe
            },
            newPointsBalance: user.points
        },
        message: `Payment successful! You earned ${pointsToAward} points. Your order will be ready around ${order.estimatedReadyTime?.toLocaleTimeString()}.`
    });
}));

// Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), catchAsync(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    const eventResult = StripeService.constructEvent(req.body, signature);
    if (!eventResult.success) {
        return res.status(400).send(`Webhook Error: ${eventResult.error}`);
    }
    
    const event = eventResult.event;
    
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            
            if (orderId) {
                // Mark paid if not already
                let order = await Order.findById(orderId);
                if (order && !order.payment.paid) {
                    order.payment.paid = true;
                    order.payment.paidAt = new Date();
                    order.status = 'confirmed';
                    await order.save();
                }

                // Reload populated order to perform side effects
                order = await Order.findById(orderId)
                    .populate('user', '_id')
                    .populate('items.product', '_id');

                if (order && order.payment.paid) {
                    // Ensure amount-based points are awarded
                    const pointsToAward = Math.floor(order.totalAmount);
                    if (order.totalPointsEarned !== pointsToAward) {
                        order.totalPointsEarned = pointsToAward;
                        await order.save();
                    }

                    const user = await User.findById(order.user._id);
                    if (user) {
                        await user.addPoints(
                            pointsToAward,
                            `Order ${order.orderNumber} - ${order.cafe || 'Cafe'} purchase`,
                            order._id
                        );
                    }

                    // Decrement stock
                    for (const item of order.items) {
                        if (item.product) {
                            await Product.findByIdAndUpdate(
                                item.product._id,
                                { $inc: { stockQuantity: -item.quantity } }
                            );
                        }
                    }

                    // Mark coupon used
                    if (order.discount && order.discount.coupon) {
                        const coupon = await Coupon.findById(order.discount.coupon);
                        if (coupon) {
                            await coupon.useCoupon(
                                order.user._id,
                                order._id,
                                order.cafe?._id,
                                order.discount.amount
                            );
                        }
                    }
                }
            }
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            const failedOrderId = failedPayment.metadata.orderId;
            
            if (failedOrderId) {
                const order = await Order.findById(failedOrderId);
                if (order) {
                    order.payment.failureReason = failedPayment.last_payment_error?.message || 'Payment failed';
                    order.status = 'cancelled';
                    await order.save();
                }
            }
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
}));

// Get payment methods for user
router.get('/payment-methods', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    if (!user.stripeCustomerId) {
        return res.json({
            success: true,
            data: { paymentMethods: [] }
        });
    }
    
    const result = await StripeService.getPaymentMethods(user.stripeCustomerId);
    
    if (!result.success) {
        return res.status(400).json({
            success: false,
            error: result.error
        });
    }
    
    res.json({
        success: true,
        data: { paymentMethods: result.paymentMethods }
    });
}));

module.exports = router;
