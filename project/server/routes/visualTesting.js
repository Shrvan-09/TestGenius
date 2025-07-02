import express from 'express';
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create directories for videos and screenshots
const videosDir = join(__dirname, '../videos');
const screenshotsDir = join(__dirname, '../screenshots');
const overlaysDir = join(__dirname, '../overlays');

[videosDir, screenshotsDir, overlaysDir].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Color palette for different UI element types (inspired by displaCy)
const ELEMENT_COLORS = {
  button: '#FF6B6B',      // Red
  input: '#4ECDC4',       // Teal
  form: '#45B7D1',        // Blue
  link: '#96CEB4',        // Green
  text: '#FFEAA7',        // Yellow
  image: '#DDA0DD',       // Plum
  navigation: '#98D8C8',   // Mint
  interactive: '#F7DC6F', // Gold
  container: '#BB8FCE',   // Light Purple
  default: '#85C1E9'      // Light Blue
};

// UI element selectors with priorities
const ELEMENT_SELECTORS = [
  { 
    name: 'Navigation Links', 
    selector: 'nav a, .nav a, .navbar a, .menu a, [role="navigation"] a',
    color: ELEMENT_COLORS.navigation,
    priority: 1
  },
  { 
    name: 'Primary Buttons', 
    selector: 'button[type="submit"], .btn-primary, .primary-btn, .cta-button',
    color: ELEMENT_COLORS.button,
    priority: 2
  },
  { 
    name: 'Form Inputs', 
    selector: 'input[type="text"], input[type="email"], input[type="password"], textarea',
    color: ELEMENT_COLORS.input,
    priority: 3
  },
  { 
    name: 'Interactive Buttons', 
    selector: 'button, .btn, input[type="button"], input[type="submit"]',
    color: ELEMENT_COLORS.interactive,
    priority: 4
  },
  { 
    name: 'Forms', 
    selector: 'form',
    color: ELEMENT_COLORS.form,
    priority: 5
  },
  { 
    name: 'Links', 
    selector: 'a[href]',
    color: ELEMENT_COLORS.link,
    priority: 6
  },
  { 
    name: 'Images', 
    selector: 'img',
    color: ELEMENT_COLORS.image,
    priority: 7
  },
  { 
    name: 'Text Areas', 
    selector: 'p, h1, h2, h3, h4, h5, h6, .text-content',
    color: ELEMENT_COLORS.text,
    priority: 8
  }
];

// Function to inject overlay styles and scripts
async function injectOverlaySystem(page) {
  await page.addStyleTag({
    content: `
      .testgenius-overlay {
        position: absolute !important;
        border: 2px solid !important;
        background: rgba(255, 255, 255, 0.1) !important;
        z-index: 999999 !important;
        pointer-events: none !important;
        box-sizing: border-box !important;
        border-radius: 4px !important;
        animation: testgenius-pulse 2s infinite !important;
      }
      
      .testgenius-label {
        position: absolute !important;
        top: -25px !important;
        left: 0 !important;
        background: rgba(0, 0, 0, 0.8) !important;
        color: white !important;
        padding: 2px 8px !important;
        border-radius: 3px !important;
        font-size: 12px !important;
        font-family: Arial, sans-serif !important;
        white-space: nowrap !important;
        z-index: 1000000 !important;
        pointer-events: none !important;
      }
      
      @keyframes testgenius-pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
        70% { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }
      
      .testgenius-step-indicator {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: rgba(0, 0, 0, 0.9) !important;
        color: white !important;
        padding: 10px 20px !important;
        border-radius: 8px !important;
        font-size: 16px !important;
        font-family: Arial, sans-serif !important;
        z-index: 1000001 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
      }
    `
  });

  await page.addScriptTag({
    content: `
      window.testGeniusOverlay = {
        overlays: [],
        
        addOverlay: function(element, color, label, stepCount) {
          const rect = element.getBoundingClientRect();
          
          // Create overlay div
          const overlay = document.createElement('div');
          overlay.className = 'testgenius-overlay';
          overlay.style.borderColor = color;
          overlay.style.left = (rect.left + window.scrollX) + 'px';
          overlay.style.top = (rect.top + window.scrollY) + 'px';
          overlay.style.width = rect.width + 'px';
          overlay.style.height = rect.height + 'px';
          
          // Create label
          const labelDiv = document.createElement('div');
          labelDiv.className = 'testgenius-label';
          labelDiv.textContent = label;
          overlay.appendChild(labelDiv);
          
          // Add step indicator
          let stepIndicator = document.querySelector('.testgenius-step-indicator');
          if (!stepIndicator) {
            stepIndicator = document.createElement('div');
            stepIndicator.className = 'testgenius-step-indicator';
            document.body.appendChild(stepIndicator);
          }
          stepIndicator.textContent = 'Step ' + stepCount + ': Analyzing ' + label;
          
          document.body.appendChild(overlay);
          this.overlays.push(overlay);
          
          return overlay;
        },
        
        clearOverlays: function() {
          this.overlays.forEach(overlay => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          });
          this.overlays = [];
        },
        
        highlightElements: function(selector, color, label, stepCount) {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element, index) => {
            if (element.offsetWidth > 0 && element.offsetHeight > 0) {
              this.addOverlay(element, color, label + ' ' + (index + 1), stepCount);
            }
          });
          return elements.length;
        }
      };
    `
  });
}

