import { expect, test } from '@playwright/test';

test('score-analysis 页面加载且关键控件齐全', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/docs/score-analysis/');
  await expect(page.locator('#fileInput')).toHaveCount(1);
  await expect(page.locator('#copyBtn')).toHaveCount(1);
  await expect(page.locator('#exportBtn')).toHaveCount(1);
  await expect(page.locator('text=数据仅在本地浏览器处理')).toBeVisible();
  expect(errors).toEqual([]);
});

test('首页有成绩分析入口链接', async ({ page }) => {
  await page.goto('/docs/');
  await expect(page.locator('a[href="./score-analysis/"], [onclick*="score-analysis"]').first()).toHaveCount(1);
});
