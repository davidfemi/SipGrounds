const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        required: [true, 'Product image is required']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['coffee', 'tea', 'pastry', 'food', 'merchandise', 'gift_card'],
        default: 'coffee'
    },
    subcategory: {
        type: String,
        enum: ['espresso', 'latte', 'cappuccino', 'americano', 'cold_brew', 'pour_over', 
               'black_tea', 'green_tea', 'herbal_tea', 'chai',
               'croissant', 'muffin', 'cookie', 'cake', 'donut',
               'sandwich', 'salad', 'soup', 'bagel', 'wrap',
               'mug', 'tumbler', 't_shirt', 'tote_bag', 'beans']
    },
    availableAt: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cafe'
    }], // empty array = available at all cafes
    pointsEarned: {
        type: Number,
        default: function() {
            // Default: 1 point per dollar spent, rounded up
            return Math.ceil(this.price);
        },
        min: [0, 'Points earned cannot be negative']
    },
    customization: {
        sizes: [{
            name: String, // 'Small', 'Medium', 'Large'
            price: Number,
            pointsEarned: Number
        }],
        milkOptions: [{
            name: String, // 'Whole', 'Almond', 'Oat', 'Soy'
            extraCharge: { type: Number, default: 0 }
        }],
        extras: [{
            name: String, // 'Extra Shot', 'Decaf', 'Extra Hot'
            price: { type: Number, default: 0 }
        }]
    },
    nutritionalInfo: {
        calories: Number,
        caffeine: Number, // mg
        allergens: [String]
    },
    inStock: {
        type: Boolean,
        default: true
    },
    stockQuantity: {
        type: Number,
        default: 100,
        min: [0, 'Stock quantity cannot be negative']
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isRecommended: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for total points with customizations
productSchema.virtual('totalPointsWithCustomizations').get(function() {
    return function(customizations = {}) {
        let totalPrice = this.price;
        let totalPoints = this.pointsEarned;
        
        // Add size upcharge
        if (customizations.size) {
            const sizeOption = this.customization.sizes.find(s => s.name === customizations.size);
            if (sizeOption) {
                totalPrice += sizeOption.price;
                totalPoints = sizeOption.pointsEarned || Math.ceil(totalPrice);
            }
        }
        
        // Add milk option upcharge
        if (customizations.milk) {
            const milkOption = this.customization.milkOptions.find(m => m.name === customizations.milk);
            if (milkOption) {
                totalPrice += milkOption.extraCharge;
            }
        }
        
        // Add extras upcharge
        if (customizations.extras && customizations.extras.length > 0) {
            customizations.extras.forEach(extraName => {
                const extra = this.customization.extras.find(e => e.name === extraName);
                if (extra) {
                    totalPrice += extra.price;
                }
            });
        }
        
        // Recalculate points based on final price if no custom points set
        if (!this.customization.sizes?.find(s => s.name === customizations.size)?.pointsEarned) {
            totalPoints = Math.ceil(totalPrice);
        }
        
        return { totalPrice, totalPoints };
    };
});

module.exports = mongoose.model('Product', productSchema); 