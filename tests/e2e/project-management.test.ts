import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should allow creating new projects', async ({ page }) => {
    // Test project selector button
    await page.locator('button:text("No Project")').click();
    
    // Test creating a new project
    await page.locator('button:text("New Project")').click();
    
    // Handle project creation dialog
    page.on('dialog', dialog => {
      dialog.accept('Test Project');
    });
    
    page.on('dialog', dialog => {
      dialog.accept('Test project description');
    });
    
    // Verify project was created
    await expect(page.locator('text=Test Project')).toBeVisible();
  });

  test('should allow loading existing projects', async ({ page }) => {
    // Test project selector button
    await page.locator('button:text("No Project")').click();
    
    // Test loading a project if one exists
    // This would require having pre-existing projects
    await expect(page.locator('text=Load')).toBeVisible();
  });

  test('should allow backing up all projects', async ({ page }) => {
    // Test project selector button
    await page.locator('button:text("No Project")').click();
    
    // Test backup functionality
    await page.locator('button:text("Backup All")').click();
    
    // Check for download dialog or success message
    // Implementation would depend on how the backup works
  });
});