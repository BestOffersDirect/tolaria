import { chromium } from '@playwright/test';

const baseUrl = 'http://localhost:5173';
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

page.on('pageerror', error => {
  errors.push(error.message);
});

// Check landing
console.log('Checking landing page...');
await page.goto(baseUrl);
await page.waitForLoadState('networkidle');

const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
console.log('Canonical:', canonical);

const robotsMeta = await page.locator('meta[name="robots"]').count();
console.log('Robots meta tag:', robotsMeta === 0 ? 'Not present (good)' : 'Present');

// Check search
console.log('\nChecking search...');
await page.goto(`${baseUrl}/docs`);
await page.waitForLoadState('networkidle');

try {
  await page.click('button[aria-label="Search"]', { timeout: 5000 });
  await page.waitForSelector('.DocSearch-Input', { state: 'visible', timeout: 5000 });
  await page.type('.DocSearch-Input', 'install');
  await page.waitForTimeout(1000);
  const results = await page.locator('.DocSearch-Hit').count();
  console.log(`Search works: found ${results} results for "install"`);
} catch (e) {
  console.log('Search check failed:', e.message);
}

// Check 404s
console.log('\nChecking expected 404s...');
for (const path of ['/sw.js', '/robots.txt']) {
  const response = await page.goto(`${baseUrl}${path}`);
  console.log(`${path}: ${response.status()} ${response.status() === 404 ? '✓' : '✗'}`);
}

// Check key paths exist
console.log('\nChecking key paths...');
const paths = ['/', '/docs', '/start/install', '/concepts/vaults', '/guides/capture-a-note', '/reference/supported-platforms', '/troubleshooting/vault-not-loading'];
for (const path of paths) {
  const response = await page.goto(`${baseUrl}${path}`);
  console.log(`${path}: ${response.status()} ${response.status() === 200 ? '✓' : '✗'}`);
}

console.log('\nConsole errors:', errors.length === 0 ? 'None ✓' : errors.join('\n'));

await browser.close();
