// @vitest-environment node

import { describe, test, expect, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'vite';
import { lismPurge } from './vite';

type AnyPluginCtx = Record<string, unknown>;

function getGenerateBundle(plugin: ReturnType<typeof lismPurge>) {
  const hook = plugin.generateBundle;
  if (typeof hook === 'function') return hook;
  if (hook && typeof hook === 'object' && 'handler' in hook) return hook.handler;
  throw new Error('generateBundle hook not found');
}

const known = {
  classes: new Set(['-p:20', '-m:10']),
  attrs: new Set<string>(),
};

async function setupViteProject(usedClass: string): Promise<string> {
  // macOS の tmpdir() は /tmp→/private/tmp の symlink。Vite は root を realpath 化するため、
  // symlink のままだと emit される index.html 名が root 外へ脱出し、新しい Rollup が弾く。realpath で揃える。
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'lism-purge-vite-')));
  await writeFile(join(dir, 'index.html'), `<div class="${usedClass}"></div><script type="module" src="/src/main.js"></script>`);
  await mkdir(join(dir, 'src'));
  await writeFile(join(dir, 'src/main.js'), 'import "./style.css";');
  await writeFile(join(dir, 'src/style.css'), '.-p\\:20{padding:20px}.-m\\:10{margin:10px}');
  return dir;
}

async function readBuildOutput(dir: string): Promise<{ cssName: string; css: string; html: string }> {
  const assets = await readdir(join(dir, 'dist/assets'));
  const cssName = assets.find((file) => file.endsWith('.css'));
  if (!cssName) throw new Error('CSS asset not found');
  return {
    cssName,
    css: await readFile(join(dir, 'dist/assets', cssName), 'utf8'),
    html: await readFile(join(dir, 'dist/index.html'), 'utf8'),
  };
}

