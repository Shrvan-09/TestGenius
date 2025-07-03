import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdirSync } from 'fs';
import testGenerationRoutes from './routes/testGeneration.js';
import testExecutionRoutes from './routes/testExecution.js';
import visualTestingRoutes from './routes/visualTesting.js';

dotenv.config();

// These two lines are needed for __dirname in ES modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Routes
app.use('/api/generate', testGenerationRoutes);
app.use('/api/execute', testExecutionRoutes);
app.use('/api/visual', visualTestingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to list screenshots
app.get('/api/screenshots', (req, res) => {
  const screenshotsPath = path.join(__dirname, 'screenshots');
  
  try {
    const files = readdirSync(screenshotsPath);
    const screenshots = files.map(file => ({
      filename: file,
      url: `/screenshots/${file}`,
      fullUrl: `http://localhost:${PORT}/screenshots/${file}`
    }));
    
    res.json({
      count: screenshots.length,
      screenshots: screenshots,
      screenshotsPath: screenshotsPath
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read screenshots directory', message: error.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI SaaS Testing Platform running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});