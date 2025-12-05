import { test, expect } from '@playwright/test';

test.describe('Selective Coding Step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Navigate to Selective Coding step
    // This would require pre-populating data or using a fixture
  });

  test('should display theoretical narrative', async ({ page }) => {
    // Test that the theoretical narrative section is displayed
    await expect(page.locator('text=Theoretical Narrative')).toBeVisible();
    
    // Test that theory confidence is displayed
    await expect(page.locator('text=Theory Confidence')).toBeVisible();
  });

  test('should allow narrative editing', async ({ page }) => {
    // Test switching to edit mode
    await page.locator('button:text("Edit Narrative")').click();
    
    // Verify edit interface appears
    await expect(page.locator('text=Save Changes')).toBeVisible();
    
    // Test saving changes
    await page.locator('button:text("Save Changes")').click();
    await expect(page.locator('text=Edit Narrative')).toBeVisible();
  });

  test('should display core concept cloud', async ({ page }) => {
    // Test that core concept visualization is visible
    await expect(page.locator('text=Core Concept Cloud')).toBeVisible();
  });
});