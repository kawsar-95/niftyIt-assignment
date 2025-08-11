import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testData } from '../fixtures/testData';

// Increase timeout for very slow internet
test.setTimeout(300000); // 5 minutes

test.describe('Denowatts Portal Authentication', () => {
  let page: Page;
  let loginPage: LoginPage;

  test.beforeEach(async ({ browser }) => {
    // Create page with performance optimizations
    const context = await browser.newContext({
      // Disable images and CSS to speed up loading
      ignoreHTTPSErrors: true,
      // Disable some features to speed up loading
      bypassCSP: true,
      // Reduce resource loading
      extraHTTPHeaders: {
        'Accept-Encoding': 'gzip, deflate'
      }
    });

    page = await context.newPage();

    // Disable heavy resources but allow CSS for proper styling in screenshots
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      const url = route.request().url();

      // Allow CSS files for proper styling
      if (resourceType === 'stylesheet') {
        route.continue();
      }
      // Block heavy resources that slow down loading
      else if (['image', 'font', 'media'].includes(resourceType)) {
        route.abort();
      }
      // Block large image files but allow small icons
      else if (resourceType === 'other' && /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(url)) {
        route.abort();
      }
      else {
        route.continue();
      }
    });

    // Set longer navigation timeout for slow internet
    page.setDefaultNavigationTimeout(180000); // 3 minutes
    page.setDefaultTimeout(90000); // 1.5 minutes for other operations

    loginPage = new LoginPage(page);

    // Login once for all tests
    console.log('🔄 Logging in...');
    await loginPage.navigateTo();

    // Take screenshot before login
    await page.screenshot({ path: 'screenshots/before-login.png', fullPage: true });
    console.log('📸 Screenshot taken before login');

    // Debug: Check if login form elements are present
    const emailVisible = await loginPage.emailInput.isVisible();
    const passwordVisible = await loginPage.passwordInput.isVisible();
    const buttonVisible = await loginPage.loginButton.isVisible();

    console.log(`Email input visible: ${emailVisible}`);
    console.log(`Password input visible: ${passwordVisible}`);
    console.log(`Login button visible: ${buttonVisible}`);

    await loginPage.login(testData.user.email, testData.user.password);

    // Take screenshot after login attempt
    await page.screenshot({ path: 'screenshots/after-login-attempt.png', fullPage: true });
    console.log('📸 Screenshot taken after login attempt');

    // Debug: Check current URL
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);

    // Validate login success with longer timeout
    const isDashboardVisible = await loginPage.validateDashboardAccess();
    expect(isDashboardVisible).toBeTruthy();
    console.log('✅ Login successful - Ready for test execution');
  });

  test.afterEach(async () => {
    if (page && !page.isClosed()) {
      await page.close();
    }
  });

  test('Dashboard Access and Screenshots', async () => {
    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(3000);

    // Take screenshot of dashboard
    await page.screenshot({ path: 'screenshots/after-signin.png', fullPage: true });

    // Log current URL for debugging
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    console.log('✅ Dashboard access test completed');
  });

  test('Navigation to Quote Management', async () => {
    // Navigate to Quote Management
    console.log('🔄 Navigating to Quote Management...');

    // Wait for page to be ready and check if it's still open
    if (page.isClosed()) {
      throw new Error('Page has been closed unexpectedly');
    }

    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // Click Settings with longer timeout
    console.log('🔄 Clicking Settings menu...');
    await loginPage.settingsMenu.click({ timeout: 45000 });
    await page.waitForTimeout(3000); // Increased wait time

    // Look for Quote Management menu item
    // Wait for the menu options to appear after clicking Settings
    const menuOptions = page.locator('ul[role="menu"] li, [role="menuitem"]');
    await menuOptions.nth(2).waitFor({ state: 'visible', timeout: 60000 }); // 0-based index, so 2 is the third option

    // Click the third option (Quotation Management)
    const quoteManagementLink = menuOptions.nth(2);

    // Wait for the element to be visible with longer timeout
    await quoteManagementLink.waitFor({ state: 'visible', timeout: 60000 });

    if (await quoteManagementLink.isVisible()) {
      console.log('🔄 Clicking Quote Management link...');
      await quoteManagementLink.click();
      await page.waitForLoadState('networkidle', { timeout: 45000 });

      // Look for New Quote option
      const newQuoteLink = page.locator(`//button[normalize-space()="Create Quote"]`)

      // Wait for New Quote link to be available
      await newQuoteLink.waitFor({ state: 'visible', timeout: 60000 });
      if (await newQuoteLink.isVisible()) {
        console.log('🔄 Clicking New Quote link...');
        await newQuoteLink.click();
        await page.waitForLoadState('networkidle', { timeout: 45000 });

        console.log('✅ Successfully navigated to New Quote page');
        await page.screenshot({ path: 'screenshots/new-quote-page.png', fullPage: true });
      } else {
        console.log('⚠️ New Quote link not found');
      }
    } else {
      console.log('⚠️ Quote Management link not found');
    }
  });
});
