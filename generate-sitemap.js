#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for Sip Grounds
 * 
 * This script generates an XML sitemap by fetching dynamic content from the API
 * and combining it with static routes. Run this script after deployment to 
 * create an up-to-date sitemap.
 * 
 * Usage:
 * node generate-sitemap.js [domain] [api-url]
 * 
 * Example:
 * node generate-sitemap.js https://sipgrounds.com https://api.sipgrounds.com
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration
const DOMAIN = process.argv[2] || 'https://yourdomain.com';
const API_URL = process.argv[3] || 'http://localhost:5000';
const OUTPUT_FILE = './sipgrounds-frontend/public/sitemap.xml';

console.log('🗺️  Generating sitemap for Sip Grounds...');
console.log(`📍 Domain: ${DOMAIN}`);
console.log(`🔗 API URL: ${API_URL}`);

// Static routes with their SEO properties
const staticRoutes = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/cafes', priority: 0.9, changefreq: 'daily' },
  { url: '/shop', priority: 0.8, changefreq: 'weekly' },
  { url: '/menu', priority: 0.8, changefreq: 'weekly' },
  { url: '/polls', priority: 0.6, changefreq: 'weekly' },
  { url: '/login', priority: 0.5, changefreq: 'monthly' },
  { url: '/register', priority: 0.5, changefreq: 'monthly' },
  { url: '/sitemap', priority: 0.4, changefreq: 'monthly' },
];

// Menu categories
const menuCategories = [
  'hot-coffee', 'iced-coffee', 'espresso', 'tea', 'smoothies',
  'pastries', 'sandwiches', 'breakfast'
];

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.warn(`⚠️  Failed to fetch ${url}: ${error.message}`);
      resolve(null);
    });
  });
}

// Generate XML sitemap content
function generateSitemapXML(urls) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

  urls.forEach(({ url, priority, changefreq, lastmod }) => {
    xml += `<url>
  <loc>${DOMAIN}${url}</loc>
  <lastmod>${lastmod || currentDate}</lastmod>
  <changefreq>${changefreq}</changefreq>
  <priority>${priority}</priority>
</url>

`;
  });

  xml += `</urlset>`;
  return xml;
}

// Main function
async function generateSitemap() {
  const allUrls = [];
  
  // Add static routes
  console.log('📝 Adding static routes...');
  allUrls.push(...staticRoutes);
  
  // Add menu categories
  console.log('🍽️  Adding menu categories...');
  menuCategories.forEach(category => {
    allUrls.push({
      url: `/menu/${category}`,
      priority: 0.7,
      changefreq: 'weekly'
    });
  });
  
  try {
    // Fetch and add cafes
    console.log('☕ Fetching cafes...');
    const cafesResponse = await makeRequest(`${API_URL}/api/cafes`);
    if (cafesResponse && cafesResponse.data && cafesResponse.data.cafes) {
      cafesResponse.data.cafes.slice(0, 100).forEach(cafe => { // Limit to first 100 cafes
        allUrls.push({
          url: `/cafes/${cafe._id}`,
          priority: 0.6,
          changefreq: 'monthly'
        });
      });
      console.log(`✅ Added ${Math.min(cafesResponse.data.cafes.length, 100)} cafe pages`);
    }
    
    // Fetch and add products
    console.log('🛍️  Fetching products...');
    const productsResponse = await makeRequest(`${API_URL}/api/products`);
    if (productsResponse && productsResponse.data && productsResponse.data.products) {
      productsResponse.data.products.forEach(product => {
        allUrls.push({
          url: `/products/${product._id}`,
          priority: 0.5,
          changefreq: 'monthly'
        });
      });
      console.log(`✅ Added ${productsResponse.data.products.length} product pages`);
    }
    
    // Fetch and add menu items
    console.log('🍕 Fetching menu items...');
    const menuResponse = await makeRequest(`${API_URL}/api/menu-items`);
    if (menuResponse && menuResponse.data) {
      const menuItems = Array.isArray(menuResponse.data) ? menuResponse.data : 
                       (menuResponse.data.menuItems || []);
      
      menuItems.slice(0, 50).forEach(item => { // Limit to first 50 menu items
        allUrls.push({
          url: `/menu/item/${item._id}`,
          priority: 0.6,
          changefreq: 'monthly'
        });
      });
      console.log(`✅ Added ${Math.min(menuItems.length, 50)} menu item pages`);
    }
    
  } catch (error) {
    console.warn(`⚠️  Error fetching dynamic content: ${error.message}`);
    console.log('📝 Continuing with static routes only...');
  }
  
  // Generate sitemap XML
  console.log('🔨 Generating sitemap XML...');
  const sitemapXML = generateSitemapXML(allUrls);
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, sitemapXML);
  
  console.log('✅ Sitemap generated successfully!');
  console.log(`📊 Total URLs: ${allUrls.length}`);
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
  console.log(`🌐 Sitemap URL: ${DOMAIN}/sitemap.xml`);
  
  // Show breakdown
  const breakdown = {
    'Static Pages': staticRoutes.length,
    'Menu Categories': menuCategories.length,
    'Cafe Pages': allUrls.filter(u => u.url.startsWith('/cafes/')).length,
    'Product Pages': allUrls.filter(u => u.url.startsWith('/products/')).length,
    'Menu Items': allUrls.filter(u => u.url.startsWith('/menu/item/')).length
  };
  
  console.log('\n📋 Sitemap Breakdown:');
  Object.entries(breakdown).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Deploy your updated frontend with the new sitemap');
  console.log('2. Submit sitemap to Google Search Console');
  console.log('3. Update your domain in the sitemap.xml file');
  console.log('4. Run this script regularly to keep sitemap updated');
}

// Run the generator
generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
