# 🚀 Menu System Quick Start Guide

## Overview
Get the new menu system up and running in 5 minutes!

## Prerequisites
- Node.js and npm installed
- MongoDB running
- Backend and frontend dependencies installed

## Step 1: Seed Menu Data
```bash
cd sipgrounds-backend
node seed-menu.js
```

Expected output:
```
🌱 Starting menu seeding process...
✅ Database connected
🗑️ Cleared existing menu items
🍹 Creating drink items...
✅ Created 18 drink items
🍽️ Creating food items...
✅ Created 13 food items
📋 Creating sample menu...
✅ Created sample menu for [Cafe Name]
🎉 Menu seeding completed successfully!
```

## Step 2: Start Backend Server
```bash
# In sipgrounds-backend directory
npm run dev
```

The server should start on `http://localhost:5000` (or your configured port).

## Step 3: Start Frontend Server
```bash
cd sipgrounds-frontend
npm start
```

The frontend should start on `http://localhost:3000`.

## Step 4: Access Menu
1. Navigate to `http://localhost:3000/cafes`
2. Click on any café
3. Look for "View Menu" button or navigate to `/cafes/{cafeId}/menu`

## What You'll See

### Seasonal & Limited-Time Items
- Pumpkin Spice Latte
- Pumpkin Cream Cold Brew
- Pecan Cortado (new)
- Protein Cold Foam
- Strawberries and Cream Cake Pop

### Hot Coffee
- Brewed Coffee
- Latte
- Americano
- Cappuccino
- Mocha

### Cold Coffee
- Cold Brew
- Nitro Cold Brew
- Iced Shaken Espresso
- Iced Latte
- Iced Mocha

### Food Items
- Egg Bites (various flavors)
- Croissants (butter, chocolate, ham & swiss)
- Protein bars
- Danish pastries

## Testing Features

### 1. Item Customization
- Click any menu item
- Try different sizes (pricing updates automatically)
- Add milk options for drinks
- Add extras and see price changes

### 2. Cart Integration
- Add items to cart with customizations
- Items with different customizations appear as separate entries
- Verify pricing includes all customizations

### 3. Dietary Filters
- Look for dietary badges (Vegan, Gluten-Free, etc.)
- Popular and Recommended tags
- Caffeine content for drinks

## API Testing

### Get Menu for Café
```bash
curl http://localhost:5000/api/menus/cafe/{CAFE_ID}
```

### Search Menu Items
```bash
curl "http://localhost:5000/api/menu-items/search?category=drinks&drinkType=latte"
```

### Get Popular Items
```bash
curl http://localhost:5000/api/menu-items/popular
```

## Troubleshooting

### Menu Not Loading
1. Check if cafés exist in database
2. Verify menu items were seeded successfully
3. Check browser console for API errors

### Items Not Appearing
1. Ensure `inStock: true` in seed data
2. Check if items are assigned to menu sections
3. Verify API endpoints are responding

### Customization Not Working
1. Check if user is authenticated
2. Verify cart context is properly initialized
3. Check for TypeScript errors in console

## Common Issues

### "Menu not found" Error
- Run the seed script to create sample menu
- Ensure café ID in URL is valid

### TypeScript Errors
- All known TypeScript errors have been resolved
- If you see new errors, check the latest code changes

### Cart Not Working
- The cart has been updated to support menu items
- Clear localStorage if you see old cart data issues

## Next Steps

### For Development
1. Add more menu items using the admin endpoints
2. Customize the UI styling
3. Add more dietary filters
4. Implement seasonal item scheduling

### For Production
1. Replace placeholder images with real photos
2. Set up Cloudinary for image optimization
3. Configure Redis for caching
4. Add analytics tracking

## Support

If you encounter issues:
1. Check the console for errors
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check the comprehensive documentation in `MENU_SYSTEM_DOCUMENTATION.md`

## Success Indicators

✅ Menu page loads without errors  
✅ Items display with images and pricing  
✅ Customization modal opens and works  
✅ Items can be added to cart  
✅ Seasonal section appears first  
✅ Dietary badges are visible  
✅ Search and filtering work  

---

**🎉 Congratulations!** Your menu system is now ready to use. Explore the features and start customizing for your specific needs!
