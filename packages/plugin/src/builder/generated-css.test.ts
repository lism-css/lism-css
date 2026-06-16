// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { generateCssToDir } from './generated-css';

const dirs: string[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-gen-css-'));
  dirs.push(dir);
  return dir;
}
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

describe('generateCssToDir', () => {
  test('config 反映 CSS を outDir へ生成し、bare CSS import の alias map を返す', async () => {
    const root = tmpDir();
    const outDir = path.join(root, '.lism-css/css');
    // minify=false で cssnano を省き、テストを軽くする。
    const result = await generateCssToDir({ projectRoot: root, outDir, minify: false });

    // main エントリは生成され、alias map は bare specifier → 生成 CSS 絶対パス。
    expect(result.entries).toContain('main');
    expect(result.aliasMap['lism-css/main.css']).toBe(path.join(outDir, 'main.css'));
    expect(fs.existsSync(result.aliasMap['lism-css/main.css'])).toBe(true);
    // 入れ子エントリも posix キーで解決する。
    expect(result.aliasMap['lism-css/base/set.css']).toBe(path.join(outDir, 'base/set.css'));
    expect(result.outDir).toBe(outDir);
    // user config が無い場合は null。
    expect(result.userConfigPath).toBeNull();
    // full 系は既定で生成しない。
    expect(result.entries).not.toContain('full');
  });

  test('user lism.config を反映し、userConfigPath を返す（watch 対象）', async () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default { props: { myz: { prop: "zIndex", utils: { "9": "9" } } } };\n');
    const outDir = path.join(root, '.lism-css/css');
    const result = await generateCssToDir({ projectRoot: root, outDir, minify: false });

    expect(result.userConfigPath).toBe(path.join(root, 'lism.config.js'));
    // user 設定で追加した prop クラスが props レイヤーの生成 CSS に出力される。
    const propsCss = fs.readFileSync(path.join(outDir, 'props.css'), 'utf8');
    expect(propsCss).toContain('-myz');
  });

  test('full: true で full エントリも生成する', async () => {
    const root = tmpDir();
    const outDir = path.join(root, '.lism-css/css');
    const result = await generateCssToDir({ projectRoot: root, outDir, full: true, minify: false });
    expect(result.entries).toContain('full');
    expect(result.aliasMap['lism-css/full.css']).toBe(path.join(outDir, 'full.css'));
  });
});