// Main visual testing function
async function performVisualTesting(url, testId) {
  let browser;
  const results = {
    testId,
    url,
    timestamp: new Date().toISOString(),
    steps: [],
    screenshots: [],
    videoPath: null,
    summary: {
      totalElements: 0,
      elementTypes: {},
      testDuration: 0
    }
  };

  try {
    const startTime = Date.now();
    
    // Launch browser with video recording
    browser = await chromium.launch({
      headless: true, // Set to true for headless environments like Codespaces
      slowMo: 1000, // Slow down for better video capture
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: videosDir,
        size: { width: 1280, height: 720 }
      }
    });

    const page = await context.newPage();
    
    // Navigate to the URL
    console.log(`Starting visual testing for: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Inject overlay system
    await injectOverlaySystem(page);
    
    // Take initial screenshot
    const initialScreenshot = `${testId}-initial.png`;
    await page.screenshot({ 
      path: join(screenshotsDir, initialScreenshot),
      fullPage: true 
    });
    results.screenshots.push(initialScreenshot);

    let stepCount = 1;
    
    // Process each element type step by step
    for (const elementType of ELEMENT_SELECTORS) {
      console.log(`Step ${stepCount}: Analyzing ${elementType.name}`);
      
      // Clear previous overlays
      await page.evaluate(() => {
        window.testGeniusOverlay.clearOverlays();
      });
      
      // Highlight current element type
      const elementCount = await page.evaluate(
        ({ selector, color, label, step }) => {
          return window.testGeniusOverlay.highlightElements(selector, color, label, step);
        },
        {
          selector: elementType.selector,
          color: elementType.color,
          label: elementType.name,
          step: stepCount
        }
      );
      
      if (elementCount > 0) {
        // Wait for animation and user to see the highlights
        await page.waitForTimeout(3000);
        
        // Take screenshot of this step
        const stepScreenshot = `${testId}-step-${stepCount}-${elementType.name.replace(/\s+/g, '_')}.png`;
        await page.screenshot({ 
          path: join(screenshotsDir, stepScreenshot),
          fullPage: true 
        });
        
        // Record step details
        const stepDetails = {
          step: stepCount,
          elementType: elementType.name,
          selector: elementType.selector,
          color: elementType.color,
          elementsFound: elementCount,
          screenshot: stepScreenshot,
          timestamp: new Date().toISOString()
        };
        
        results.steps.push(stepDetails);
        results.screenshots.push(stepScreenshot);
        results.summary.totalElements += elementCount;
        results.summary.elementTypes[elementType.name] = elementCount;
        
        console.log(`Found ${elementCount} ${elementType.name} elements`);
        stepCount++;
      }
    }
    
    // Final step - show all elements together
    console.log(`Step ${stepCount}: Final Overview`);
    await page.evaluate(() => {
      window.testGeniusOverlay.clearOverlays();
    });
    
    // Add all elements with their respective colors
    let totalFinalElements = 0;
    for (const elementType of ELEMENT_SELECTORS) {
      const count = await page.evaluate(
        ({ selector, color, label, step }) => {
          return window.testGeniusOverlay.highlightElements(selector, color, label, step);
        },
        {
          selector: elementType.selector,
          color: elementType.color,
          label: elementType.name,
          step: stepCount
        }
      );
      totalFinalElements += count;
    }
    
    await page.waitForTimeout(4000);
    
    // Final screenshot
    const finalScreenshot = `${testId}-final-overview.png`;
    await page.screenshot({ 
      path: join(screenshotsDir, finalScreenshot),
      fullPage: true 
    });
    
    results.steps.push({
      step: stepCount,
      elementType: 'Final Overview',
      selector: 'all',
      elementsFound: totalFinalElements,
      screenshot: finalScreenshot,
      timestamp: new Date().toISOString()
    });
    results.screenshots.push(finalScreenshot);
    
    // Calculate test duration
    results.summary.testDuration = Date.now() - startTime;
    
    // Get video path before closing context
    const firstPage = context.pages()[0];
    const videoPath = firstPage.video() ? await firstPage.video().path() : null;
    results.videoPath = videoPath;
    
    // Close browser and save video
    await context.close();
    await browser.close();
    
    console.log(`Visual testing completed for ${url}`);
    console.log(`Total elements found: ${results.summary.totalElements}`);
    console.log(`Test duration: ${results.summary.testDuration}ms`);
    
    return results;
    
  } catch (error) {
    console.error('Visual testing failed:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

// API endpoint for visual testing
router.post('/visual-test', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const testId = uuidv4();
    console.log(`Starting visual test ${testId} for URL: ${url}`);
    
    const results = await performVisualTesting(url, testId);
    
    res.json({
      success: true,
      testId,
      results
    });
    
  } catch (error) {
    console.error('Visual testing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// API endpoint to get test results
router.get('/test-results/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    
    // In a real implementation, you'd fetch this from a database
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      message: 'Test results endpoint - implement database storage for persistence'
    });
    
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
