const express = require('express');
const router = express.Router();
const Reward = require('../models/reward');
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

// Get all available rewards
router.get('/', catchAsync(async (req, res) => {
    const { category, cafeId } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (cafeId) {
        query.$or = [
            { applicableCafes: cafeId },
            { applicableCafes: { $size: 0 } } // Available at all cafes
        ];
    }
    
    const rewards = await Reward.find(query)
        .populate('applicableCafes', 'name location')
        .sort({ pointsCost: 1 });
    
    res.json({
        success: true,
        data: { rewards }
    });
}));

// Get reward details
router.get('/:id', catchAsync(async (req, res) => {
    const reward = await Reward.findById(req.params.id)
        .populate('applicableCafes', 'name location address');
    
    if (!reward) {
        return res.status(404).json({
            success: false,
            error: 'Reward not found'
        });
    }
    
    res.json({
        success: true,
        data: { reward }
    });
}));

// Redeem reward
router.post('/:id/redeem', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { cafeId } = req.body;
    
    // Get reward and user
    const [reward, user] = await Promise.all([
        Reward.findById(id),
        User.findById(req.user._id)
    ]);
    
    if (!reward) {
        return res.status(404).json({
            success: false,
            error: 'Reward not found'
        });
    }
    
    // Check if reward is available
    const availability = reward.isAvailableForUser(req.user._id);
    if (!availability.available) {
        return res.status(400).json({
            success: false,
            error: availability.reason
        });
    }
    
    // Check if user has enough points
    if (user.points < reward.pointsCost) {
        return res.status(400).json({
            success: false,
            error: 'Insufficient points balance'
        });
    }
    
    // Check if reward is available at the specified cafe
    if (cafeId && reward.applicableCafes.length > 0) {
        const isValidCafe = reward.applicableCafes.some(cafe => cafe.toString() === cafeId);
        if (!isValidCafe) {
            return res.status(400).json({
                success: false,
                error: 'Reward not available at this cafe'
            });
        }
    }
    
    try {
        // Redeem points from user
        await user.redeemPoints(reward.pointsCost, `Redeemed: ${reward.name}`, reward._id);
        
        // Update reward redemption count
        reward.redeemedCount += 1;
        await reward.save();
        
        // Create redemption record (could be a separate model)
        const redemption = {
            user: user._id,
            reward: reward._id,
            pointsCost: reward.pointsCost,
            cafe: cafeId || null,
            redeemedAt: new Date(),
            expiresAt: new Date(Date.now() + (reward.expiryDays * 24 * 60 * 60 * 1000)),
            redemptionCode: generateRedemptionCode()
        };
        
        res.status(201).json({
            success: true,
            data: { 
                redemption,
                remainingPoints: user.points
            },
            message: `Successfully redeemed ${reward.name}! Your redemption code is ${redemption.redemptionCode}`
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));

// Helper function to generate redemption codes
function generateRedemptionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

module.exports = router;
