// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { lismDynamicCss } from './dynamic-css';

// resolveId フックを取り出す（Function 形式 / Object 形式の両対応）。
function getResolveId(plugin: ReturnType<typeof lismDynamicCss>) {
  const hook = plugin.resolveId;
  const fn = typeof hook === 'function' ? hook : hook?.handler;
  if (!fn) throw new Error('resolveId hook not found');
  // resolveId は this（PluginContext）を参照しないため、空オブジェクトで呼べる。
  return (source: string) => (fn as (this: unknown, s: string) => unknown).call({}, source);
}

function getLoad(plugin: ReturnType<typeof lismDynamicCss>) {
  const hook = plugin.load;
  const fn = typeof hook === 'function' ? hook : hook?.handler;
  if (!fn) throw new Error('load hook not found');
  return (id: string, ctx: { addWatchFile(file: string): void }) => (fn as (this: typeof ctx, id: string) => unknown).call(ctx, id);
}

function getHandleHotUpdate(plugin: ReturnType<typeof lismDynamicCss>) {
  const hook = plugin.handleHotUpdate;
  const fn = typeof hook === 'function' ? hook : hook?.handler;
  if (!fn) throw new Error('handleHotUpdate hook not found');
  return (ctx: unknown) => (fn as (ctx: unknown) => unknown)(ctx);
}

describe('lismDynamicCss resolveId', () => {
  test('lism-css/<entry>.css を自身の dist/css パスへ解決する', async () => {
    const resolveId = getResolveId(lismDynamicCss());
    const id = await resolveId('lism-css/main.css');
    expect(typeof id).toBe('string');
    expect(id as string).toMatch(/\/dist\/css\/main\.css$/);
  });

  test('入れ子エントリも解決する', async () => {
    const resolveId = getResolveId(lismDynamicCss());
    expect((await resolveId('lism-css/primitives/layout.css')) as string).toMatch(/\/dist\/css\/primitives\/layout\.css$/);
    expect((await resolveId('lism-css/base/set.css')) as string).toMatch(/\/dist\/css\/base\/set\.css$/);
  });

  test('クエリを保持する', async () => {
    const resolveId = getResolveId(lismDynamicCss());
    expect((await resolveId('lism-css/main.css?inline')) as string).toMatch(/\/dist\/css\/main\.css\?inline$/);
  });

  test('存在しないエントリは解決しない', async () => {
    const resolveId = getResolveId(lismDynamicCss());
    expect(await resolveId('lism-css/does-not-exist.css')).toBeNull();
  });

  test('CSS import 以外は素通しする', async () => {
    const resolveId = getResolveId(lismDynamicCss());
    expect(await resolveId('react')).toBeNull();
    expect(await resolveId('lism-css/main.js')).toBeNull();
    expect(await resolveId('./local.css')).toBeNull();
  });
});

describe('lismDynamicCss watch / hot update', () => {
  test('load 時に core の SCSS と default config を watch 対象へ登録する', async () => {
    const plugin = lismDynamicCss();
    const resolveId = getResolveId(plugin);
    const load = getLoad(plugin);
    const id = (await resolveId('lism-css/main.css')) as string;
    const watched: string[] = [];

    await load(id, { addWatchFile: (file) => watched.push(file) });

    expect(watched.some((file) => file.endsWith('/packages/lism-css/src/scss/main.scss'))).toBe(true);
    expect(watched.some((file) => file.endsWith('/packages/lism-css/config/defaults/tokens.ts'))).toBe(true);
    expect(watched.some((file) => file.endsWith('/packages/lism-css/dist/config/defaults/tokens.js'))).toBe(true);
  });

  test('core の SCSS 変更時に CSS モジュールを更新対象にして full reload する', async () => {
    const plugin = lismDynamicCss();
    const resolveId = getResolveId(plugin);
    const load = getLoad(plugin);
    const handleHotUpdate = getHandleHotUpdate(plugin);
    const id = (await resolveId('lism-css/main.css')) as string;
    await load(id, { addWatchFile: () => {} });

    const mod = { id };
    const sent: unknown[] = [];
    const affected = await handleHotUpdate({
      file: fileURLToPath(new URL('../../../lism-css/src/scss/main.scss', import.meta.url)),
      server: {
        moduleGraph: {
          getModuleById: (moduleId: string) => (moduleId === id ? mod : null),
        },
        ws: {
          send: (payload: unknown) => sent.push(payload),
        },
      },
    });

    expect(affected).toEqual([mod]);
    expect(sent).toContainEqual({ type: 'full-reload' });
  });
});
