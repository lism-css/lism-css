import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright';
import sharp from 'sharp';
import { expect, it, vi } from 'vitest';
import { capturePatternScreenshot } from './capture-pattern-screenshot';

it.each(['webp', 'png'])('撮影結果を%sで保存し、比較用PNGのバイト列を保つ', async (extension) => {
  const dir = await mkdtemp(join(tmpdir(), 'pattern-screenshot-'));
  try {
    const png = await sharp({ create: { width: 1200, height: 400, channels: 4, background: '#abcdef' } })
      .png()
      .toBuffer();
    const screenshot = vi.fn(async (options: { path?: string }) => {
      if (options.path) await writeFile(options.path, png);
      return png;
    });
    const page = {
      goto: vi.fn(),
      waitForTimeout: vi.fn(),
      evaluate: vi.fn(),
      viewportSize: () => ({ width: 1200, height: 800 }),
      locator: () => ({ evaluate: () => Promise.resolve(400) }),
      screenshot,
    } as unknown as Page;
    const outputPath = join(dir, `capture.${extension}`);
    await capturePatternScreenshot(page, 'http://localhost/preview/', outputPath, 0);
    const output = await readFile(outputPath);
    expect(await sharp(output).metadata()).toMatchObject({ format: extension, width: 1200, height: 400 });
    expect(screenshot).toHaveBeenCalledWith({
      path: extension === 'png' ? outputPath : undefined,
      type: 'png',
      clip: { x: 0, y: 0, width: 1200, height: 400 },
    });
    if (extension === 'png') expect(output.equals(png)).toBe(true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
