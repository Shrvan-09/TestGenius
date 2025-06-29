#!/bin/bash

echo "🚀 Deploying TestGenius to Vercel..."

# Check if logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "🔐 Please login to Vercel first:"
    echo "npx vercel login"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - GEMINI_API_KEY=your_gemini_api_key"
echo "   - NODE_ENV=production"
echo "2. Visit your deployment URL to test"
echo "3. Run verification script: ./scripts/verify-deployment.sh YOUR_VERCEL_URL"
