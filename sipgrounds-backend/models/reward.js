const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RewardSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ['drink', 'food', 'pastry', 'merchandise', 'experience'],
        required: true
    },
    pointsCost: {
        type: Number,
        required: true,
        min: 1
    },
    monetaryValue: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        url: String,
        filename: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stockLimit: {
        type: Number,
        default: null // null = unlimited
    },
    redeemedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    applicableCafes: [{
        type: Schema.Types.ObjectId,
        ref: 'Cafe'
    }], // empty array = valid at all partner cafes
    restrictions: {
        maxPerUser: {
            type: Number,
            default: null // null = unlimited
        },
        validDays: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }], // empty array = valid all days
        validTimes: {
            start: String, // "09:00"
            end: String    // "17:00"
        }
    },
    expiryDays: {
        type: Number,
        default: 30 // Days after redemption before reward expires
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure virtuals (e.g., isInStock, stockPercentage) are sent in API responses
RewardSchema.set('toJSON', { virtuals: true });
RewardSchema.set('toObject', { virtuals: true });

// Check if reward is available for redemption
RewardSchema.methods.isAvailableForUser = function(userId) {
    // Basic availability checks
    if (!this.isActive) return { available: false, reason: 'Reward is not active' };
    
    // Stock limit check
    if (this.stockLimit && this.redeemedCount >= this.stockLimit) {
        return { available: false, reason: 'Reward is out of stock' };
    }
    
    return { available: true };
};

// Virtual for availability status
RewardSchema.virtual('isInStock').get(function() {
    return !this.stockLimit || this.redeemedCount < this.stockLimit;
});

// Virtual for stock percentage
RewardSchema.virtual('stockPercentage').get(function() {
    if (!this.stockLimit) return 100;
    return Math.max(0, Math.round(((this.stockLimit - this.redeemedCount) / this.stockLimit) * 100));
});

module.exports = mongoose.model('Reward', RewardSchema);
