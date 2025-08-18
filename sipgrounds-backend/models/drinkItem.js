const mongoose = require('mongoose');
const MenuItem = require('./menuItem');

// Drinks Schema - extends MenuItem
const drinkItemSchema = new mongoose.Schema({
    drinkType: {
        type: String,
        required: [true, 'Drink type is required'],
        enum: [
            // Hot Coffee
            'brewed_coffee', 'latte', 'americano', 'cappuccino', 'mocha', 'cortado',
            // Cold Coffee
            'cold_brew', 'nitro_cold_brew', 'iced_shaken_espresso', 'iced_latte', 'iced_mocha', 'iced_coffee',
            // Tea
            'hot_tea', 'iced_tea', 'chai', 'tea_lemonade',
            // Refreshers
            'refresher', 'mango_dragonfruit_lemonade', 'strawberry_acai_lemonade', 'summer_berry_refresher',
            // Frappuccino
            'frappuccino', 'coffee_frappuccino', 'creme_frappuccino', 'strato_frappuccino',
            // Other
            'hot_chocolate', 'lemonade', 'steamed_juice', 'bottled_water', 'bottled_juice', 'sparkling_water', 'juice', 'energy_drink', 'cold_foam'
        ]
    },
    temperature: {
        type: String,
        enum: ['hot', 'cold', 'both'],
        default: 'both'
    },
    caffeineContent: {
        type: Number, // mg of caffeine
        default: 0
    },
    milkOptions: [{
        name: String, // 'Whole', 'Almond', 'Oat', 'Soy', 'Coconut', '2%', 'Nonfat'
        extraCharge: { type: Number, default: 0 }
    }],
    sweetenerOptions: [{
        name: String, // 'Sugar', 'Stevia', 'Honey', 'Agave', 'Sugar-free Vanilla'
        extraCharge: { type: Number, default: 0 }
    }],
    flavorSyrups: [{
        name: String, // 'Vanilla', 'Caramel', 'Hazelnut', 'Peppermint'
        extraCharge: { type: Number, default: 0.50 }
    }],
    teaVariety: {
        type: String,
        enum: ['black_tea', 'green_tea', 'earl_grey', 'chamomile', 'herbal', 'white', 'oolong', 'chai', 'matcha', null],
        default: null
    },
    isDecafAvailable: {
        type: Boolean,
        default: false
    },
    brewMethod: {
        type: String,
        enum: ['espresso', 'drip', 'cold_brew', 'french_press', 'pour_over', 'steamed', null],
        default: null
    }
});

// Pre-save middleware to set category
drinkItemSchema.pre('save', function(next) {
    this.category = 'drinks';
    next();
});

// Method to get available milk options
drinkItemSchema.methods.getAvailableMilkOptions = function() {
    return this.milkOptions || [];
};

// Method to check if decaf is available
drinkItemSchema.methods.hasDecafOption = function() {
    return this.isDecafAvailable;
};

// Method to calculate total caffeine with customizations
drinkItemSchema.methods.getTotalCaffeine = function(customizations = {}) {
    let totalCaffeine = this.caffeineContent;
    
    if (customizations.decaf) {
        totalCaffeine = 0;
    }
    
    if (customizations.extraShot) {
        totalCaffeine += 75; // Average espresso shot caffeine
    }
    
    return totalCaffeine;
};

// Static method to get drinks by type
drinkItemSchema.statics.getByDrinkType = function(drinkType, cafeId = null) {
    const query = { drinkType };
    if (cafeId) {
        query.$or = [
            { availableAt: { $size: 0 } },
            { availableAt: cafeId }
        ];
    }
    return this.find(query).sort({ isPopular: -1, name: 1 });
};

// Static method to get drinks by temperature
drinkItemSchema.statics.getByTemperature = function(temperature, cafeId = null) {
    const query = { 
        $or: [
            { temperature: temperature },
            { temperature: 'both' }
        ]
    };
    if (cafeId) {
        query.$and = [{
            $or: [
                { availableAt: { $size: 0 } },
                { availableAt: cafeId }
            ]
        }];
    }
    return this.find(query).sort({ isPopular: -1, name: 1 });
};

// Create the DrinkItem model as a discriminator of MenuItem
const DrinkItem = MenuItem.discriminator('DrinkItem', drinkItemSchema);

module.exports = DrinkItem;
