# ☕ Sip Grounds — Coffee Discovery & Rewards Platform

**Where Coffee Meets Community** — A modern café discovery platform with rewards, seamless payments, and community engagement. Connect coffee lovers with amazing local cafés.

---

## 🚀 Product Overview

**Mission:** Sip Grounds bridges the gap between coffee enthusiasts and exceptional local cafés, creating a rewarding ecosystem that benefits both customers and café partners.

### ✨ **Key Features**
- 🗺️ **Interactive café discovery** with map-based exploration
- 💳 **Seamless payments** via Stripe integration
- 🎯 **Points & rewards system** for customer loyalty
- 🛍️ **Official merchandise shop** with coffee gear and apparel
- 📱 **Community polls** and engagement features
- ⭐ **Reviews & ratings** with photo uploads
- 🎫 **Coupon system** for special offers
- 💬 **Integrated customer support** via Intercom

### 🎯 **Primary Goals**
- Increase foot traffic & repeat visits for partner cafés
- Provide a delightful, rewarding customer experience
- Build a thriving coffee community
- Drive customer loyalty through gamification

### 🏗️ **Architecture**
- **Frontend**: React + TypeScript (responsive web-first approach)
- **Backend**: Node.js + Express + MongoDB
- **Payments**: Stripe Checkout with secure webhooks
- **Real-time Support**: Intercom Messenger integration
- **Deployment**: Vercel (frontend) + Render (backend)

---

## 🎯 Platform Features

### 🗺️ **Café Discovery**
- Interactive map with location-based search
- Advanced filtering (price range, ratings, amenities)
- Detailed café profiles with photos and information
- Real-time availability and hours

### 👤 **User Experience**
- Secure authentication system
- Personalized user profiles with statistics
- Order history and preferences
- Achievement badges and milestones

### 🍽️ **Menu System**
- **Comprehensive drink categories**: Hot coffee, cold coffee, seasonal specials
- **Food offerings**: Breakfast items, bakery goods, snacks
- **Advanced customization**: Sizes, milk alternatives, extras
- **Seasonal & limited-time items** with automatic prioritization
- **Rich metadata**: Nutritional info, allergens, prep times

### 💰 **Payments & Rewards**
- Secure Stripe integration for seamless checkout
- Points accumulation on every purchase
- Tiered rewards system (Bronze, Silver, Gold, Platinum)
- Coupon codes and special offers
- Gift card functionality

### 🛍️ **Merchandise Shop**
- Official Sip Grounds branded items
- Coffee gear and accessories
- Apparel and drinkware
- Integrated with main rewards system

### 🤝 **Community Features**
- Photo reviews and ratings
- Community polls and voting
- User-generated content
- Social sharing capabilities

### 💬 **Customer Support**
- Integrated Intercom Messenger
- Real-time chat for logged-in users and visitors
- Context-aware support with user activity tracking
- Automated help suggestions

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 + TypeScript
- **Styling**: Bootstrap 5 + Custom CSS with orange theme (`#f59e0b`)
- **State Management**: React Context (Auth, Cart)
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Toastify
- **Maps**: Integrated mapping components
- **Build Tool**: Create React App

### **Backend**
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based sessions
- **File Upload**: Cloudinary integration
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, rate limiting

### **Third-Party Services**
- **Payments**: Stripe Checkout + Webhooks
- **Customer Support**: Intercom Messenger
- **File Storage**: Cloudinary CDN
- **Email**: Integrated email services
- **Analytics**: Event tracking via Intercom