describe('lismPurge (Vite)', () => {
  test('lism signature を含まない CSS asset は書き換えられない', async () => {
    const plugin = lismPurge();
    const original = '.button--primary{color:red}.card{padding:8px}';
    const bundle: Record<string, unknown> = {
      'assets/styles.css': {
        type: 'asset',
        fileName: 'assets/styles.css',
        source: original,
      },
    };
    const ctx: AnyPluginCtx = { info: vi.fn(), warn: vi.fn() };
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);
    expect((bundle['assets/styles.css'] as { source: string }).source).toBe(original);
  });

  test('lism signature を含む CSS は used に基づいて purge される', async () => {
    const plugin = lismPurge();
    const bundle: Record<string, unknown> = {
      'assets/main.css': {
        type: 'asset',
        fileName: 'assets/main.css',
        source: '.-p\\:20{padding:var(--s20)}.-m\\:10{margin:var(--s10)}',
      },
      'assets/app.js': {
        type: 'chunk',
        fileName: 'assets/app.js',
        code: 'const cls = "-p:20";',
      },
    };
    const ctx: AnyPluginCtx = { info: vi.fn(), warn: vi.fn() };
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);
    const source = (bundle['assets/main.css'] as { source: string }).source;
    expect(source).toContain('-p\\:20');
    expect(source).not.toContain('-m\\:10');
  });

  test('hash 付き CSS asset は purge 後の内容でリネームし、参照も同期する', async () => {
    const plugin = lismPurge({ known });
    const bundle: Record<string, unknown> = {
      'assets/main-AAAA1111.css': {
        type: 'asset',
        fileName: 'assets/main-AAAA1111.css',
        source: '.-p\\:20{padding:var(--s20)}.-m\\:10{margin:var(--s10)}',
      },
      'index.html': {
        type: 'asset',
        fileName: 'index.html',
        source: '<link rel="stylesheet" href="/assets/main-AAAA1111.css"><div class="-p:20"></div>',
      },
      'assets/app.js': {
        type: 'chunk',
        fileName: 'assets/app.js',
        code: 'const href = "/assets/main-AAAA1111.css";',
      },
    };
    const ctx: AnyPluginCtx = { info: vi.fn(), warn: vi.fn() };
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);

    expect(bundle['assets/main-AAAA1111.css']).toBeUndefined();
    const cssKey = Object.keys(bundle).find((key) => key.endsWith('.css'));
    expect(cssKey).toMatch(/^assets\/main-[a-f0-9]{8}\.css$/);
    const cssAsset = bundle[cssKey as string] as { fileName: string; source: string };
    expect(cssAsset.fileName).toBe(cssKey);
    expect(cssAsset.source).toContain('-p\\:20');
    expect(cssAsset.source).not.toContain('-m\\:10');

    const newBase = cssKey?.split('/').pop();
    expect((bundle['index.html'] as { source: string }).source).toContain(newBase);
    expect((bundle['index.html'] as { source: string }).source).not.toContain('main-AAAA1111.css');
    expect((bundle['assets/app.js'] as { code: string }).code).toContain(newBase);
    expect((bundle['assets/app.js'] as { code: string }).code).not.toContain('main-AAAA1111.css');
  });

  test('リネーム時に chunk.viteMetadata.importedCss と manifest.json の参照も同期する', async () => {
    const plugin = lismPurge({ known });
    const importedCss = new Set<string>(['assets/main-AAAA1111.css']);
    const bundle: Record<string, unknown> = {
      'assets/main-AAAA1111.css': {
        type: 'asset',
        fileName: 'assets/main-AAAA1111.css',
        source: '.-p\\:20{padding:var(--s20)}.-m\\:10{margin:var(--s10)}',
      },
      'assets/app.js': {
        type: 'chunk',
        fileName: 'assets/app.js',
        code: 'const cls = "-p:20";',
        // Vite が manifest / HTML の css 参照を生成する元データ
        viteMetadata: { importedCss, importedAssets: new Set<string>() },
      },
      '.vite/manifest.json': {
        type: 'asset',
        fileName: '.vite/manifest.json',
        source: JSON.stringify({ 'index.html': { file: 'assets/app.js', css: ['assets/main-AAAA1111.css'] } }),
      },
    };
    const ctx: AnyPluginCtx = { info: vi.fn(), warn: vi.fn() };
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);

    const cssKey = Object.keys(bundle).find((key) => key.endsWith('.css')) as string;
    expect(cssKey).toMatch(/^assets\/main-[a-f0-9]{8}\.css$/);

    // importedCss が旧名を捨てて新名に差し替わっている
    expect(importedCss.has('assets/main-AAAA1111.css')).toBe(false);
    expect(importedCss.has(cssKey)).toBe(true);

    // manifest.json の css 参照も新名に同期している
    const manifest = JSON.parse((bundle['.vite/manifest.json'] as { source: string }).source);
    expect(manifest['index.html'].css).toEqual([cssKey]);
  });

  test('Vite build でも purge 後の CSS 内容に応じて hash 付きファイル名が変わる', async () => {
    const dirP = await setupViteProject('-p:20');
    const dirM = await setupViteProject('-m:10');
    try {
      await build({ root: dirP, configFile: false, logLevel: 'silent', plugins: [lismPurge({ known })] });
      await build({ root: dirM, configFile: false, logLevel: 'silent', plugins: [lismPurge({ known })] });

      const outP = await readBuildOutput(dirP);
      const outM = await readBuildOutput(dirM);
      expect(outP.cssName).not.toBe(outM.cssName);
      expect(outP.cssName).toMatch(/^index-[a-f0-9]{8}\.css$/);
      expect(outM.cssName).toMatch(/^index-[a-f0-9]{8}\.css$/);
      expect(outP.css).toContain('-p\\:20');
      expect(outP.css).not.toContain('-m\\:10');
      expect(outM.css).toContain('-m\\:10');
      expect(outM.css).not.toContain('-p\\:20');
      expect(outP.html).toContain(outP.cssName);
      expect(outM.html).toContain(outM.cssName);
    } finally {
      await rm(dirP, { recursive: true, force: true });
      await rm(dirM, { recursive: true, force: true });
    }
  });
});
