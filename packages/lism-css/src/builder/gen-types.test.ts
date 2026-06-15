// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test, afterAll } from 'vitest';
import { extraAdvertisedBpKeys, generateBreakpointDts } from './gen-types';
import { writeBreakpointDts, TYPES_FILENAME } from './vite-typegen';

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

describe('generateBreakpointDts', () => {
  test('追加解禁キーがあれば BreakpointRegistry 拡張の .d.ts を生成する', () => {
    const dts = generateBreakpointDts({ xs: '360px', xl: '1400px' });
    expect(dts).not.toBeNull();
    expect(dts).toContain("declare module 'lism-css'");
    expect(dts).toContain('interface BreakpointRegistry');
    expect(dts).toContain('xs: true;');
    expect(dts).toContain('xl: true;');
    // 編集禁止の自動生成ヘッダを含む
    expect(dts).toContain('自動生成');
  });

  test('追加解禁キーが無ければ null（ファイル不要）', () => {
    expect(generateBreakpointDts({ sm: '480px', md: '800px', lg: '1120px' })).toBeNull();
    expect(generateBreakpointDts(undefined)).toBeNull();
  });
});

describe('writeBreakpointDts', () => {
  const dirs: string[] = [];
  function tmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-typegen-'));
    dirs.push(dir);
    return dir;
  }
  afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

  test('content があれば lism-env.d.ts を書き出す', () => {
    const root = tmpDir();
    writeBreakpointDts(root, generateBreakpointDts({ xs: '360px' }));
    const file = path.join(root, TYPES_FILENAME);
    expect(fs.existsSync(file)).toBe(true);
    expect(fs.readFileSync(file, 'utf8')).toContain('xs: true;');
  });

  test('内容が変わらなければ書き込まない（mtime 不変 = HMR ループ回避）', () => {
    const root = tmpDir();
    const content = generateBreakpointDts({ xs: '360px' });
    writeBreakpointDts(root, content);
    const file = path.join(root, TYPES_FILENAME);
    const mtime1 = fs.statSync(file).mtimeMs;
    writeBreakpointDts(root, content);
    expect(fs.statSync(file).mtimeMs).toBe(mtime1);
  });

  test('content が null なら既存の生成物を削除する', () => {
    const root = tmpDir();
    const file = path.join(root, TYPES_FILENAME);
    fs.writeFileSync(file, '// stale', 'utf8');
    writeBreakpointDts(root, generateBreakpointDts({ sm: '480px' })); // null
    expect(fs.existsSync(file)).toBe(false);
  });
});
