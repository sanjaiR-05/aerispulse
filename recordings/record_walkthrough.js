/**
 * AerisPulse Automated 1080p Playwright Walkthrough Recorder
 * High-definition automated judge demonstration
 */

const { chromium } = require('playwright');
const path = require('path');

async function recordWalkthrough() {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: path.join(__dirname, 'output'),
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  console.log(`Starting automated walkthrough recording at ${baseUrl}...`);

  // 1. Load initial dashboard
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 2. Metro Presets Evaluation
  const presets = ['Mumbai Coastal', 'Bengaluru Corridor', 'Chennai Industrial', 'Delhi NCR'];
  for (const preset of presets) {
    console.log(`Selecting preset: ${preset}`);
    await page.getByText(preset).click();
    await page.waitForTimeout(1500);
  }

  // 3. Interactive What-If Simulator Exploration
  console.log('Interacting with Lifestyle Simulator...');
  // Select Metro Rail / Electric Bus
  await page.getByText('Metro Rail / Electric Bus').click();
  await page.waitForTimeout(1000);

  // Select N95 / FFP2 Respirator
  await page.getByText('N95 / FFP2 Respirator').click();
  await page.waitForTimeout(1000);

  // Toggle Indoor HEPA Purifier
  await page.getByRole('switch', { name: /Toggle Indoor True HEPA Air Purifier/i }).click();
  await page.waitForTimeout(1500);

  // 4. Generate Personalized Action Plan
  console.log('Synthesizing GenAI Action Plan...');
  await page.getByRole('button', { name: /Generate Personalized Action Plan/i }).click();
  await page.waitForTimeout(3000);

  // 5. Streaming Grounded Assistant
  console.log('Testing Grounded Streaming Chat Assistant...');
  const chip = page.getByText('Is it safe to jog outside right now?');
  if (await chip.isVisible()) {
    await chip.click();
    await page.waitForTimeout(4000);
  }

  // 6. Test Localization (Tamil and Hindi)
  console.log('Testing Trilingual Localization...');
  await page.getByText('தமிழ்').click();
  await page.waitForTimeout(2000);

  await page.getByText('हिंदी').click();
  await page.waitForTimeout(2000);

  await page.getByText('EN').click();
  await page.waitForTimeout(1500);

  console.log('Walkthrough completed successfully. Saving recording...');
  await context.close();
  await browser.close();
}

if (require.main === module) {
  recordWalkthrough().catch(console.error);
}

module.exports = { recordWalkthrough };
