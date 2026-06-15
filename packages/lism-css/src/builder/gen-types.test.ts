// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test, afterAll } from 'vitest';
import { extraAdvertisedBpKeys, extraCustomPropKeys, generateLismEnvDts } from './gen-types';
import { writeLismEnvDts, TYPES_FILENAME } from './vite-typegen';

const DEFAULT_PROP_KEYS = ['p', 'bg', 'fz'];

describe('extraAdvertisedBpKeys', () => {
  test('有効化された xs/xl のみを追加解禁キーとして返す', () => {
    expect(extraAdvertisedBpKeys({ xs: '360px', sm: '480px', md: '800px', lg: '1120px', xl: 0 })).toEqual(['xs']);
    expect(extraAdvertisedBpKeys({ xs: '360px', xl: '1400px' })).toEqual(['xs', 'xl']);
  });

  test('デフォルト広告（sm/md/lg）は対象外、サイズ0/未定義は無効', () => {
    expect(extraAdvertisedBpKeys({ sm: '480px', md: '800px', lg: '1120px' })).toEqual([]);
    expect(extraAdvertisedBpKeys({ xs: 0, xl: 0 })).toEqual([]);
    expect(extraAdvertisedBpKeys(undefined)).toEqual([]);
  });
});

describe('extraCustomPropKeys', () => {
  test('default-config に無い prop のみを追加解禁キーとして返す', () => {
    expect(
      extraCustomPropKeys({ p: { prop: 'padding' }, filter: { prop: 'filter' }, 'scroll-m': { prop: 'scrollMargin' } }, DEFAULT_PROP_KEYS)
    ).toEqual(['filter', 'scroll-m']);
  });

  test('props が無い場合や既定 prop だけの場合は空配列を返す', () => {
    expect(extraCustomPropKeys({ p: { prop: 'padding' }, bg: { prop: 'background' } }, DEFAULT_PROP_KEYS)).toEqual([]);
    expect(extraCustomPropKeys(undefined, DEFAULT_PROP_KEYS)).toEqual([]);
  });
});

describe('generateLismEnvDts', () => {
  test('追加解禁キーがあれば BreakpointRegistry 拡張の .d.ts を生成する', () => {
    const dts = generateLismEnvDts({ breakpoints: { xs: '360px', xl: '1400px' }, props: {} }, DEFAULT_PROP_KEYS);
    expect(dts).not.toBeNull();
    expect(dts).toContain("declare module 'lism-css'");
    expect(dts).toContain('interface BreakpointRegistry');
    expect(dts).toContain('xs: true;');
    expect(dts).toContain('xl: true;');
    // 編集禁止の自動生成ヘッダを含む
    expect(dts).toContain('自動生成');
  });

  test('追加 prop があれば CustomPropRegistry 拡張の .d.ts を生成する', () => {
    const dts = generateLismEnvDts({ breakpoints: {}, props: { p: { prop: 'padding' }, filter: { prop: 'filter' } } }, DEFAULT_PROP_KEYS);
    expect(dts).not.toBeNull();
    expect(dts).toContain("import type { CustomPropValue } from 'lism-css';");
    expect(dts).toContain('interface CustomPropRegistry');
    expect(dts).toContain('filter?: CustomPropValue;');
    expect(dts).not.toContain('p?: CustomPropValue;');
  });

  test('breakpoints と props を同じ declare module に並べて生成する', () => {
    const dts = generateLismEnvDts(
      { breakpoints: { xs: '360px' }, props: { filter: { prop: 'filter' }, 'scroll-m': { prop: 'scrollMargin' } } },
      DEFAULT_PROP_KEYS
    );
    expect(dts).not.toBeNull();
    expect(dts).toContain('interface BreakpointRegistry');
    expect(dts).toContain('interface CustomPropRegistry');
    expect(dts).toContain('xs: true;');
    expect(dts).toContain('filter?: CustomPropValue;');
    expect(dts).toContain('"scroll-m"?: CustomPropValue;');
    expect(dts?.match(/declare module 'lism-css'/g)).toHaveLength(1);
  });

  test('追加 breakpoints / props がどちらも無ければ null（ファイル不要）', () => {
    expect(
      generateLismEnvDts({ breakpoints: { sm: '480px', md: '800px', lg: '1120px' }, props: { p: { prop: 'padding' } } }, DEFAULT_PROP_KEYS)
    ).toBeNull();
    expect(generateLismEnvDts({ breakpoints: undefined, props: {} }, DEFAULT_PROP_KEYS)).toBeNull();
  });
});

