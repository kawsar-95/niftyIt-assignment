import { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly settingsMenu: Locator;
  private dashboardElements: Locator;
  private settingsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // More comprehensive selectors for React-based forms
    this.emailInput = page.locator([
      'input[id="email"]',
      'input[name="email"]',
      'input[type="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="Email" i]',
      'input[placeholder*="username" i]',
      'input[placeholder*="Username" i]',
      '#email',
      '.email-input',
      '[data-testid="email"]',
      '[data-testid="email-input"]',
      'form input:first-of-type',
      'input:first-of-type'
    ].join(', '));

    this.passwordInput = page.locator([
      'input[type="password"]',
      'input[name="password"]',
      'input[id="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="Password" i]',
      '#password',
      '.password-input',
      '[data-testid="password"]',
      '[data-testid="password-input"]'
    ].join(', '));

    this.loginButton = page.locator([
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      'button:has-text("LOG IN")',
      'button:has-text("SIGN IN")',
      '.ant-btn:has-text("Sign In")',
      '.ant-btn:has-text("Login")',
      '[data-testid="login"]',
      '[data-testid="submit"]',
      'input[type="submit"]',
      'form button',
      'button'
    ].join(', '));

    // Dashboard verification selectors
    this.dashboardElements = page.locator('[data-testid="dashboard"], .dashboard, [class*="dashboard"], h1:has-text("Dashboard"), h2:has-text("Dashboard")');
    this.settingsButton = page.locator('button:has-text("Settings"), [data-testid="settings"], .settings-button, [class*="settings"]');
    // More flexible selectors for settings menu
    this.settingsMenu = page.locator(`svg[aria-label='Settings']`);
  }

  async navigateTo() {
    console.log('🌐 Navigating to login page...');

    // Navigate and wait for network to settle
    await this.page.goto('https://dev.portal.denowatts.com/signin', {
      waitUntil: 'networkidle', // Wait for network to be idle (React app loaded)
      timeout: 120000 // 2 minutes
    });

    console.log('✅ Navigation successful');

    // Check if we actually loaded the page
    const currentUrl = this.page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);

    // Wait for React app to render - look for any form element to appear
    console.log('⏳ Waiting for React app to render...');
    await this.page.waitForFunction(() => {
      return document.querySelector('input') !== null ||
        document.querySelector('form') !== null ||
        document.querySelector('[class*="form"]') !== null ||
        document.querySelector('[id*="email"]') !== null;
    }, { timeout: 60000 });

    console.log('✅ React app rendered successfully');
  }

  async login(email: string, password: string) {
    console.log('🔑 Attempting to login...');

    // Wait for form elements to be visible with longer timeout
    console.log('⏳ Waiting for login form elements...');

    try {
      await this.emailInput.waitFor({ state: 'visible', timeout: 30000 });
      console.log('✅ Email input found');
    } catch (error) {
      console.log('❌ Email input not found. Debugging...');

      // Debug: Check what inputs are actually on the page
      const allInputs = await this.page.locator('input').count();
      console.log(`Found ${allInputs} input elements total`);

      // Try to get first input regardless of type
      const firstInput = this.page.locator('input').first();
      if (await firstInput.count() > 0) {
        console.log('Found first input element, will use it as email input');
        // Use first input as email input
        await firstInput.waitFor({ state: 'visible', timeout: 10000 });
        await firstInput.clear();
        await firstInput.fill(email);
        console.log('✅ Email filled in first input');
      } else {
        throw new Error('No input elements found on page');
      }
    }

    try {
      await this.passwordInput.waitFor({ state: 'visible', timeout: 30000 });
      console.log('✅ Password input found');
    } catch (error) {
      console.log('❌ Password input not found. Using second input...');

      // Try to get second input for password
      const secondInput = this.page.locator('input').nth(1);
      if (await secondInput.count() > 0) {
        console.log('Found second input element, will use it as password input');
        await secondInput.waitFor({ state: 'visible', timeout: 10000 });
        await secondInput.clear();
        await secondInput.fill(password);
        console.log('✅ Password filled in second input');
      } else {
        throw new Error('No second input element found for password');
      }
    }

    // If we got here using the original selectors, fill normally
    try {
      if (await this.emailInput.first().isVisible() && await this.passwordInput.first().isVisible()) {
        console.log('📝 Filling email field...');
        await this.emailInput.first().clear();
        await this.emailInput.first().fill(email);

        console.log('📝 Filling password field...');
        await this.passwordInput.first().clear();
        await this.passwordInput.first().fill(password);
      }
    } catch (error) {
      console.log('⚠️ Using fallback direct input filling...');
      // Use direct input selectors
      await this.page.locator('#email').fill(email);
      await this.page.locator('#password').fill(password);
    }

    // Wait for and click login button
    console.log('🔘 Looking for login button...');
    try {
      await this.loginButton.waitFor({ state: 'visible', timeout: 15000 });
      console.log('🔘 Clicking login button...');
      await this.loginButton.click();
    } catch (error) {
      console.log('❌ Login button not found. Looking for any button...');

      // Try to find any button on the page
      const anyButton = this.page.locator('button').first();
      if (await anyButton.count() > 0) {
        console.log('Found a button, clicking it...');
        await anyButton.click();
      } else {
        // Try form submit
        console.log('No buttons found, trying form submit...');
        await this.page.keyboard.press('Enter');
      }
    }

    // Wait for navigation after login
    console.log('⏳ Waiting for login response...');
    await this.page.waitForTimeout(5000); // Give time for response

    // Wait for navigation, but with a reasonable timeout
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });

    console.log('✅ Login form submitted');
  }

  async validateDashboardAccess() {
    // Wait for potential redirects and check for settings menu or dashboard elements
    await this.page.waitForTimeout(5000);

    // Check if we're on a dashboard-like page (flexible URL matching)
    const currentUrl = this.page.url();
    const isDashboardUrl = currentUrl.includes('dashboard') ||
      currentUrl.includes('portal.denowatts.com') &&
      !currentUrl.includes('signin') &&
      !currentUrl.includes('signup');

    // Try to find settings menu or other dashboard indicators
    const settingsVisible = await this.settingsMenu.isVisible().catch(() => false);

    // Alternative dashboard indicators
    const dashboardIndicators = [
      'text=Dashboard',
      'text=Welcome',
      'text=Quote Management',
      'text=Profile',
      'text=Account',
      '[data-testid="dashboard"]',
      '.dashboard',
      '#dashboard'
    ];

    let hasValidDashboardElement = false;
    for (const selector of dashboardIndicators) {
      if (await this.page.locator(selector).isVisible()) {
        hasValidDashboardElement = true;
        break;
      }
    }

    return settingsVisible || hasValidDashboardElement || isDashboardUrl;
  }
}
