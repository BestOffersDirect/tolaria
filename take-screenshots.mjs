import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const baseUrl = 'http://localhost:5173';
const outputDir = '/tmp/site-screenshots';

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

// Light mode screenshots
const lightContext = await browser.newContext({ colorScheme: 'light', viewport: { width: 1280, height: 800 } });
const lightPage = await lightContext.newPage();

console.log('Landing light...');
await lightPage.goto(baseUrl);
await lightPage.waitForLoadState('networkidle');
await lightPage.screenshot({ path: `${outputDir}/landing-light.png`, fullPage: true });

console.log('Docs light...');
await lightPage.goto(`${baseUrl}/docs`);
await lightPage.waitForLoadState('networkidle');
await lightPage.screenshot({ path: `${outputDir}/docs-light.png`, fullPage: true });

console.log('Doc page light...');
await lightPage.goto(`${baseUrl}/start/install`);
await lightPage.waitForLoadState('networkidle');
await lightPage.screenshot({ path: `${outputDir}/doc-page-light.png`, fullPage: true });

await lightContext.close();

// Dark mode screenshots
const darkContext = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 800 } });
const darkPage = await darkContext.newPage();

console.log('Landing dark...');
await darkPage.goto(baseUrl);
await darkPage.waitForLoadState('networkidle');
await darkPage.screenshot({ path: `${outputDir}/landing-dark.png`, fullPage: true });

console.log('Docs dark...');
await darkPage.goto(`${baseUrl}/docs`);
await darkPage.waitForLoadState('networkidle');
await darkPage.screenshot({ path: `${outputDir}/docs-dark.png`, fullPage: true });

console.log('Doc page dark...');
await darkPage.goto(`${baseUrl}/start/install`);
await darkPage.waitForLoadState('networkidle');
await darkPage.screenshot({ path: `${outputDir}/doc-page-dark.png`, fullPage: true });

await darkContext.close();
await browser.close();

console.log('Done! Screenshots saved to', outputDir);
