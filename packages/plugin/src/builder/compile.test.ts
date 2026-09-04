// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { compileCssTree } from './compile';

const dirs: string[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-plugin-compile-'));
  dirs.push(dir);
  return dir;
}
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

describe('compileCssTree', () => {
  test('既存の出力をその場で上書きせず新しい実体へ差し替える（ハードリンク先を汚さない・#594）', async () => {
    const scssDir = tmpDir();
    const distDir = tmpDir();
    fs.writeFileSync(path.join(scssDir, 'a.scss'), '.a { color: red; }\n');

    // pnpm のハードリンク配置を模す: dist の既存ファイルとストア側が同じ実体。
    const distPath = path.join(distDir, 'a.css');
    const storePath = path.join(tmpDir(), 'a.css');
    fs.writeFileSync(storePath, '/* store */');
    fs.linkSync(storePath, distPath);
    expect(fs.statSync(distPath).ino).toBe(fs.statSync(storePath).ino);

    const written = await compileCssTree({ scssDir, distDir, minify: false, log: () => {} });

    expect(written).toEqual([distPath]);
    expect(fs.readFileSync(distPath, 'utf8')).toContain('.a');
    expect(fs.readFileSync(storePath, 'utf8')).toBe('/* store */');
    expect(fs.statSync(distPath).ino).not.toBe(fs.statSync(storePath).ino);
    // 一時ファイルは残らない。
    expect(fs.readdirSync(distDir)).toEqual(['a.css']);
  });

  test('出力先ディレクトリが無ければ作成する', async () => {
    const scssDir = tmpDir();
    const distDir = path.join(tmpDir(), 'nested', 'css');
    fs.writeFileSync(path.join(scssDir, 'b.scss'), '.b { margin: 0; }\n');

    const written = await compileCssTree({ scssDir, distDir, minify: false, log: () => {} });

    expect(written).toEqual([path.join(distDir, 'b.css')]);
    expect(fs.readdirSync(distDir)).toEqual(['b.css']);
  });
});
