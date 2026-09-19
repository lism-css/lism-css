// @vitest-environment node

import { describe, test, expect, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as buildVite7, createLogger } from 'vite';
import { build as buildVite8 } from 'vite8';
import { lismPurge } from './vite';

type EmittedAssetLike = { type: 'asset'; fileName: string; source: string | Uint8Array };

// Rollup / Rolldown と同じく、generateBundle 中の emitFile を bundle に反映する
function createCtx(bundle: Record<string, unknown>) {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    emitFile: vi.fn((file: EmittedAssetLike) => {
      bundle[file.fileName] = { type: 'asset', fileName: file.fileName, source: file.source };
      return file.fileName;
    }),
  };
}

function getGenerateBundle(plugin: ReturnType<typeof lismPurge>) {
  const hook = plugin.generateBundle;
  if (typeof hook === 'function') return hook;
  if (hook && typeof hook === 'object' && 'handler' in hook) return hook.handler;
  throw new Error('generateBundle hook not found');
}

type BuildFn = (config: {
  root: string;
  configFile: false;
  logLevel: 'silent';
  plugins: unknown[];
  customLogger?: ReturnType<typeof createLogger>;
}) => Promise<unknown>;
// Rollup（Vite 7）と Rolldown（Vite 8）で generateBundle の bundle 操作の扱いが違うため、両方で確認する
const bundlers: [string, BuildFn][] = [
  ['Vite 7 (Rollup)', buildVite7 as unknown as BuildFn],
  ['Vite 8 (Rolldown)', buildVite8 as unknown as BuildFn],
];

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
  test.each(bundlers)('%sの実ビルドで静的propsのCSR警告とsafelistの効果を確認する', async (_name, build) => {
    for (const { htmlClass, safelist } of [
      { htmlClass: '', safelist: undefined },
      { htmlClass: '', safelist: ['-p:20'] },
      { htmlClass: '-p:20', safelist: undefined },
    ]) {
      const dir = await setupViteProject(htmlClass);
      try {
        const runtime = fileURLToPath(import.meta.resolve('lism-css/lib/getLismProps'));
        await writeFile(
          join(dir, 'src/main.js'),
          `import './style.css'; import getLismProps from ${JSON.stringify(runtime)}; document.body.className = getLismProps({ p: '20' }).className;`
        );
        const logger = createLogger();
        const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
        await build({ root: dir, configFile: false, logLevel: 'silent', customLogger: logger, plugins: [lismPurge({ known, safelist })] });
        const csrWarnings = warn.mock.calls.filter(([message]) => message.includes('possible CSR'));
        expect(csrWarnings).toHaveLength(htmlClass ? 0 : 1);
        const out = await readBuildOutput(dir);
        expect(out.css.includes('-p\\:20')).toBe(!!htmlClass || !!safelist);
        expect(out.css).not.toContain('-m\\:10');
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }
  });

  test.each([
    '/app/node_modules/lism-css/dist/components/Box.js',
    '/app/node_modules/.pnpm/lism-css@0.29.1/node_modules/lism-css/dist/lib/getLismProps.js',
    '/repo/packages/lism-css/src/lib/getLismProps.ts',
    'C:\\app\\node_modules\\lism-css\\dist\\index.js?commonjs-proxy',
  ])('HTMLにLismクラスがない場合にランタイム%sを検出して警告する', async (id) => {
    const bundle = {
      'index.html': { type: 'asset', source: '<div id="root"></div>' },
      'app.js': { type: 'chunk', code: 'const cls = "l--box";', modules: { [id]: {} } },
      'lazy.js': { type: 'chunk', code: '', modules: { [id]: {} } },
    };
    const ctx = createCtx(bundle);
    await getGenerateBundle(lismPurge({ known })).call(ctx as never, {} as never, bundle as never, false);
    expect(ctx.warn).toHaveBeenCalledTimes(1);
    expect(ctx.warn).toHaveBeenCalledWith(expect.stringMatching(/possible CSR.*static prop values.*safelist.*disable purge/));
  });

  test.each([
    '/app/node_modules/lism-css/dist/css/main.css',
    '/app/node_modules/lism-css/src/scss/main.scss',
    '/app/node_modules/@lism-css/plugin/dist/index.js',
    '/app/node_modules/not-lism-css/dist/index.js',
  ])('ランタイムではない%sでは警告しない', async (id) => {
    const bundle = { 'app.js': { type: 'chunk', code: '', modules: { [id]: {} } } };
    const ctx = createCtx(bundle);
    await getGenerateBundle(lismPurge({ known })).call(ctx as never, {} as never, bundle as never, false);
    expect(ctx.warn).not.toHaveBeenCalled();
  });

  test('別ページのHTMLにLismクラスがあれば警告せず、HTMLのクラスも保持する', async () => {
    const bundle = {
      'index.html': { type: 'asset', source: '<div id="root"></div>' },
      'nested/index.htm': { type: 'asset', source: new TextEncoder().encode('<div class="-p:20"></div>') },
      'app.js': { type: 'chunk', code: '', modules: { '/app/node_modules/lism-css/dist/index.js': {} } },
      'main.css': { type: 'asset', fileName: 'main.css', source: '.-p\\:20{padding:20px}.-m\\:10{margin:10px}' },
    };
    const ctx = createCtx(bundle);
    await getGenerateBundle(lismPurge({ known })).call(ctx as never, {} as never, bundle as never, false);
    expect(ctx.warn).not.toHaveBeenCalled();
    expect(bundle['main.css'].source).toContain('-p\\:20');
    expect(bundle['main.css'].source).not.toContain('-m\\:10');
  });

  test('SSRビルドをCSRと判定しない', async () => {
    const plugin = lismPurge({ known });
    const configHook = plugin.configResolved;
    if (typeof configHook !== 'function') throw new Error('configResolved hook not found');
    await configHook.call({} as never, { build: { ssr: true } } as never);
    const bundle = { 'entry.js': { type: 'chunk', code: '', modules: { '/app/node_modules/lism-css/dist/index.js': {} } } };
    const ctx = createCtx(bundle);
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);
    expect(ctx.warn).not.toHaveBeenCalled();
  });

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
    const ctx = createCtx(bundle);
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
    const ctx = createCtx(bundle);
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
    const ctx = createCtx(bundle);
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);

    expect(bundle['assets/main-AAAA1111.css']).toBeUndefined();
    const cssKey = Object.keys(bundle).find((key) => key.endsWith('.css'));
    expect(cssKey).toMatch(/^assets\/main-[a-f0-9]{8}\.css$/);
    expect(ctx.emitFile).toHaveBeenCalledWith(expect.objectContaining({ type: 'asset', fileName: cssKey }));
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

  test('ハッシュ無し CSS asset はリネームされない（8 文字未満の末尾はハッシュ扱いしない）', async () => {
    const plugin = lismPurge({ known });
    const bundle: Record<string, unknown> = {
      'assets/my-styles.css': {
        type: 'asset',
        fileName: 'assets/my-styles.css',
        source: '.-p\\:20{padding:var(--s20)}.-m\\:10{margin:var(--s10)}',
      },
    };
    const ctx = createCtx(bundle);
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);

    expect(bundle['assets/my-styles.css']).toBeDefined();
    expect((bundle['assets/my-styles.css'] as { fileName: string }).fileName).toBe('assets/my-styles.css');
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
    const ctx = createCtx(bundle);
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

  test('CSS sourcemap 参照を削除し、古い .css.map asset を削除する', async () => {
    const plugin = lismPurge({ known });
    const bundle: Record<string, unknown> = {
      'assets/main-AAAA1111.css': {
        type: 'asset',
        fileName: 'assets/main-AAAA1111.css',
        source: '.-p\\:20{padding:var(--s20)}.-m\\:10{margin:var(--s10)}\n/*# sourceMappingURL=main-AAAA1111.css.map */',
      },
      'assets/main-AAAA1111.css.map': {
        type: 'asset',
        fileName: 'assets/main-AAAA1111.css.map',
        source: JSON.stringify({ version: 3, file: 'main-AAAA1111.css' }),
      },
      'index.html': {
        type: 'asset',
        fileName: 'index.html',
        source: '<link rel="stylesheet" href="/assets/main-AAAA1111.css"><div class="-p:20"></div>',
      },
    };
    const ctx = createCtx(bundle);
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);

    expect(bundle['assets/main-AAAA1111.css']).toBeUndefined();
    expect(bundle['assets/main-AAAA1111.css.map']).toBeUndefined();
    const cssKey = Object.keys(bundle).find((key) => key.endsWith('.css')) as string;
    const cssAsset = bundle[cssKey] as { source: string };
    expect(cssAsset.source).toContain('-p\\:20');
    expect(cssAsset.source).not.toContain('-m\\:10');
    expect(cssAsset.source).not.toContain('sourceMappingURL');
  });

  test.each(bundlers)('%s の build でも purge 後の CSS 内容に応じて hash 付きファイル名が変わる', async (_name, build) => {
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

  test('purge 削除も sourcemap も無い場合は素通しし、末尾空白差分でリネームしない', async () => {
    const plugin = lismPurge({ known });
    // 末尾に改行を持つが、全クラスが used に含まれ purge 対象が無く、sourcemap も無い
    const original = '.-p\\:20{padding:var(--s20)}.-m\\:10{margin:var(--s10)}\n';
    const bundle: Record<string, unknown> = {
      'assets/main-AAAA1111.css': {
        type: 'asset',
        fileName: 'assets/main-AAAA1111.css',
        source: original,
      },
      'assets/app.js': {
        type: 'chunk',
        fileName: 'assets/app.js',
        code: 'const cls = "-p:20 -m:10";',
      },
    };
    const ctx = createCtx(bundle);
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);

    // リネームされず、内容も trimEnd されず原文のまま
    const cssKeys = Object.keys(bundle).filter((key) => key.endsWith('.css'));
    expect(cssKeys).toEqual(['assets/main-AAAA1111.css']);
    expect((bundle['assets/main-AAAA1111.css'] as { source: string }).source).toBe(original);
  });
});
