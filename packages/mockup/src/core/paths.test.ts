import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

import { cleanupTempDirs, createTempDir, writeFiles } from '../test-helpers/fixtures.js';
import { isInsideDir, safeRealpath } from './paths.js';

afterAll(() => {
  cleanupTempDirs();
});

describe('isInsideDir', () => {
  const dir = path.resolve('/base/data');

  test('自身と配下は内側', () => {
    expect(isInsideDir(dir, dir)).toBe(true);
    expect(isInsideDir(dir, path.join(dir, 'pages/home.jsx'))).toBe(true);
  });

  test('親・兄弟は外側', () => {
    expect(isInsideDir(dir, path.dirname(dir))).toBe(false);
    expect(isInsideDir(dir, path.resolve('/base/other/x.jsx'))).toBe(false);
  });

  test('前方一致するだけの別ディレクトリは外側', () => {
    expect(isInsideDir(dir, `${dir}-extra/x.jsx`)).toBe(false);
  });
});

describe('safeRealpath', () => {
  test('シンボリックリンクは実体へ解決する', () => {
    const dir = createTempDir();
    writeFiles(dir, { 'real/x.js': '' });
    fs.symlinkSync(path.join(dir, 'real'), path.join(dir, 'link'));

    expect(safeRealpath(path.join(dir, 'link', 'x.js'))).toBe(path.join(dir, 'real', 'x.js'));
  });

  test('存在しないパスは絶対パス化して返す（例外にしない）', () => {
    const dir = createTempDir();
    const missing = path.join(dir, 'missing', 'x.js');

    expect(safeRealpath(missing)).toBe(missing);
    expect(safeRealpath('relative/x.js')).toBe(path.resolve('relative/x.js'));
  });

  test('ディレクトリ内のリンクが外を指す場合、realpath 後は内側判定を通らない', () => {
    const root = createTempDir();
    const inside = path.join(root, 'inside');
    writeFiles(root, { 'outside.js': '', 'inside/.keep': '' });
    const link = path.join(inside, 'escape.js');
    fs.symlinkSync(path.join(root, 'outside.js'), link);

    // 文字列上は内側に見えるが、実体は外にある。
    expect(isInsideDir(inside, link)).toBe(true);
    expect(isInsideDir(inside, safeRealpath(link))).toBe(false);
  });
});
