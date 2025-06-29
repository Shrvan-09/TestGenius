
# 🧪 TestGenius - AI-Powered Testing Platform

TestGenius is an intelligent SaaS platform that leverages AI to automatically generate, execute, and analyze Playwright test scripts by scanning website DOM structures. It provides comprehensive test automation with detailed reporting, screenshot capture, and failure analysis.

---

## ✨ Key Features

### 🧠 **AI Test Generation**
- **Smart DOM Analysis** – Uses Google Gemini AI to analyze website structure
- **Intelligent Test Creation** – Generates comprehensive Playwright test scripts
- **Interactive Element Detection** – Identifies buttons, forms, links, and user interactions
- **Scenario-Based Testing** – Creates realistic user journey tests

### 🎯 **Advanced Test Execution**
- **Playwright Browser Automation** – Supports Chromium, Firefox, and Safari
- **Real-time Test Monitoring** – Live execution status and progress tracking
- **Detailed Test Reporting** – Pass/fail/skip breakdown with execution times
- **AI-Powered Failure Analysis** – Intelligent error diagnosis and suggestions

### 📊 **Comprehensive Dashboard**
- **User Authentication** – Firebase-based secure user management
- **Test History Tracking** – Complete test execution timeline
- **Visual Results Display** – Interactive test results with filtering
- **Performance Metrics** – Test execution analytics and trends

### 🖼️ **Screenshot & Media Capture**
- **Automated Screenshots** – Before/after test execution captures
- **Failure Evidence** – Visual proof of test failures and errors
- **Video Recording** – Full test execution recordings (configurable)
- **Media Management** – Organized storage and retrieval system

### 🌐 **Cloud-Ready Architecture**
- **Multi-Platform Deployment** – Vercel, Railway, Heroku, Docker support
- **Scalable Backend** – Node.js + Express with proper error handling
- **Database Integration** – Firebase Firestore for data persistence
- **Production Optimized** – Built-in health checks and monitoring

---

## 🛠️ Technology Stack

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive UI design
- **Vite** for fast development and optimized builds
- **Lucide React** for consistent iconography
- **Firebase SDK** for authentication and data management

### Backend Stack
- **Node.js + Express** for robust API development
- **Playwright** for browser automation and testing
- **Google Generative AI (Gemini)** for intelligent test generation
- **Cheerio** for HTML parsing and DOM analysis
- **Firebase Admin** for server-side user management

### Development Tools
- **ESLint + TypeScript** for code quality and type checking
- **Concurrently** for parallel frontend/backend development
- **Nodemon** for automatic server reloading
- **PostCSS + Autoprefixer** for CSS processing

### Cloud & Deployment
- **Docker** containerization for consistent deployments
- **Vercel** for frontend hosting and serverless functions
- **Railway** for full-stack deployment
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for user management

---

## � Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Git** for version control
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))
- **Firebase Project** ([Firebase Console](https://console.firebase.google.com/))

### 1. Clone and Setup
```bash
git clone https://github.com/Shrvan-09/TestGenius.git
cd TestGenius/project
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `project` directory:
```env
# Required: Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Optional: Server Configuration
NODE_ENV=development
PORT=3001
DEBUG=true
```

### 3. Install Playwright Browsers
```bash
npx playwright install chromium --with-deps
```

### 4. Start Development Server
```bash
npm run dev
```
This runs both frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently.

### 5. Build for Production
```bash
npm run build:production
```

---

## 📖 Detailed Setup Guide

### Complete Environment Setup
For detailed setup instructions including troubleshooting, see [`SETUP_COMMANDS.md`](SETUP_COMMANDS.md)

### Cloud Deployment
For comprehensive deployment instructions, see [`project/DEPLOYMENT.md`](project/DEPLOYMENT.md)

### Firebase Configuration
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy configuration values to your `.env` file
5. Update Firestore security rules (see `project/firestore.rules`)

---

## 🎯 How It Works

### 1. **AI Test Generation**
- User provides a website URL
- AI analyzes the DOM structure using Cheerio
- Google Gemini AI generates intelligent test scenarios
- Playwright test scripts are created automatically

### 2. **Test Execution Engine**
- Tests run in isolated browser environments
- Real-time progress tracking and logging
- Screenshot capture at key interaction points
- Detailed error reporting with AI analysis

### 3. **Results Dashboard**
- Comprehensive test results visualization
- Pass/fail/skip statistics with timing data
- Screenshot gallery with before/after comparisons
- Historical test data and trend analysis

### 4. **User Management**
- Firebase Authentication for secure access
- User-specific test history and data
- Profile management and preferences
- Secure API access with user authentication

---

## 📁 Project Structure

```
TestGenius/
├── README.md                    # Main documentation
├── SETUP_COMMANDS.md           # Setup and troubleshooting guide
└── project/                    # Main application directory
    ├── DEPLOYMENT.md           # Deployment instructions
    ├── package.json            # Dependencies and scripts
    ├── vite.config.ts          # Vite configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── firestore.rules         # Firestore security rules
    ├── Dockerfile              # Docker containerization
    ├── vercel.json            # Vercel deployment config
    ├── railway.json           # Railway deployment config
    ├── Procfile               # Heroku process file
    ├── scripts/               # Deployment and utility scripts
    │   ├── build.sh           # Production build script
    │   ├── deploy-vercel.sh   # Vercel deployment
    │   ├── deploy-railway.sh  # Railway deployment
    │   ├── health-check.sh    # Health monitoring
    │   └── verify-deployment.sh # Deployment verification
    ├── server/                # Backend API server
    │   ├── index.js           # Express server entry point
    │   ├── routes/            # API route handlers
    │   │   ├── testGeneration.js # AI test generation logic
    │   │   └── testExecution.js  # Playwright test execution
    │   └── screenshots/       # Generated test screenshots
    └── src/                   # Frontend React application
        ├── App.tsx            # Main app component
        ├── main.tsx           # React entry point
        ├── firebase.ts        # Firebase configuration
        ├── index.css          # Global styles
        └── components/        # React components
            ├── Hero.tsx       # Landing page hero
            ├── Features.tsx   # Feature showcase
            ├── TestGenerator.tsx # Test creation interface
            ├── TestResults.tsx   # Results display
            ├── UserProfile.tsx   # User dashboard
            └── CodeEditor.tsx    # Code display component
```

---

## 🔧 Available Scripts

### Development
```bash
npm run dev              # Start development servers (frontend + backend)
npm run dev:frontend     # Start only frontend (Vite)
npm run dev:backend      # Start only backend (Express)
```

### Building
```bash
npm run build            # Build frontend for production
npm run build:production # Build with Playwright installation
npm run preview          # Preview production build locally
```

### Deployment
```bash
npm run deploy:vercel    # Deploy to Vercel
npm run deploy:railway   # Deploy to Railway
npm run health-check     # Check application health
npm run verify-deployment # Verify deployment success
```

### Maintenance
```bash
npm run lint             # Run ESLint code analysis
npm run start            # Start production server
```

---

## 🌐 API Endpoints

### Test Generation
- `POST /api/generate-test` - Generate test script from URL
- `GET /api/health` - Health check endpoint

### Test Execution
- `POST /api/execute-test` - Execute Playwright test
- `GET /api/screenshots` - List available screenshots
- `GET /screenshots/:filename` - Serve screenshot files

### Utilities
- `GET /api/status` - Application status and metrics
- `GET /api/version` - Application version information

---

## 🔍 Testing & Quality Assurance

### Local Testing
```bash
# Verify setup
npm run health-check http://localhost:3001

# Test Playwright installation
npx playwright --version

# Verify browser installation
node -e "const { chromium } = require('playwright'); chromium.launch().then(() => console.log('Browser ready!')).catch(console.error)"
```

### Production Testing
```bash
# Test deployed application
npm run verify-deployment https://your-app-url.com

# Check API endpoints
curl https://your-app.com/api/health
curl https://your-app.com/api/screenshots
```

---

## 📚 Documentation

- **[Setup Commands](SETUP_COMMANDS.md)** - Complete setup and troubleshooting guide
- **[Deployment Guide](project/DEPLOYMENT.md)** - Cloud deployment instructions
- **[API Documentation](#-api-endpoints)** - API endpoint reference
- **[Architecture Overview](#-how-it-works)** - System design and workflow

---

## 🐛 Troubleshooting

### Common Issues

1. **Playwright Browser Installation**
   ```bash
   npx playwright install chromium --with-deps
   ```

2. **Permission Errors**
   ```bash
   chmod +x scripts/*.sh
   ```

3. **Port Conflicts**
   ```bash
   # Change ports in .env or package.json
   PORT=3001  # Backend
   # Frontend runs on 5173 by default
   ```

4. **Environment Variables**
   - Ensure all required variables are set in `.env`
   - Check Firebase configuration values
   - Verify Gemini API key is valid

### Getting Help
- Check the [Setup Commands](SETUP_COMMANDS.md) for detailed troubleshooting
- Review deployment logs for specific error messages
- Ensure all prerequisites are installed and configured

---

## 🚀 Deployment Platforms

TestGenius supports deployment on multiple platforms:

| Platform | Configuration | Deployment Command |
|----------|---------------|-------------------|
| **Vercel** | `vercel.json` | `npm run deploy:vercel` |
| **Railway** | `railway.json` | `npm run deploy:railway` |
| **Heroku** | `Procfile` | Manual Git deployment |
| **Docker** | `Dockerfile` | `docker build && docker run` |
| **Render** | Auto-detected | Connect GitHub repo |

For detailed deployment instructions, see [`project/DEPLOYMENT.md`](project/DEPLOYMENT.md).

---

## 🎉 Contributing

We welcome contributions to TestGenius! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all scripts pass before submitting PRs

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent test generation
- **Playwright** for reliable browser automation
- **Firebase** for authentication and data storage
- **Vite** for fast development experience
- **Tailwind CSS** for beautiful UI components

---

**Happy Testing with TestGenius! 🧪✨**

*Transform your website testing with the power of AI - Generate, Execute, and Analyze tests automatically.*
