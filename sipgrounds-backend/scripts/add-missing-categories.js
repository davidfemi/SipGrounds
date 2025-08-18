require('dotenv').config();
const mongoose = require('mongoose');
const DrinkItem = require('../models/drinkItem');

const mongoUrl = process.env.DB_URL || 'mongodb://localhost:27017/sipgrounds';

const missingDrinkItems = [
  // HOT TEA
  {
    name: "Earl Grey Tea",
    description: "A classic black tea blend with bergamot oil",
    price: 2.45,
    image: "https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202280/hot_tea_gmvzmw.jpg",
    category: "drinks",
    drinkType: "hot_tea",
    temperature: "hot",
    caffeineContent: 40,
    teaVariety: "earl_grey"
  },
  {
    name: "Green Tea",
    description: "A smooth, refreshing green tea with a delicate flavor",
    price: 2.45,
    image: "https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202280/hot_tea_gmvzmw.jpg",
    category: "drinks",
    drinkType: "hot_tea",
    temperature: "hot",
    caffeineContent: 25,
    teaVariety: "green_tea"
  },
  
  // COLD TEA
  {
    name: "Iced Green Tea",
    description: "Premium green tea served over ice",
    price: 2.45,
    image: "https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202277/cold_tea_ipge6m.jpg",
    category: "drinks",
    drinkType: "iced_tea",
    temperature: "cold",
    caffeineContent: 25,
    teaVariety: "green_tea"
  },
  
  // REFRESHERS
  {
    name: "Strawberry Açaí Refresher",
    description: "Sweet strawberry flavors accented by passion fruit and açaí notes",
    price: 3.85,
    image: "https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202278/refresher_byajep.jpg",
    category: "drinks",
    drinkType: "refresher",
    temperature: "cold",
    caffeineContent: 45
  },
  
  // FRAPPUCCINO
  {
    name: "Caramel Frappuccino®",
    description: "Coffee blended with milk and ice, topped with caramel drizzle",
    price: 4.95,
    image: "https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202279/frappuccino_kkrlgu.jpg",
    category: "drinks",
    drinkType: "frappuccino",
    temperature: "cold",
    caffeineContent: 95
  },
  
  // HOT CHOCOLATE
  {
    name: "Hot Chocolate",
    description: "Rich, creamy hot chocolate made with steamed milk",
    price: 3.45,
    image: "https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202284/hot_chocolate_zgs31m.jpg",
    category: "drinks",
    drinkType: "hot_chocolate",
    temperature: "hot",
    caffeineContent: 15
  },
  
  // BOTTLED BEVERAGES
  {
    name: "Orange Juice",
    description: "Premium orange juice with no added sugar",
    price: 3.45,
    image: "https://res.cloudinary.com/djsoqjxpg/image/upload/v1755202278/orange_juice_yxc2ng.jpg",
    category: "drinks",
    drinkType: "bottled_juice",
    temperature: "cold",
    caffeineContent: 0
  }
];

async function addMissingCategories() {
  try {
    console.log('🌱 Adding missing menu categories...');
    
    // Connect to MongoDB
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');

    // Add missing items (only if they don't exist)
    for (const itemData of missingDrinkItems) {
      const existingItem = await DrinkItem.findOne({ name: itemData.name });
      if (!existingItem) {
        const item = new DrinkItem(itemData);
        await item.save();
        console.log(`✅ Added: ${itemData.name} (${itemData.drinkType})`);
      } else {
        console.log(`⏭️  Skipped: ${itemData.name} (already exists)`);
      }
    }

    // Check final count
    const totalCount = await DrinkItem.countDocuments();
    console.log(`📊 Total drink items in database: ${totalCount}`);
    
    // List all drink types
    const drinkTypes = await DrinkItem.distinct('drinkType');
    console.log('🍹 Available drink types:', drinkTypes.sort());
    
  } catch (error) {
    console.error('❌ Error adding missing categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

addMissingCategories();
