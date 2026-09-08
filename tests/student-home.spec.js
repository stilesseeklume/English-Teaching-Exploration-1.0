import { expect, test } from '@playwright/test';

test('student home leads with Shadow Reading and keeps grammar secondary', async ({ page }) => {
  await page.goto('/docs/');

  await expect(page).toHaveTitle(/\u82f1\u8bed\u5b66\u4e60\u7cfb\u7edf/);
  await expect(page.getByRole('button', { name: /\u5f00\u59cb Shadow Reading/ })).toBeVisible();
  await expect(page.locator('.hero-sub')).toContainText('\u542c\u529b\u3001\u9605\u8bfb\u4e0e\u8868\u8fbe');

  await page.locator('.scroll-cue').click();
  const entries = page.locator('.project-entry-glass');
  await expect(entries).toHaveCount(2);
  await expect(entries.nth(0)).toContainText('Shadow Reading');
  await expect(entries.nth(1)).toContainText('\u8bed\u6cd5\u4e13\u9879\u7ec3\u4e60');
  await expect(page.getByText('\u8bed\u6cd5\u586b\u7a7a\u8bb2\u8bc4')).toHaveCount(0);
  await expect(page.getByText('\u7ba1\u7406\u5458', { exact: true })).toHaveCount(0);
});
