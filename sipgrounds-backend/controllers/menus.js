const Menu = require('../models/menu');
const MenuItem = require('../models/menuItem');
const DrinkItem = require('../models/drinkItem');
const FoodItem = require('../models/foodItem');
const Cafe = require('../models/cafe');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// --- New flat groups derived from ITEMS.md ---
const MENU_GROUPS = [
    { slug: 'breakfast', name: 'Breakfast', category: 'food' },
    { slug: 'bakery', name: 'Bakery', category: 'food' },
    { slug: 'hot-coffee', name: 'Hot Coffee', category: 'drinks' },
    { slug: 'cold-coffee', name: 'Cold Coffee', category: 'drinks' },
    { slug: 'hot-tea', name: 'Hot Tea', category: 'drinks' },
    { slug: 'cold-tea', name: 'Cold Tea', category: 'drinks' },
    { slug: 'refreshers', name: 'Refreshers', category: 'drinks' },
    { slug: 'frappuccino', name: 'Frappuccino', category: 'drinks' },
    { slug: 'hot-chocolate-more', name: 'Hot Chocolate & More', category: 'drinks' },
    { slug: 'bottled', name: 'Bottled', category: 'drinks' }
];

// Helpers to map item into a group using simple heuristics
function inferGroupForItem(item) {
    const name = (item.name || '').toLowerCase();
    const cat = item.category;

    if (cat === 'food') {
        // Check foodType field first if available
        if (item.foodType) {
            if (['sandwich', 'wrap', 'egg_bites', 'egg_bakes', 'avocado_spread'].includes(item.foodType)) return 'breakfast';
            return 'bakery';
        }
        // Fallback to name patterns
        if (/(sandwich|wrap|egg|oatmeal|bites|bakes|avocado)/.test(name)) return 'breakfast';
        return 'bakery';
    }

    // For drinks, use drinkType and temperature fields when available
    if (cat === 'drinks' && item.drinkType) {
        // Cold coffee types
        if (['cold_brew', 'nitro_cold_brew', 'iced_shaken_espresso', 'iced_latte', 'iced_mocha', 'iced_coffee'].includes(item.drinkType)) {
            return 'cold-coffee';
        }
        
        // Hot coffee types
        if (['brewed_coffee', 'latte', 'americano', 'cappuccino', 'mocha', 'cortado'].includes(item.drinkType) && item.temperature !== 'cold') {
            return 'hot-coffee';
        }
        
        // Tea types
        if (['hot_tea', 'chai'].includes(item.drinkType) && item.temperature !== 'cold') {
            return 'hot-tea';
        }
        if (['iced_tea', 'chai', 'tea_lemonade'].includes(item.drinkType) && item.temperature === 'cold') {
            return 'cold-tea';
        }
        
        // Refreshers
        if (['refresher', 'mango_dragonfruit_lemonade', 'strawberry_acai_lemonade', 'summer_berry_refresher'].includes(item.drinkType)) {
            return 'refreshers';
        }
        
        // Frappuccino types
        if (['frappuccino', 'coffee_frappuccino', 'creme_frappuccino', 'strato_frappuccino'].includes(item.drinkType)) {
            return 'frappuccino';
        }
        
        // Other beverages
        if (['hot_chocolate', 'lemonade', 'steamed_juice'].includes(item.drinkType)) {
            return 'hot-chocolate-more';
        }
        
        if (['bottled_water', 'sparkling_water', 'juice', 'energy_drink', 'bottled_juice'].includes(item.drinkType)) {
            return 'bottled';
        }
    }

    // Fallback to name-based patterns if drinkType not available or not matched
    // Check cold drinks FIRST to avoid false positives
    if (/(iced|cold brew|nitro|shaken espresso|cold foam)/.test(name)) return 'cold-coffee';
    if (/(refresher|pink drink|dragon drink|summer skies|strawberry açaí|mango dragonfruit)/.test(name)) return 'refreshers';
    if (/(frappuccino)/.test(name)) return 'frappuccino';
    if (/(iced .*tea|iced chai|iced matcha|iced london fog|lemonade.*tea|peach green tea)/.test(name)) return 'cold-tea';
    
    // Hot coffee - check without iced versions
    if (/(featured|odyssey|pike place|americano|cappuccino|espresso|flat white|latte|macchiato|mocha|misto|white chocolate|cinnamon dolce|caramel|cortado|decaf)/.test(name) && !/iced/.test(name)) return 'hot-coffee';
    
    // Hot tea
    if (/(chai|matcha|london fog|royal english|emperor|mint|earl grey|chamomile|honey citrus)/.test(name) && !/iced/.test(name)) return 'hot-tea';
    
    // Hot chocolate and more
    if (/(hot chocolate|steamed milk|lemonade)/.test(name) && !/refresher/.test(name)) return 'hot-chocolate-more';
    
    // Bottled beverages
    if (/(ethos|spindrift|koia|horizon|evolution fresh|tree top|olipop|bottled|sparkling water|juice|protein shake|protein drink|water)/.test(name)) return 'bottled';

    // Final default based on temperature
    return item.temperature === 'cold' ? 'cold-coffee' : 'hot-coffee';
}

