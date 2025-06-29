# TestGenius Setup and Fix Commands

This document records all the necessary commands executed to resolve recent errors and modifications.

## Issue 1: Playwright Browser Installation Error

### Error:
```
browserType.launch: Executable doesn't exist at /home/codespace/.cache/ms-playwright/chromium_headless_shell-1179/chrome-linux/headless_shell
```

### Commands Executed:

1. **Install Playwright browsers with dependencies:**
   ```bash
   cd /workspaces/TestGenius/project
   npx playwright install chromium --with-deps
   ```

2. **Alternative command (if the above fails):**
   ```bash
   npx playwright install
   ```

3. **Verify Playwright installation:**
   ```bash
   npx playwright --version
   ```

4. **Test browser launch (optional verification):**
   ```bash
   node -e "const { chromium } = require('playwright'); (async () => { try { const browser = await chromium.launch(); console.log('Browser launched successfully!'); await browser.close(); } catch (e) { console.error('Browser launch failed:', e.message); } })()"
   ```

## Issue 2: Screenshot Visibility on Test Results Page

### Error:
Screenshots not displaying in the TestResults component UI

### Commands Executed:

1. **Check screenshot directory contents:**
   ```bash
   ls -la /workspaces/TestGenius/project/server/screenshots/
   ```

2. **Remove empty/corrupted screenshot file:**
   ```bash
   rm /workspaces/TestGenius/project/server/screenshots/initial-load.png
   ```

3. **Test screenshot API endpoint:**
   ```bash
   curl http://localhost:3001/api/screenshots
   ```

4. **Verify screenshot file serving:**
   ```bash
   curl -I http://localhost:3001/screenshots/[filename].png
   ```

5. **Restart backend server:**
   ```bash
   cd /workspaces/TestGenius/project
   npm run dev:backend
   ```

6. **Restart frontend server (after proxy config changes):**
   ```bash
   cd /workspaces/TestGenius/project
   npm run dev:frontend
   ```

## Issue 3: Playwright Configuration Error

### Error:
```
browser.newContext: recordVideo: expected object, got boolean
```

### Fix:
No commands needed - this was a code configuration fix in `testExecution.js`

## Development Server Commands

### Start both frontend and backend:
```bash
cd /workspaces/TestGenius/project
npm run dev
```

### Start backend only:
```bash
cd /workspaces/TestGenius/project
npm run dev:backend
```

### Start frontend only:
```bash
cd /workspaces/TestGenius/project
npm run dev:frontend
```

## Environment Setup Commands

### Install dependencies:
```bash
cd /workspaces/TestGenius/project
npm install
```

### Setup environment variables:
```bash
# Edit .env file with your API keys
nano .env
```

## File Modifications Made

### 1. `/workspaces/TestGenius/project/server/routes/testExecution.js`
- Fixed `recordVideo` configuration (removed boolean, used object format)
- Enhanced browser launch with better error handling
- Added browser installation check and error messages
- Improved screenshot URL generation
- Added comprehensive logging and debugging

### 2. `/workspaces/TestGenius/project/vite.config.ts`
- Added `/screenshots` proxy configuration for proper file serving

### 3. `/workspaces/TestGenius/project/src/components/TestResults.tsx`
- Enhanced screenshot display with error handling
- Added debug logging for screenshot data
- Improved fallback UI for failed screenshot loads
- Added click-to-open screenshot functionality

### 4. `/workspaces/TestGenius/project/server/index.js`
- Added `/api/screenshots` debug endpoint
- Imported `readdirSync` from fs module
- Enhanced static file serving for screenshots

### 5. `/workspaces/TestGenius/project/.env`
- Created comprehensive environment configuration file
- Added Gemini API key configuration
- Added server and development settings

### 6. `/workspaces/TestGenius/project/firestore.rules`
- Created Firestore security rules for user data access

## Troubleshooting Commands

### Check if Playwright browsers are installed:
```bash
npx playwright list-devices
```

