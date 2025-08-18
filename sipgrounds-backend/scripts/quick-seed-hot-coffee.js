const mongoose = require('mongoose');
const DrinkItem = require('../models/drinkItem');

require('dotenv').config({ path: '../.env' });

const mongoUrl = process.env.DB_URL || 'mongodb://localhost:27017/sipgrounds';

async function seedHotCoffee() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Clear test items
    await DrinkItem.deleteMany({ name: /Test|TEST/ });
    console.log('Cleared test items');

    // Hot Coffee items from ITEMS.md with correct Cloudinary images
    const hotCoffeeItems = [
      {
        name: 'Featured Medium Roast – Odyssey Blend™ 2025',
        description: 'Our signature medium roast coffee, expertly crafted for the perfect balance',
        price: 3.25,
        category: 'drinks',
        drinkType: 'brewed_coffee',
        temperature: 'hot',
        caffeineContent: 180,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755271935/Uefa_champions_league_blend_tpw5ia.jpg',
        pointsEarned: 3,
        inStock: true,
        preparationTime: 2
      },
      {
        name: 'Decaf Pike Place® Roast',
        description: 'Smooth and balanced decaf with subtle notes of cocoa and toasted nuts',
        price: 3.15,
        category: 'drinks',
        drinkType: 'brewed_coffee',
        temperature: 'hot',
        caffeineContent: 15,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755271935/fifa_decaf_roast_nc9ymc.jpg',
        isDecafAvailable: true,
        pointsEarned: 3,
        inStock: true,
        preparationTime: 2
      },
      {
        name: 'Caffè Misto',
        description: 'A one-to-one combination of fresh-brewed coffee and steamed milk',
        price: 3.95,
        category: 'drinks',
        drinkType: 'brewed_coffee',
        temperature: 'hot',
        caffeineContent: 115,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755271935/cafe_mistro_xybfrc.jpg',
        pointsEarned: 4,
        inStock: true,
        preparationTime: 3
      },
      {
        name: 'White Chocolate Mocha',
        description: 'Espresso with white chocolate sauce and steamed milk, topped with whipped cream',
        price: 6.45,
        category: 'drinks',
        drinkType: 'mocha',
        temperature: 'hot',
        caffeineContent: 150,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311936/white_chocolate_mocha_ufxoxx.jpg',
        pointsEarned: 6,
        inStock: true,
        isPopular: true,
        preparationTime: 4
      },
      {
        name: 'Caffè Americano',
        description: 'Espresso shots topped with hot water create a light layer of crema',
        price: 4.15,
        category: 'drinks',
        drinkType: 'americano',
        temperature: 'hot',
        caffeineContent: 225,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311936/cafe_americano_hyd72b.jpg',
        pointsEarned: 4,
        inStock: true,
        preparationTime: 3
      },
      {
        name: 'Cappuccino',
        description: 'Dark, rich espresso lies in wait under a smoothed and stretched layer of thick milk foam',
        price: 5.35,
        category: 'drinks',
        drinkType: 'cappuccino',
        temperature: 'hot',
        caffeineContent: 150,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311936/cappuccino_uqnwkb.jpg',
        pointsEarned: 5,
        inStock: true,
        preparationTime: 4
      },
      {
        name: 'Espresso',
        description: 'Our smooth signature Espresso Roast with rich flavor and caramelly sweetness',
        price: 2.95,
        category: 'drinks',
        drinkType: 'americano',
        temperature: 'hot',
        caffeineContent: 150,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311936/espresso_ajeisb.jpg',
        pointsEarned: 3,
        inStock: true,
        preparationTime: 2
      },
      {
        name: 'Flat White',
        description: 'Bold ristretto shots of espresso with steamed whole milk and microfoam',
        price: 5.95,
        category: 'drinks',
        drinkType: 'latte',
        temperature: 'hot',
        caffeineContent: 195,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311936/flat_white_wkmwyl.jpg',
        pointsEarned: 6,
        inStock: true,
        preparationTime: 4
      },
      {
        name: 'Caffè Latte',
        description: 'Rich espresso balanced with steamed milk and a light layer of foam',
        price: 5.35,
        category: 'drinks',
        drinkType: 'latte',
        temperature: 'hot',
        caffeineContent: 150,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311936/caffe_Latte_osjvu8.jpg',
        pointsEarned: 5,
        inStock: true,
        isPopular: true,
        preparationTime: 4
      },
      {
        name: 'Cinnamon Dolce Latte',
        description: 'Espresso, steamed milk and cinnamon dolce syrup topped with sweetened whipped cream',
        price: 6.25,
        category: 'drinks',
        drinkType: 'latte',
        temperature: 'hot',
        caffeineContent: 150,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311940/Cinnamon_dolce_latter_gze9nf.jpg',
        pointsEarned: 6,
        inStock: true,
        preparationTime: 4
      },
      {
        name: 'Caramel Macchiato',
        description: 'Freshly steamed milk with vanilla syrup marked with espresso and caramel drizzle',
        price: 6.45,
        category: 'drinks',
        drinkType: 'latte',
        temperature: 'hot',
        caffeineContent: 150,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311940/caramel_macchiato_fidvci.jpg',
        pointsEarned: 6,
        inStock: true,
        isPopular: true,
        preparationTime: 4
      },
      {
        name: 'Caffè Mocha',
        description: 'Rich, full-bodied espresso combined with bittersweet mocha sauce and steamed milk',
        price: 6.25,
        category: 'drinks',
        drinkType: 'mocha',
        temperature: 'hot',
        caffeineContent: 175,
        image: 'https://res.cloudinary.com/djsoqjxpg/image/upload/v1755311940/caffe_momcha_ww3qfa.jpg',
        pointsEarned: 6,
        inStock: true,
        isPopular: true,
        preparationTime: 4
      }
    ];

    console.log(`Inserting ${hotCoffeeItems.length} hot coffee items...`);
    
    for (const item of hotCoffeeItems) {
      try {
        const exists = await DrinkItem.findOne({ name: item.name });
        if (exists) {
          // Update existing item
          await DrinkItem.findOneAndUpdate(
            { name: item.name },
            item,
            { new: true }
          );
          console.log(`✅ Updated: ${item.name}`);
        } else {
          // Create new item
          await DrinkItem.create(item);
          console.log(`✅ Created: ${item.name}`);
        }
      } catch (err) {
        console.error(`❌ Failed: ${item.name} - ${err.message}`);
      }
    }

    const totalCount = await DrinkItem.countDocuments();
    const hotCoffeeCount = await DrinkItem.countDocuments({ 
      temperature: 'hot',
      drinkType: { $in: ['brewed_coffee', 'americano', 'cappuccino', 'latte', 'mocha'] }
    });
    
    console.log('\n✨ Seeding Complete!');
    console.log(`Total drinks in database: ${totalCount}`);
    console.log(`Hot coffee items: ${hotCoffeeCount}`);
    
    // Don't close immediately - wait a bit to ensure data persists
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedHotCoffee().then(() => {
  console.log('Script finished');
  process.exit(0);
}).catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
