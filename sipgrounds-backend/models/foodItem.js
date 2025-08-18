const mongoose = require('mongoose');
const MenuItem = require('./menuItem');

// Food Schema - extends MenuItem
const foodItemSchema = new mongoose.Schema({
    foodType: {
        type: String,
        required: [true, 'Food type is required'],
        enum: [
            // Breakfast
            'sandwich', 'wrap', 'egg_bites', 'egg_bakes', 'avocado_spread',
            // Bakery
            'vanilla_bean_custard_danish', 'baked_apple_croissant', 'ham_swiss_croissant', 
            'butter_croissant', 'chocolate_croissant', 'muffin',
            // Snacks
            'madagascar_vanilla_bar', 'dark_chocolate_peanut_butter_bar', 'peanut_butter_bar',
            'cake_pop'
        ]
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'snack', 'dessert', 'all_day'],
        default: 'all_day'
    },
    dietaryInfo: {
        isVegan: { type: Boolean, default: false },
        isVegetarian: { type: Boolean, default: false },
        isGlutenFree: { type: Boolean, default: false },
        isDairyFree: { type: Boolean, default: false },
        isKeto: { type: Boolean, default: false },
        isLowCarb: { type: Boolean, default: false }
    },
    ingredients: [{
        name: String,
        isAllergen: { type: Boolean, default: false }
    }],
    nutritionalInfo: {
        calories: Number,
        protein: Number, // grams
        carbs: Number, // grams
        fat: Number, // grams
        fiber: Number, // grams
        sugar: Number, // grams
        sodium: Number, // mg
        allergens: [String] // 'dairy', 'nuts', 'gluten', 'soy', 'eggs'
    },
    servingInfo: {
        servingSize: String, // '1 sandwich', '1 slice', etc.
        weight: Number, // grams
        temperature: {
            type: String,
            enum: ['hot', 'cold', 'room_temperature'],
            default: 'room_temperature'
        }
    },
    customizationOptions: {
        breadOptions: [{
            name: String, // 'Whole Wheat', 'Sourdough', 'Gluten-Free'
            extraCharge: { type: Number, default: 0 }
        }],
        proteinOptions: [{
            name: String, // 'Turkey', 'Ham', 'Veggie Patty'
            extraCharge: { type: Number, default: 0 }
        }],
        cheeseOptions: [{
            name: String, // 'Cheddar', 'Swiss', 'Vegan Cheese'
            extraCharge: { type: Number, default: 0 }
        }],
        toppings: [{
            name: String, // 'Lettuce', 'Tomato', 'Avocado'
            extraCharge: { type: Number, default: 0 }
        }],
        sauces: [{
            name: String, // 'Mayo', 'Mustard', 'Pesto'
            extraCharge: { type: Number, default: 0 }
        }]
    },
    heatingInstructions: {
        canBeHeated: { type: Boolean, default: false },
        heatingTime: Number, // seconds
        heatingMethod: {
            type: String,
            enum: ['microwave', 'oven', 'toaster', 'none'],
            default: 'none'
        }
    }
});

// Pre-save middleware to set category
foodItemSchema.pre('save', function(next) {
    this.category = 'food';
    next();
});

// Method to check if item meets dietary restrictions
foodItemSchema.methods.meetsDietaryRestrictions = function(restrictions = []) {
    const dietaryInfo = this.dietaryInfo;
    
    return restrictions.every(restriction => {
        switch (restriction.toLowerCase()) {
            case 'vegan':
                return dietaryInfo.isVegan;
            case 'vegetarian':
                return dietaryInfo.isVegetarian;
            case 'gluten-free':
            case 'gluten_free':
                return dietaryInfo.isGlutenFree;
            case 'dairy-free':
            case 'dairy_free':
                return dietaryInfo.isDairyFree;
            case 'keto':
                return dietaryInfo.isKeto;
            case 'low-carb':
            case 'low_carb':
                return dietaryInfo.isLowCarb;
            default:
                return true;
        }
    });
};

// Method to get allergen information
foodItemSchema.methods.getAllergens = function() {
    const allergens = new Set();
    
    // Add allergens from nutritional info
    if (this.nutritionalInfo && this.nutritionalInfo.allergens) {
        this.nutritionalInfo.allergens.forEach(allergen => allergens.add(allergen));
    }
    
    // Add allergens from ingredients
    if (this.ingredients) {
        this.ingredients.forEach(ingredient => {
            if (ingredient.isAllergen) {
                allergens.add(ingredient.name.toLowerCase());
            }
        });
    }
    
    return Array.from(allergens);
};

// Method to check if item is available for specific meal time
foodItemSchema.methods.isAvailableForMealType = function(mealType) {
    return this.mealType === 'all_day' || this.mealType === mealType;
};

// Method to get customization options by type
foodItemSchema.methods.getCustomizationOptions = function(optionType) {
    if (!this.customizationOptions || !this.customizationOptions[optionType]) {
        return [];
    }
    return this.customizationOptions[optionType];
};

// Static method to get food by meal type
foodItemSchema.statics.getByMealType = function(mealType, cafeId = null) {
    const query = { 
        $or: [
            { mealType: mealType },
            { mealType: 'all_day' }
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

// Static method to get food by dietary restrictions
foodItemSchema.statics.getByDietaryRestrictions = function(restrictions = [], cafeId = null) {
    const query = {};
    
    restrictions.forEach(restriction => {
        switch (restriction.toLowerCase()) {
            case 'vegan':
                query['dietaryInfo.isVegan'] = true;
                break;
            case 'vegetarian':
                query['dietaryInfo.isVegetarian'] = true;
                break;
            case 'gluten-free':
            case 'gluten_free':
                query['dietaryInfo.isGlutenFree'] = true;
                break;
            case 'dairy-free':
            case 'dairy_free':
                query['dietaryInfo.isDairyFree'] = true;
                break;
            case 'keto':
                query['dietaryInfo.isKeto'] = true;
                break;
            case 'low-carb':
            case 'low_carb':
                query['dietaryInfo.isLowCarb'] = true;
                break;
        }
    });
    
    if (cafeId) {
        query.$or = [
            { availableAt: { $size: 0 } },
            { availableAt: cafeId }
        ];
    }
    
    return this.find(query).sort({ isPopular: -1, name: 1 });
};

// Create the FoodItem model as a discriminator of MenuItem
const FoodItem = MenuItem.discriminator('FoodItem', foodItemSchema);

module.exports = FoodItem;
