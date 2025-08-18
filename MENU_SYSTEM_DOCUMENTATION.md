# 🍽️ Menu System Documentation

## Overview

The Menu System is a comprehensive solution for managing café menus with drinks and food items. It provides a structured approach to organizing menu items, customizations, and availability across different cafés.

## Architecture

### Backend Models

#### 1. MenuItem (Base Class)
- **File**: `sipgrounds-backend/models/menuItem.js`
- **Purpose**: Abstract base class for all menu items
- **Key Features**:
  - Basic item information (name, description, price, image)
  - Points system integration
  - Customization options (sizes, extras)
  - Availability management per café
  - Stock tracking

#### 2. DrinkItem (Extends MenuItem)
- **File**: `sipgrounds-backend/models/drinkItem.js`
- **Purpose**: Specialized class for beverage items
- **Key Features**:
  - Drink-specific types (coffee, tea, refreshers, etc.)
  - Temperature options (hot, cold, both)
  - Caffeine content tracking
  - Milk and sweetener options
  - Flavor syrups
  - Decaf availability

#### 3. FoodItem (Extends MenuItem)
- **File**: `sipgrounds-backend/models/foodItem.js`
- **Purpose**: Specialized class for food items
- **Key Features**:
  - Food-specific types (breakfast, bakery, snacks)
  - Meal type categorization
  - Dietary information (vegan, gluten-free, etc.)
  - Nutritional information
  - Ingredient tracking with allergen flags
  - Customization options (bread, protein, toppings)

#### 4. Menu
- **File**: `sipgrounds-backend/models/menu.js`
- **Purpose**: Organizes menu items into sections for each café
- **Key Features**:
  - Café-specific menus
  - Organized sections (Hot Coffee, Cold Coffee, Breakfast, etc.)
  - Availability scheduling
  - Special hours management
  - Pricing configuration

### Frontend Components

#### Menu Page
- **File**: `sipgrounds-frontend/src/pages/Menu.tsx`
- **Route**: `/cafes/:cafeId/menu`
- **Features**:
  - Tabbed interface (Drinks/Food)
  - Item customization modal
  - Cart integration
  - Dietary badges
  - Responsive design

### API Endpoints

#### Public Endpoints
- `GET /api/menus/cafe/:cafeId` - Get menu for specific café
- `GET /api/menus/cafe/:cafeId/items` - Get menu items with filters
- `GET /api/menu-items/:itemId` - Get specific menu item
- `GET /api/menu-items/search` - Search menu items
- `GET /api/menu-items/popular` - Get popular items
- `GET /api/menu-items/recommended` - Get recommended items

#### Admin Endpoints (Protected)
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/:itemId` - Update menu item
- `DELETE /api/menu-items/:itemId` - Delete menu item
- `PUT /api/menus/cafe/:cafeId` - Create/update café menu
- `POST /api/menus/cafe/:cafeId/sections/items` - Add item to section
- `DELETE /api/menus/cafe/:cafeId/sections/items` - Remove item from section

## Menu Categories

### Drinks

#### Hot Coffee
- Brewed Coffee
- Latte
- Americano
- Cappuccino
- Mocha

#### Cold Coffee
- Cold Brew
- Nitro Cold Brew
- Iced Shaken Espresso
- Iced Latte
- Iced Mocha

#### Hot Tea
- Multiple varieties (black, green, herbal, chai, matcha)

#### Cold Tea
- Multiple varieties

#### Refreshers
- Mango Dragonfruit Lemonade
- Strawberry Açaí Lemonade
- Summer Berry Refreshers

#### Frappuccino® Blended Beverages
- Coffee-based flavors
- Crème-based flavors
- Strato™ Frappuccinos

#### Other Beverages
- Hot Chocolate
- Lemonade
- Bottled Water
- Sparkling Water
- Juices
- Energy Drinks

### Food

#### Breakfast
- Sandwiches
- Wraps
- Egg Bites (including Italian Sausage)
- Egg Bakes
- Avocado Spread

#### Bakery
- Vanilla Bean Custard Danish
- Baked Apple Croissant
- Ham & Swiss Croissant
- Butter Croissant
- Chocolate Croissant

#### Snacks
- All In™ Madagascar Vanilla, Honey & Almonds Bar
- Perfect Bar® – Dark Chocolate Chip Peanut Butter
- Perfect Bar® – Peanut Butter

## Customization System

### Drink Customizations
- **Sizes**: Short, Tall, Grande, Venti (with different pricing)
- **Milk Options**: Whole, 2%, Nonfat, Oat, Almond, Soy (some with extra charge)
- **Sweeteners**: Sugar, Stevia, Honey, Agave
- **Flavor Syrups**: Vanilla, Caramel, Hazelnut (with extra charge)
- **Extras**: Extra shot, decaf, temperature preferences

### Food Customizations
- **Bread Options**: Whole wheat, sourdough, gluten-free
- **Protein Options**: Turkey, ham, veggie patty
- **Cheese Options**: Cheddar, Swiss, vegan cheese
- **Toppings**: Lettuce, tomato, avocado
- **Sauces**: Mayo, mustard, pesto

## Dietary Information

### Supported Dietary Restrictions
- Vegan
- Vegetarian
- Gluten-Free
- Dairy-Free
- Keto
- Low-Carb

### Allergen Tracking
- Dairy
- Nuts
- Gluten
- Soy
- Eggs

## Setup Instructions

### 1. Backend Setup

1. **Install Dependencies** (if not already done):
   ```bash
   cd sipgrounds-backend
   npm install
   ```

2. **Seed Menu Items**:
   ```bash
   node seed-menu.js
   ```

3. **Start Backend Server**:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. **Install Dependencies** (if not already done):
   ```bash
   cd sipgrounds-frontend
   npm install
   ```

2. **Start Frontend Server**:
   ```bash
   npm start
   ```

### 3. Access Menu

Navigate to: `http://localhost:3000/cafes/{cafeId}/menu`

