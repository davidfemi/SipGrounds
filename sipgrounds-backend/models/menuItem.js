const mongoose = require('mongoose');

// Base MenuItem Schema - Abstract base class for menu items
const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Menu item description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Menu item price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        required: [true, 'Menu item image is required']
    },
    category: {
        type: String,
        required: [true, 'Menu item category is required'],
        enum: ['drinks', 'food']
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
        extras: [{
            name: String, // 'Extra Shot', 'Decaf', 'Extra Hot', 'No Ice'
            price: { type: Number, default: 0 }
        }]
    },
    nutritionalInfo: {
        calories: Number,
        allergens: [String] // 'dairy', 'nuts', 'gluten', 'soy'
    },
    inStock: {
        type: Boolean,
        default: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isRecommended: {
        type: Boolean,
        default: false
    },
    preparationTime: {
        type: Number, // in minutes
        default: 5
    }
}, {
    timestamps: true,
    discriminatorKey: 'itemType' // This allows for inheritance
});

// Virtual for total points with customizations
menuItemSchema.virtual('totalPointsWithCustomizations').get(function() {
    let total = this.pointsEarned;
    if (this.customization && this.customization.extras) {
        this.customization.extras.forEach(extra => {
            if (extra.price > 0) {
                total += Math.ceil(extra.price);
            }
        });
    }
    return total;
});

// Method to check availability at specific cafe
menuItemSchema.methods.isAvailableAt = function(cafeId) {
    if (!this.availableAt || this.availableAt.length === 0) {
        return true; // Available at all cafes
    }
    return this.availableAt.some(id => id.toString() === cafeId.toString());
};

// Method to get price with size customization
menuItemSchema.methods.getPriceWithSize = function(sizeName) {
    if (!sizeName || !this.customization || !this.customization.sizes) {
        return this.price;
    }
    
    const size = this.customization.sizes.find(s => s.name === sizeName);
    return size ? size.price : this.price;
};

// Static method to get items by category
menuItemSchema.statics.getByCategory = function(category, cafeId = null) {
    const query = { category };
    if (cafeId) {
        query.$or = [
            { availableAt: { $size: 0 } }, // Available at all cafes
            { availableAt: cafeId }
        ];
    }
    return this.find(query).sort({ isPopular: -1, name: 1 });
};

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
