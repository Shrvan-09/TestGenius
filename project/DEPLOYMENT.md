# 🚀 TestGenius Deployment Guide

Quick deployment guide for TestGenius AI-powered testing platform.

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

## 📋 Pre-deployment Checklist

- [ ] Set `GEMINI_API_KEY` in your deployment platform
- [ ] Configure Firestore rules in Firebase Console
- [ ] Test locally with `npm run dev`
- [ ] Run `npm run build` to ensure it builds successfully
- [ ] Verify all environment variables are set

## 🌐 Platform-Specific Instructions

### Vercel
1. Connect GitHub repo to Vercel
2. Set environment variables in dashboard
3. Deploy automatically on push

### Railway
1. Connect GitHub repo to Railway
2. Set environment variables
3. Deploy with zero configuration

### Render
1. Connect GitHub repo
2. Set build command: `npm run build:production`
3. Set start command: `npm start`

### Heroku
1. Create Heroku app
2. Add Node.js buildpack
3. Set environment variables
4. Deploy with Git

## 🔍 Verification

After deployment, run:
```bash
npm run verify-deployment https://your-app-url.com
```

## 🛠️ Troubleshooting

### Common Issues:
1. **Playwright browsers not installed**: Add to build command
2. **Screenshots not working**: Check file storage configuration
3. **API calls failing**: Verify CORS and proxy settings
4. **Build failures**: Check Node.js version (require 18+)

### Debug Commands:
```bash
# Check health
curl https://your-app.com/api/health

# Check screenshots API
curl https://your-app.com/api/screenshots

# Local testing
npm run health-check http://localhost:3001
```

## 📦 Files Created

- `vercel.json` - Vercel configuration
- `railway.json` - Railway configuration  
- `Dockerfile` - Container configuration
- `Procfile` - Heroku process file
- `scripts/` - Deployment automation scripts

## 🔒 Environment Variables

Required for all deployments:
```
GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
```

Optional:
```
PORT=3001
DEBUG=false
```

## 📞 Support

If deployment fails:
1. Check platform logs
2. Verify environment variables
3. Test locally first
4. Check the troubleshooting section above

---

Happy deploying! 🎉