### Verify server is running:
```bash
curl http://localhost:3001/api/health
```

### Check screenshot directory:
```bash
ls -la /workspaces/TestGenius/project/server/screenshots/
```

### View server logs:
```bash
# Backend logs are visible in the terminal where npm run dev:backend is running
```

### Test screenshot access:
```bash
# Visit in browser or curl:
curl http://localhost:5173/api/screenshots
```

## Dependencies Installed

The following were already in package.json and installed via `npm install`:
- `playwright@^1.40.0`
- `@google/generative-ai@^0.2.1`
- `axios@^1.6.0`
- `express@^4.18.2`
- `cors@^2.8.5`
- `dotenv@^16.3.1`

## Notes

1. **One-time setup**: Playwright browser installation is only needed once per environment
2. **Environment variables**: Make sure to set your actual Gemini API key in `.env`
3. **Firestore rules**: Apply the rules in Firebase Console for user data to work
4. **Port conflicts**: Default ports are 5173 (frontend) and 3001 (backend)
5. **Screenshots**: Are served from `/screenshots/` endpoint and stored in `server/screenshots/`

## Success Verification

After running these commands, you should have:
- ✅ Playwright browsers installed and working
- ✅ Screenshots visible in test results
- ✅ Detailed test execution logs with AI analysis
- ✅ Proper error handling and debugging tools
- ✅ Working frontend-backend integration

---

# 🚀 Cloud Deployment Guide

## Platform Options

### 1. Vercel (Frontend + Serverless Backend)
### 2. Railway (Full-Stack)
### 3. Render (Full-Stack)
### 4. Heroku (Full-Stack)
### 5. DigitalOcean App Platform
### 6. Google Cloud Platform
### 7. AWS (EC2 + S3)

---

## 1. Vercel Deployment

### Frontend Deployment Commands:
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /workspaces/TestGenius/project
vercel

# Set environment variables in Vercel dashboard
# GEMINI_API_KEY=your_gemini_api_key
# NODE_ENV=production
```

### Backend API Routes (Serverless):
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/screenshots/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Vercel Deployment Script:
```bash
#!/bin/bash
# deploy-vercel.sh

echo "🚀 Deploying TestGenius to Vercel..."

# Build the project
npm run build

# Deploy to Vercel
vercel --prod

echo "✅ Deployment complete!"
echo "Don't forget to set environment variables in Vercel dashboard"
```

---

## 2. Railway Deployment

### Railway Commands:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project (optional)
railway link

# Deploy
railway up

# Set environment variables
railway variables set GEMINI_API_KEY=your_api_key
railway variables set NODE_ENV=production
railway variables set PORT=3001
```

### Railway Configuration (`railway.json`):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### Railway Dockerfile (optional):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Playwright to use installed Chromium
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

---

## 3. Render Deployment

### Render Commands:
```bash
# Connect your GitHub repo to Render
# Or use Render CLI
curl -L https://github.com/render-examples/render-cli/releases/latest/download/render-cli-linux-amd64 -o render
chmod +x render
./render auth login
./render service create
```

