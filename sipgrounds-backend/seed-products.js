require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

// Database connection
const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://localhost:27017/sipgrounds';

async function seedProducts() {
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Database connected');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️ Cleared existing products');

        // Sample products for the shop
        const products = [
            {
                name: 'The Campgrounds Logo T-Shirt',
                description: 'Premium cotton t-shirt with The Campgrounds logo',
                price: 24.99,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                category: 'merchandise',
                subcategory: 't_shirt',
                pointsEarned: 25,
                inStock: true,
                stockQuantity: 50,
                isPopular: true
            },
            {
                name: 'Campgrounds Coffee Mug',
                description: 'Ceramic coffee mug perfect for your morning brew',
                price: 14.99,
                image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400',
                category: 'merchandise',
                subcategory: 'mug',
                pointsEarned: 15,
                inStock: true,
                stockQuantity: 75,
                isRecommended: true
            },
            {
                name: 'Insulated Travel Tumbler',
                description: 'Stainless steel tumbler keeps drinks hot or cold for hours',
                price: 29.99,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                category: 'merchandise',
                subcategory: 'tumbler',
                pointsEarned: 30,
                inStock: true,
                stockQuantity: 30,
                isPopular: true
            },
            {
                name: 'Campgrounds Tote Bag',
                description: 'Eco-friendly canvas tote bag for all your adventures',
                price: 19.99,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                category: 'merchandise',
                subcategory: 'tote_bag',
                pointsEarned: 20,
                inStock: true,
                stockQuantity: 40
            },
            {
                name: 'Premium Coffee Beans - House Blend',
                description: 'Our signature coffee blend, roasted to perfection',
                price: 16.99,
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
                category: 'merchandise',
                subcategory: 'beans',
                pointsEarned: 17,
                inStock: true,
                stockQuantity: 100,
                isRecommended: true
            },
            {
                name: 'Campgrounds Hoodie',
                description: 'Comfortable hoodie perfect for cool mornings',
                price: 39.99,
                image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
                category: 'merchandise',
                subcategory: 't_shirt',
                pointsEarned: 40,
                inStock: true,
                stockQuantity: 25,
                isPopular: true
            },
            {
                name: 'Campgrounds Notebook',
                description: 'Lined notebook for jotting down your thoughts and plans',
                price: 12.99,
                image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
                category: 'merchandise',
                pointsEarned: 13,
                inStock: true,
                stockQuantity: 60
            },
            {
                name: 'Gift Card - $25',
                description: 'Perfect gift for the coffee lover in your life',
                price: 25.00,
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
                category: 'gift_card',
                pointsEarned: 0, // No points for gift cards
                inStock: true,
                stockQuantity: 1000
            },
            {
                name: 'Gift Card - $50',
                description: 'Perfect gift for the coffee lover in your life',
                price: 50.00,
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
                category: 'gift_card',
                pointsEarned: 0, // No points for gift cards
                inStock: true,
                stockQuantity: 1000
            }
        ];

        // Create products
        console.log('🛍️ Creating products...');
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ Created ${createdProducts.length} products`);

        console.log('🎉 Product seeding completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - ${createdProducts.length} products created`);
        console.log(`   - Categories: apparel, drinkware, accessories, merchandise, stationery, gift_card`);

    } catch (error) {
        console.error('❌ Error seeding products:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the seeding function
if (require.main === module) {
    seedProducts();
}

module.exports = seedProducts;
