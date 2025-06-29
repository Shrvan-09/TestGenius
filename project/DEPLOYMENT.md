# 🚀 TestGenius Deployment Guide

Complete deployment guide for TestGenius AI-powered testing platform across multiple cloud providers.

## 📋 Pre-deployment Requirements

### System Requirements
- Node.js 18+ 
- npm or yarn package manager
- Git for version control
- Chrome/Chromium for Playwright tests

### Required Services
- **Google Gemini API Key** - For AI test generation
- **Firebase Project** - For authentication and data storage
- **Cloud Storage** (optional) - For screenshot persistence

## 🎯 Quick Deploy

### Vercel (Recommended for beginners)
```bash
npm run deploy:vercel
```

### Railway (Full-stack friendly)
```bash
npm run deploy:railway
```

### Manual Commands
```bash
# Any platform
npm run build:production
npm run health-check
```

## 🔑 Environment Variables Configuration

### Required Variables
All deployments need these environment variables:

```env
# Google Gemini AI (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (All Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Production Settings
NODE_ENV=production
```

### Optional Variables
```env
# Server Configuration
PORT=3001
DEBUG=false

# Performance Tuning
MAX_CONCURRENT_TESTS=3
TEST_TIMEOUT=30000
SCREENSHOT_QUALITY=80
```

### Platform-Specific Environment Setup

#### Vercel
1. Go to your Vercel dashboard
2. Select your project → Settings → Environment Variables
3. Add each variable with appropriate scope (Production/Preview/Development)

#### Railway
1. Go to your Railway dashboard
2. Select your project → Variables tab
3. Add variables in KEY=VALUE format

#### Heroku
```bash
# Using Heroku CLI
heroku config:set GEMINI_API_KEY=your_key_here
heroku config:set NODE_ENV=production
# ... add all other variables
```

## 📋 Pre-deployment Checklist

- [ ] Set `GEMINI_API_KEY` in your deployment platform
- [ ] Configure all Firebase environment variables
- [ ] Set up Firestore rules in Firebase Console
- [ ] Test locally with `npm run dev`
- [ ] Run `npm run build` to ensure it builds successfully
- [ ] Verify all environment variables are set
- [ ] Test Playwright browser installation
- [ ] Check screenshot generation and serving
- [ ] Verify API endpoints are working

## 🌐 Platform-Specific Instructions

### Vercel
**Best for:** Frontend-heavy applications with serverless functions

**Setup:**
1. Connect GitHub repo to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Set environment variables in dashboard
4. Deploy automatically on push

**Configuration File:** `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install && npx playwright install chromium",
  "functions": {
    "server/index.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### Railway
**Best for:** Full-stack applications with persistent storage

**Setup:**
1. Connect GitHub repo to Railway
2. Railway auto-detects Node.js project
3. Set environment variables in dashboard
4. Deploy with zero additional configuration

**Configuration File:** `railway.json`
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### Render
**Best for:** Affordable full-stack hosting

**Setup:**
1. Connect GitHub repo to Render
2. Create a new Web Service
3. Configure build settings:
   - Build Command: `npm run build:production`
   - Start Command: `npm start`
4. Set environment variables in dashboard

### Heroku
**Best for:** Enterprise applications with add-ons

**Setup:**
1. Create Heroku app: `heroku create your-app-name`
2. Add Node.js buildpack: `heroku buildpacks:set heroku/nodejs`
3. Set environment variables (see above)
4. Deploy: `git push heroku main`

**Procfile:**
```
web: npm start
release: npx playwright install chromium
```

### Docker Deployment
**Best for:** Containerized deployments and self-hosting

**Build and Run:**
```bash
# Build the image
docker build -t testgenius .

# Run the container
docker run -p 3001:3001 \
  -e GEMINI_API_KEY=your_key \
  -e NODE_ENV=production \
  testgenius
