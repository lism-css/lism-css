import { describe, test, expect, afterEach, vi } from 'vitest';

// config/index.ts はモジュール初期化時に lism-css/config.js（= lism.config.js）を読むため、
// doMock で差し替えてから resetModules + 動的 import する
type LoosePropConfig = Record<string, Record<string, unknown>>;

async function importConfig(userConfig: Record<string, unknown> = {}) {
  vi.resetModules();
  vi.doMock('lism-css/config.js', () => ({ default: userConfig }));
  return await import('./index');
}

afterEach(() => {
  vi.doUnmock('lism-css/config.js');
  vi.resetModules();
});

describe('isFullMode', () => {
  test('デフォルトでは full preset は適用されない', async () => {
    const { PROPS } = await importConfig();
    const props = PROPS as unknown as LoosePropConfig;
    expect(props.pl.bp).toBe(0);
    expect(props.pl.tokenClass).toBeUndefined();
  });

  test('lism.config.js の isFullMode で full preset が適用される', async () => {
    const { PROPS } = await importConfig({ isFullMode: true });
    const props = PROPS as unknown as LoosePropConfig;

    // bp:0 だった prop が bp:1 になる
    expect(props.pl.bp).toBe(1);
    // スペーシング系方向 props には tokenClass:1 が付与される
    expect(props.pl.tokenClass).toBe(1);
    expect(props.cg.tokenClass).toBe(1);
    // isVar 系は preset の対象外
    expect(props.cols.isVar).toBe(1);
    expect(props.cols.tokenClass).toBeUndefined();
  });

  test('ユーザー設定の props 上書きが full preset より優先される（opt-out 可能）', async () => {
    const { PROPS } = await importConfig({ isFullMode: true, props: { pl: { bp: 0 } } });
    const props = PROPS as unknown as LoosePropConfig;
    expect(props.pl.bp).toBe(0);
    expect(props.pl.tokenClass).toBe(1); // 上書きしていないキーは preset のまま
  });

  test('isFullMode でコンポーネントの出力がトークンクラスになる', async () => {
    vi.resetModules();
    vi.doMock('lism-css/config.js', () => ({ default: { isFullMode: true } }));
    const { default: getLismProps } = await import('../src/lib/getLismProps');
    const result = getLismProps({ pl: '20' });
    expect(result.className).toContain('-pl:20');
    expect(result.style).toBeUndefined();
  });

  test('isFullMode なしではコンポーネントの出力は inline style のまま', async () => {
    vi.resetModules();
    const { default: getLismProps } = await import('../src/lib/getLismProps');
    const result = getLismProps({ pl: '20' });
    expect(result.className).toBeUndefined();
    expect(result.style).toEqual({ paddingLeft: 'var(--s20)' });
  });
});
