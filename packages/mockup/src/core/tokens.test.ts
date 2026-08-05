import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { loadBuildConfigs } from '@lism-css/plugin/builder';

import { cleanupTempDirs, createDataDir, createTempDir } from '../test-helpers/fixtures.js';
import {
  buildTokensArtifacts,
  collectDarkTokens,
  collectTokenGroups,
  loadTokens,
  mergeLightTokens,
  readTokensFile,
  serializeDarkTokens,
  validateDarkTokens,
  validateTokens,
  writeConfigModule,
} from './tokens.js';

let defaultTokens: Record<string, unknown>;

beforeAll(async () => {
  ({
    defaultConfig: { tokens: defaultTokens },
  } = await loadBuildConfigs(createTempDir()));
});

afterAll(() => {
  cleanupTempDirs();
});

describe('validateTokens', () => {
  test('color は新しいキーを追加できる', () => {
    const tokens = validateTokens({ color: { canvas: '#f7f7f7' } }, defaultTokens, 'tokens.json');
    expect(tokens).toEqual({ color: { canvas: '#f7f7f7' } });
  });

  test('color 以外の新キーは契約違反', () => {
    expect(() => validateTokens({ space: { huge: '10rem' } }, defaultTokens, 'tokens.json')).toThrow(/"space.huge" is not an existing token/);
  });

  test('color 以外でも既存キーの上書きは通る', () => {
    expect(validateTokens({ space: { '30': '1rem' } }, defaultTokens, 'tokens.json')).toEqual({ space: { '30': '1rem' } });
  });

  test('vars は構造変数（既存キー）の上書きが通り、typo（新キー）は契約違反', () => {
    expect(validateTokens({ vars: { '--L': '72%', '--C': '0.15' } }, defaultTokens, 'tokens.json')).toEqual({
      vars: { '--L': '72%', '--C': '0.15' },
    });
    expect(() => validateTokens({ vars: { '--fz--mol': '9' } }, defaultTokens, 'tokens.json')).toThrow(/"vars.--fz--mol" is not an existing token/);
  });

  test('未知のトークン種別は契約違反', () => {
    expect(() => validateTokens({ shadow: { s: '0 0 0' } }, defaultTokens, 'tokens.json')).toThrow(/unknown token group "shadow"/);
  });

  test('prototype 由来のキーを種別名にしても既知グループ扱いしない', () => {
    for (const group of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      // 空オブジェクトだと「既存トークンではない」チェックが1件も走らないため、素通りしないことを確かめる。
      expect(() => validateTokens(JSON.parse(`{ "${group}": {} }`), defaultTokens, 'tokens.json')).toThrow(
        new RegExp(`unknown token group "${group}"`)
      );
      expect(() => validateTokens(JSON.parse(`{ "${group}": { "brand": "#fff" } }`), defaultTokens, 'tokens.json')).toThrow(/unknown token group/);
    }
  });

  test('__proto__ はトークンキーにできない（生成 config が持てないため）', () => {
    // 通すと validateTokens は own key として保持できるのに、生成 config のオブジェクトリテラルで
    // 消えて CSS にもトークン一覧にも出ない。黙って消えるより契約違反にする。
    expect(() => validateTokens(JSON.parse('{ "color": { "__proto__": "#fff" } }'), defaultTokens, 'tokens.json')).toThrow(
      /"color\.__proto__" cannot be used as a token key/
    );
  });

  test('検証結果は null プロトタイプで、prototype 由来の名前も own key として保持する', () => {
    const tokens = validateTokens(JSON.parse('{ "color": { "constructor": "#fff", "toString": "#000" } }'), defaultTokens, 'tokens.json');

    expect(Object.getPrototypeOf(tokens)).toBe(null);
    expect(Object.getPrototypeOf(tokens.color)).toBe(null);
    expect(Object.keys(tokens.color)).toEqual(['constructor', 'toString']);
  });

  test('値は string / number のみ', () => {
    expect(() => validateTokens({ color: { brand: { light: '#fff' } } }, defaultTokens, 'tokens.json')).toThrow(/must be a string or a number/);
  });

  test('トップレベルがオブジェクトでなければエラー', () => {
    expect(() => validateTokens(['#fff'], defaultTokens, 'tokens.json')).toThrow(/must contain a JSON object/);
    expect(() => validateTokens({ color: '#fff' }, defaultTokens, 'tokens.json')).toThrow(/"color" must be an object/);
  });
});

