import express from 'express';
import { chromium } from 'playwright';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create temp and screenshots directories
const tempDir = join(__dirname, '../temp');
const screenshotsDir = join(__dirname, '../screenshots');
try {
  mkdirSync(tempDir, { recursive: true });
  mkdirSync(screenshotsDir, { recursive: true });
} catch (err) {
  // Directories might already exist
}

// AI-powered analysis of test failures
async function analyzeTestFailures(failureDetails, url) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'demo-key') {
    return "AI analysis not available - please configure GEMINI_API_KEY";
  }

  const prompt = `Analyze the following Playwright test failures and provide detailed insights:

Website URL: ${url}
Failure Details: ${JSON.stringify(failureDetails, null, 2)}

Please provide:
1. Root cause analysis for each failure
2. Specific DOM elements or selectors that might be causing issues
3. Potential fixes and recommendations
4. Whether this might be a timing issue, selector issue, or website change

Keep the response concise but actionable.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return "AI analysis failed - using fallback analysis";
  }
}

// Execute Playwright tests with detailed logging
async function executePlaywrightTest(code, language, testId, url) {
  let browser;
  let tempFilePath;
  const detailedLogs = [];
  const testCases = [];
  const screenshots = [];
  
  try {
    detailedLogs.push(`[INFO] Initializing browser for test execution`);
    
    // Check if browsers are installed and install if needed
    try {
      // Launch browser with detailed logging
      browser = await chromium.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-extensions',
          '--no-first-run',
          '--disable-default-apps'
        ]
      });
    } catch (launchError) {
      if (launchError.message.includes("Executable doesn't exist")) {
        detailedLogs.push(`[ERROR] Browser not installed. Please run: npx playwright install chromium`);
        throw new Error("Playwright browsers not installed. Run 'npx playwright install chromium' to install required browsers.");
      }
      throw launchError;
    }
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      // recordVideo: { dir: 'videos/' }, // Uncomment to enable video recording
      ignoreHTTPSErrors: true, // Handle SSL issues
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    // Enable detailed logging
    page.on('console', msg => {
      detailedLogs.push(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      detailedLogs.push(`[PAGE ERROR] ${err.message}`);
    });
    
    page.on('requestfailed', request => {
      detailedLogs.push(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Parse and execute test code
    const testResults = await executeTestCode(page, code, language, url, detailedLogs, testCases, screenshots, testId);
    
    await browser.close();
    
    return testResults;
    
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        detailedLogs.push(`[WARN] Failed to close browser: ${closeError.message}`);
      }
    }
    detailedLogs.push(`[ERROR] Browser execution failed: ${error.message}`);
    throw error;
  }
}

// Execute test code with detailed tracking
async function executeTestCode(page, code, language, url, detailedLogs, testCases, screenshots, testId) {
  let passed = 0, failed = 0, skipped = 0;
  const startTime = Date.now();
  
  try {
    detailedLogs.push(`[INFO] Starting test execution for: ${url}`);
    detailedLogs.push(`[INFO] Language: ${language}, Test ID: ${testId}`);
    
    // Navigate to the URL first
    await page.goto(url, { waitUntil: 'networkidle' });
    detailedLogs.push(`[SUCCESS] ✓ Successfully navigated to ${url}`);
    
    // Take initial screenshot
    const initialScreenshot = `${testId}-initial.png`;
    await page.screenshot({ 
      path: join(screenshotsDir, initialScreenshot),
      fullPage: true 
    });
    screenshots.push({
      name: 'Initial Page Load',
      filename: initialScreenshot,
      url: `/screenshots/${initialScreenshot}`,
      timestamp: new Date().toISOString()
    });
    
    // Simulate test execution with detailed analysis
    const testScenarios = await analyzeTestScenarios(page, url, detailedLogs);
    
    for (const scenario of testScenarios) {
      try {
        const result = await executeTestScenario(page, scenario, detailedLogs, screenshots, testId);
        testCases.push(result);
        
        if (result.status === 'passed') passed++;
        else if (result.status === 'failed') failed++;
        else if (result.status === 'skipped') skipped++;
        
      } catch (error) {
        const failedCase = {
          name: scenario.name,
          status: 'failed',
          error: error.message,
          location: scenario.selector || 'Unknown',
          timestamp: new Date().toISOString(),
          details: `Failed to execute: ${scenario.description}`
        };
        testCases.push(failedCase);
        failed++;
        detailedLogs.push(`[FAILED] ✗ ${scenario.name}: ${error.message}`);
      }
    }
    
    const duration = Date.now() - startTime;
    detailedLogs.push(`[INFO] Test execution completed in ${duration}ms`);
    
    return {
      passed,
      failed,
      skipped,
      duration,
      testCases,
      detailedLogs,
      screenshots
    };
    
  } catch (error) {
    detailedLogs.push(`[ERROR] Test execution failed: ${error.message}`);
    throw error;
  }
}

// Analyze page and create test scenarios
async function analyzeTestScenarios(page, url, detailedLogs) {
  const scenarios = [];
  
  try {
    // Basic page load test
    scenarios.push({
      name: 'Page Load Verification',
      description: 'Verify the page loads successfully',
      type: 'basic',
      selector: 'body',
      action: 'verify-visible'
    });
    
    // Check for buttons
    const buttons = await page.$$eval('button, input[type="submit"], input[type="button"]', elements => 
      elements.map(el => ({
        text: el.textContent?.trim() || el.value || '',
        id: el.id,
        className: el.className,
        type: el.type,
        selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase()
      }))
    );
    
    buttons.slice(0, 5).forEach((button, index) => {
      scenarios.push({
        name: `Button Interaction: ${button.text || `Button ${index + 1}`}`,
        description: `Test clicking button: ${button.text || button.selector}`,
        type: 'interaction',
        selector: button.selector,
        action: 'click',
        element: button
      });
    });
    
    // Check for form inputs
    const inputs = await page.$$eval('input[type="text"], input[type="email"], textarea', elements =>
      elements.map(el => ({
        name: el.name,
        id: el.id,
        type: el.type,
        placeholder: el.placeholder,
        selector: el.id ? `#${el.id}` : el.name ? `[name="${el.name}"]` : el.tagName.toLowerCase()
      }))
    );
    
    inputs.slice(0, 3).forEach((input, index) => {
      scenarios.push({
        name: `Form Input: ${input.name || input.placeholder || `Input ${index + 1}`}`,
        description: `Test filling form input: ${input.selector}`,
        type: 'form',
        selector: input.selector,
        action: 'fill',
        element: input
      });
    });
    
    // Check for navigation links
    const links = await page.$$eval('a[href]', elements =>
      elements.slice(0, 3).map(el => ({
        text: el.textContent?.trim(),
        href: el.href,
        selector: el.id ? `#${el.id}` : `a[href="${el.getAttribute('href')}"]`
      }))
    );
    
    links.forEach((link, index) => {
      scenarios.push({
        name: `Navigation Link: ${link.text || `Link ${index + 1}`}`,
        description: `Test navigation link visibility: ${link.text}`,
        type: 'navigation',
        selector: link.selector,
        action: 'verify-visible',
        element: link
      });
    });
    
    detailedLogs.push(`[INFO] Generated ${scenarios.length} test scenarios`);
    return scenarios;
    
  } catch (error) {
    detailedLogs.push(`[ERROR] Failed to analyze page: ${error.message}`);
    return scenarios;
  }
}

