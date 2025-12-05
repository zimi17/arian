import { test, expect } from '@playwright/test';

// Test suite for the Qualitative Analysis Application
test.describe('Qualitative Analysis App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173'); // Adjust URL as needed
  });

  test('should load the application and show main UI elements', async ({ page }) => {
    // Check if main UI elements are present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=Aplikasi Coding Etnografer')).toBeVisible();
    await expect(page.locator('text=Tugas Analisis Data Penelitian')).toBeVisible();
    await expect(page.locator('text=PDIA - Universitas Jenderal Soedirman')).toBeVisible();
    await expect(page.locator('text=Input')).toBeVisible();
  });

  test('should allow user to add data in Input step', async ({ page }) => {
    // Verify we're on the input step
    await expect(page.locator('text=Add New Data')).toBeVisible();
    
    // Test adding dataset name
    await page.locator('input[placeholder*="Dataset Name"]').fill('Test Dataset');
    
    // Test adding text content
    await page.locator('textarea').fill('This is a test segment for analysis.\n\nThis is another segment.');
    
    // Test word count functionality
    await expect(page.locator('text=12').first()).toBeVisible(); // Word count
    
    // Test adding the dataset
    await page.locator('button:text("Add to Project")').click();
    
    // Verify dataset was added
    await expect(page.locator('text=Test Dataset')).toBeVisible();
  });

  test('should handle file uploads', async ({ page }) => {
    // Test file upload functionality
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Note: Actual file upload would require test fixtures
    // This test verifies the upload UI is present
    await expect(page.locator('button:text("Upload")').first()).toBeVisible();
  });

  test('should navigate between analysis steps', async ({ page }) => {
    // Test navigation from Input to Open Coding
    await page.locator('button:text("Analyze All Datasets")').click();
    await page.waitForTimeout(1500); // Wait for processing
    
    // Check if we're in Open Coding step
    await expect(page.locator('text=Code List')).toBeVisible();
  });
});