### Render Configuration (`render.yaml`):
```yaml
services:
  - type: web
    name: testgenius-backend
    env: node
    plan: starter
    buildCommand: npm install && npx playwright install chromium --with-deps && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: GEMINI_API_KEY
        sync: false
      - key: PORT
        value: 3001
    disk:
      name: screenshots
      mountPath: /app/server/screenshots
      sizeGB: 1

  - type: static
    name: testgenius-frontend
    buildCommand: npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 4. Heroku Deployment

### Heroku Commands:
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

# Login to Heroku
heroku login

# Create Heroku app
heroku create testgenius-app

# Add buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack

# Set environment variables
heroku config:set GEMINI_API_KEY=your_api_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Heroku Configuration (`Procfile`):
```
web: npm start
```

### Heroku Package.json additions:
```json
{
  "scripts": {
    "heroku-postbuild": "npm run build && npx playwright install chromium"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## 5. DigitalOcean App Platform

### DigitalOcean App Spec (`.do/app.yaml`):
```yaml
name: testgenius
services:
- name: web
  source_dir: /
  github:
    repo: your-username/testgenius
    branch: main
  run_command: npm start
  build_command: npm install && npx playwright install chromium --with-deps && npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  health_check:
    http_path: /api/health
  envs:
  - key: NODE_ENV
    value: production
  - key: GEMINI_API_KEY
    value: your_api_key
    type: SECRET
  - key: PORT
    value: "8080"
```

### DigitalOcean Deployment Commands:
```bash
# Install doctl
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Create app
doctl apps create .do/app.yaml

# Deploy updates
doctl apps create-deployment <app-id>
```

---

## 6. Google Cloud Platform

### GCP Commands:
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Set project
gcloud config set project your-project-id

# Deploy to Cloud Run
gcloud run deploy testgenius \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_api_key,NODE_ENV=production
```

### GCP Dockerfile:
```dockerfile
FROM node:18-slim

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
RUN npx playwright install chromium

COPY . .
RUN npm run build

ENV PORT 8080
EXPOSE 8080

CMD ["npm", "start"]
```

---

## 7. AWS EC2 + S3 Deployment

### AWS EC2 Setup Script:
```bash
#!/bin/bash
# aws-deploy.sh

# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install Git
sudo yum install git -y

# Install Playwright dependencies
sudo yum install -y \
    alsa-lib \
    atk \
    cups-libs \
    drm \
    gtk3 \
    libXcomposite \
    libXdamage \
    libXrandr \
    libgbm \
    libxss \
    mesa-libgbm \
    nss \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-Type1 \
    xorg-x11-utils

# Clone and setup project
git clone https://github.com/your-username/testgenius.git
cd testgenius/project
npm install
npx playwright install chromium
npm run build

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start npm --name "testgenius" -- start
pm2 startup
pm2 save
```

### AWS S3 Static Hosting:
```bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Configure S3 for static hosting
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

---

## Environment Variables for All Platforms

Set these environment variables in your deployment platform:

```bash
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001

# Firebase (if using custom config)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

---

## Deployment Scripts

### Universal Build Script (`scripts/build.sh`):
```bash
#!/bin/bash
set -e

echo "🔨 Building TestGenius..."

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium --with-deps

# Build frontend
npm run build

echo "✅ Build complete!"
```

### Health Check Script (`scripts/health-check.sh`):
```bash
#!/bin/bash

# Wait for server to start
sleep 5

# Health check
curl -f http://localhost:3001/api/health || exit 1

echo "✅ Health check passed!"
```

### Deployment Verification Script (`scripts/verify-deployment.sh`):
```bash
#!/bin/bash

URL=${1:-"https://your-app.vercel.app"}

echo "🔍 Verifying deployment at $URL..."

# Check health endpoint
curl -f "$URL/api/health" || { echo "❌ Health check failed"; exit 1; }

# Check screenshot endpoint
curl -f "$URL/api/screenshots" || { echo "❌ Screenshots API failed"; exit 1; }

echo "✅ Deployment verification complete!"
```

---

## Quick Deploy Commands

### One-liner deployments:
```bash
# Vercel
npx vercel --prod

# Railway
npx @railway/cli up

# Render (via Git)
git push origin main

# Heroku
git push heroku main

# Netlify
npx netlify deploy --prod
```

---

## Production Considerations

1. **Browser Installation**: Ensure Playwright browsers are installed during build
2. **Environment Variables**: Set all required API keys securely
3. **File Storage**: Screenshots need persistent storage (use S3, Cloudinary, etc.)
4. **Database**: Configure Firestore for production
5. **Monitoring**: Set up logging and error tracking
6. **SSL**: Ensure HTTPS is enabled
7. **Rate Limiting**: Implement API rate limiting
8. **CORS**: Configure proper CORS settings
