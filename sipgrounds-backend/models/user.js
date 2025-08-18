const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    pointsHistory: [{
        type: {
            type: String,
            enum: ['earned', 'redeemed'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: String,
        relatedOrder: {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        },
        relatedReward: {
            type: Schema.Types.ObjectId,
            ref: 'Reward'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    favoritecafes: [{
        type: Schema.Types.ObjectId,
        ref: 'Cafe'
    }],
    profile: {
        firstName: String,
        lastName: String,
        phone: String,
        preferences: {
            coffeeType: [String], // e.g., ['espresso', 'latte', 'cappuccino']
            dietaryRestrictions: [String], // e.g., ['vegan', 'gluten-free']
            notifications: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
                promotions: { type: Boolean, default: true }
            }
        }
    }
}, {
    timestamps: true
})

UserSchema.plugin(passportLocalMongoose)

// Methods for points management
UserSchema.methods.addPoints = function(amount, description, relatedOrder = null) {
    this.points += amount;
    this.pointsHistory.push({
        type: 'earned',
        amount,
        description,
        relatedOrder
    });
    return this.save();
};

UserSchema.methods.redeemPoints = function(amount, description, relatedReward = null) {
    if (this.points < amount) {
        throw new Error('Insufficient points balance');
    }
    this.points -= amount;
    this.pointsHistory.push({
        type: 'redeemed',
        amount,
        description,
        relatedReward
    });
    return this.save();
};

module.exports = mongoose.model('User', UserSchema)