// GET /api/menus/groups
module.exports.getMenuGroups = catchAsync(async (req, res) => {
    res.json({ success: true, data: { groups: MENU_GROUPS } });
});

// GET /api/menus/group/:groupSlug
module.exports.getItemsByGroup = catchAsync(async (req, res) => {
    const { groupSlug } = req.params;
    const { cafeId, inStock = 'true' } = req.query;

    const group = MENU_GROUPS.find(g => g.slug === groupSlug);
    if (!group) throw new ExpressError('Invalid group', 400);

    // Build base query: category + availability + stock
    const query = { category: group.category, inStock: inStock === 'true' };
    if (cafeId) {
        query.$or = [ { availableAt: { $size: 0 } }, { availableAt: cafeId } ];
    }

    const all = await MenuItem.find(query).sort({ isPopular: -1, name: 1 });
    const items = all.filter(it => inferGroupForItem(it) === groupSlug);

    res.json({ success: true, data: { group, items } });
});

// Get menu for a specific cafe
module.exports.getMenuByCafe = catchAsync(async (req, res) => {
    const { cafeId } = req.params;
    
    // Verify cafe exists
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
        throw new ExpressError('Cafe not found', 404);
    }
    
    let menu = await Menu.getByCafe(cafeId);
    
    // If no menu exists, create a default one
    if (!menu) {
        menu = await Menu.createDefaultMenu(cafeId);
        await menu.populate({
            path: 'menuSections.items',
            match: { inStock: true }
        });
        await menu.populate('cafe', 'name location');
    }
    
    res.json({
        success: true,
        data: { menu }
    });
});

// Get menu items for a specific cafe with filters
module.exports.getMenuItems = catchAsync(async (req, res) => {
    const { cafeId } = req.params;
    const { 
        category, 
        drinkType, 
        foodType, 
        mealType, 
        temperature, 
        dietaryRestrictions,
        inStock = true 
    } = req.query;
    
    // Verify cafe exists
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
        throw new ExpressError('Cafe not found', 404);
    }
    
    // Build query
    const query = {
        $or: [
            { availableAt: { $size: 0 } }, // Available at all cafes
            { availableAt: cafeId }
        ],
        inStock: inStock === 'true'
    };
    
    if (category) {
        query.category = category;
    }
    
    // Drink-specific filters
    if (drinkType) {
        query.drinkType = drinkType;
    }
    
    if (temperature) {
        query.$or = [
            { temperature: temperature },
            { temperature: 'both' }
        ];
    }
    
    // Food-specific filters
    if (foodType) {
        query.foodType = foodType;
    }
    
    if (mealType) {
        query.$or = [
            { mealType: mealType },
            { mealType: 'all_day' }
        ];
    }
    
    // Dietary restrictions filter
    if (dietaryRestrictions) {
        const restrictions = Array.isArray(dietaryRestrictions) 
            ? dietaryRestrictions 
            : [dietaryRestrictions];
            
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
    }
    
    const items = await MenuItem.find(query)
        .sort({ isPopular: -1, isRecommended: -1, name: 1 });
    
    res.json({
        success: true,
        data: { items }
    });
});

// Get specific menu item
module.exports.getMenuItem = catchAsync(async (req, res) => {
    const { itemId } = req.params;
    
    const item = await MenuItem.findById(itemId);
    if (!item) {
        throw new ExpressError('Menu item not found', 404);
    }
    
    res.json({
        success: true,
        data: { item }
    });
});

// Search menu items across all cafes
module.exports.searchMenuItems = catchAsync(async (req, res) => {
    const {
        query: searchQuery,
        category,
        drinkType,
        foodType,
        priceRange,
        dietaryRestrictions,
        cafeId,
        limit = 20,
        page = 1
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search query
    const mongoQuery = { inStock: true };
    
    if (searchQuery) {
        mongoQuery.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } }
        ];
    }
    
    if (category) {
        mongoQuery.category = category;
    }
    
    if (drinkType) {
        mongoQuery.drinkType = drinkType;
    }
    
    if (foodType) {
        mongoQuery.foodType = foodType;
    }
    
    if (priceRange) {
        const { min, max } = priceRange;
        if (min) mongoQuery.price = { $gte: parseFloat(min) };
        if (max) mongoQuery.price = { ...mongoQuery.price, $lte: parseFloat(max) };
    }
    
    if (cafeId) {
        mongoQuery.$or = [
            { availableAt: { $size: 0 } },
            { availableAt: cafeId }
        ];
    }
    
    // Dietary restrictions
    if (dietaryRestrictions) {
        const restrictions = Array.isArray(dietaryRestrictions) 
            ? dietaryRestrictions 
            : [dietaryRestrictions];
            
        restrictions.forEach(restriction => {
            switch (restriction.toLowerCase()) {
                case 'vegan':
                    mongoQuery['dietaryInfo.isVegan'] = true;
                    break;
                case 'vegetarian':
                    mongoQuery['dietaryInfo.isVegetarian'] = true;
                    break;
                case 'gluten-free':
                case 'gluten_free':
                    mongoQuery['dietaryInfo.isGlutenFree'] = true;
                    break;
                case 'dairy-free':
                case 'dairy_free':
                    mongoQuery['dietaryInfo.isDairyFree'] = true;
                    break;
                case 'keto':
                    mongoQuery['dietaryInfo.isKeto'] = true;
                    break;
                case 'low-carb':
                case 'low_carb':
                    mongoQuery['dietaryInfo.isLowCarb'] = true;
                    break;
            }
        });
    }
    
    const totalCount = await MenuItem.countDocuments(mongoQuery);
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    const items = await MenuItem.find(mongoQuery)
        .sort({ isPopular: -1, isRecommended: -1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit));
    
    res.json({
        success: true,
        data: {
            items,
            totalCount,
            totalPages,
            currentPage: parseInt(page),
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1
        }
    });
});

