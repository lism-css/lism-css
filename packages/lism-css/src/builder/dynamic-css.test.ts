// @vitest-environment node
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
