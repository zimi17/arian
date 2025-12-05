import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should open global search modal', async ({ page }) => {
    // Test opening search modal with keyboard shortcut
    await page.keyboard.press('Control+K'); // For Windows/Linux
    // Or await page.keyboard.press('Meta+K'); // For Mac
    
    // Verify search modal appears
    await expect(page.locator('text=Search Across Project')).toBeVisible();
  });

  test('should allow searching for codes', async ({ page }) => {
    // Open search modal
    await page.locator('button:text("Search")').click();
    await expect(page.locator('text=Search Across Project')).toBeVisible();
    
    // Enter search term
    await page.locator('input[placeholder*="Search"]').fill('test');
    
    // Verify search results appear
    await expect(page.locator('text=No results found')).toBeVisible();
    // Or verify results appear if test codes exist
  });

  test('should allow searching for categories', async ({ page }) => {
    // Open search modal
    await page.locator('button:text("Search")').click();
    
    // Enter search term for category
    await page.locator('input[placeholder*="Search"]').fill('category');
    
    // Verify search results appear
    await expect(page.locator('.search-result')).toBeVisible();
  });

  test('should allow searching for segments', async ({ page }) => {
    // Open search modal
    await page.locator('button:text("Search")').click();
    
    // Enter search term for segment
    await page.locator('input[placeholder*="Search"]').fill('segment');
    
    // Verify search results appear
    await expect(page.locator('.search-result')).toBeVisible();
  });

  test('should navigate to search results', async ({ page }) => {
    // Open search modal
    await page.locator('button:text("Search")').click();
    
    // Enter search term
    await page.locator('input[placeholder*="Search"]').fill('test');
    
    // Click on a result (if any)
    await page.locator('.search-result').first().click();
    
    // Verify navigation to result location
    // Implementation would depend on specific navigation behavior
  });
});