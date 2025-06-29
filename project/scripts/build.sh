#!/bin/bash
set -e

echo "🔨 Building TestGenius..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium --with-deps

# Build frontend
echo "🏗️ Building frontend..."
npm run build

echo "✅ Build complete!"
echo "📁 Build output: ./dist"
echo "🖥️ Server files: ./server"
