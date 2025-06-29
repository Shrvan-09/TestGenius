#!/bin/bash

echo "🚂 Deploying TestGenius to Railway..."

# Check if logged in to Railway
if ! railway status > /dev/null 2>&1; then
    echo "🔐 Please login to Railway first:"
    echo "npx @railway/cli login"
    exit 1
fi

# Initialize if not already done
if [ ! -f "railway.json" ]; then
    echo "🔧 Initializing Railway project..."
    railway init
fi

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set GEMINI_API_KEY=${GEMINI_API_KEY:-"your_api_key_here"}
railway variables set NODE_ENV=production
railway variables set PORT=3001

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update GEMINI_API_KEY in Railway dashboard if needed"
echo "2. Visit your Railway app URL to test"
echo "3. Check Railway logs for any issues"
