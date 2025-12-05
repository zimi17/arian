import { test, expect } from '@playwright/test';

test.describe('Visualization Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should switch to network graph view', async ({ page }) => {
    // Navigate to Open Coding step
    // Then switch to visualization view
    
    // Click View tab
    await page.locator('text=View').click();
    
    // Click Visualization button
    await page.locator('button:text("Visualization")').click();
    
    // Verify visualization view is active
    await expect(page.locator('text=Interactive Visualizations')).toBeVisible();
  });

  test('should display network graph', async ({ page }) => {
    // Navigate to visualization view
    await page.locator('text=View').click();
    await page.locator('button:text("Visualization")').click();
    
    // Click Network Graph tab
    await page.locator('button:text("Network Graph")').click();
    
    // Verify network graph is displayed
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should display frequency charts', async ({ page }) => {
    // Navigate to visualization view
    await page.locator('text=View').click();
    await page.locator('button:text("Visualization")').click();
    
    // Click Charts tab
    await page.locator('button:text("Frequency Charts")').click();
    
    // Verify charts are displayed
    await expect(page.locator('text=Code Frequency - Bar Chart')).toBeVisible();
  });

  test('should display kanban board', async ({ page }) => {
    // Navigate to visualization view
    await page.locator('text=View').click();
    await page.locator('button:text("Visualization")').click();
    
    // Click Kanban Board tab
    await page.locator('button:text("Kanban Board")').click();
    
    // Verify kanban board is displayed
    await expect(page.locator('text=Unassigned Codes')).toBeVisible();
  });

  test('should display quality metrics dashboard', async ({ page }) => {
    // Navigate to visualization view
    await page.locator('text=View').click();
    await page.locator('button:text("Visualization")').click();
    
    // Click Quality Metrics tab
    await page.locator('button:text("Quality Metrics")').click();
    
    // Verify quality metrics dashboard is displayed
    await expect(page.locator('text=Quality Metrics Dashboard')).toBeVisible();
  });

  test('should allow fullscreen visualization', async ({ page }) => {
    // Navigate to visualization view
    await page.locator('text=View').click();
    await page.locator('button:text("Visualization")').click();
    
    // Click fullscreen button
    await page.locator('button[title*="Enter fullscreen"]').click();
    
    // Verify fullscreen mode
    await expect(page.locator('button[title*="Exit fullscreen"]')).toBeVisible();
  });
});