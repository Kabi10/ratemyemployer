import { test, expect } from '@playwright/test';

test.describe('Review Submission', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should show review form', async ({ page }) => {
    await page.click('text=Write Review');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('text=Company')).toBeVisible();
    await expect(page.locator('text=Rating')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('text=Write Review');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Company name is required')).toBeVisible();
    await expect(page.locator('text=Rating is required')).toBeVisible();
  });

  test('should submit review successfully', async ({ page }) => {
    await page.click('text=Write Review');
    await page.fill('input[name="company"]', 'Test Company');
    await page.fill('textarea[name="review"]', 'Great place to work!');
    await page.click('input[name="rating"][value="5"]');
    await page.fill('input[name="pros"]', 'Good benefits');
    await page.fill('input[name="cons"]', 'Long hours');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Review submitted successfully')).toBeVisible();
  });
}); 