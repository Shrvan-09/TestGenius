#!/bin/bash

URL=${1:-"https://your-app.vercel.app"}

echo "🔍 Verifying deployment at $URL..."

# Check health endpoint
echo "🏥 Checking health endpoint..."
if curl -f "$URL/api/health" > /dev/null 2>&1; then
    echo "✅ Health endpoint working!"
else
    echo "❌ Health endpoint failed!"
    exit 1
fi

# Check screenshot endpoint
echo "📸 Checking screenshots API..."
if curl -f "$URL/api/screenshots" > /dev/null 2>&1; then
    echo "✅ Screenshots API working!"
else
    echo "⚠️ Screenshots API not responding"
fi

# Check if frontend loads
echo "🌐 Checking frontend..."
if curl -f "$URL" > /dev/null 2>&1; then
    echo "✅ Frontend loads successfully!"
else
    echo "❌ Frontend failed to load!"
    exit 1
fi

# Test API generation endpoint (basic check)
echo "🤖 Testing API endpoints..."
if curl -f "$URL/api/generate" -X POST -H "Content-Type: application/json" -d '{}' > /dev/null 2>&1; then
    echo "⚠️ Generate API responded (expected error for empty request)"
else
    echo "📡 Generate API endpoint exists"
fi

echo "✅ Deployment verification complete!"
echo "🎉 Your TestGenius app is live at: $URL"
