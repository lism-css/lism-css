import type { Page } from 'playwright';

export async function capturePatternScreenshot(page: Page, url: string, outputPath: string, waitAfterLoad: number): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(waitAfterLoad);
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    for (const image of images) image.loading = 'eager';
    await document.fonts.ready;
    // 読み込みに失敗した画像は従来どおりページ上の表示を撮影する。
    await Promise.allSettled(images.map((image) => image.decode()));
  });

  const viewport = page.viewportSize();
  if (!viewport) throw new Error('撮影用ビューポートが設定されていません');

  // bodyは画面高まで広がるため、内側のコンテンツの末端を測る。
  const contentBottom = await page.locator('.c--previewSizeReporter').evaluate((element) => element.getBoundingClientRect().bottom);
  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: { x: 0, y: 0, width: viewport.width, height: Math.max(1, Math.min(viewport.height, Math.ceil(contentBottom))) },
  });
}
