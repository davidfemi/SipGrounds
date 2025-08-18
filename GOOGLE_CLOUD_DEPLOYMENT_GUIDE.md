# 🚀 Google Cloud Deployment Guide for Sip Grounds

## 📋 **Overview**

This guide provides a comprehensive deployment strategy for hosting both the **Sip Grounds frontend (React)** and **backend (Node.js/Express)** on Google Cloud Platform using the most cost-effective and scalable approach.

## 🏗️ **Architecture Overview**

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Cloud Storage     │    │    Cloud Run        │    │   Cloud SQL         │
│   (Frontend)        │    │   (Backend API)     │    │   (MongoDB Atlas)   │
│                     │    │                     │    │                     │
│ • Static React App  │◄───┤ • Node.js/Express  │◄───┤ • MongoDB Database  │
│ • CDN Distribution  │    │ • Auto-scaling      │    │ • Managed Service   │
│ • Custom Domain     │    │ • HTTPS/SSL         │    │ • Backup & Recovery │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🎯 **Recommended Deployment Strategy**

### **Frontend: Cloud Storage + CDN**
- **Service**: Google Cloud Storage with Cloud CDN
- **Cost**: ~$0.01-$0.05/month for static hosting
- **Features**: Global CDN, Custom domain, HTTPS

### **Backend: Cloud Run**
- **Service**: Google Cloud Run (Serverless containers)
- **Cost**: Pay-per-request (~$0.40/million requests)
- **Features**: Auto-scaling, Zero-maintenance, Built-in HTTPS

### **Database: MongoDB Atlas**
- **Service**: MongoDB Atlas (Free tier available)
- **Cost**: Free tier (512MB) or $9/month (2GB)
- **Features**: Managed service, Automatic backups, Global clusters

## 📁 **Current Codebase Analysis**

### **Frontend Structure:**
```
sipgrounds-frontend/
├── src/               # React TypeScript source
├── build/            # Production build output ✅
├── public/           # Static assets
├── package.json      # Dependencies & scripts
└── tsconfig.json     # TypeScript config
```

### **Backend Structure:**
```
sipgrounds-backend/
├── server.js         # Main server file ✅
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── utils/           # Helper functions
├── package.json     # Dependencies & scripts
└── .env variables   # Environment configuration
```

### **Key Environment Variables:**
- `MONGODB_URI` / `DB_URL` - Database connection
- `FRONTEND_URL` - CORS configuration
- `MAPBOX_TOKEN` - Map integration
- `STRIPE_SECRET_KEY` - Payment processing
- `CLOUDINARY_*` - Image hosting

---

# 🔧 **Step-by-Step Deployment**

## **Phase 1: Database Setup (MongoDB Atlas)**

### 1. Create MongoDB Atlas Account
```bash
# Visit: https://www.mongodb.com/cloud/atlas
# Create free account and cluster
# Get connection string: mongodb+srv://username:password@cluster.mongodb.net/sipgrounds
```

### 2. Configure Database Access
- Add your IP to whitelist (0.0.0.0/0 for Google Cloud)
- Create database user with read/write permissions
- Note the connection string

---

## **Phase 2: Backend Deployment (Cloud Run)**

### 1. Create Dockerfile for Backend
```dockerfile
# Create: sipgrounds-backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
```

### 2. Create .dockerignore
```
# Create: sipgrounds-backend/.dockerignore
node_modules
npm-debug.log
.env
.git
*.md
```

### 3. Deploy to Cloud Run
```bash
# Install Google Cloud CLI
# Visit: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
cd sipgrounds-backend
gcloud run deploy sipgrounds-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars NODE_ENV=production
```

### 4. Set Environment Variables
```bash
# Set environment variables in Cloud Run
gcloud run services update sipgrounds-backend \
  --region us-central1 \
  --set-env-vars \
  MONGODB_URI="your-mongodb-atlas-connection-string" \
  MAPBOX_TOKEN="your-mapbox-token" \
  STRIPE_SECRET_KEY="your-stripe-secret" \
  CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud" \
  CLOUDINARY_KEY="your-cloudinary-key" \
  CLOUDINARY_SECRET="your-cloudinary-secret" \
  FRONTEND_URL="https://your-frontend-domain.com"
```

---

## **Phase 3: Frontend Deployment (Cloud Storage + CDN)**

### 1. Build Production Frontend
```bash
cd sipgrounds-frontend

# Set backend URL for production
echo "REACT_APP_API_URL=https://your-backend-url.run.app" > .env.production

# Build for production
npm run build
```

