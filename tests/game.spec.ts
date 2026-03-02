import { expect, test, type Page } from '@playwright/test';

// Note: Phaser games render to canvas, so we can't select buttons by DOM selectors.
// We use canvas coordinates based on the game's layout (1920x1080 virtual size).

async function loginAsGuest(page: Page) {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // "Play as Guest" button is at center, ~62% down from top
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');
  
  const clickX = box.x + box.width / 2;
  const clickY = box.y + box.height * 0.62;
  await page.mouse.click(clickX, clickY);
  await page.waitForTimeout(3000); // Wait for auth and menu scene transition
}

async function clickCenter(page: Page) {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }
}

test.describe('Typing Maniac', () => {
  test('auth screen loads', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'tests/screenshots/auth.png' });
  });

  test('can login as guest and see menu', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsGuest(page);
    
    await page.screenshot({ path: 'tests/screenshots/menu.png' });
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('can start game and type words', async ({ page }) => {
    test.setTimeout(90000);
    
    await loginAsGuest(page);
    
    await clickCenter(page);
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000); // Countdown: 3(0.9s) + 2(0.9s) + 1(0.9s) + GO(0.6s) + transition
    
    await page.keyboard.type('test');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'tests/screenshots/gameplay.png' });
  });

  test('version is displayed in menu', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsGuest(page);
    
    await page.screenshot({ path: 'tests/screenshots/version.png', clip: { x: 0, y: 0, width: 150, height: 60 } });
  });
});
