const mongoose = require('mongoose')
const Review = require('./review')
const User = require('./user')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } }

const CafeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'US' }
    },
    contact: {
        phone: String,
        email: String,
        website: String,
        socialMedia: {
            instagram: String,
            facebook: String,
            twitter: String
        }
    },
    hours: {
        monday: { open: String, close: String, closed: { type: Boolean, default: false } },
        tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
        friday: { open: String, close: String, closed: { type: Boolean, default: false } },
        saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
        sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
    },
    amenities: [{
        type: String,
        enum: ['wifi', 'parking', 'outdoor_seating', 'pet_friendly', 'wheelchair_accessible', 
               'takeout', 'delivery', 'drive_through', 'reservations', 'live_music', 
               'study_friendly', 'meeting_rooms', 'charging_stations']
    }],
    specialties: [{
        type: String,
        enum: ['espresso', 'pour_over', 'cold_brew', 'pastries', 'sandwiches', 'breakfast', 
               'lunch', 'vegan_options', 'gluten_free', 'organic', 'fair_trade', 'local_roast']
    }],
    priceRange: {
        type: String,
        enum: ['$', '$$', '$$$', '$$$$'],
        default: '$$'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    isPartner: {
        type: Boolean,
        default: true // All cafes are pre-onboarded partners per spec
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    pointsMultiplier: {
        type: Number,
        default: 1,
        min: 1,
        max: 5 // 1x to 5x points for special partner cafes
    }
}, opts)

CafeSchema.virtual('properties.popUpMarkUp').get(function () {
    const safeDescription = this.description || '';
    const safeName = this.name || 'Untitled Cafe';
    return `
    <strong><a href="/cafes/${this._id}">${safeName}</a></strong>
    <p>${safeDescription.substring(0, 50)}...</p>
    <p><strong>Price Range:</strong> ${this.priceRange}</p>`
})

CafeSchema.virtual('averageRating').get(function () {
    if (!this.reviews || this.reviews.length === 0) return 0;
    return this.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / this.reviews.length;
})

CafeSchema.virtual('isOpen').get(function () {
    const now = new Date();
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const dayHours = this.hours?.[day];
    
    if (!dayHours || dayHours.closed) return false;
    
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= dayHours.open && currentTime <= dayHours.close;
})

CafeSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Cafe', CafeSchema)