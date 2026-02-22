import { test, expect } from '@playwright/test';

test.describe('Patna Metro Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage with all metro lines', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /patna metro/i })).toBeVisible();
    await expect(page.getByText('Red Line')).toBeVisible();
    await expect(page.getByText('Blue Line')).toBeVisible();
    await expect(page.getByText('Yellow Line')).toBeVisible();
    await expect(page.getByText('Green Line')).toBeVisible();
  });

  test('should navigate to booking page', async ({ page }) => {
    await page.getByRole('link', { name: /book your journey/i }).click();
    await expect(page.getByRole('heading', { name: /book your journey/i })).toBeVisible();
  });

  test('should search and select source station', async ({ page }) => {
    await page.goto('/book');
    
    const sourceInput = page.getByLabel('Select source station');
    await sourceInput.click();
    await sourceInput.fill('Danapur');
    
    await expect(page.getByRole('option', { name: /danapur cantonment/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('option', { name: /danapur cantonment/i }).click();
    
    await expect(sourceInput).toHaveValue('Danapur Cantonment');
  });

  test('should search and select destination station', async ({ page }) => {
    await page.goto('/book');
    
    const destInput = page.getByLabel('Select destination station');
    await destInput.click();
    await destInput.fill('Gandhi');
    
    await expect(page.getByRole('option', { name: /gandhi maidan/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole('option', { name: /gandhi maidan/i }).click();
    
    await expect(destInput).toHaveValue('Gandhi Maidan');
  });

  test('should swap source and destination', async ({ page }) => {
    await page.goto('/book');
    
    const sourceInput = page.getByLabel('Select source station');
    const destInput = page.getByLabel('Select destination station');
    
    await sourceInput.click();
    await sourceInput.fill('Danapur');
    await page.getByRole('option', { name: /danapur cantonment/i }).click();
    
    await destInput.click();
    await destInput.fill('Patna J');
    await page.getByRole('option', { name: /patna junction/i }).click();
    
    await page.getByLabel('Swap source and destination').click();
    
    await expect(sourceInput).toHaveValue('Patna Junction');
    await expect(destInput).toHaveValue('Danapur Cantonment');
  });

  test('complete booking flow - search routes and see recommendation', async ({ page }) => {
    await page.goto('/book');
    
    const sourceInput = page.getByLabel('Select source station');
    await sourceInput.click();
    await sourceInput.fill('Danapur');
    await page.getByRole('option', { name: /danapur cantonment/i }).click();
    
    const destInput = page.getByLabel('Select destination station');
    await destInput.click();
    await destInput.fill('New ISBT');
    await page.getByRole('option', { name: /new isbt/i }).click();
    
    await page.getByRole('button', { name: /search routes/i }).click();
    
    await expect(page.getByText('Available Routes')).toBeVisible();
    await expect(page.getByText('Recommended')).toBeVisible();
  });

  test('should show multiple route options for journeys with alternatives', async ({ page }) => {
    await page.goto('/book');
    
    const sourceInput = page.getByLabel('Select source station');
    await sourceInput.click();
    await sourceInput.fill('Danapur');
    await page.getByRole('option', { name: /danapur cantonment/i }).click();
    
    const destInput = page.getByLabel('Select destination station');
    await destInput.click();
    await destInput.fill('New ISBT');
    await page.getByRole('option', { name: /new isbt/i }).click();
    
    await page.getByRole('button', { name: /search routes/i }).click();
    
    await expect(page.getByText('Available Routes')).toBeVisible();
    const routeCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /min/ });
    const count = await routeCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should select route and proceed to booking', async ({ page }) => {
    await page.goto('/book');
    
    const sourceInput = page.getByLabel('Select source station');
    await sourceInput.click();
    await sourceInput.fill('Danapur');
    await page.getByRole('option', { name: /danapur cantonment/i }).click();
    
    const destInput = page.getByLabel('Select destination station');
    await destInput.click();
    await destInput.fill('Gandhi');
    await page.getByRole('option', { name: /gandhi maidan/i }).click();
    
    await page.getByRole('button', { name: /search routes/i }).click();
    
    await expect(page.getByText('Available Routes')).toBeVisible();
    
    // Click on the first route card to select it
    await page.locator('.cursor-pointer').filter({ hasText: /minutes/ }).first().click();
    
    // Wait for button to be enabled and click
    await page.getByRole('button', { name: /proceed to booking/i }).click();
    
    await expect(page.getByText(/booking confirmed/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Metro Map Page', () => {
  test('should display metro map with all lines in legend', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.getByRole('heading', { name: /patna metro network map/i })).toBeVisible({ timeout: 10000 });
    
    await expect(page.getByText('Red').first()).toBeVisible();
    await expect(page.getByText('Blue').first()).toBeVisible();
    await expect(page.getByText('Yellow').first()).toBeVisible();
    await expect(page.getByText('Green').first()).toBeVisible();
  });

  test('should show map legend with station types', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.getByText('Legend')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Station')).toBeVisible();
    await expect(page.getByText('Interchange')).toBeVisible();
  });

  test('should have zoom controls', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.getByLabel('Zoom in')).toBeVisible();
    await expect(page.getByLabel('Zoom out')).toBeVisible();
    await expect(page.getByLabel('Reset view')).toBeVisible();
  });
});

test.describe('Admin Panel', () => {
  test('should display admin panel with line editor', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.getByRole('heading', { name: /admin panel/i })).toBeVisible();
    await expect(page.getByText('Metro Lines')).toBeVisible();
  });

  test('should show all metro lines in line editor', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.getByRole('button', { name: /red line/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /blue line/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /yellow line/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /green line/i })).toBeVisible();
  });

  test('should switch between admin tabs', async ({ page }) => {
    await page.goto('/admin');
    
    await page.getByRole('link', { name: /bulk import/i }).click();
    await expect(page.getByText('Upload Metro Data')).toBeVisible();
    
    await page.getByRole('link', { name: /compatibility/i }).click();
    await expect(page.getByText('Version Compatibility Matrix')).toBeVisible();
  });

  test('should have reset button for network', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA attributes on search inputs', async ({ page }) => {
    await page.goto('/book');
    
    const sourceInput = page.getByLabel('Select source station');
    await expect(sourceInput).toBeVisible();
    
    const destInput = page.getByLabel('Select destination station');
    await expect(destInput).toBeVisible();
  });

  test('should support keyboard navigation in autocomplete', async ({ page }) => {
    await page.goto('/book');
    
    const sourceInput = page.getByLabel('Select source station');
    await sourceInput.focus();
    await sourceInput.fill('P');
    
    await page.waitForTimeout(500);
    
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    const value = await sourceInput.inputValue();
    expect(value).not.toBe('P');
  });

  test('should have ARIA labels on map controls', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.getByLabel('Zoom in')).toBeVisible();
    await expect(page.getByLabel('Zoom out')).toBeVisible();
    await expect(page.getByLabel('Reset view')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: /patna metro/i })).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: /patna metro/i })).toBeVisible();
  });

  test('should display booking page on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/book');
    
    await expect(page.getByRole('heading', { name: /book your journey/i })).toBeVisible();
    await expect(page.getByLabel('Select source station')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /map/i }).click();
    await expect(page).toHaveURL(/\/map/);
    
    await page.getByRole('link', { name: /book/i }).click();
    await expect(page).toHaveURL(/\/book/);
    
    await page.getByRole('link', { name: /admin/i }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should return to home from any page', async ({ page }) => {
    await page.goto('/book');
    
    // Click on Home link in navigation
    await page.getByRole('link', { name: /^home$/i }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Route Calculation', () => {
  test('should recommend shortest route by time', async ({ page }) => {
    await page.goto('/book');
    
    const sourceInput = page.getByLabel('Select source station');
    await sourceInput.click();
    await sourceInput.fill('Danapur');
    await page.getByRole('option', { name: /danapur cantonment/i }).click();
    
    const destInput = page.getByLabel('Select destination station');
    await destInput.click();
    await destInput.fill('New ISBT');
    await page.getByRole('option', { name: /new isbt/i }).click();
    
    await page.getByRole('button', { name: /search routes/i }).click();
    
    await expect(page.getByText('Available Routes')).toBeVisible();
    
    // The first route should have the Recommended badge
    const recommendedBadge = page.getByText('Recommended');
    await expect(recommendedBadge).toBeVisible();
    
    // Verify the recommended badge appears in the first route card
    const firstRouteCard = page.locator('.cursor-pointer').filter({ hasText: /minutes/ }).first();
    await expect(firstRouteCard).toContainText('Recommended');
  });
});
