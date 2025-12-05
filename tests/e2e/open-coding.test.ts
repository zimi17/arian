import { test, expect } from '@playwright/test';

test.describe('Open Coding Step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Navigate to Open Coding step (assuming we have some data)
    // This would require pre-populating data or using a fixture
  });

  test('should display code list', async ({ page }) => {
    // Test that the code list is displayed
    await expect(page.locator('text=Code List')).toBeVisible();
    
    // Test the search functionality
    const searchInput = page.locator('input[placeholder*="Filter or search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should allow adding new codes', async ({ page }) => {
    // Test adding a new code
    await page.locator('button:text("Add Code")').click();
    
    // Verify the prompt appears
    page.on('dialog', dialog => {
      dialog.accept('Test Code');
    });
    
    // Wait for the code to be added
    await expect(page.locator('text=Test Code')).toBeVisible({ timeout: 5000 });
  });

  test('should allow renaming codes', async ({ page }) => {
    // First, add a code if none exist
    await page.locator('button:text("Add Code")').click();
    
    page.on('dialog', dialog => {
      dialog.accept('Initial Code Name');
    });
    
    // Wait for the code to be added
    await page.waitForTimeout(1000);
    
    // Select the code
    await page.locator('text=Initial Code Name').click();
    
    // Click rename button
    await page.locator('button:text("Rename")').click();
    
    // Rename the code
    page.on('dialog', dialog => {
      dialog.accept('Renamed Code');
    });
    
    // Verify the code was renamed
    await expect(page.locator('text=Renamed Code')).toBeVisible();
  });

  test('should support code visualization views', async ({ page }) => {
    // Test switching to cloud view
    await page.locator('button:text("Word Cloud")').click();
    await expect(page.locator('text=Frequency Visualization')).toBeVisible();
    
    // Test switching back to list view
    await page.locator('button:text("List View")').click();
    await expect(page.locator('text=Segment Viewer')).toBeVisible();
  });
});