```

**Dockerfile Features:**
- Multi-stage build for smaller image size
- Automatic Playwright browser installation
- Security best practices
- Health checks included

## 🔍 Deployment Verification

### Automated Verification
After deployment, run the verification script:
```bash
npm run verify-deployment https://your-app-url.com
```

This checks:
- API health endpoint
- Screenshot serving
- Firebase connectivity
- AI test generation
- Browser automation

### Manual Verification Steps
1. **Health Check:**
   ```bash
   curl https://your-app.com/api/health
   ```

2. **Test Generation:**
   - Navigate to your deployed app
   - Enter a test URL
   - Verify AI generates test code

3. **Test Execution:**
   - Run a generated test
   - Check for screenshots
   - Verify test results display

4. **User Authentication:**
   - Test login/signup flow
   - Verify user profile functionality
   - Check test history persistence

## 🛠️ Troubleshooting

### Common Deployment Issues

#### 1. Build Failures
**Problem:** Build fails during deployment
```bash
# Solutions:
npm run build          # Test locally first
npm audit fix          # Fix vulnerabilities
rm -rf node_modules && npm install  # Clean install
```

#### 2. Playwright Browser Issues
**Problem:** Browsers not installed in production
```bash
# Add to build command:
npx playwright install chromium --with-deps

# Or in Dockerfile:
RUN npx playwright install chromium --with-deps
```

#### 3. Environment Variable Issues
**Problem:** Variables not loading properly
- Verify all required variables are set
- Check variable naming (case-sensitive)
- Ensure no extra spaces in values
- Test with `console.log(process.env.VARIABLE_NAME)`

#### 4. CORS and API Issues
**Problem:** Frontend can't reach backend
```javascript
// Update API base URL for production
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.com' 
  : 'http://localhost:3001';
```

#### 5. Screenshot Storage Issues
**Problem:** Screenshots not persisting
- Check file write permissions
- Consider using cloud storage (S3, Cloudinary)
- Verify proxy configuration in `vite.config.ts`

#### 6. Memory/Performance Issues
**Problem:** Application crashes or slow performance
```env
# Optimize for production
NODE_OPTIONS=--max-old-space-size=1024
MAX_CONCURRENT_TESTS=2
BROWSER_POOL_SIZE=3
```

### Debug Commands
```bash
# Check application health
curl https://your-app.com/api/health

# Check screenshots API
curl https://your-app.com/api/screenshots

# Test local build
npm run build && npm run preview

# Local health check
npm run health-check http://localhost:3001

# Verify deployment
npm run verify-deployment https://your-app.com
```

### Log Analysis
Most platforms provide real-time logs:

**Vercel:** Dashboard → Functions → View Logs
**Railway:** Dashboard → Deployments → Logs
**Heroku:** `heroku logs --tail`
**Render:** Dashboard → Logs tab

## 🚀 Advanced Configuration

### Custom Domain Setup
1. **Vercel:** Project Settings → Domains
2. **Railway:** Project Settings → Custom Domain
3. **Heroku:** `heroku domains:add your-domain.com`

### SSL/HTTPS
All recommended platforms provide automatic SSL certificates.

### Database Scaling
For high traffic, consider:
- Firebase Firestore scaling limits
- Database connection pooling
- Caching strategies (Redis)

### CDN Configuration
For better performance:
- Enable platform CDN features
- Optimize image delivery
- Cache static assets

## 📦 Deployment Files Reference

### Created Files
- `vercel.json` - Vercel configuration
- `railway.json` - Railway configuration  
- `Dockerfile` - Container configuration
- `Procfile` - Heroku process file
- `scripts/` - Deployment automation scripts
  - `build.sh` - Production build with optimizations
  - `deploy-vercel.sh` - Automated Vercel deployment
  - `deploy-railway.sh` - Automated Railway deployment
  - `health-check.sh` - Application health monitoring
  - `verify-deployment.sh` - Post-deployment verification

### Script Permissions
Make scripts executable:
```bash
chmod +x scripts/*.sh
```

## 📊 Monitoring and Maintenance

### Health Monitoring
Set up monitoring for:
- API response times
- Error rates
- Browser automation failures
- Screenshot generation issues

### Performance Optimization
- Monitor memory usage
- Optimize test execution concurrency
- Cache frequently accessed data
- Implement request rate limiting

### Security Best Practices
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement proper CORS policies
- Use environment variables for secrets
- Enable platform security features

## 📞 Support and Resources

### Platform Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Render Docs](https://render.com/docs)

### TestGenius Resources
- Main README: [Project Overview](../README.md)
- Setup Guide: [SETUP_COMMANDS.md](../SETUP_COMMANDS.md)
- API Documentation: Available in main README

### Getting Help
If deployment fails:
1. Check platform-specific logs
2. Verify all environment variables
3. Test the application locally first
4. Review the troubleshooting section above
5. Check platform status pages for outages

---

**Happy Deploying! 🎉**

*TestGenius is designed to deploy seamlessly across multiple platforms. Choose the one that best fits your needs and scale as you grow.*
