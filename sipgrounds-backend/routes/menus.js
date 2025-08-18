const express = require('express');
const router = express.Router();
const menus = require('../controllers/menus');
const { isLoggedIn } = require('../middleware');

// Public routes - accessible to all users

// Flat menu groups endpoints (new UX)
router.get('/groups', menus.getMenuGroups);
router.get('/group/:groupSlug', menus.getItemsByGroup);

// Direct search route for /api/menu-items/search
router.get('/search', menus.searchMenuItems);

// Get menu for a specific cafe
router.get('/cafe/:cafeId', menus.getMenuByCafe);

// Get menu items for a specific cafe with filters
router.get('/cafe/:cafeId/items', menus.getMenuItems);

// Search menu items across all cafes (must be before /items/:itemId)
router.get('/items/search', menus.searchMenuItems);

// Get specific menu item
router.get('/items/:itemId', menus.getMenuItem);

// Get popular menu items
router.get('/items/popular', menus.getPopularItems);

// Get recommended menu items
router.get('/items/recommended', menus.getRecommendedItems);

// Protected routes - require authentication

// Admin routes - require authentication (admin system can be added later)
router.use(isLoggedIn);

// Create menu item
router.post('/items', menus.createMenuItem);

// Update menu item
router.put('/items/:itemId', menus.updateMenuItem);

// Delete menu item
router.delete('/items/:itemId', menus.deleteMenuItem);

// Create or update menu for cafe
router.put('/cafe/:cafeId', menus.createOrUpdateMenu);

// Add item to menu section
router.post('/cafe/:cafeId/sections/items', menus.addItemToMenuSection);

// Remove item from menu section
router.delete('/cafe/:cafeId/sections/items', menus.removeItemFromMenuSection);

module.exports = router;
