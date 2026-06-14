import { describe, test, expect, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { lismPurgeAstro } from './astro';

async function setupDist(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'lism-purge-astro-'));
  for (const [name, content] of Object.entries(files)) {
    const full = join(dir, name);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content, 'utf8');
  }
  return dir;
}

function getBuildDoneHook(integration: ReturnType<typeof lismPurgeAstro>) {
  const hook = integration.hooks['astro:build:done'];
  if (!hook) throw new Error('astro:build:done hook not found');
  return hook;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe('lismPurgeAstro (Astro)', () => {
  test('lism signature を含まない CSS は書き換えられない', async () => {
    const original = '.button--primary{color:red}';
    const dir = await setupDist({
      'styles.css': original,
      'index.html': '<div class="button--primary"></div>',
    });
    try {
      const integration = lismPurgeAstro();
      const hook = getBuildDoneHook(integration);
      const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      await hook({
        dir: pathToFileURL(dir + '/'),
        logger,
        pages: [],
        routes: [],
      } as never);
      const after = await readFile(join(dir, 'styles.css'), 'utf8');
      expect(after).toBe(original);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('SSG 出力 HTML のクラスが used として認識され、CSS が purge される', async () => {
    const cssOriginal = `.l--stack{display:flex}.l--unused{display:grid}.-p\\:20{padding:var(--p20)}`;
    const dir = await setupDist({
      '_astro/main.AAAA1111.css': cssOriginal,
      'index.html': `<!DOCTYPE html><html><head><link rel="stylesheet" href="/_astro/main.AAAA1111.css"></head><body><div class="l--stack -p:20"></div></body></html>`,
    });
    try {
      const integration = lismPurgeAstro();
      const hook = getBuildDoneHook(integration);
      const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      await hook({
        dir: pathToFileURL(dir + '/'),
        logger,
        pages: [],
        routes: [],
      } as never);

      // 旧 hash ファイルは存在せず、新 hash ファイルが 1 つだけ存在する
      expect(await fileExists(join(dir, '_astro/main.AAAA1111.css'))).toBe(false);
      const entries = await readdir(join(dir, '_astro'));
      const cssFiles = entries.filter((f) => f.endsWith('.css'));
      expect(cssFiles).toHaveLength(1);
      const newName = cssFiles[0];
      expect(newName).toMatch(/^main\.[A-Za-z0-9_-]+\.css$/);
      expect(newName).not.toBe('main.AAAA1111.css');

      // CSS の中身が purge されている
      const cssAfter = await readFile(join(dir, '_astro', newName), 'utf8');
      expect(cssAfter).toContain('l--stack');
      expect(cssAfter).toContain('-p\\:20');
      expect(cssAfter).not.toContain('l--unused');

      // HTML 内の参照が新ファイル名に更新されている
      const htmlAfter = await readFile(join(dir, 'index.html'), 'utf8');
      expect(htmlAfter).toContain(newName);
      expect(htmlAfter).not.toContain('main.AAAA1111.css');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('ハッシュ無し CSS は in-place で上書きされる（リネームなし）', async () => {
    const dir = await setupDist({
      'main.css': `.l--stack{display:flex}.l--unused{display:grid}`,
      'index.html': `<div class="l--stack"></div>`,
    });
    try {
      const integration = lismPurgeAstro();
      const hook = getBuildDoneHook(integration);
      const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      await hook({
        dir: pathToFileURL(dir + '/'),
        logger,
        pages: [],
        routes: [],
      } as never);
      const cssAfter = await readFile(join(dir, 'main.css'), 'utf8');
      expect(cssAfter).toContain('l--stack');
      expect(cssAfter).not.toContain('l--unused');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('JS / manifest 内の CSS ファイル参照もリネームに同期する', async () => {
    const cssOriginal = `.l--grid{display:grid}.l--unused{display:flex}`;
    const dir = await setupDist({
      '_astro/styles.BBBB2222.css': cssOriginal,
      'index.html': `<link rel="stylesheet" href="/_astro/styles.BBBB2222.css"><div class="l--grid"></div>`,
      '_astro/app.js': `import "/_astro/styles.BBBB2222.css";\nconsole.log("/_astro/styles.BBBB2222.css");`,
    });
    try {
      const integration = lismPurgeAstro();
      const hook = getBuildDoneHook(integration);
      const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      await hook({
        dir: pathToFileURL(dir + '/'),
        logger,
        pages: [],
        routes: [],
      } as never);

      const entries = await readdir(join(dir, '_astro'));
      const cssFiles = entries.filter((f) => f.endsWith('.css'));
      const newName = cssFiles[0];
      expect(newName).not.toBe('styles.BBBB2222.css');

      const html = await readFile(join(dir, 'index.html'), 'utf8');
      const js = await readFile(join(dir, '_astro/app.js'), 'utf8');
      expect(html).toContain(newName);
      expect(html).not.toContain('styles.BBBB2222.css');
      expect(js).toContain(newName);
      expect(js).not.toContain('styles.BBBB2222.css');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('CSS sourcemap 参照を削除し、古い .css.map を削除する', async () => {
    const dir = await setupDist({
      '_astro/main.AAAA1111.css': `.l--stack{display:flex}.l--unused{display:grid}\n/*# sourceMappingURL=main.AAAA1111.css.map */`,
      '_astro/main.AAAA1111.css.map': JSON.stringify({ version: 3, file: 'main.AAAA1111.css' }),
      'index.html': `<link rel="stylesheet" href="/_astro/main.AAAA1111.css"><div class="l--stack"></div>`,
    });
    try {
      const integration = lismPurgeAstro({
        known: { classes: new Set(['l--stack', 'l--unused']), attrs: new Set() },
      });
      const hook = getBuildDoneHook(integration);
      const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      await hook({
        dir: pathToFileURL(dir + '/'),
        logger,
        pages: [],
        routes: [],
      } as never);

      const entries = await readdir(join(dir, '_astro'));
      const cssFiles = entries.filter((f) => f.endsWith('.css'));
      expect(cssFiles).toHaveLength(1);

      const cssAfter = await readFile(join(dir, '_astro', cssFiles[0]), 'utf8');
      expect(cssAfter).toContain('l--stack');
      expect(cssAfter).not.toContain('l--unused');
      expect(cssAfter).not.toContain('sourceMappingURL');
      expect(entries.some((f) => f.endsWith('.css.map'))).toBe(false);
      expect(await fileExists(join(dir, '_astro/main.AAAA1111.css.map'))).toBe(false);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('purge 削除も sourcemap も無い場合は素通しし、末尾改行を保持する', async () => {
    // 末尾に改行を持つが、全クラスが used に含まれ purge 対象が無く、sourcemap も無い
    const original = `.l--stack{display:flex}\n`;
    const dir = await setupDist({
      'main.css': original,
      'index.html': `<div class="l--stack"></div>`,
    });
    try {
      const integration = lismPurgeAstro({
        known: { classes: new Set(['l--stack']), attrs: new Set() },
      });
      const hook = getBuildDoneHook(integration);
      const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
      await hook({
        dir: pathToFileURL(dir + '/'),
        logger,
        pages: [],
        routes: [],
      } as never);
      // 素通しされ、in-place 上書き（trimEnd）も走らないため末尾改行が原文のまま残る
      const after = await readFile(join(dir, 'main.css'), 'utf8');
      expect(after).toBe(original);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