### **DevOps & Deployment**
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render.com
- **Version Control**: Git + GitHub
- **Environment**: Separate dev/staging/production configs

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ and npm
- MongoDB database
- Stripe account for payments
- Cloudinary account for image storage
- Intercom account for customer support

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SipGrounds
   ```

2. **Backend Setup**
   ```bash
   cd sipgrounds-backend
   npm install
   
   # Create .env file with your credentials
   cp .env.example .env
   
   # Seed initial data
   node seed-menu.js
   node scripts/auto-seed-cafes.js
   
   # Start backend server (port 5001 avoids macOS AirPlay conflict on port 5000)
   PORT=5001 npm start
   ```

3. **Frontend Setup**
   ```bash
   cd sipgrounds-frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Start development server
   npm start
   ```

### **Environment Variables**

**Backend (.env)**
```bash
DATABASE_URL=mongodb://localhost:27017/sipgrounds
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:5173
PORT=5001
```

**Frontend (.env)**
```bash
REACT_APP_API_URL=http://localhost:5001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_INTERCOM_APP_ID=....
PORT=5173
```

> **macOS Note:** Port 5000 is reserved by the macOS AirPlay Receiver (Control Center) on macOS 12+. The backend is configured to run on port **5001** to avoid this conflict. If you disable AirPlay Receiver in **System Settings → General → AirDrop & Handoff**, you can use port 5000 instead.

---

## 📱 Key Pages & Features

### **Public Pages**
- **Homepage** (`/`) - Hero section with café discovery
- **Cafés** (`/cafes`) - Interactive map and list view
- **Café Detail** (`/cafes/:id`) - Individual café information
- **Menu** (`/cafes/:id/menu`) - Full menu with categories
- **Shop** (`/shop`) - Merchandise and coffee gear
- **Polls** (`/polls`) - Community engagement

### **User Pages** (Authentication Required)
- **Profile** (`/profile`) - User dashboard with statistics
- **Rewards** (`/rewards`) - Points balance and redemption
- **Orders** (`/orders`) - Purchase history
- **Checkout** (`/checkout`) - Secure payment flow

### **Design System**
- **Primary Color**: Orange (`#f59e0b`) - consistent throughout
- **Typography**: Modern, clean fonts with good readability
- **Components**: Reusable React components with TypeScript
- **Responsive**: Mobile-first design with Bootstrap grid
- **Accessibility**: WCAG compliant with proper ARIA labels

---

## 🍽️ Menu System

### **Architecture**
- **Object-oriented design** with Drinks and Food classes
- **Seasonal & Limited-Time Items** featuring seasonal flavors
- **Advanced customization** with sizes, milk options, extras
- **Rich metadata** including nutritional info and allergens
- **Smart categorization** with automatic seasonal prioritization

### **Categories**
- **Hot Coffee**: Brewed Coffee, Latte, Americano, Cappuccino, Mocha
- **Cold Coffee**: Cold Brew, Nitro Cold Brew, Iced Latte, Iced Mocha
- **Seasonal Drinks**: Pumpkin Spice Latte, Pecan Cortado, Holiday Specials
- **Food**: Breakfast items, bakery goods, snacks, seasonal treats

---

## 📊 Project Status

### **✅ Completed Features**
- ✅ **User Authentication** - Secure login/signup system
- ✅ **Café Discovery** - Interactive map and detailed profiles
- ✅ **Menu System** - Comprehensive drinks and food categories
- ✅ **Rewards Program** - Points accumulation and redemption
- ✅ **Merchandise Shop** - Official branded items
- ✅ **Payment Integration** - Stripe checkout and webhooks
- ✅ **Customer Support** - Intercom Messenger integration
- ✅ **Community Features** - Reviews, ratings, and polls
- ✅ **Responsive Design** - Mobile-optimized interface
- ✅ **Admin Dashboard** - Content management system

### **🚧 In Development**
- 🔄 **Enhanced Analytics** - Detailed user behavior tracking
- 🔄 **Mobile App** - Native iOS/Android applications
- 🔄 **Advanced Filtering** - AI-powered café recommendations
- 🔄 **Social Features** - User profiles and friend connections

### **🎯 Future Roadmap**
- 📱 **Native Mobile Apps** - iOS and Android applications
- 🤖 **AI Recommendations** - Personalized café and drink suggestions
- 🎮 **Gamification** - Badges, challenges, and leaderboards
- 🌐 **Multi-language Support** - Internationalization
- 📈 **Advanced Analytics** - Business intelligence dashboard
- 🔗 **API Platform** - Third-party integrations

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Development workflow

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

- **Customer Support**: Integrated Intercom Messenger
- **Developer Support**: GitHub Issues
- **Business Inquiries**: Contact through website

---

**Built with ❤️ for the coffee community**

