const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CouponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['percentage', 'fixed_amount', 'free_item', 'points_bonus'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    // For free_item type
    freeItem: {
        category: String, // 'drink', 'pastry', 'food'
        maxValue: Number  // max price of free item
    },
    // For points_bonus type
    pointsBonus: {
        multiplier: {
            type: Number,
            default: 2,
            min: 1,
            max: 10
        },
        basePoints: Number // flat bonus points
    },
    minimumPurchase: {
        type: Number,
        default: 0,
        min: 0
    },
    maxUses: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    maxUsesPerUser: {
        type: Number,
        default: 1,
        min: 1
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCafes: [{
        type: Schema.Types.ObjectId,
        ref: 'Cafe'
    }], // empty array = valid at all partner cafes
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usage: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        },
        cafe: {
            type: Schema.Types.ObjectId,
            ref: 'Cafe'
        },
        discountAmount: Number,
        usedAt: {
            type: Date,
            default: Date.now
        },
        usedInStore: {
            type: Boolean,
            default: false // true if used in-store, false if used in app
        }
    }]
}, {
    timestamps: true
});

// Generate random alphanumeric coupon code
CouponSchema.statics.generateCode = function(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Check if coupon is valid for use
CouponSchema.methods.isValidForUse = function(userId, orderTotal = 0) {
    const now = new Date();
    
    // Basic validity checks
    if (!this.isActive) return { valid: false, reason: 'Coupon is not active' };
    if (now < this.validFrom) return { valid: false, reason: 'Coupon is not yet valid' };
    if (now > this.validUntil) return { valid: false, reason: 'Coupon has expired' };
    
    // Usage limit checks
    if (this.maxUses && this.usedCount >= this.maxUses) {
        return { valid: false, reason: 'Coupon usage limit reached' };
    }
    
    // User usage limit check
    const userUsageCount = this.usage.filter(use => use.user.toString() === userId.toString()).length;
    if (userUsageCount >= this.maxUsesPerUser) {
        return { valid: false, reason: 'User has reached maximum uses for this coupon' };
    }
    
    // Minimum purchase check
    if (orderTotal < this.minimumPurchase) {
        return { valid: false, reason: `Minimum purchase of $${this.minimumPurchase} required` };
    }
    
    return { valid: true };
};

// Calculate discount amount
CouponSchema.methods.calculateDiscount = function(orderTotal, items = []) {
    switch (this.type) {
        case 'percentage':
            return Math.min(orderTotal * (this.value / 100), orderTotal);
        case 'fixed_amount':
            return Math.min(this.value, orderTotal);
        case 'free_item':
            // Find applicable items and return value of cheapest qualifying item
            const applicableItems = items.filter(item => 
                item.category === this.freeItem.category && 
                item.price <= this.freeItem.maxValue
            );
            if (applicableItems.length === 0) return 0;
            return Math.min(...applicableItems.map(item => item.price));
        case 'points_bonus':
            return 0; // No monetary discount, only points bonus
        default:
            return 0;
    }
};

// Use the coupon
CouponSchema.methods.useCoupon = function(userId, orderId, cafeId, discountAmount, inStore = false) {
    this.usedCount += 1;
    this.usage.push({
        user: userId,
        order: orderId,
        cafe: cafeId,
        discountAmount,
        usedInStore: inStore
    });
    return this.save();
};

module.exports = mongoose.model('Coupon', CouponSchema);
