import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { loadBuildConfigs } from '@lism-css/plugin/builder';

import { cleanupTempDirs, createDataDir, createTempDir } from '../test-helpers/fixtures.js';
import { buildTokensArtifacts, collectTokenGroups, loadTokens, validateTokens, writeConfigModule } from './tokens.js';

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

describe('loadTokens', () => {
  test('tokens.json が無ければ空トークン扱い', async () => {
    await expect(loadTokens(createDataDir({}))).resolves.toEqual({});
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
});
