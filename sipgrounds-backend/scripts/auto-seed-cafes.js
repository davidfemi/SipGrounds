require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Cafe = require('../models/cafe');
const User = require('../models/user');

// Initialize Gemini AI with your provided key
const genAI = new GoogleGenerativeAI('AIzaSyDwVcIeS7SRa-8Fm5HjEvTY-c7rXeFDobk');

// Configuration
const RATE_LIMIT_DELAY = 3000; // 3 seconds between requests to be safe
const BATCH_SIZE = 8; // Smaller batches for better success rate
const TOTAL_CAFES = 1500;
const TOTAL_BATCHES = Math.ceil(TOTAL_CAFES / BATCH_SIZE);

// Major US cities with coordinates for better distribution
const US_CITIES = [
  { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
  { city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
  { city: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
  { city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
  { city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
  { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
  { city: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 },
  { city: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
  { city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
  { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
  { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { city: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369 },
  { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  { city: 'El Paso', state: 'TX', lat: 31.7619, lng: -106.4850 },
  { city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
  { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  { city: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490 },
  { city: 'Oklahoma City', state: 'OK', lat: 35.4676, lng: -97.5164 },
  { city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
  { city: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585 },
  { city: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122 },
  { city: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065 },
  { city: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504 },
  { city: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747 },
  { city: 'Fresno', state: 'CA', lat: 36.7378, lng: -119.7871 },
  { city: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944 },
  { city: 'Mesa', state: 'AZ', lat: 33.4152, lng: -111.8315 },
  { city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
  { city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
  { city: 'Long Beach', state: 'CA', lat: 33.7701, lng: -118.1937 },
  { city: 'Colorado Springs', state: 'CO', lat: 38.8339, lng: -104.8214 },
  { city: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382 },
  { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  { city: 'Virginia Beach', state: 'VA', lat: 36.8529, lng: -75.9780 },
  { city: 'Omaha', state: 'NE', lat: 41.2565, lng: -95.9345 },
  { city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712 },
  { city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650 },
  { city: 'Tulsa', state: 'OK', lat: 36.1540, lng: -95.9928 },
  { city: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944 },
  { city: 'Wichita', state: 'KS', lat: 37.6872, lng: -97.3301 },
  { city: 'Arlington', state: 'TX', lat: 32.7357, lng: -97.1081 },
  { city: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715 }
];

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Generate random coordinates around a city
const generateNearbyCoordinates = (baseLat, baseLng, radiusKm = 25) => {
  const radiusInDegrees = radiusKm / 111; // Rough conversion
  const deltaLat = (Math.random() - 0.5) * 2 * radiusInDegrees;
  const deltaLng = (Math.random() - 0.5) * 2 * radiusInDegrees;
  
  return [
    baseLng + deltaLng, // MongoDB uses [longitude, latitude]
    baseLat + deltaLat
  ];
};

// Connect to database
const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://localhost:27017/sipgrounds';
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    let adminUser = await User.findOne({ username: 'sipgrounds_admin' });
    
    if (!adminUser) {
      adminUser = new User({
        username: 'sipgrounds_admin',
        email: 'admin@sipgrounds.com'
      });
      
      await User.register(adminUser, 'SipGrounds2024!');
      console.log('✅ Created admin user');
    }
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    // Try to find existing user
    return await User.findOne({ username: 'sipgrounds_admin' }) || await User.findOne({}).limit(1);
  }
};

// Generate café data using Gemini
const generateCafeData = async (cities) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const cityList = cities.map(c => `${c.city}, ${c.state}`).join(', ');
  
  const prompt = `Generate ${cities.length} unique independent coffee shops for these US cities: ${cityList}

Requirements:
1. Create realistic, unique café names (NO chains like Starbucks)
2. Each café should reflect its city's local character
3. Vary the styles: hipster, artisan, cozy, modern, vintage, etc.

Return ONLY a JSON array with exactly ${cities.length} objects, each with:
{
  "name": "unique café name",
  "description": "2-3 sentences about atmosphere and what makes it special",
  "priceRange": "$" | "$$" | "$$$" | "$$$$",
  "amenities": ["wifi", "parking", "outdoor_seating", "pet_friendly", "wheelchair_accessible", "takeout", "delivery", "study_friendly", "live_music", "charging_stations"],
  "specialties": ["espresso", "pour_over", "cold_brew", "pastries", "sandwiches", "breakfast", "vegan_options", "gluten_free", "organic", "fair_trade", "local_roast"]
}

Return ONLY the JSON array, no markdown or explanations.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
    
    const cafesData = JSON.parse(text);
    return Array.isArray(cafesData) ? cafesData : [cafesData];
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    
    // Fallback data
    return cities.map((city, index) => ({
      name: `${city.city} Coffee Co.`,
      description: `A charming local coffee shop in the heart of ${city.city}. Known for exceptional brews and welcoming atmosphere.`,
      priceRange: getRandomItem(['$', '$$', '$$$']),
      amenities: ['wifi', 'takeout', 'study_friendly', 'charging_stations'],
      specialties: ['espresso', 'pastries', 'organic', 'local_roast']
    }));
  }
};

// Save cafés to database
const saveCafesToDB = async (cafesData, cities, adminUser) => {
  const savedCafes = [];
  
  for (let i = 0; i < Math.min(cafesData.length, cities.length); i++) {
    const cafeData = cafesData[i];
    const cityData = cities[i];
    
    try {
      const coordinates = generateNearbyCoordinates(cityData.lat, cityData.lng);
      
      const cafe = new Cafe({
        name: cafeData.name,
        description: cafeData.description,
        location: `${cityData.city}, ${cityData.state}`,
        address: {
          city: cityData.city,
          state: cityData.state,
          country: 'US'
        },
        geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        priceRange: cafeData.priceRange || '$$',
        amenities: cafeData.amenities || [],
        specialties: cafeData.specialties || [],
        author: adminUser._id,
        isPartner: true,
        status: 'active',
        pointsMultiplier: Math.random() < 0.2 ? 2 : 1, // 20% chance of 2x points
        images: []
      });
      
      await cafe.save();
      savedCafes.push(cafe);
      
    } catch (error) {
      console.error(`❌ Error saving café ${cafeData.name}:`, error.message);
    }
  }
  
  return savedCafes;
};

// Main seeding function
const seedCafes = async () => {
  console.log('🚀 Starting automatic café seeding with Gemini AI...');
  console.log(`📊 Target: ${TOTAL_CAFES} cafés across ${US_CITIES.length} major US cities`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_DELAY}ms between API calls`);
  console.log(`📦 Batch size: ${BATCH_SIZE} cafés per request\n`);
  
  try {
    await connectDB();
    const adminUser = await createAdminUser();
    
    // Clear existing cafés
    console.log('🗑️  Clearing existing cafés...');
    await Cafe.deleteMany({});
    
    let totalSaved = 0;
    
    for (let batch = 0; batch < TOTAL_BATCHES; batch++) {
      console.log(`📦 Batch ${batch + 1}/${TOTAL_BATCHES}...`);
      
      // Get random cities for this batch
      const batchCities = [];
      for (let i = 0; i < BATCH_SIZE && totalSaved + i < TOTAL_CAFES; i++) {
        batchCities.push(getRandomItem(US_CITIES));
      }
      
      try {
        console.log(`🤖 Generating data for: ${batchCities.map(c => c.city).join(', ')}`);
        const cafesData = await generateCafeData(batchCities);
        
        console.log('💾 Saving to database...');
        const savedCafes = await saveCafesToDB(cafesData, batchCities, adminUser);
        
        totalSaved += savedCafes.length;
        console.log(`✅ Batch complete: ${savedCafes.length} cafés saved (Total: ${totalSaved}/${TOTAL_CAFES})\n`);
        
        // Rate limiting
        if (batch < TOTAL_BATCHES - 1) {
          console.log(`⏳ Rate limiting... waiting ${RATE_LIMIT_DELAY}ms`);
          await sleep(RATE_LIMIT_DELAY);
        }
        
      } catch (error) {
        console.error(`❌ Batch ${batch + 1} failed:`, error.message);
      }
    }
    
    // Final statistics
    const finalCount = await Cafe.countDocuments();
    console.log('\n🎉 Seeding completed!');
    console.log(`📊 Total cafés created: ${finalCount}`);
    
    const stateStats = await Cafe.aggregate([
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('\n📈 Distribution by state:');
    stateStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} cafés`);
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from database');
    process.exit(0);
  }
};

// Execute if run directly
if (require.main === module) {
  seedCafes();
}

module.exports = { seedCafes };
