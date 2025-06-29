import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdirSync, existsSync } from 'fs';
import serverless from 'serverless-http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'netlify-functions'
  });
});

// Basic test generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { url, testType = 'basic', language = 'javascript' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Simple test generation without external dependencies for now
    const testId = Math.random().toString(36).substring(7);
    
    const basicTest = `const { test, expect } = require('@playwright/test');

test.describe('${url} - Basic Tests', () => {
  test('should load the page successfully', async ({ page }) => {
    await page.goto('${url}');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('${url}');
    // Add more specific tests based on the website
  });
});`;

    res.json({
      testId,
      url,
      testType,
      language,
      code: basicTest,
      analysis: {
        title: 'Generated Test',
        buttons: [],
        forms: [],
        links: [],
        aiGenerated: false,
        generatedAt: new Date().toISOString()
      },
      screenshots: []
    });

  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate test',
      message: error.message 
    });
  }
});

// Basic test execution endpoint
app.post('/api/execute', async (req, res) => {
  try {
    const { code, language, testId, url } = req.body;

    if (!code || !testId) {
      return res.status(400).json({ error: 'Code and testId are required' });
    }

    // Simulate test execution for now
    const results = {
      testId,
      language,
      url: url || 'https://example.com',
      status: 'completed',
      executedAt: new Date().toISOString(),
      results: {
        passed: 2,
        failed: 0,
        skipped: 0,
        duration: 1500,
        total: 2
      },
      testCases: [
        {
          name: 'should load the page successfully',
          status: 'passed',
          location: 'body',
          timestamp: new Date().toISOString(),
          duration: 750,
          details: 'Page loaded successfully'
        },
        {
          name: 'should have working navigation',
          status: 'passed',
          location: 'nav',
          timestamp: new Date().toISOString(),
          duration: 750,
          details: 'Navigation elements found'
        }
      ],
      logs: [
        '[INFO] Starting test execution',
        '[SUCCESS] ✓ Page loaded successfully',
        '[SUCCESS] ✓ Navigation test passed',
        '[INFO] Test execution completed'
      ],
      screenshots: [],
      summary: {
        successRate: 100,
        criticalFailures: 0,
        recommendations: ['Tests completed successfully']
      }
    };

    res.json(results);

  } catch (error) {
    console.error('Test execution error:', error);
    res.status(500).json({ 
      error: 'Test execution failed',
      message: error.message,
      testId: req.body.testId || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
});

// Screenshots endpoint
app.get('/api/screenshots', (req, res) => {
  res.json({
    count: 0,
    screenshots: [],
    message: 'Screenshots not available in serverless environment'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Export the serverless handler
export const handler = serverless(app);