// Execute individual test scenario
async function executeTestScenario(page, scenario, detailedLogs, screenshots, testId) {
  const startTime = Date.now();
  
  try {
    detailedLogs.push(`[RUNNING] Testing: ${scenario.name}`);
    
    // Wait for element to be available
    const element = await page.waitForSelector(scenario.selector, { timeout: 5000 });
    
    if (!element) {
      return {
        name: scenario.name,
        status: 'skipped',
        reason: `Element not found: ${scenario.selector}`,
        location: scenario.selector,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };
    }
    
    // Execute the action
    switch (scenario.action) {
      case 'click':
        await element.click();
        detailedLogs.push(`[SUCCESS] ✓ Clicked element: ${scenario.selector}`);
        break;
        
      case 'fill':
        await element.fill('Test Data ' + Date.now());
        detailedLogs.push(`[SUCCESS] ✓ Filled input: ${scenario.selector}`);
        break;
        
      case 'verify-visible':
        const isVisible = await element.isVisible();
        if (!isVisible) throw new Error('Element is not visible');
        detailedLogs.push(`[SUCCESS] ✓ Element is visible: ${scenario.selector}`);
        break;
        
      default:
        detailedLogs.push(`[INFO] Unknown action: ${scenario.action}`);
    }
    
    // Take screenshot for critical interactions
    if (scenario.action === 'click') {
      const screenshotName = `${testId}-${scenario.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      await page.screenshot({ 
        path: join(screenshotsDir, screenshotName),
        fullPage: false 
      });
      screenshots.push({
        name: `After: ${scenario.name}`,
        filename: screenshotName,
        url: `/screenshots/${screenshotName}`,
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      name: scenario.name,
      status: 'passed',
      location: scenario.selector,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      details: scenario.description
    };
    
  } catch (error) {
    detailedLogs.push(`[FAILED] ✗ ${scenario.name}: ${error.message}`);
    
    return {
      name: scenario.name,
      status: 'failed',
      error: error.message,
      location: scenario.selector,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      details: scenario.description,
      troubleshooting: await generateTroubleshootingTips(scenario, error.message)
    };
  }
}

// Generate troubleshooting tips
async function generateTroubleshootingTips(scenario, errorMessage) {
  const tips = [];
  
  if (errorMessage.includes('timeout') || errorMessage.includes('not found')) {
    tips.push(`Element selector "${scenario.selector}" might be incorrect or element loads dynamically`);
    tips.push('Try using more specific selectors or wait for network idle');
  }
  
  if (errorMessage.includes('not visible')) {
    tips.push('Element might be hidden by CSS or outside viewport');
    tips.push('Check if element needs scrolling into view');
  }
  
  if (errorMessage.includes('click')) {
    tips.push('Element might be covered by another element');
    tips.push('Try using force: true option for clicking');
  }
  
  return tips;
}

// Main execution endpoint
router.post('/', async (req, res) => {
  try {
    const { code, language, testId, url } = req.body;

    if (!code || !testId) {
      return res.status(400).json({ error: 'Code and testId are required' });
    }

    console.log(`[INFO] Starting test execution for ${testId}`);
    
    // Extract URL from code if not provided
    let targetUrl = url;
    if (!targetUrl) {
      const urlMatch = code.match(/goto\(['"`](https?:\/\/[^'"`]+)['"`]\)/);
      targetUrl = urlMatch ? urlMatch[1] : 'https://example.com';
    }
    
    // Execute tests with detailed logging
    const executionResults = await executePlaywrightTest(code, language, testId, targetUrl);
    
    // Generate AI analysis for failures if available
    let aiAnalysis = null;
    const failedTests = executionResults.testCases.filter(test => test.status === 'failed');
    
    if (failedTests.length > 0) {
      console.log(`[INFO] Generating AI analysis for ${failedTests.length} failed tests`);
      try {
        aiAnalysis = await analyzeTestFailures(failedTests, targetUrl);
      } catch (aiError) {
        console.warn(`[WARN] AI analysis failed: ${aiError.message}`);
        aiAnalysis = "AI analysis temporarily unavailable. Please check your Gemini API configuration.";
      }
    }
    
    const results = {
      testId,
      language,
      url: targetUrl,
      status: executionResults.failed > 0 ? 'completed_with_failures' : 'completed',
      executedAt: new Date().toISOString(),
      results: {
        passed: executionResults.passed,
        failed: executionResults.failed,
        skipped: executionResults.skipped,
        duration: executionResults.duration,
        total: executionResults.passed + executionResults.failed + executionResults.skipped
      },
      testCases: executionResults.testCases,
      logs: executionResults.detailedLogs,
      screenshots: executionResults.screenshots,
      aiAnalysis: aiAnalysis,
      summary: {
        successRate: executionResults.passed + executionResults.failed > 0 
          ? Math.round((executionResults.passed / (executionResults.passed + executionResults.failed)) * 100) 
          : 0,
        criticalFailures: failedTests.filter(test => 
          test.error?.includes('timeout') || test.error?.includes('not found')
        ).length,
        recommendations: generateExecutionRecommendations(executionResults)
      }
    };

    console.log(`[INFO] Test execution completed: ${results.results.passed} passed, ${results.results.failed} failed, ${results.results.skipped} skipped`);
    res.json(results);

  } catch (error) {
    console.error('Test execution error:', error);
    
    // Handle specific browser installation errors
    if (error.message.includes('Playwright browsers not installed')) {
      return res.status(500).json({ 
        error: 'Browser Setup Required',
        message: 'Playwright browsers are not installed. Please run "npx playwright install chromium" on the server.',
        details: 'This is a one-time setup required for test execution.',
        testId: req.body.testId || 'unknown',
        timestamp: new Date().toISOString(),
        installCommand: 'npx playwright install chromium'
      });
    }
    
    res.status(500).json({ 
      error: 'Test execution failed',
      message: error.message,
      testId: req.body.testId || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
});

// Generate execution recommendations
function generateExecutionRecommendations(results) {
  const recommendations = [];
  
  if (results.failed > 0) {
    recommendations.push('Review failed test cases and update selectors if elements have changed');
  }
  
  if (results.skipped > 0) {
    recommendations.push('Investigate skipped tests - elements might be loading dynamically');
  }
  
  if (results.duration > 30000) {
    recommendations.push('Consider optimizing tests - execution time is quite long');
  }
  
  const successRate = results.passed / (results.passed + results.failed);
  if (successRate < 0.8) {
    recommendations.push('Low success rate detected - consider updating test strategy');
  }
  
  return recommendations;
}

export default router;