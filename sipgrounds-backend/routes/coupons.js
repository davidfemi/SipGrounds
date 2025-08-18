const express = require('express');
const router = express.Router();
const Coupon = require('../models/coupon');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

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

// Get all active coupons (public)
router.get('/', catchAsync(async (req, res) => {
    const { cafeId } = req.query;
    
    const query = { 
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
    };
    
    if (cafeId) {
        query.$or = [
            { applicableCafes: cafeId },
            { applicableCafes: { $size: 0 } } // Valid at all cafes
        ];
    }
    
    const coupons = await Coupon.find(query)
        .populate('applicableCafes', 'name location')
        .select('-usage') // Don't expose usage data publicly
        .sort({ createdAt: -1 });
    
    res.json({
        success: true,
        data: { coupons }
    });
}));

// Validate coupon code
router.post('/validate', isLoggedIn, catchAsync(async (req, res) => {
    const { code, orderTotal = 0, items = [] } = req.body;
    
    if (!code) {
        return res.status(400).json({
            success: false,
            error: 'Coupon code is required'
        });
    }
    
    const coupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        isActive: true 
    });
    
    if (!coupon) {
        return res.status(404).json({
            success: false,
            error: 'Invalid coupon code'
        });
    }
    
    // Validate coupon for user
    const validation = coupon.isValidForUse(req.user._id, orderTotal);
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            error: validation.reason
        });
    }
    
    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderTotal, items);
    
    res.json({
        success: true,
        data: {
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                type: coupon.type,
                value: coupon.value
            },
            discountAmount,
            isValid: true
        }
    });
}));

// Apply coupon to order
router.post('/apply', isLoggedIn, catchAsync(async (req, res) => {
    const { couponId, orderId, cafeId, discountAmount } = req.body;
    
    if (!couponId || !orderId) {
        return res.status(400).json({
            success: false,
            error: 'Coupon ID and Order ID are required'
        });
    }
    
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        return res.status(404).json({
            success: false,
            error: 'Coupon not found'
        });
    }
    
    // Final validation before application
    const validation = coupon.isValidForUse(req.user._id);
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            error: validation.reason
        });
    }
    
    // Use the coupon
    await coupon.useCoupon(req.user._id, orderId, cafeId, discountAmount);
    
    res.json({
        success: true,
        data: {
            couponUsed: true,
            discountApplied: discountAmount
        },
        message: 'Coupon applied successfully'
    });
}));

// Generate new coupon (admin function)
router.post('/generate', isLoggedIn, catchAsync(async (req, res) => {
    const {
        name,
        description,
        type,
        value,
        minimumPurchase = 0,
        maxUses = null,
        maxUsesPerUser = 1,
        validDays = 30,
        applicableCafes = []
    } = req.body;
    
    if (!name || !type || value === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Name, type, and value are required'
        });
    }
    
    // Generate unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = Coupon.generateCode();
        const existing = await Coupon.findOne({ code });
        if (!existing) isUnique = true;
    }
    
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);
    
    const coupon = new Coupon({
        code,
        name,
        description,
        type,
        value,
        minimumPurchase,
        maxUses,
        maxUsesPerUser,
        validUntil,
        applicableCafes,
        createdBy: req.user._id
    });
    
    await coupon.save();
    
    res.status(201).json({
        success: true,
        data: { coupon },
        message: `Coupon created with code: ${code}`
    });
}));

// Get user's coupon usage history
router.get('/my-usage', isLoggedIn, catchAsync(async (req, res) => {
    const coupons = await Coupon.find({
        'usage.user': req.user._id
    })
    .populate('applicableCafes', 'name')
    .populate('usage.cafe', 'name location')
    .select('code name description type value usage');
    
    const userUsage = coupons.map(coupon => {
        const userCouponUsage = coupon.usage.filter(use => 
            use.user.toString() === req.user._id.toString()
        );
        
        return {
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                name: coupon.name,
                description: coupon.description,
                type: coupon.type,
                value: coupon.value
            },
            usageHistory: userCouponUsage
        };
    });
    
    res.json({
        success: true,
        data: { userUsage }
    });
}));

module.exports = router;
