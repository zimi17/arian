import { test, expect } from '@playwright/test';

test.describe('User Preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should open preferences modal', async ({ page }) => {
    // Click the Settings button
    await page.locator('button[title="User Preferences"]').click();
    
    // Verify preferences modal appears
    await expect(page.locator('text=User Preferences')).toBeVisible();
  });

  test('should change theme setting', async ({ page }) => {
    // Open preferences
    await page.locator('button[title="User Preferences"]').click();
    
    // Click on Dark theme option
    await page.locator('button:text("Dark")').click();
    
    // Save preferences
    await page.locator('button:text("Save Preferences")').click();
    
    // Verify a change that indicates dark theme is active
    // This would depend on how the theme is implemented
  });

  test('should change font size setting', async ({ page }) => {
    // Open preferences
    await page.locator('button[title="User Preferences"]').click();
    
    // Click on Large font option
    await page.locator('button:text("Large")').click();
    
    // Save preferences
    await page.locator('button:text("Save Preferences")').click();
    
    // Verify font size change
    // This would require checking computed styles or class changes
  });

  test('should reset preferences to defaults', async ({ page }) => {
    // Open preferences
    await page.locator('button[title="User Preferences"]').click();
    
    // Click reset button
    await page.locator('button:text("Reset to Defaults")').click();
    
    // Confirm reset if needed
    page.on('dialog', dialog => {
      dialog.accept();
    });
    
    // Save to apply defaults
    await page.locator('button:text("Save Preferences")').click();
  });
});