describe('writeLismEnvDts', () => {
  const dirs: string[] = [];
  function tmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-typegen-'));
    dirs.push(dir);
    return dir;
  }
  afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

  test('content があれば lism-env.d.ts を書き出す', () => {
    const root = tmpDir();
    writeLismEnvDts(root, generateLismEnvDts({ breakpoints: { xs: '360px' }, props: {} }, DEFAULT_PROP_KEYS));
    const file = path.join(root, TYPES_FILENAME);
    expect(fs.existsSync(file)).toBe(true);
    expect(fs.readFileSync(file, 'utf8')).toContain('xs: true;');
  });

  test('内容が変わらなければ書き込まない（mtime 不変 = HMR ループ回避）', () => {
    const root = tmpDir();
    const content = generateLismEnvDts({ breakpoints: { xs: '360px' }, props: {} }, DEFAULT_PROP_KEYS);
    writeLismEnvDts(root, content);
    const file = path.join(root, TYPES_FILENAME);
    const mtime1 = fs.statSync(file).mtimeMs;
    writeLismEnvDts(root, content);
    expect(fs.statSync(file).mtimeMs).toBe(mtime1);
  });

  test('追加 breakpoints / props がどちらも無く content が null なら既存の「生成物」を削除する', () => {
    const root = tmpDir();
    const file = path.join(root, TYPES_FILENAME);
    // 自動生成された .d.ts（マーカー付き）を置いておく
    fs.writeFileSync(file, generateLismEnvDts({ breakpoints: { xs: '360px' }, props: {} }, DEFAULT_PROP_KEYS)!, 'utf8');
    writeLismEnvDts(root, generateLismEnvDts({ breakpoints: { sm: '480px' }, props: { p: { prop: 'padding' } } }, DEFAULT_PROP_KEYS)); // null
    expect(fs.existsSync(file)).toBe(false);
  });

  test('追加 breakpoints が無くても追加 props が残れば削除しない', () => {
    const root = tmpDir();
    const file = path.join(root, TYPES_FILENAME);
    const content = generateLismEnvDts({ breakpoints: { xs: '360px' }, props: {} }, DEFAULT_PROP_KEYS)!;
    fs.writeFileSync(file, content, 'utf8');

    writeLismEnvDts(root, generateLismEnvDts({ breakpoints: { sm: '480px' }, props: { filter: { prop: 'filter' } } }, DEFAULT_PROP_KEYS));

    expect(fs.existsSync(file)).toBe(true);
    expect(fs.readFileSync(file, 'utf8')).toContain('filter?: CustomPropValue;');
    expect(fs.readFileSync(file, 'utf8')).not.toContain('xs: true;');
  });

  test('content が null でも、自動生成マーカーの無い手書きファイルは削除しない', () => {
    const root = tmpDir();
    const file = path.join(root, TYPES_FILENAME);
    fs.writeFileSync(file, '// 手書きの型定義\n', 'utf8');
    writeLismEnvDts(root, null);
    expect(fs.existsSync(file)).toBe(true);
  });

  test('自動生成マーカーの無い手書きファイルは上書きしない', () => {
    const root = tmpDir();
    const file = path.join(root, TYPES_FILENAME);
    fs.writeFileSync(file, '// 手書きの型定義\n', 'utf8');

    writeLismEnvDts(root, generateLismEnvDts({ breakpoints: { xs: '360px' }, props: {} }, DEFAULT_PROP_KEYS));

    expect(fs.readFileSync(file, 'utf8')).toBe('// 手書きの型定義\n');
  });
});
