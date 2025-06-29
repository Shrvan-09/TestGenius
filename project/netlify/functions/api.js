import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdirSync } from 'fs';
import testGenerationRoutes from '../../server/routes/testGeneration.js';
import testExecutionRoutes from '../../server/routes/testExecution.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/screenshots', express.static(path.join(__dirname, '../../server/screenshots')));

// Routes
app.use('/api/generate', testGenerationRoutes);
app.use('/api/execute', testExecutionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to list screenshots
app.get('/api/screenshots', (req, res) => {
  const screenshotsPath = path.join(__dirname, '../../server/screenshots');
  
  try {
    const files = readdirSync(screenshotsPath);
    const screenshots = files.map(file => ({
      filename: file,
      url: `/screenshots/${file}`,
      fullUrl: `${req.protocol}://${req.get('host')}/screenshots/${file}`
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export const handler = async (event, context) => {
  const serverless = require('serverless-http');
  const handler = serverless(app);
  return await handler(event, context);
};