describe('readTokensFile', () => {
  test('ファイルが無ければ null', () => {
    expect(readTokensFile(createDataDir({}))).toBeNull();
  });

  test('ENOENT 以外の読み込みエラー（権限エラー等）は null 扱いにせず、そのまま投げる', () => {
    const dir = createDataDir({ 'tokens.json': '{}' });
    const eacces = Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
    const spy = vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw eacces;
    });
    try {
      expect(() => readTokensFile(dir)).toThrow(eacces);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('loadTokens', () => {
  test('トークンファイルが無ければ空トークン扱い', async () => {
    await expect(loadTokens(createDataDir({}))).resolves.toEqual({ tokens: {}, darkTokens: {} });
  });

  test('JSON として壊れていればエラー', async () => {
    const dir = createDataDir({ 'tokens.json': '{ "color": ' });
    await expect(loadTokens(dir)).rejects.toThrow(/tokens.json is not valid JSON/);
  });

  test('契約違反は警告ではなくエラー', async () => {
    const dir = createDataDir({ 'tokens.json': JSON.stringify({ fz: { giant: '10rem' } }) });
    await expect(loadTokens(dir)).rejects.toThrow(/is not an existing token/);
  });

  test('tokens.json に prototype 由来の種別名を書いてもエラーになる', async () => {
    const dir = createDataDir({ 'tokens.json': '{ "toString": {}, "constructor": {} }' });
    await expect(loadTokens(dir)).rejects.toThrow(/unknown token group "toString"/);
  });

  test('tokens.dark.json が無ければダークは空（ファイルの有無＝ダーク対応の有無）', async () => {
    const dir = createDataDir({ 'tokens.json': JSON.stringify({ color: { brand: '#2f6f5e' } }) });
    await expect(loadTokens(dir)).resolves.toEqual({ tokens: { color: { brand: '#2f6f5e' } }, darkTokens: {} });
  });

  test('tokens.dark.json は tokens.json 無しでも読める', async () => {
    const dir = createDataDir({ 'tokens.dark.json': JSON.stringify({ color: { base: '#111111' } }) });
    await expect(loadTokens(dir)).resolves.toEqual({ tokens: {}, darkTokens: { color: { base: '#111111' } } });
  });

  test('tokens.json が足した独自キーもダークで上書きできる', async () => {
    const dir = createDataDir({
      'tokens.json': JSON.stringify({ color: { canvas: '#f7f7f7' } }),
      'tokens.dark.json': JSON.stringify({ color: { canvas: '#151515' } }),
    });
    await expect(loadTokens(dir)).resolves.toEqual({ tokens: { color: { canvas: '#f7f7f7' } }, darkTokens: { color: { canvas: '#151515' } } });
  });

  test('ライトのどこにも無いキーはダークで追加できない（color の新キー例外は持ち込まない）', async () => {
    const dir = createDataDir({ 'tokens.dark.json': JSON.stringify({ color: { canvas: '#151515' } }) });
    await expect(loadTokens(dir)).rejects.toThrow(/"color\.canvas" does not exist in the light theme/);
  });

  test('ダークの JSON が壊れていればファイル名つきでエラー', async () => {
    const dir = createDataDir({ 'tokens.dark.json': '{ "color": ' });
    await expect(loadTokens(dir)).rejects.toThrow(/tokens\.dark\.json is not valid JSON/);
  });
});

describe('validateDarkTokens', () => {
  /** マージ後のライト側トークン（`'-'` は CSS 変数を持たないキー）。 */
  const LIGHT = { color: { base: '#ffffff', canvas: '#f7f7f7' }, lh: { base: '-' }, vars: { '--L': '60%' } };

  test('ライトに実値があるキーは上書きできる', () => {
    expect(validateDarkTokens({ color: { base: '#111111' }, vars: { '--L': '72%' } }, LIGHT, 'tokens.dark.json')).toEqual({
      color: { base: '#111111' },
      vars: { '--L': '72%' },
    });
  });

  test('ライトが CSS 変数を持たないキー（"-" センチネル）は上書きできない', () => {
    // ライトに値が無いものをダークにだけ持たせると、一覧が「ライトに対する差分」として組めなくなる。
    // 種別まるごと上書き不可なので、空の候補リストではなくその旨を伝える。
    expect(() => validateDarkTokens({ lh: { base: '1.8' } }, LIGHT, 'tokens.dark.json')).toThrow(
      /"lh\.base" does not exist in the light theme\. No token in "lh" can be overridden/
    );
  });

  test('一部だけ上書きできる種別では、候補に上書きできるキーだけを並べる', () => {
    const light = { bdrs: { '10': '0.25rem', inner: '-' } };
    expect(() => validateDarkTokens({ bdrs: { outer: '1rem' } }, light, 'tokens.dark.json')).toThrow(/\(bdrs: 10\)/);
  });

  test('未知のトークン種別・prototype 由来の種別名は契約違反', () => {
    expect(() => validateDarkTokens({ shadow: { s: '0 0 0' } }, LIGHT, 'tokens.dark.json')).toThrow(/unknown token group "shadow"/);
    expect(() => validateDarkTokens(JSON.parse('{ "toString": {} }'), LIGHT, 'tokens.dark.json')).toThrow(/unknown token group "toString"/);
  });

  test('エラー文のファイル名は tokens.dark.json になる', () => {
    expect(() => validateDarkTokens(['#fff'], LIGHT, 'tokens.dark.json')).toThrow(/^tokens\.dark\.json must contain a JSON object/);
    expect(() => validateDarkTokens({ color: { base: { x: 1 } } }, LIGHT, 'tokens.dark.json')).toThrow(
      /tokens\.dark\.json: "color\.base" must be a string or a number/
    );
  });
});

describe('mergeLightTokens', () => {
  const DEFAULTS = { color: { base: '#ffffff' }, ratio: ['1/2', '1/3'] };

  test('default-config へ tokens.json を重ねた結果を返す', () => {
    const merged = mergeLightTokens(DEFAULTS, { color: { base: '#fafafa', canvas: '#f7f7f7' } });

    expect(merged.color).toEqual({ base: '#fafafa', canvas: '#f7f7f7' });
    expect(Object.getPrototypeOf(merged)).toBe(null);
  });

  test('配列カタログは CSS 変数を持たないキーとして扱う', () => {
    expect(mergeLightTokens(DEFAULTS, {}).ratio).toEqual({ '1/2': '-', '1/3': '-' });
  });
});

describe('collectTokenGroups', () => {
  const DEFAULT_TOKENS = {
    color: { text: '#333333', base: '#ffffff' },
    space: { '30': '1rem' },
    fz: { l: '1.25rem' },
  };

  /** グループ名 → トークンキーの配列（結果の並びを見やすく比較するため）。 */
  function keysOf(groups: ReturnType<typeof collectTokenGroups>): Record<string, string[]> {
    return Object.fromEntries(groups.map((entry) => [entry.group, entry.tokens.map((token) => token.key)]));
  }

  test('上書きが無ければすべて default（変数名は getTokenVarName の規則）', () => {
    const groups = collectTokenGroups(DEFAULT_TOKENS, DEFAULT_TOKENS, {});

    expect(keysOf(groups)).toEqual({ color: ['text', 'base'], space: ['30'], fz: ['l'] });
    expect(groups[0].tokens[0]).toEqual({ key: 'text', varName: '--text', value: '#333333', source: 'default' });
    expect(groups[1].tokens[0].varName).toBe('--s30');
    // プレフィックス未登録の種別は `--{種別}--{キー}` になる。
    expect(groups[2].tokens[0].varName).toBe('--fz--l');
  });

  test('既存キーの上書きは overridden、color の新キーは custom', () => {
    const groups = collectTokenGroups({ color: { text: '#000000', base: '#ffffff', canvas: '#f7f7f7' }, space: { '30': '1.5rem' } }, DEFAULT_TOKENS, {
      color: { text: '#000000', canvas: '#f7f7f7' },
      space: { '30': '1.5rem' },
    });

    expect(groups[0].tokens).toEqual([
      { key: 'text', varName: '--text', value: '#000000', source: 'overridden' },
      { key: 'base', varName: '--base', value: '#ffffff', source: 'default' },
      { key: 'canvas', varName: '--canvas', value: '#f7f7f7', source: 'custom' },
    ]);
    expect(groups[1].tokens[0].source).toBe('overridden');
  });

  test('生成 CSS に出ない値（"-" センチネル・空文字・null）は一覧に出さない', () => {
    const groups = collectTokenGroups({ color: { text: '#333333', divider: '-', border: '', shadow: null } }, DEFAULT_TOKENS, {});

    expect(keysOf(groups)).toEqual({ color: ['text'] });
  });

  test('全トークンが除外された種別は結果に含めない', () => {
    const groups = collectTokenGroups({ color: { text: '#333333' }, fz: { l: '-', xl: '' } }, DEFAULT_TOKENS, {});

    expect(groups.map((entry) => entry.group)).toEqual(['color']);
  });

  test('配列カタログや非オブジェクトの種別は飛ばす', () => {
    const groups = collectTokenGroups({ color: { text: '#333333' }, ratio: ['1/2', '1/3'], flag: 'x', empty: null }, DEFAULT_TOKENS, {});

    expect(groups.map((entry) => entry.group)).toEqual(['color']);
  });

  test('数値の値は文字列化する', () => {
    const groups = collectTokenGroups({ fz: { l: 1.25 } }, DEFAULT_TOKENS, { fz: { l: 1.25 } });

    expect(groups[0].tokens[0]).toEqual({ key: 'l', varName: '--fz--l', value: '1.25', source: 'overridden' });
  });

  test('null プロトタイプの overrides でも判定でき、prototype 由来のキーは上書き扱いしない', () => {
    const overrides = Object.create(null) as Record<string, Record<string, string>>;
    overrides.color = Object.assign(Object.create(null) as Record<string, string>, { canvas: '#f7f7f7' });

    const groups = collectTokenGroups({ color: { text: '#333333', canvas: '#f7f7f7' } }, DEFAULT_TOKENS, overrides);
    expect(groups[0].tokens.map((token) => token.source)).toEqual(['default', 'custom']);

    // `in` 判定だと `constructor` / `toString` が上書き済み扱いになってしまう（hasOwn なので default のまま）。
    const proto = collectTokenGroups({ constructor: { a: '1' }, toString: { b: '2' } }, DEFAULT_TOKENS, {});
    expect(proto.flatMap((entry) => entry.tokens.map((token) => token.source))).toEqual(['default', 'default']);
  });

  test('ダークのある種別には元セクションの直後にダークセクションを足す', () => {
    const light = { color: { text: '#333333', base: '#ffffff' }, space: { '30': '1rem' } };
    const darkEntries = collectDarkTokens(light, { color: { base: '#111111' } });
    const groups = collectTokenGroups(light, DEFAULT_TOKENS, {}, darkEntries);

    expect(groups.map((entry) => entry.id)).toEqual(['color', 'color--dark', 'space']);
    expect(groups[1]).toEqual({
      id: 'color--dark',
      group: 'color',
      // プレビュー形状は group で引くため、表示ラベルとは別に持つ。
      label: 'color (dark)',
      isDark: true,
      tokens: [{ key: 'base', varName: '--base', value: '#111111', source: 'overridden' }],
    });
  });

  test('ダークが無ければセクションは増えず、ライトのセクションに isDark も付かない', () => {
    const groups = collectTokenGroups(DEFAULT_TOKENS, DEFAULT_TOKENS, {}, []);

    expect(groups.map((entry) => entry.id)).toEqual(['color', 'space', 'fz']);
    expect(groups.every((entry) => entry.isDark === undefined)).toBe(true);
  });
});

describe('collectDarkTokens', () => {
  const LIGHT = {
    vars: { '--L': '60%', '--s-unit': '0.5rem' },
    color: { base: '#ffffff', text: '#111111' },
    palette: { red: 'oklch(var(--L) 0.2 20)', white: '#fff' },
    space: { '10': 'var(--s-unit)' },
  };

  test('指定したトークンだけを、ライトの並び順で返す', () => {
    const entries = collectDarkTokens(LIGHT, { color: { text: '#eeeeee', base: '#111111' } });

    expect(entries).toEqual([
      { group: 'color', key: 'base', varName: '--base', value: '#111111', isDeclared: true },
      { group: 'color', key: 'text', varName: '--text', value: '#eeeeee', isDeclared: true },
    ]);
  });

  test('構造変数を上書きすると、それを参照するトークンも再宣言する', () => {
    // `.set--dark { --L: 72% }` だけでは :root で確定済みの --red は変わらないため、
    // --red 自体を同じブロックへ再宣言する必要がある（.set--s / .set--bxsh と同じ理屈）。
    const entries = collectDarkTokens(LIGHT, { vars: { '--L': '72%' } });

    expect(entries).toEqual([
      { group: 'vars', key: '--L', varName: '--L', value: '72%', isDeclared: true },
      { group: 'palette', key: 'red', varName: '--red', value: 'oklch(var(--L) 0.2 20)', isDeclared: false },
    ]);
  });

  test('参照していないトークンは再宣言しない', () => {
    const entries = collectDarkTokens(LIGHT, { vars: { '--s-unit': '0.75rem' } });

    expect(entries.map((entry) => entry.varName)).toEqual(['--s-unit', '--s10']);
  });

  test('参照の連鎖を追い切る', () => {
    const chained = { vars: { '--a': '1px' }, space: { '10': 'calc(var(--a) * 2)', '20': 'calc(var(--s10) * 2)' } };
    const entries = collectDarkTokens(chained, { vars: { '--a': '2px' } });

    expect(entries.map((entry) => entry.varName)).toEqual(['--a', '--s10', '--s20']);
  });

  test('ダーク宣言が無ければ空', () => {
    expect(collectDarkTokens(LIGHT, {})).toEqual([]);
    // 値が空でも CSS へは出ないので、依存の再宣言も起こさない。
    expect(collectDarkTokens(LIGHT, { color: { base: '' } })).toEqual([]);
  });

  test('配列カタログや非オブジェクトの種別は飛ばす', () => {
    const entries = collectDarkTokens({ ...LIGHT, ratio: ['1/2'], flag: 'x' }, { color: { base: '#111111' } });

    expect(entries.map((entry) => entry.group)).toEqual(['color']);
  });
});

describe('serializeDarkTokens', () => {
  test('.set--dark ブロックとして出力する', () => {
    const css = serializeDarkTokens(collectDarkTokens({ color: { base: '#ffffff' } }, { color: { base: '#111111' } }));

    expect(css).toBe('.set--dark {\n  --base: #111111;\n}\n');
  });

  test('ダーク宣言が無ければ何も出さない（クラス自体を作らない）', () => {
    expect(serializeDarkTokens([])).toBe('');
  });
});

describe('writeConfigModule / buildTokensArtifacts', () => {
  test('生成 config は lism.config 互換の default export', () => {
    const dir = createTempDir();
    const file = writeConfigModule(dir, { color: { canvas: '#f7f7f7' } });

    expect(path.basename(file)).toBe('lism.config.js');
    expect(fs.readFileSync(file, 'utf-8')).toContain('export default {\n  "tokens": {\n    "color": {\n      "canvas": "#f7f7f7"');
  });

  test('color の新キーが生成 config 経由で CSS 変数になる', async () => {
    const dataDir = createDataDir({});
    const overrides = { color: { canvas: '#f7f7f7' } };
    const configPath = writeConfigModule(createTempDir(), overrides);

    const { css } = await buildTokensArtifacts(dataDir, configPath, overrides);
    expect(css).toContain('--canvas: #f7f7f7;');
  });

  test('space の上書きは .set--s スコープを含めて出力される', async () => {
    const dataDir = createDataDir({});
    const overrides = { space: { '30': '1.5rem' } };
    const configPath = writeConfigModule(createTempDir(), overrides);

    const { css } = await buildTokensArtifacts(dataDir, configPath, overrides);
    expect(css).toMatch(/:root,\n\.set--s \{[\s\S]*--s30: 1\.5rem;/);
  });

  test('同じパスへ書き直した config を読み直せる（tokens.json 変更時の再生成）', async () => {
    const dataDir = createDataDir({});
    const tempDir = createTempDir();

    const first = await buildTokensArtifacts(dataDir, writeConfigModule(tempDir, { color: { canvas: '#111111' } }), {
      color: { canvas: '#111111' },
    });
    expect(first.css).toContain('--canvas: #111111;');

    const second = await buildTokensArtifacts(dataDir, writeConfigModule(tempDir, { color: { canvas: '#222222' } }), {
      color: { canvas: '#222222' },
    });
    expect(second.css).toContain('--canvas: #222222;');
  });

  test('CSS と同じ config からトークン一覧を作る（上書きは overridden / custom）', async () => {
    const dataDir = createDataDir({});
    const overrides = { color: { canvas: '#f7f7f7', text: '#000000' } };
    const configPath = writeConfigModule(createTempDir(), overrides);

    const { css, groups } = await buildTokensArtifacts(dataDir, configPath, overrides);
    const color = groups.find((entry) => entry.group === 'color');

    expect(color?.tokens).toContainEqual({ key: 'canvas', varName: '--canvas', value: '#f7f7f7', source: 'custom' });
    expect(color?.tokens).toContainEqual({ key: 'text', varName: '--text', value: '#000000', source: 'overridden' });
    // 一覧に出るトークンは、生成 CSS が実際に定義しているものと一致する。
    for (const entry of groups) {
      for (const token of entry.tokens) expect(css).toContain(`${token.varName}: ${token.value};`);
    }
  });

  test('ダークは :root の後ろに .set--dark ブロックとして足され、一覧にもセクションが増える', async () => {
    const dataDir = createDataDir({});
    const configPath = writeConfigModule(createTempDir(), {});

    const { css, groups } = await buildTokensArtifacts(dataDir, configPath, {}, { color: { base: '#111111', text: '#eeeeee' } });

    expect(css).toContain('.set--dark {\n  --base: #111111;\n  --text: #eeeeee;\n}\n');
    // ライトの :root がダークで上書きされるよう、ダークは必ず後ろに出す。
    expect(css.indexOf('.set--dark {')).toBeGreaterThan(css.indexOf(':root {'));

    const darkIndex = groups.findIndex((entry) => entry.id === 'color--dark');
    expect(groups[darkIndex - 1].id).toBe('color');
    expect(groups[darkIndex].label).toBe('color (dark)');
    expect(groups[darkIndex].tokens.map((token) => token.key)).toEqual(['base', 'text']);
  });

  test('ダークの vars 上書きは、それを参照するパレット色まで .set--dark へ運ぶ', async () => {
    const dataDir = createDataDir({});
    const configPath = writeConfigModule(createTempDir(), {});

    const { css, groups } = await buildTokensArtifacts(dataDir, configPath, {}, { vars: { '--L': '72%' } });

    const darkBlock = css.slice(css.indexOf('.set--dark {'));
    expect(darkBlock).toContain('--L: 72%;');
    // --red は :root で値が確定しているため、再宣言しない限りダークの --L では組み直されない。
    expect(darkBlock).toContain('--red: oklch(var(--L) var(--C) 20);');
    expect(groups.map((entry) => entry.id)).toContain('palette--dark');
  });

  test('ダーク宣言が無ければ .set--dark も一覧のダークセクションも作らない', async () => {
    const dataDir = createDataDir({});
    const configPath = writeConfigModule(createTempDir(), {});

    const { css, groups } = await buildTokensArtifacts(dataDir, configPath, {});

    expect(css).not.toContain('.set--dark');
    expect(groups.every((entry) => entry.isDark === undefined)).toBe(true);
  });
});
