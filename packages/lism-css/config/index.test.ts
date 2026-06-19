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
    // bp 省略 = 非レスポンシブ（bp:0 のデフォルト）。full preset 未適用を確認する
    expect(props.pl.bp).toBeUndefined();
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

describe('tokens（値付き単一情報源）', () => {
  test('lism.config.js の tokens で新規キーを追加するとランタイム TOKENS に登録される', async () => {
    const { TOKENS } = await importConfig({ tokens: { lts: { '2xl': '.5em' } } });
    const tokens = TOKENS as unknown as Record<string, Record<string, unknown>>;
    expect(Object.hasOwn(tokens.lts, '2xl')).toBe(true);
    // 既定キーは deep-merge で保持される
    expect(Object.hasOwn(tokens.lts, 'base')).toBe(true);
  });

  test('tokens.color へ追加したキーは color 合成（color ∪ palette）にも反映される', async () => {
    const { TOKENS } = await importConfig({ tokens: { color: { success: '#0a0' } } });
    const tokens = TOKENS as unknown as { color: Record<string, unknown> };
    expect(Object.hasOwn(tokens.color, 'success')).toBe(true);
  });

  test('既定値の上書きができる（同名キー）', async () => {
    const { TOKENS } = await importConfig({ tokens: { fz: { base: '1.1rem' } } });
    const tokens = TOKENS as unknown as { fz: Record<string, unknown> };
    expect(tokens.fz.base).toBe('1.1rem');
  });

  test('登録キーをコンポーネントが props として受理しトークンクラスを出力する（lts="2xl" → -lts:2xl）', async () => {
    // tokenClass:1 の prop は登録済みトークンならインライン style ではなく `.-lts:2xl` クラスを出力する。
    // tokens に値を書くことで対応する `.-lts\:2xl { letter-spacing: var(--lts--2xl) }`（+ :root の値）が生成され噛み合う。
    vi.resetModules();
    vi.doMock('lism-css/config.js', () => ({ default: { tokens: { lts: { '2xl': '.5em' } } } }));
    const { default: getLismProps } = await import('../src/lib/getLismProps');
    const result = getLismProps({ lts: '2xl' });
    expect(result.className).toContain('-lts:2xl');
  });

  test('未登録のキーはトークンクラス化されない（登録の効果を確認）', async () => {
    // tokens に '2xl' を与えなければ TOKENS に無く、トークンクラス（-lts:2xl）は出力されない。
    vi.resetModules();
    const { default: getLismProps } = await import('../src/lib/getLismProps');
    const result = getLismProps({ lts: '2xl' });
    expect(result.className ?? '').not.toContain('-lts:2xl');
  });
});
