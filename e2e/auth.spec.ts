import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login form', async ({ page }) => {
    await page.click('text=Sign In');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Password')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.click('text=Sign In');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
}); 