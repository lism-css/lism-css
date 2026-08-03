import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { loadBuildConfigs } from '@lism-css/plugin/builder';

import { cleanupTempDirs, createDataDir, createTempDir } from '../test-helpers/fixtures.js';
import { buildTokensCss, loadTokens, validateTokens, writeConfigModule } from './tokens.js';

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

  test('未知のトークン種別は契約違反', () => {
    expect(() => validateTokens({ shadow: { s: '0 0 0' } }, defaultTokens, 'tokens.json')).toThrow(/unknown token group "shadow"/);
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
});

describe('writeConfigModule / buildTokensCss', () => {
  test('生成 config は lism.config 互換の default export', () => {
    const dir = createTempDir();
    const file = writeConfigModule(dir, { color: { canvas: '#f7f7f7' } });

    expect(path.basename(file)).toBe('lism.config.js');
    expect(fs.readFileSync(file, 'utf-8')).toContain('export default {\n  "tokens": {\n    "color": {\n      "canvas": "#f7f7f7"');
  });

  test('color の新キーが生成 config 経由で CSS 変数になる', async () => {
    const dataDir = createDataDir({});
    const configPath = writeConfigModule(createTempDir(), { color: { canvas: '#f7f7f7' } });

    const css = await buildTokensCss(dataDir, configPath);
    expect(css).toContain('--canvas: #f7f7f7;');
  });

  test('space の上書きは .set--s スコープを含めて出力される', async () => {
    const dataDir = createDataDir({});
    const configPath = writeConfigModule(createTempDir(), { space: { '30': '1.5rem' } });

    const css = await buildTokensCss(dataDir, configPath);
    expect(css).toMatch(/:root,\n\.set--s \{[\s\S]*--s30: 1\.5rem;/);
  });

  test('同じパスへ書き直した config を読み直せる（tokens.json 変更時の再生成）', async () => {
    const dataDir = createDataDir({});
    const tempDir = createTempDir();

    const first = await buildTokensCss(dataDir, writeConfigModule(tempDir, { color: { canvas: '#111111' } }));
    expect(first).toContain('--canvas: #111111;');

    const second = await buildTokensCss(dataDir, writeConfigModule(tempDir, { color: { canvas: '#222222' } }));
    expect(second).toContain('--canvas: #222222;');
  });
});
