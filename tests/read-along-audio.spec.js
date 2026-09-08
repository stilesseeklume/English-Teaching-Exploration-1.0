import { expect, test } from '@playwright/test';

test('Shadow Reading warms the Windows audio path before every sentence', async ({ page }) => {
  await page.addInitScript(() => {
    window.__audioPlays = [];
    URL.createObjectURL = () => 'blob:echo-reading-warmup';
    URL.revokeObjectURL = () => {};
    HTMLMediaElement.prototype.load = function() {};
    HTMLMediaElement.prototype.play = function() {
      window.__audioPlays.push(this.src);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function() {};
  });

  await page.goto('/docs/read-along/#/bixiu1/hj');
  await page.getByRole('button', { name: 'Start Reading' }).click();

  await expect(page.locator('#statusText')).toContainText('Preparing audio');
  await expect.poll(() => page.evaluate(() => window.__audioPlays.slice())).toEqual([
    'blob:echo-reading-warmup'
  ]);

  await page.locator('#audioPlayer').evaluate((el) => el.dispatchEvent(new Event('ended')));
  await page.locator('#audioPlayer').evaluate((el) => el.dispatchEvent(new Event('canplay')));

  await expect(page.locator('#statusText')).toContainText('Playing');
  const plays = await page.evaluate(() => window.__audioPlays.slice());
  expect(plays).toHaveLength(2);
  expect(plays[1]).toContain('/docs/read-along/audio/hj/uk_f/title_00.mp3?v=3');
  await expect(page.locator('#audioPlayer')).toHaveJSProperty('currentTime', 0);

  await page.locator('#audioPlayer').evaluate((el) => el.dispatchEvent(new Event('ended')));
  await expect(page.locator('#statusText')).toContainText('Echo');
});

test('pausing invalidates a pending audio-ready callback', async ({ page }) => {
  await page.addInitScript(() => {
    window.__audioPlays = [];
    URL.createObjectURL = () => 'blob:echo-reading-warmup';
    HTMLMediaElement.prototype.load = function() {};
    HTMLMediaElement.prototype.play = function() {
      window.__audioPlays.push(this.src);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function() {};
  });

  await page.goto('/docs/read-along/#/bixiu1/hj');
  await page.getByRole('button', { name: 'Start Reading' }).click();
  await page.locator('#audioPlayer').evaluate((el) => el.dispatchEvent(new Event('ended')));
  await page.locator('#startBtn').click();
  await page.locator('#audioPlayer').evaluate((el) => el.dispatchEvent(new Event('canplay')));

  await expect(page.locator('#statusText')).toHaveText('Paused');
  await expect.poll(() => page.evaluate(() => window.__audioPlays.length)).toBe(1);
});

test('students can save lesson completion on this device', async ({ page }) => {
  await page.goto('/docs/read-along/#/bixiu1/hj');
  await page.getByRole('button', { name: 'Mark complete' }).click();

  await expect(page.getByRole('button', { name: 'Completed ✓' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Completed ✓' })).toBeVisible();

  await page.locator('#backLink').click();
  await expect(page.locator('.toc-item').first()).toContainText('Completed');
});

test('students can record and listen back without uploading audio', async ({ page }) => {
  await page.addInitScript(() => {
    window.__trackStopped = false;
    const track = { stop: () => { window.__trackStopped = true; } };
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => ({ getTracks: () => [track] }) }
    });
    class FakeMediaRecorder {
      constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; }
      start() { this.state = 'recording'; }
      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['student voice'], { type: this.mimeType }) });
        this.onstop?.();
      }
    }
    window.MediaRecorder = FakeMediaRecorder;
  });

  await page.goto('/docs/read-along/#/bixiu1/hj');
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.locator('#recordingStatus')).toContainText('Recording now');
  await page.getByRole('button', { name: 'Stop', exact: true }).click();

  await expect(page.locator('#recordingPlayer')).toHaveClass(/ready/);
  await expect(page.getByRole('button', { name: 'Record again' })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.__trackStopped)).toBe(true);
});
