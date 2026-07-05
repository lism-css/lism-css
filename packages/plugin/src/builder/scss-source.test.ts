// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';
import { afterAll, describe, expect, test } from 'vitest';
import { generateLismScss } from './scss-source';

// `pkg:` importer は「@forward を書いたファイルの位置」から node_modules を上方探索する。
// 消費側（プロジェクト内に node_modules/lism-css がある）を再現するため、テスト用 root は
// plugin パッケージ配下に作る（packages/plugin/node_modules/lism-css へ到達できる）。
const PKG_ROOT = path.resolve(import.meta.dirname, '..', '..');

const dirs: string[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(PKG_ROOT, '.lism-test-'));
  dirs.push(dir);
  return dir;
}
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

/** 消費側に相当する最小エントリ。lism-setting（bridge）→ main_no_layer の順で `@use` する。 */
const CONSUMER_ENTRY = `@use 'lism-setting';\n@use 'pkg:lism-css/scss/main_no_layer';\n`;

/** bridge を pkg: importer + loadPaths で解決してコンパイルする（消費側の sass 設定を再現）。 */
function compileWithBridge(outDir: string): sass.CompileResult {
  return sass.compileString(CONSUMER_ENTRY, {
    loadPaths: [outDir],
    importers: [new sass.NodePackageImporter(outDir)],
  });
}

describe('generateLismScss', () => {
  test('既定 outDir に bridge 2ファイルを生成する', async () => {
    const root = tmpDir();
    const result = await generateLismScss({ projectRoot: root });

    expect(result.outDir).toBe(path.join(root, '.lism-css/scss'));
    expect(result.configFile).toBe(path.join(root, '.lism-css/scss/_lism-config.gen.scss'));
    expect(result.settingFile).toBe(path.join(root, '.lism-css/scss/lism-setting.scss'));
    expect(fs.existsSync(result.configFile)).toBe(true);
    expect(fs.existsSync(result.settingFile)).toBe(true);

    // _lism-config.gen.scss は $props / $breakpoints / $default_important を含む。
    const gen = fs.readFileSync(result.configFile, 'utf8');
    expect(gen).toContain('$props: (');
    expect(gen).toContain('$breakpoints:');
    expect(gen).toContain('$default_important:');

    // lism-setting.scss は config.gen を読み setting へ forward する bridge。
    const setting = fs.readFileSync(result.settingFile, 'utf8');
    expect(setting).toContain("@use 'lism-config.gen' as cfg;");
    expect(setting).toContain("@forward 'pkg:lism-css/scss/setting' with (");
  });

  test('outDir を明示指定できる', async () => {
    const root = tmpDir();
    const outDir = path.join(root, 'custom/scss');
    const result = await generateLismScss({ projectRoot: root, outDir });

    expect(result.outDir).toBe(outDir);
    expect(fs.existsSync(path.join(outDir, '_lism-config.gen.scss'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'lism-setting.scss'))).toBe(true);
  });

  test('生成 bridge を pkg: importer + loadPaths で解決してコンパイルできる', async () => {
    const root = tmpDir();
    const { outDir } = await generateLismScss({ projectRoot: root });

    const result = compileWithBridge(outDir);

    // コンパイルが成立し、lism のレイアウトプリミティブ（l--*）が出力される。
    expect(result.css.length).toBeGreaterThan(0);
    expect(result.css).toContain('l--');
  });

  test('user lism.config の追加 prop が CSS 出力へ反映される', async () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default { props: { myz: { prop: "zIndex", utils: { "9": "9" } } } };\n');
    const { outDir, userConfigPath, configFile } = await generateLismScss({ projectRoot: root });

    expect(userConfigPath).toBe(path.join(root, 'lism.config.js'));
    // 直列化 config に追加 prop が含まれる（loadBuildConfigs が user 設定をマージ済み）。
    expect(fs.readFileSync(configFile, 'utf8')).toContain("'myz'");

    // 追加 prop 由来の Property Class が CSS 出力に現れる。
    const result = compileWithBridge(outDir);
    expect(result.css).toContain('myz');
  });

  test('lism.config.ts（TS構文）の追加 prop が jiti 経由で CSS 出力へ反映される', async () => {
    const root = tmpDir();
    // 型注釈を含む TS 構文。jiti が型を取り除いて評価できることを確認する。
    fs.writeFileSync(
      path.join(root, 'lism.config.ts'),
      [
        'interface ExtraConfig { props: { myts: { prop: string; utils: Record<string, string> } } }',
        'const config: ExtraConfig = { props: { myts: { prop: "zIndex", utils: { "9": "9" } } } };',
        'export default config;',
        '',
      ].join('\n')
    );
    const { outDir, userConfigPath, configFile } = await generateLismScss({ projectRoot: root });

    expect(userConfigPath).toBe(path.join(root, 'lism.config.ts'));
    expect(fs.readFileSync(configFile, 'utf8')).toContain("'myts'");

    const result = compileWithBridge(outDir);
    expect(result.css).toContain('myts');
  });
});
