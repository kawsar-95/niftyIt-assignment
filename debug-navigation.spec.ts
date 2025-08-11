import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { QuoteCreationPage } from './pages/QuoteCreationPage';

test('Debug Navigation Flow', async ({ page }) => {
  // Login first
  const loginPage = new LoginPage(page);
  const quoteCreationPage = new QuoteCreationPage(page);

  console.log('🔧 Starting navigation debug...');

  // Step 1: Login
  await loginPage.login('automation@denowatts.com', 'Automation!');
  console.log('✅ Login completed');

  // Step 2: Navigate to Quote Creation (same as actual test)
  console.log('🔄 Navigating to Quote Management...');

  // Click Settings dropdown
  const settingsMenu = page.locator('.ant-dropdown-trigger:has-text("Settings")');
  await settingsMenu.waitFor({ state: 'visible', timeout: 10000 });
  await settingsMenu.click();
  console.log('🔄 Clicking Settings menu...');

  // Wait for settings menu to expand
  await page.waitForSelector('text="Quotation Management "', { state: 'visible', timeout: 5000 });

  // Click Quote Management option
  const quoteManagementOption = page.locator('text="Quotation Management "');
  await quoteManagementOption.waitFor({ state: 'visible', timeout: 10000 });
  await quoteManagementOption.click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  console.log('✅ Reached Quote Management page');

  // Click Create Quote button
  const createQuoteButton = page.locator('button:has-text("Create Quote")');
  await createQuoteButton.waitFor({ state: 'visible', timeout: 10000 });
  await createQuoteButton.click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  console.log('✅ Navigation to quote creation completed');

  // Step 3: Take screenshot and debug current page
  await page.screenshot({ path: 'screenshots/debug-current-page.png', fullPage: true });

  // Check current URL
  const currentUrl = page.url();
  console.log(`📍 Current URL: ${currentUrl}`);

  // Check page title
  const title = await page.title();
  console.log(`📄 Page Title: ${title}`);

  // Check for key elements
  const hasQuoteForm = await page.locator('.ant-form').count();
  console.log(`📋 Forms found: ${hasQuoteForm}`);

  const hasCreateButton = await page.locator('button:has-text("Create")').count();
  console.log(`🔲 Create buttons: ${hasCreateButton}`);

  const hasServiceLevel = await page.locator('label:has-text("What service level")').count();
  console.log(`🎯 Service level labels: ${hasServiceLevel}`);

  // Check page content for debugging
  const bodyText = await page.textContent('body');
  const pageKeywords = [
    'project',
    'quote',
    'service',
    'hardware',
    'solar',
    'nameplate',
    'mounting'
  ];

  console.log('📄 Page content analysis:');
  for (const keyword of pageKeywords) {
    const found = bodyText?.toLowerCase().includes(keyword.toLowerCase()) || false;
    console.log(`  - "${keyword}": ${found ? '✅' : '❌'}`);
  }

  // List all visible form elements
  const formElements = await page.locator('input, select, button').all();
  console.log(`📋 Found ${formElements.length} form elements`);

  for (let i = 0; i < Math.min(formElements.length, 10); i++) {
    const element = formElements[i];
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    const type = await element.evaluate(el => el.getAttribute('type') || '');
    const id = await element.evaluate(el => el.id || '');
    const placeholder = await element.evaluate(el => el.getAttribute('placeholder') || '');

    console.log(`  ${i + 1}. ${tagName}${type ? `[${type}]` : ''} id="${id}" placeholder="${placeholder}"`);
  }
});
