const mongoose = require('mongoose');

// Menu Schema - represents a cafe's complete menu
const menuSchema = new mongoose.Schema({
    cafe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cafe',
        required: [true, 'Menu must belong to a cafe']
    },
    name: {
        type: String,
        required: [true, 'Menu name is required'],
        trim: true,
        default: function() {
            return `${this.cafe.name} Menu`;
        }
    },
    description: {
        type: String,
        trim: true,
        default: 'Our carefully curated selection of drinks and food items'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    menuSections: [{
        name: {
            type: String,
            required: true
        }, // 'Hot Coffee', 'Cold Coffee', 'Breakfast', 'Bakery', etc.
        description: String,
        displayOrder: {
            type: Number,
            default: 0
        },
        items: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem'
        }],
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    availability: {
        schedule: {
            monday: { 
                isAvailable: { type: Boolean, default: true },
                startTime: { type: String, default: '06:00' },
                endTime: { type: String, default: '22:00' }
            },
            tuesday: { 
                isAvailable: { type: Boolean, default: true },
                startTime: { type: String, default: '06:00' },
                endTime: { type: String, default: '22:00' }
            },
            wednesday: { 
                isAvailable: { type: Boolean, default: true },
                startTime: { type: String, default: '06:00' },
                endTime: { type: String, default: '22:00' }
            },
            thursday: { 
                isAvailable: { type: Boolean, default: true },
                startTime: { type: String, default: '06:00' },
                endTime: { type: String, default: '22:00' }
            },
            friday: { 
                isAvailable: { type: Boolean, default: true },
                startTime: { type: String, default: '06:00' },
                endTime: { type: String, default: '22:00' }
            },
            saturday: { 
                isAvailable: { type: Boolean, default: true },
                startTime: { type: String, default: '07:00' },
                endTime: { type: String, default: '22:00' }
            },
            sunday: { 
                isAvailable: { type: Boolean, default: true },
                startTime: { type: String, default: '07:00' },
                endTime: { type: String, default: '21:00' }
            }
        },
        specialHours: [{
            date: Date,
            isAvailable: Boolean,
            startTime: String,
            endTime: String,
            reason: String // 'Holiday', 'Special Event', etc.
        }]
    },
    pricing: {
        currency: {
            type: String,
            default: 'USD'
        },
        taxIncluded: {
            type: Boolean,
            default: false
        },
        serviceCharge: {
            type: Number,
            default: 0
        }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
menuSchema.index({ cafe: 1 });
menuSchema.index({ isActive: 1 });
menuSchema.index({ 'menuSections.items': 1 });

// Pre-save middleware to update lastUpdated
menuSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Virtual to get total number of items
menuSchema.virtual('totalItems').get(function() {
    return this.menuSections.reduce((total, section) => {
        return total + (section.items ? section.items.length : 0);
    }, 0);
});

// Virtual to get active sections only
menuSchema.virtual('activeSections').get(function() {
    return this.menuSections.filter(section => section.isActive);
});

// Method to check if menu is available at current time
menuSchema.methods.isAvailableNow = function() {
    const now = new Date();
    const currentDay = now.toLocaleLowerCase().substring(0, 3); // 'mon', 'tue', etc.
    const currentTime = now.toTimeString().substring(0, 5); // 'HH:MM'
    
    // Check special hours first
    const today = now.toISOString().split('T')[0];
    const specialHour = this.availability.specialHours.find(sh => 
        sh.date.toISOString().split('T')[0] === today
    );
    
    if (specialHour) {
        if (!specialHour.isAvailable) return false;
        return currentTime >= specialHour.startTime && currentTime <= specialHour.endTime;
    }
    
    // Check regular schedule
    const daySchedule = this.availability.schedule[currentDay + 'day'];
    if (!daySchedule || !daySchedule.isAvailable) return false;
    
    return currentTime >= daySchedule.startTime && currentTime <= daySchedule.endTime;
};

// Method to add item to section
menuSchema.methods.addItemToSection = function(sectionName, itemId) {
    let section = this.menuSections.find(s => s.name === sectionName);
    
    if (!section) {
        section = {
            name: sectionName,
            items: [],
            isActive: true,
            displayOrder: this.menuSections.length
        };
        this.menuSections.push(section);
    }
    
    if (!section.items.includes(itemId)) {
        section.items.push(itemId);
    }
    
    return this.save();
};

// Method to remove item from section
menuSchema.methods.removeItemFromSection = function(sectionName, itemId) {
    const section = this.menuSections.find(s => s.name === sectionName);
    if (section) {
        section.items = section.items.filter(id => id.toString() !== itemId.toString());
    }
    return this.save();
};

// Method to get items by category
menuSchema.methods.getItemsByCategory = function(category) {
    const items = [];
    this.menuSections.forEach(section => {
        if (section.isActive) {
            section.items.forEach(item => {
                if (item.category === category) {
                    items.push(item);
                }
            });
        }
    });
    return items;
};

// Static method to get menu by cafe
menuSchema.statics.getByCafe = function(cafeId) {
    return this.findOne({ cafe: cafeId, isActive: true })
        .populate({
            path: 'menuSections.items',
            match: { inStock: true }
        })
        .populate('cafe', 'name location');
};

// Static method to create default menu for cafe
menuSchema.statics.createDefaultMenu = function(cafeId) {
    const defaultSections = [
        { name: 'Hot Coffee', displayOrder: 1 },
        { name: 'Cold Coffee', displayOrder: 2 },
        { name: 'Hot Tea', displayOrder: 3 },
        { name: 'Cold Tea', displayOrder: 4 },
        { name: 'Refreshers', displayOrder: 5 },
        { name: 'Frappuccino® Blended Beverages', displayOrder: 6 },
        { name: 'Hot Chocolate, Lemonade & More', displayOrder: 7 },
        { name: 'Bottled Beverages', displayOrder: 8 },
        { name: 'Breakfast', displayOrder: 9 },
        { name: 'Bakery', displayOrder: 10 },
        { name: 'Snacks', displayOrder: 11 }
    ];
    
    return this.create({
        cafe: cafeId,
        menuSections: defaultSections
    });
};

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
