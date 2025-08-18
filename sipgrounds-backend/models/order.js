const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    customizations: {
        size: String,
        milk: String,
        extras: [String],
        specialInstructions: String
    },
    pointsEarned: {
        type: Number,
        default: 0,
        min: 0
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cafe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cafe'
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },
    discount: {
        amount: {
            type: Number,
            default: 0,
            min: 0
        },
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon'
        },
        couponCode: String
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    totalPointsEarned: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending'
    },
    orderType: {
        type: String,
        enum: ['pickup', 'delivery', 'dine_in'],
        default: 'pickup'
    },
    pickupTime: Date,
    estimatedReadyTime: Date,
    deliveryAddress: {
        name: String,
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'USA'
        },
        phone: String,
        instructions: String
    },
    orderNumber: {
        type: String,
        unique: true
    },
    payment: {
        method: {
            type: String,
            enum: ['stripe', 'apple_pay', 'google_pay', 'cash', 'simulated', 'points'],
            default: 'stripe'
        },
        transactionId: String,
        paymentIntentId: String, // Stripe payment intent ID
        clientSecret: String, // Stripe client secret
        paid: {
            type: Boolean,
            default: false
        },
        paidAt: Date,
        failureReason: String
    },
    refund: {
        status: {
            type: String,
            enum: ['none', 'pending', 'processed', 'failed'],
            default: 'none'
        },
        amount: {
            type: Number,
            default: 0
        },
        refundId: String, // Stripe refund ID
        reason: String,
        processedAt: Date,
        failureReason: String
    },
    customerNotes: String,
    internalNotes: String
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        this.orderNumber = 'SG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// Also generate on validation to ensure it's always present
orderSchema.pre('validate', function(next) {
    if (!this.orderNumber) {
        this.orderNumber = 'SG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// Calculate total points earned for the order
orderSchema.methods.calculateTotalPoints = function() {
    let totalPoints = 0;
    this.items.forEach(item => {
        totalPoints += item.pointsEarned * item.quantity;
    });
    
    // Apply cafe points multiplier if applicable
    if (this.cafe && this.cafe.pointsMultiplier) {
        totalPoints *= this.cafe.pointsMultiplier;
    }
    
    return Math.floor(totalPoints);
};

// Virtual for estimated preparation time
orderSchema.virtual('estimatedPrepTime').get(function() {
    // Base prep time calculation based on items
    const baseMinutes = this.items.reduce((total, item) => {
        let itemTime = 3; // base 3 minutes per item
        
        // Add time for customizations
        if (item.customizations) {
            if (item.customizations.extras && item.customizations.extras.length > 0) {
                itemTime += item.customizations.extras.length * 1; // 1 min per extra
            }
        }
        
        return total + (itemTime * item.quantity);
    }, 0);
    
    return Math.max(5, Math.min(30, baseMinutes)); // Min 5 minutes, max 30 minutes
});

module.exports = mongoose.model('Order', orderSchema); 