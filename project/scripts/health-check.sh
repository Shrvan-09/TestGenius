#!/bin/bash

URL=${1:-"http://localhost:3001"}

echo "🔍 Running health check on $URL..."

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Health check
echo "🏥 Checking health endpoint..."
if curl -f "$URL/api/health" > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

# Check if screenshots endpoint exists
echo "📸 Checking screenshots endpoint..."
if curl -f "$URL/api/screenshots" > /dev/null 2>&1; then
    echo "✅ Screenshots API working!"
else
    echo "⚠️ Screenshots API not responding (this might be expected)"
fi

echo "🎉 Health check complete!"
