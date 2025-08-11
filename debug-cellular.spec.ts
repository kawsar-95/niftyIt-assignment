import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('Debug Cellular Data Plan Selection', async ({ page }) => {
  const loginPage = new LoginPage(page);

  console.log('🔧 Testing cellular data plan selection...');

  // Login
  await loginPage.login('automation@denowatts.com', 'Automation!');
  console.log('✅ Login completed');

  // Navigate to Quote Management
  const settingsMenu = page.locator('.ant-dropdown-trigger:has-text("Settings")');
  await settingsMenu.click();
  await page.waitForSelector('text="Quotation Management "', { state: 'visible' });

  const quoteManagementOption = page.locator('text="Quotation Management "');
  await quoteManagementOption.click();
  await page.waitForLoadState('networkidle');

  // Click Create Quote
  const createQuoteButton = page.locator('button:has-text("Create Quote")');
  await createQuoteButton.click();
  await page.waitForLoadState('networkidle');

  // Fill basic form to get to hardware page
  await page.locator('.ant-select-selector:has(input[id="isExistingSite"])').click();
  await page.locator('.ant-select-dropdown .ant-select-item:has-text("Yes, this is a new project to Denowatts")').click();

  await page.fill('input[id="projectName"]', 'Test Project');
  await page.fill('input[id="projectOwner"]', 'Test Company');
  await page.fill('input[id="projectAddress"]', 'Test Address');
  await page.fill('input[id="town"]', 'Test City');

  await page.locator('input[id="state"]').click();
  await page.locator('.ant-select-dropdown .ant-select-item:has-text("Alabama")').click();

  await page.fill('input[id="zipCode"]', '12345');
  await page.fill('input[id="acNameplate"]', '0.5');

  await page.locator('input[id="energizationYear"]').click();
  await page.locator('.ant-select-dropdown .ant-select-item:has-text("2025")').click();

  await page.locator('input[value="new"]').check();
  await page.locator('input[value="GroundFixed"]').check();
  await page.locator('input[value="Monofacial"]').check();

  // Wait for hardware page
  await page.waitForURL('**/quote-management/create');
  await page.waitForSelector('h2:has-text("Required Service")', { timeout: 10000 });

  // Set service level and period first
  await page.locator('.ant-form-item:has(label:text("What service level do you require?")) .ant-select-selector').click();
  await page.locator('.ant-select-dropdown .ant-select-item:has-text("Benchmarking (Basic)")').click();

  await page.locator('.ant-form-item:has(#servicePeriod) .ant-select-selector').click();
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item:has-text("1")').click();

  console.log('✅ Service level and period selected');

  // Now test cellular modem selection
  console.log('🔍 Looking for cellular modem checkbox...');
  const cellularCheckbox = page.locator('#cellModemService');
  await cellularCheckbox.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✅ Found cellular modem checkbox');

  // Take screenshot before clicking
  await page.screenshot({ path: 'screenshots/before-cellular-click.png', fullPage: true });

  await cellularCheckbox.check();
  console.log('✅ Clicked cellular modem checkbox');

  // Wait for any UI changes after clicking cellular modem
  await page.waitForTimeout(3000);

  // Take screenshot after clicking to see what appeared
  await page.screenshot({ path: 'screenshots/after-cellular-click.png', fullPage: true });

  // Check what elements are now on the page
  const pageContent = await page.textContent('body');
  console.log('📄 Page contains "data plan":', pageContent?.toLowerCase().includes('data plan'));
  console.log('📄 Page contains "plan":', pageContent?.toLowerCase().includes('plan'));
  console.log('📄 Page contains "250MB":', pageContent?.toLowerCase().includes('250mb'));
  console.log('📄 Page contains "1GB":', pageContent?.toLowerCase().includes('1gb'));

  // Count all dropdowns on page
  const dropdownCount = await page.locator('.ant-select-selector').count();
  console.log(`📊 Total dropdown elements: ${dropdownCount}`);

  // List all visible dropdowns
  const dropdowns = await page.locator('.ant-select-selector').all();
  for (let i = 0; i < dropdowns.length; i++) {
    const dropdown = dropdowns[i];
    const isVisible = await dropdown.isVisible();
    const text = await dropdown.textContent();
    console.log(`  Dropdown ${i + 1}: visible=${isVisible}, text="${text?.trim()}"`);
  }

  // Look for any elements that might be related to data plans
  const dataPlanElements = await page.locator('*:has-text("data plan")').count();
  console.log(`📊 Elements containing "data plan": ${dataPlanElements}`);

  const planElements = await page.locator('*:has-text("plan")').count();
  console.log(`📊 Elements containing "plan": ${planElements}`);

  // Try to find the data plan dropdown more systematically
  const possibleDataPlanSelectors = [
    '.ant-select-selector:has-text("Select data plan")',
    '.ant-select-selector:has-text("data plan")',
    '.ant-select-selector:has-text("Plan")',
    '.ant-form-item:has(label:text("Data Plan")) .ant-select-selector',
    '.ant-form-item:has(label:text("Cellular Data Plan")) .ant-select-selector',
    'div:has-text("Data Plan") + .ant-select .ant-select-selector'
  ];

  console.log('🔍 Searching for data plan dropdown...');
  for (const selector of possibleDataPlanSelectors) {
    try {
      const element = page.locator(selector);
      const count = await element.count();
      const isVisible = count > 0 ? await element.first().isVisible() : false;
      console.log(`  ${selector}: count=${count}, visible=${isVisible}`);
    } catch (error) {
      console.log(`  ${selector}: error - ${error}`);
    }
  }

  console.log('🔧 Debug completed - check screenshots for UI state');
});
