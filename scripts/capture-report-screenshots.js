'use strict';

// Capture genuine HTML report pages produced by this exact CI run.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('@playwright/test');

async function capture(browser, source, output) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing generated report: ${source}`);
  }
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 1,
  });
  try {
    await page.goto(pathToFileURL(path.resolve(source)).toString(), {
      waitUntil: 'domcontentloaded',
    });
    await page.screenshot({ path: output, fullPage: false });
    console.log(`Captured ${output} from ${source}`);
  } finally {
    await page.close();
  }
}

(async () => {
  fs.mkdirSync('reports/screenshots', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    await capture(browser, 'coverage/index.html', 'reports/screenshots/real-jest-coverage.png');
    await capture(
      browser,
      'reports/playwright-html/index.html',
      'reports/screenshots/real-playwright-report.png',
    );
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
