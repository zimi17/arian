import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should open global search with Ctrl+K', async ({ page }) => {
    // Press Ctrl+K keyboard shortcut
    await page.keyboard.press('Control+K');
    
    // Verify search modal appears
    await expect(page.locator('text=Search Across Project')).toBeVisible();
  });

  test('should create new project with Ctrl+Shift+N', async ({ page }) => {
    // Press Ctrl+Shift+N keyboard shortcut
    await page.keyboard.press('Control+Shift+N');
    
    // This should trigger the new project creation
    // The actual behavior depends on implementation
    page.on('dialog', dialog => {
      dialog.accept('Test Project from Shortcut');
    });
    
    page.on('dialog', dialog => {
      dialog.accept('Created via keyboard shortcut');
    });
    
    // Verify project was created
    await expect(page.locator('text=Test Project from Shortcut')).toBeVisible();
  });

  test('should navigate between steps with arrow keys', async ({ page }) => {
    // Press Ctrl+ArrowRight to go to next step
    await page.keyboard.press('Control+ArrowRight');
    
    // This would navigate from Input to Open Coding step
    await expect(page.locator('text=Code List')).toBeVisible();
    
    // Press Ctrl+ArrowLeft to go back
    await page.keyboard.press('Control+ArrowLeft');
    
    // This should go back to Input step
    await expect(page.locator('text=Add New Data')).toBeVisible();
  });

  test('should open add code dialog with Ctrl+Shift+C', async ({ page }) => {
    // Press Ctrl+Shift+C keyboard shortcut
    await page.keyboard.press('Control+Shift+C');
    
    // This should navigate to open coding step
    // The behavior depends on implementation
    await expect(page.locator('text=Add Code')).toBeVisible();
  });
});