// Get popular menu items
module.exports.getPopularItems = catchAsync(async (req, res) => {
    const { cafeId, category } = req.query;
    
    const query = { 
        isPopular: true, 
        inStock: true 
    };
    
    if (category) {
        query.category = category;
    }
    
    if (cafeId) {
        query.$or = [
            { availableAt: { $size: 0 } },
            { availableAt: cafeId }
        ];
    }
    
    const items = await MenuItem.find(query)
        .sort({ name: 1 })
        .limit(10);
    
    res.json({
        success: true,
        data: { items }
    });
});

// Get recommended menu items
module.exports.getRecommendedItems = catchAsync(async (req, res) => {
    const { cafeId, category } = req.query;
    
    const query = { 
        isRecommended: true, 
        inStock: true 
    };
    
    if (category) {
        query.category = category;
    }
    
    if (cafeId) {
        query.$or = [
            { availableAt: { $size: 0 } },
            { availableAt: cafeId }
        ];
    }
    
    const items = await MenuItem.find(query)
        .sort({ name: 1 })
        .limit(10);
    
    res.json({
        success: true,
        data: { items }
    });
});

// Admin functions (protected routes)

// Create menu item
module.exports.createMenuItem = catchAsync(async (req, res) => {
    const { category, itemType } = req.body;
    
    let item;
    if (category === 'drinks' || itemType === 'DrinkItem') {
        item = new DrinkItem(req.body);
    } else if (category === 'food' || itemType === 'FoodItem') {
        item = new FoodItem(req.body);
    } else {
        item = new MenuItem(req.body);
    }
    
    await item.save();
    
    res.status(201).json({
        success: true,
        data: { item }
    });
});

// Update menu item
module.exports.updateMenuItem = catchAsync(async (req, res) => {
    const { itemId } = req.params;
    
    const item = await MenuItem.findByIdAndUpdate(itemId, req.body, {
        new: true,
        runValidators: true
    });
    
    if (!item) {
        throw new ExpressError('Menu item not found', 404);
    }
    
    res.json({
        success: true,
        data: { item }
    });
});

// Delete menu item
module.exports.deleteMenuItem = catchAsync(async (req, res) => {
    const { itemId } = req.params;
    
    const item = await MenuItem.findByIdAndDelete(itemId);
    if (!item) {
        throw new ExpressError('Menu item not found', 404);
    }
    
    res.json({
        success: true,
        message: 'Menu item deleted successfully'
    });
});

// Create or update menu for cafe
module.exports.createOrUpdateMenu = catchAsync(async (req, res) => {
    const { cafeId } = req.params;
    
    // Verify cafe exists
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
        throw new ExpressError('Cafe not found', 404);
    }
    
    let menu = await Menu.findOne({ cafe: cafeId });
    
    if (menu) {
        // Update existing menu
        Object.assign(menu, req.body);
        await menu.save();
    } else {
        // Create new menu
        menu = new Menu({
            cafe: cafeId,
            ...req.body
        });
        await menu.save();
    }
    
    await menu.populate('cafe', 'name location');
    
    res.json({
        success: true,
        data: { menu }
    });
});

// Add item to menu section
module.exports.addItemToMenuSection = catchAsync(async (req, res) => {
    const { cafeId } = req.params;
    const { sectionName, itemId } = req.body;
    
    const menu = await Menu.findOne({ cafe: cafeId });
    if (!menu) {
        throw new ExpressError('Menu not found', 404);
    }
    
    // Verify item exists
    const item = await MenuItem.findById(itemId);
    if (!item) {
        throw new ExpressError('Menu item not found', 404);
    }
    
    await menu.addItemToSection(sectionName, itemId);
    
    res.json({
        success: true,
        message: 'Item added to menu section successfully'
    });
});

// Remove item from menu section
module.exports.removeItemFromMenuSection = catchAsync(async (req, res) => {
    const { cafeId } = req.params;
    const { sectionName, itemId } = req.body;
    
    const menu = await Menu.findOne({ cafe: cafeId });
    if (!menu) {
        throw new ExpressError('Menu not found', 404);
    }
    
    await menu.removeItemFromSection(sectionName, itemId);
    
    res.json({
        success: true,
        message: 'Item removed from menu section successfully'
    });
});
