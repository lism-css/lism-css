// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { describe, expect, test, afterAll } from 'vitest';
import defaultConfig from '../../config/default-config';
import propsFull from '../../config/presets/props-full';
import { objDeepMerge } from '../../config/helper';
import { computeBuildConfigs } from './load-config';
import { createCssCompiler, listCssEntries, type CssCompiler } from './compile-entry';
import type { BuildConfig } from './serialize';

const scssDir = fileURLToPath(new URL('../scss', import.meta.url));
const objMerge = objDeepMerge as (a: Record<string, unknown>, b: Record<string, unknown>) => Record<string, unknown>;

function configs(userConfig: Record<string, unknown>) {
  return computeBuildConfigs({
    defaultConfig: defaultConfig as unknown as BuildConfig,
    propsFull,
    userConfig,
    objDeepMerge: objMerge,
  });
}

const compilers: CssCompiler[] = [];
function makeCompiler(): CssCompiler {
  const c = createCssCompiler({ scssDir });
  compilers.push(c);
  return c;
}
afterAll(() => compilers.forEach((c) => c.dispose()));

describe('listCssEntries', () => {
  test('dist/css に対応するエントリ名を導出する（入れ子含む）', async () => {
    const map = await listCssEntries(scssDir);
    const keys = [...map.keys()];
    // トップレベル
    expect(keys).toContain('main');
    expect(keys).toContain('main_no_layer');
    expect(keys).toContain('full');
    expect(keys).toContain('reset');
    expect(keys).toContain('props');
    // 入れ子（X/index.scss → X）
    expect(keys).toContain('base/set');
    expect(keys).toContain('primitives/atomic');
    expect(keys).toContain('primitives/layout');
    // `_*` は除外される
    expect(keys.some((k) => k.includes('prop-config'))).toBe(false);
    // index 付きのキーは残らない
    expect(keys.some((k) => k.endsWith('/index'))).toBe(false);
  });
});

describe('createCssCompiler', () => {
  test('エントリを CSS 文字列へコンパイルする', async () => {
    const c = makeCompiler();
    const { mainConfig, fullConfig } = configs({});
    const css = await c.compile('props', mainConfig, fullConfig);
    expect(typeof css).toBe('string');
    expect(css.length).toBeGreaterThan(0);
    // props レイヤーには Property Class が含まれる
    expect(css).toMatch(/-p\\?:/);
  });

  test('lism.config（user 設定）が CSS に反映される', async () => {
    const c = makeCompiler();
    const base = configs({});
    const customized = configs({ props: { myz: { prop: 'zIndex', utils: { '9': '9' } } } });

    const defaultCss = await c.compile('props', base.mainConfig, base.fullConfig);
    const customCss = await c.compile('props', customized.mainConfig, customized.fullConfig);

    // デフォルトには無いカスタム prop クラスが、設定変更後の CSS には出力される
    expect(defaultCss).not.toContain('-myz');
    expect(customCss).toContain('-myz');
    expect(customCss).not.toBe(defaultCss);
  });

  test('tokens のインライン値が CSS に注入され、値だけの変更でもキャッシュが更新される', async () => {
    const c = makeCompiler();
    const first = configs({ tokens: { lts: { '2xl': '.5em' }, space: { '90': '6rem' } } });
    const updated = configs({ tokens: { lts: { '2xl': '.75em' }, space: { '90': '7rem' } } });

    const firstCss = await c.compile('main', first.mainConfig, first.fullConfig);
    const updatedCss = await c.compile('main', updated.mainConfig, updated.fullConfig);

    expect(firstCss).toContain('--lts--2xl: .5em');
    expect(firstCss).toContain('--s90: 6rem');
    expect(firstCss).toContain('.-lts\\:2xl');
    expect(firstCss).toContain('.-p\\:90');
    expect(updatedCss).toContain('--lts--2xl: .75em');
    expect(updatedCss).toContain('--s90: 7rem');
    expect(updatedCss).not.toContain('--lts--2xl: .5em');
    expect(updatedCss).not.toContain('--s90: 6rem');
  });

  test('lism.config の breakpoints だけで xs を有効化できる', async () => {
    const c = makeCompiler();
    const base = configs({});
    // 差分上書き: xs にサイズを与えるだけで有効化（デフォルトは xs:0=無効）。
    const withXs = configs({ breakpoints: { xs: '360px' } });

    const defaultCss = await c.compile('props', base.mainConfig, base.fullConfig);
    const xsCss = await c.compile('props', withXs.mainConfig, withXs.fullConfig);

    // デフォルトでは xs クエリ（360px）は出力されない
    expect(defaultCss).not.toContain('360px');
    // config で xs を有効化すると 360px のクエリが出力される
    expect(xsCss).toContain('360px');
    expect(xsCss).not.toBe(defaultCss);
  });

  test('full エントリの xs は user 設定が既定値より優先される', async () => {
    const c = makeCompiler();
    const withXs = configs({ breakpoints: { xs: '420px' } });

    const fullCss = await c.compile('full', withXs.mainConfig, withXs.fullConfig);

    expect(fullCss).toContain('420px');
    expect(fullCss).not.toContain('360px');
  });

  test('同一 config・同一エントリはキャッシュされ同一結果を返す', async () => {
    const c = makeCompiler();
    const { mainConfig, fullConfig } = configs({});
    const a = await c.compile('reset', mainConfig, fullConfig);
    const b = await c.compile('reset', mainConfig, fullConfig);
    expect(a).toBe(b);
  });

  test('dispose 後も再コンパイルできる（作業ディレクトリを作り直す）', async () => {
    const c = makeCompiler();
    const { mainConfig, fullConfig } = configs({});
    const before = await c.compile('reset', mainConfig, fullConfig);
    c.dispose();
    const after = await c.compile('reset', mainConfig, fullConfig);
    expect(after).toBe(before);
  });

  test('未知エントリはエラー', async () => {
    const c = makeCompiler();
    const { mainConfig, fullConfig } = configs({});
    await expect(c.compile('does-not-exist', mainConfig, fullConfig)).rejects.toThrow(/unknown CSS entry/);
  });
});
