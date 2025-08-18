#!/usr/bin/env node

/**
 * Menu Seeding Script
 * 
 * This script populates the database with sample menu items including:
 * - Drink items (hot coffee, cold coffee, etc.)
 * - Food items (breakfast, bakery, snacks)
 * - A sample menu for the first cafe
 * 
 * Usage: node seed-menu.js
 */

const seedMenuItems = require('./scripts/seed-menu-items');

console.log('🌱 Starting menu seeding process...');
console.log('=====================================');

seedMenuItems()
    .then(() => {
        console.log('=====================================');
        console.log('✅ Menu seeding completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('=====================================');
        console.error('❌ Menu seeding failed:', error);
        process.exit(1);
    });
