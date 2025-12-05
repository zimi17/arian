import { test, expect } from '@playwright/test';

test.describe('Axial Coding Step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Navigate to Axial Coding step
    // This would require pre-populating data or using a fixture
  });

  test('should display category editor', async ({ page }) => {
    // Test that the category editor is displayed
    await expect(page.locator('text=Category Editor')).toBeVisible();
    
    // Test creating a new category
    await page.locator('button:text("New Category")').click();
    
    // Verify new category appears
    await expect(page.locator('input[value="New Category"]')).toBeVisible();
  });

  test('should support drag and drop of codes to categories', async ({ page }) => {
    // Test that drag and drop functionality exists
    await expect(page.locator('.drag-and-drop')).toBeVisible();
    
    // This would test dragging codes from left panel to category boxes
    // Implementation would depend on specific UI structure
  });

  test('should display relationship map', async ({ page }) => {
    // Test switching to relationship map view
    await page.locator('button:text("Relationship Map")').click();
    await expect(page.locator('text=Cluster Insight')).toBeVisible();
  });

  test('should support category editing', async ({ page }) => {
    // Test that categories can be renamed and edited
    await page.locator('text=New Category').first().fill('Updated Category');
    await expect(page.locator('text=Updated Category')).toBeVisible();
  });
});