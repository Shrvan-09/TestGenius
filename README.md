
# AI SaaS Testing Platform

An AI-powered SaaS platform that auto-generates Playwright test scripts by scanning the DOM of a given URL. It simplifies website testing using AI and provides a dashboard for visualizing test results.

---

## 🚀 Features

- 🧠 **AI DOM Scanner** – Automatically analyzes a website and generates Playwright test scripts using AI.
- 🎯 **Test Execution** – Automatically runs the generated tests.
- 📊 **Dashboard View** – Displays results of test runs in a user-friendly interface.
- 🖼️ **Screenshots** – Captures test output screenshots.
- 🌍 **Full Stack App** – Vite + React frontend and Node.js + Express backend.
- ⚡ **Concurrent Dev Workflow** – Runs frontend and backend servers simultaneously in dev mode.

---

## 🛠️ Tech Stack

### Frontend
- **React**
- **Tailwind CSS**
- **Vite**
- **TypeScript**
- **Lucide-react** for icons

### Backend
- **Node.js** + **Express**
- **CORS**
- **Cheerio** for HTML parsing
- **@google/generative-ai** for AI integration
- **Playwright** for browser automation

### Tools & Libraries
- **Axios**
- **Nodemon**
- **ESLint**
- **UUID**
- **PostCSS**
- **Autoprefixer**

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Shrvan-09/TestGenius.git
cd TestGenius
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Environment Variables
Create a `.env` file in the `project` directory. Include any required keys (like your Generative AI API key).

### 4. Run the App in Development Mode
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

---
