#!/bin/bash

# Sip Grounds Frontend Deployment Script for Google Cloud Storage

set -e

# Configuration
PROJECT_ID="your-gcp-project-id"
BUCKET_NAME="sipgrounds-frontend-$(date +%s)"
REGION="us-central1"

echo "🚀 Starting Sip Grounds Frontend Deployment..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo "📋 Setting Google Cloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Navigate to frontend directory
cd sipgrounds-frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React app
echo "🔨 Building React application for production..."
npm run build

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "❌ Build directory not found. Build may have failed."
    exit 1
fi

# Create Cloud Storage bucket
echo "🪣 Creating Cloud Storage bucket: $BUCKET_NAME"
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME

# Enable website hosting on the bucket
echo "🌐 Configuring bucket for website hosting..."
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# Upload build files to bucket
echo "📤 Uploading build files to Cloud Storage..."
gsutil -m rsync -r -d build/ gs://$BUCKET_NAME/

# Set cache control headers for static assets
echo "⚡ Setting cache control headers..."
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/static/**

# Make all files publicly readable
echo "🔓 Making files publicly readable..."
gsutil -m acl ch -r -u AllUsers:R gs://$BUCKET_NAME/

# Create load balancer and CDN (optional but recommended)
echo "🌍 Setting up load balancer and CDN..."

# Create backend bucket
gcloud compute backend-buckets create sipgrounds-frontend-bucket \
    --gcs-bucket-name=$BUCKET_NAME \
    --enable-cdn

# Create URL map
gcloud compute url-maps create sipgrounds-frontend-map \
    --default-backend-bucket=sipgrounds-frontend-bucket

# Create managed SSL certificate
gcloud compute ssl-certificates create sipgrounds-frontend-ssl \
    --domains=yourdomain.com,www.yourdomain.com \
    --global

# Create HTTPS proxy
gcloud compute target-https-proxies create sipgrounds-frontend-proxy \
    --url-map=sipgrounds-frontend-map \
    --ssl-certificates=sipgrounds-frontend-ssl

# Create forwarding rule
gcloud compute forwarding-rules create sipgrounds-frontend-rule \
    --global \
    --target-https-proxy=sipgrounds-frontend-proxy \
    --ports=443

# Get the load balancer IP
LB_IP=$(gcloud compute forwarding-rules describe sipgrounds-frontend-rule --global --format="value(IPAddress)")

echo "✅ Frontend deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "├── Bucket Name: $BUCKET_NAME"
echo "├── Bucket URL: https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo "├── Load Balancer IP: $LB_IP"
echo "└── CDN Enabled: Yes"
echo ""
echo "🔧 Next Steps:"
echo "1. Point your domain's DNS A record to: $LB_IP"
echo "2. Update SSL certificate domains if needed"
echo "3. Test your website: https://yourdomain.com"
echo "4. Update REACT_APP_API_URL in .env.production with your backend URL"
echo ""
echo "📖 For detailed instructions, see: GOOGLE_CLOUD_DEPLOYMENT_GUIDE.md"
