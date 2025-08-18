#!/bin/bash

# Sip Grounds Backend Deployment Script for Google Cloud Run

set -e

# Configuration
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="sipgrounds-backend"
REGION="us-central1"

echo "🚀 Starting Sip Grounds Backend Deployment..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Set the project
echo "📋 Setting Google Cloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Navigate to backend directory
cd sipgrounds-backend

# Prompt for environment variables
echo "🔧 Setting up environment variables..."
echo "Please provide the following environment variables:"

read -p "MongoDB URI (MongoDB Atlas connection string): " MONGODB_URI
read -p "Mapbox Token: " MAPBOX_TOKEN
read -p "Stripe Secret Key: " STRIPE_SECRET_KEY
read -p "Cloudinary Cloud Name: " CLOUDINARY_CLOUD_NAME
read -p "Cloudinary API Key: " CLOUDINARY_KEY
read -s -p "Cloudinary API Secret: " CLOUDINARY_SECRET
echo ""
read -p "Frontend URL (e.g., https://yourdomain.com): " FRONTEND_URL

# Build and deploy to Cloud Run
echo "🔨 Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars \
    NODE_ENV=production,\
    MONGODB_URI="$MONGODB_URI",\
    DB_URL="$MONGODB_URI",\
    MAPBOX_TOKEN="$MAPBOX_TOKEN",\
    STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY",\
    CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME",\
    CLOUDINARY_KEY="$CLOUDINARY_KEY",\
    CLOUDINARY_SECRET="$CLOUDINARY_SECRET",\
    FRONTEND_URL="$FRONTEND_URL"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "✅ Backend deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "├── Service Name: $SERVICE_NAME"
echo "├── Region: $REGION"
echo "├── Service URL: $SERVICE_URL"
echo "└── Auto-scaling: Enabled"
echo ""
echo "🧪 Testing the deployment..."

# Test the health endpoint
echo "Testing health endpoint..."
if curl -f -s "$SERVICE_URL/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - please check logs"
fi

# Test the API
echo "Testing API endpoint..."
if curl -f -s "$SERVICE_URL/api/cafes" > /dev/null; then
    echo "✅ API endpoint accessible"
else
    echo "⚠️  API endpoint not responding - please check logs"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Update your frontend .env.production file with:"
echo "   REACT_APP_API_URL=$SERVICE_URL"
echo "2. Deploy your frontend with the updated backend URL"
echo "3. Test all functionality (auth, payments, API calls)"
echo "4. Set up custom domain if needed"
echo ""
echo "📊 Monitoring:"
echo "├── Logs: gcloud run logs tail $SERVICE_NAME --region=$REGION"
echo "├── Metrics: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
echo "└── Errors: https://console.cloud.google.com/errors"
echo ""
echo "📖 For detailed instructions, see: GOOGLE_CLOUD_DEPLOYMENT_GUIDE.md"