## Usage Examples

### Viewing Menu
1. Go to any café detail page
2. Click "View Menu" button
3. Browse drinks and food in separate tabs
4. Click on items to customize and add to cart

### Adding Menu Items (Admin)
```javascript
// Create a new drink item
const newDrink = {
  name: "Vanilla Latte",
  description: "Espresso with vanilla syrup and steamed milk",
  price: 4.95,
  category: "drinks",
  drinkType: "latte",
  temperature: "hot",
  caffeineContent: 150,
  customization: {
    sizes: [
      { name: "Tall", price: 4.95, pointsEarned: 5 },
      { name: "Grande", price: 5.45, pointsEarned: 6 }
    ]
  }
};
```

### Searching Menu Items
```javascript
// Search for vegan food items
const response = await menuAPI.searchItems({
  category: 'food',
  dietaryRestrictions: ['vegan'],
  cafeId: 'cafe123'
});
```

## Integration with Existing Systems

### Points System
- Each menu item earns points based on price
- Customizations can add additional points
- Points are automatically calculated and awarded on purchase

### Cart System
- Menu items integrate with existing cart context
- Customizations are preserved in cart
- Price calculations include all customizations

### Order System
- Menu items can be ordered through existing order flow
- Customizations are passed to kitchen/preparation
- Order tracking includes menu item details

## Future Enhancements

### Planned Features
1. **Seasonal Menus**: Time-based menu availability
2. **Nutritional Calculator**: Real-time nutrition info with customizations
3. **Inventory Integration**: Real-time stock updates
4. **AI Recommendations**: Personalized menu suggestions
5. **Voice Ordering**: Integration with voice assistants
6. **Loyalty Tiers**: Different pricing based on customer tier

### Technical Improvements
1. **Caching**: Redis integration for menu data
2. **Image Optimization**: Automatic image resizing and compression
3. **Search Enhancement**: Elasticsearch integration
4. **Analytics**: Menu item performance tracking
5. **A/B Testing**: Menu layout and pricing experiments

## Troubleshooting

### Common Issues

1. **Menu Not Loading**
   - Check if café exists in database
   - Verify menu items are properly seeded
   - Check API endpoint connectivity

2. **Customizations Not Saving**
   - Verify cart context is properly initialized
   - Check customization data structure
   - Ensure user is authenticated

3. **Images Not Displaying**
   - Check image URLs are accessible
   - Verify Cloudinary configuration
   - Use placeholder images for development

### Development Tips

1. **Testing Menu Items**
   - Use the seed script to populate test data
   - Create different café scenarios
   - Test with various user roles

2. **Debugging API Calls**
   - Check network tab in browser dev tools
   - Verify API endpoints are correctly mounted
   - Test with Postman or similar tools

## Contributing

When adding new menu features:

1. **Follow Existing Patterns**: Use the established model inheritance
2. **Update Documentation**: Keep this README current
3. **Add Tests**: Include unit tests for new functionality
4. **Consider Mobile**: Ensure responsive design
5. **Accessibility**: Follow WCAG guidelines

## Support

For questions or issues with the menu system:
1. Check this documentation
2. Review existing code patterns
3. Test with sample data
4. Create detailed issue reports

---

*This menu system is designed to be flexible, scalable, and user-friendly while maintaining consistency with the existing SipGrounds platform architecture.*