### 2. Create Cloud Storage Bucket
```bash
# Create bucket
gsutil mb gs://your-unique-bucket-name

# Enable website hosting
gsutil web set -m index.html -e index.html gs://your-unique-bucket-name

# Upload build files
gsutil -m rsync -r -d build/ gs://your-unique-bucket-name/

# Make files publicly readable
gsutil -m acl ch -r -u AllUsers:R gs://your-unique-bucket-name/
```

### 3. Setup Cloud CDN (Optional but Recommended)
```bash
# Create HTTPS load balancer with CDN
gcloud compute backend-buckets create sipgrounds-frontend-bucket \
  --gcs-bucket-name=your-unique-bucket-name

gcloud compute url-maps create sipgrounds-frontend-map \
  --default-backend-bucket=sipgrounds-frontend-bucket

gcloud compute target-https-proxies create sipgrounds-frontend-proxy \
  --url-map=sipgrounds-frontend-map \
  --ssl-certificates=your-ssl-cert

gcloud compute forwarding-rules create sipgrounds-frontend-rule \
  --global \
  --target-https-proxy=sipgrounds-frontend-proxy \
  --ports=443
```

---

## **Phase 4: Domain & SSL Setup**

### 1. Custom Domain for Backend
```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service sipgrounds-backend \
  --domain api.yourdomain.com \
  --region us-central1
```

### 2. Custom Domain for Frontend
```bash
# Create DNS records pointing to your load balancer IP
# A record: yourdomain.com -> YOUR_LOAD_BALANCER_IP
# CNAME: www.yourdomain.com -> yourdomain.com
```

---

# 💰 **Cost Estimation**

## **Monthly Costs (Estimated)**

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| **Cloud Run** (Backend) | 2M requests/month | $0.40/M requests | Auto-scaling |
| **Cloud Storage** (Frontend) | 5GB storage | $0.020/GB/month | Static hosting |
| **Cloud CDN** | 1TB egress | $0.08/GB | Global distribution |
| **MongoDB Atlas** | 512MB free | $9/month (2GB) | Managed database |
| **Load Balancer** | - | $18/month | HTTPS & custom domain |
| **SSL Certificate** | Free with Google | $0 | Auto-managed |

**Total Estimated Cost: $0-50/month** (depending on traffic)

---

# 🔒 **Security Considerations**

## **Backend Security:**
- ✅ HTTPS enforced by Cloud Run
- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ Rate limiting implemented

## **Frontend Security:**
- ✅ HTTPS via Cloud CDN
- ✅ No sensitive data in client
- ✅ API calls to authenticated backend

## **Database Security:**
- ✅ MongoDB Atlas with authentication
- ✅ IP whitelisting
- ✅ Encrypted connections

---

# ⚡ **Performance Optimizations**

## **Frontend Optimizations:**
- Static asset caching via CDN
- Gzip compression enabled
- Image optimization through Cloudinary
- Bundle splitting for faster loads

## **Backend Optimizations:**
- Auto-scaling based on demand
- Connection pooling for database
- Efficient API endpoints
- Rate limiting for protection

---

# 🚀 **Alternative Deployment Options**

## **Option 1: All-in-One (App Engine)**
```bash
# Deploy both frontend and backend to App Engine
# Higher cost but simpler management
```

## **Option 2: Kubernetes (GKE)**
```bash
# More complex but maximum control
# Best for high-traffic applications
```

## **Option 3: Firebase Hosting + Cloud Functions**
```bash
# Firebase for frontend
# Cloud Functions for serverless backend
# Good integration with Google services
```

---

# 📊 **Monitoring & Maintenance**

## **Monitoring Tools:**
- **Cloud Monitoring**: Track performance metrics
- **Cloud Logging**: Centralized log management  
- **Error Reporting**: Automatic error detection
- **Uptime Checks**: Monitor service availability

## **Backup Strategy:**
- MongoDB Atlas: Automatic daily backups
- Cloud Storage: Versioning enabled
- Code: Git repository as source of truth

---

# 🆘 **Troubleshooting Common Issues**

## **CORS Errors:**
```javascript
// Ensure backend CORS includes your frontend domain
const corsOptions = {
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
};
```

## **Environment Variables:**
```bash
# Check Cloud Run environment variables
gcloud run services describe sipgrounds-backend --region=us-central1
```

## **Build Failures:**
```bash
# Check Cloud Build logs
gcloud builds list
gcloud builds log BUILD_ID
```

---

# 📞 **Support & Next Steps**

After deployment:
1. **Test all functionality** (auth, payments, API calls)
2. **Setup monitoring** and alerts
3. **Configure automatic deployments** via GitHub Actions
4. **Implement CI/CD pipeline** for seamless updates
5. **Setup custom domain** and SSL certificates

---

**🎉 Congratulations! Your Sip Grounds application is now live on Google Cloud!**
