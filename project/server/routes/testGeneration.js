import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { mkdirSync } from 'fs';

const router = express.Router();
mkdirSync('screenshots', { recursive: true });

// Generate content with Gemini API using axios
async function generateWithGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const data = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // The generated text is in response.data.candidates[0].content.parts[0].text
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw new Error(`Failed to generate test with Gemini API: ${error.message}`);
  }
}

// Analyze webpage structure
async function analyzeWebpage(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extract key elements for testing
    const analysis = {
      title: $('title').text() || '',
      headings: $('h1, h2, h3').map((i, el) => $(el).text().trim()).get(),
      buttons: $('button, input[type="submit"], input[type="button"]').map((i, el) => ({
        text: $(el).text().trim() || $(el).val() || '',
        type: $(el).attr('type') || 'button',
        id: $(el).attr('id') || '',
        class: $(el).attr('class') || ''
      })).get(),
      links: $('a[href]').map((i, el) => ({
        text: $(el).text().trim(),
        href: $(el).attr('href'),
        id: $(el).attr('id') || '',
        class: $(el).attr('class') || ''
      })).get().slice(0, 10), // Limit to first 10 links
      forms: $('form').map((i, el) => ({
        action: $(el).attr('action') || '',
        method: $(el).attr('method') || 'GET',
        inputs: $(el).find('input, textarea, select').map((j, input) => ({
          name: $(input).attr('name') || '',
          type: $(input).attr('type') || 'text',
          id: $(input).attr('id') || '',
          placeholder: $(input).attr('placeholder') || ''
        })).get()
      })).get(),
      images: $('img').length,
      scripts: $('script').length,
      hasNavigation: $('nav, .nav, .navbar, .navigation').length > 0,
      hasFooter: $('footer, .footer').length > 0,
      viewport: $('meta[name="viewport"]').attr('content') || ''
    };

    return analysis;
  } catch (error) {
    console.error('Webpage analysis failed:', error.message);
    throw new Error(`Failed to analyze webpage: ${error.message}`);
  }
}

// Generate test with AI using Gemini API
async function generateTestWithAI(url, testType, language, analysis) {
  const prompts = {
    javascript: `Generate a comprehensive Playwright test script in JavaScript for testing the website: ${url}

Test Type: ${testType}
Website Analysis: ${JSON.stringify(analysis, null, 2)}

Requirements:
- Use modern Playwright syntax with async/await
- Include proper error handling and assertions
- Test the specific elements found in the analysis
- Add meaningful test descriptions
- Include setup and teardown
- Make tests robust and production-ready
- Generate ${testType} tests based on the analysis

Return ONLY the JavaScript code without markdown formatting.`,

    python: `Generate a comprehensive Playwright test script in Python for testing the website: ${url}

Test Type: ${testType}
Website Analysis: ${JSON.stringify(analysis, null, 2)}

Requirements:
- Use modern Playwright Python syntax with async/await
- Include proper error handling and assertions
- Test the specific elements found in the analysis
- Add meaningful test descriptions
- Include setup and teardown
- Make tests robust and production-ready
- Generate ${testType} tests based on the analysis

Return ONLY the Python code without markdown formatting.`
  };

  try {
    let generatedCode = await generateWithGeminiAPI(prompts[language]);
    // Clean up the generated code
    generatedCode = generatedCode.replace(/```javascript|```python|```/g, '').trim();
    return generatedCode;
  } catch (error) {
    console.error('AI generation failed:', error.message);
    throw new Error(`Failed to generate test with AI: ${error.message}`);
  }
}

// Generate fallback tests
function generateFallbackTest(url, testType, language, analysis) {
  const jsTemplate = `const { test, expect } = require('@playwright/test');

test.describe('${analysis.title || 'Website'} - ${testType} Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${url}');
  });

  test('should load the page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/${analysis.title || '.+'}/);
    await expect(page.locator('body')).toBeVisible();
  });

  ${analysis.buttons.length > 0 ? `
  test('should interact with buttons', async ({ page }) => {
    ${analysis.buttons.slice(0, 3).map(btn => 
      btn.id ? `await page.click('#${btn.id}');` : 
      btn.text ? `await page.click('text="${btn.text}"');` : ''
    ).filter(Boolean).join('\n    ')}
  });` : ''}

  ${analysis.links.length > 0 ? `
  test('should have working navigation links', async ({ page }) => {
    ${analysis.links.slice(0, 3).map(link => 
      link.text ? `await expect(page.locator('text="${link.text}"')).toBeVisible();` : ''
    ).filter(Boolean).join('\n    ')}
  });` : ''}

  ${analysis.forms.length > 0 ? `
  test('should handle form interactions', async ({ page }) => {
    ${analysis.forms[0].inputs.slice(0, 2).map(input => 
      input.name ? `await page.fill('[name="${input.name}"]', 'test data');` : ''
    ).filter(Boolean).join('\n    ')}
  });` : ''}
});`;

  const pythonTemplate = `import asyncio
from playwright.async_api import async_playwright, expect

class Test${analysis.title?.replace(/\s+/g, '') || 'Website'}:
    async def test_load_page_successfully(self, page):
        await page.goto('${url}')
        await expect(page).to_have_title('${analysis.title || '.*'}')
        await expect(page.locator('body')).to_be_visible()

    ${analysis.buttons.length > 0 ? `
    async def test_interact_with_buttons(self, page):
        await page.goto('${url}')
        ${analysis.buttons.slice(0, 3).map(btn => 
          btn.id ? `await page.click('#${btn.id}')` : 
          btn.text ? `await page.click('text="${btn.text}"')` : ''
        ).filter(Boolean).join('\n        ')}` : ''}

    ${analysis.links.length > 0 ? `
    async def test_navigation_links(self, page):
        await page.goto('${url}')
        ${analysis.links.slice(0, 3).map(link => 
          link.text ? `await expect(page.locator('text="${link.text}"')).to_be_visible()` : ''
        ).filter(Boolean).join('\n        ')}` : ''}

    ${analysis.forms.length > 0 ? `
    async def test_form_interactions(self, page):
        await page.goto('${url}')
        ${analysis.forms[0].inputs.slice(0, 2).map(input => 
          input.name ? `await page.fill('[name="${input.name}"]', 'test data')` : ''
        ).filter(Boolean).join('\n        ')}` : ''}
`;

  return language === 'javascript' ? jsTemplate : pythonTemplate;
}

// Main generation endpoint
router.post('/', async (req, res) => {
  try {
    const { url, testType = 'basic', language = 'javascript' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const testId = uuidv4();
    
    // Analyze webpage
    const analysis = await analyzeWebpage(url);
    
    let generatedTest;
    let aiGenerated = false;

    // Try AI generation first, fallback to template
    try {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo-key') {
        generatedTest = await generateTestWithAI(url, testType, language, analysis);
        aiGenerated = true;
      } else {
        throw new Error('AI API key not configured');
      }
    } catch (aiError) {
      console.warn('AI generation failed, using fallback:', aiError.message);
      generatedTest = generateFallbackTest(url, testType, language, analysis);
    }

    res.json({
      testId,
      url,
      testType,
      language,
      code: generatedTest,
      analysis: {
        ...analysis,
        aiGenerated,
        generatedAt: new Date().toISOString()
      },
      screenshots: [
        {
          name: 'initial-load.png',
          url: `/screenshots/initial-load.png`,
          timestamp: new Date().toISOString()
        }
      ]
    });

  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate test',
      message: error.message 
    });
  }
});

export default router;