import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('shows login form by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('handles invalid login attempt', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('navigates to sign up form', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  });

  test('validates password requirements on sign up', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('weak');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('handles password reset flow', async ({ page }) => {
    await page.getByText('Forgot Password?').click();
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    await expect(page.getByText('Check Your Email')).toBeVisible();
  });

  test('shows loading state during authentication', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('ValidPass123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should show loading state immediately
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
  });

  test('redirects to dashboard after successful login', async ({ page }) => {
    // Mock successful auth response
    await page.route('**/auth/v1/token?grant_type=password', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: 'fake_token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake_refresh_token',
          user: {
            id: '123',
            email: 'test@example.com',
            role: 'user'
          }
        })
      });
    });

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('ValidPass123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
}); 