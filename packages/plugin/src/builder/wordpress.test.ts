// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { withLismWordPress } from './wordpress';

const dirs: string[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-wp-'));
  dirs.push(dir);
  return dir;
}
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

/** user lism.config を追加 prop 付きで置く（型生成・config alias の発火条件を満たす）。 */
function writeUserConfig(root: string): void {
  fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default { props: { myz: { prop: "zIndex", utils: { "9": "9" } } } };\n');
}

// 既存 alias / plugins を持つ base webpack config（マージで壊さないことを確認するため）。
// 実利用と同じく `Record<string, any>` として渡す（webpack 型は持ち込まない）。
const existingPlugin = { apply(_compiler: any) {} };
function baseConfig(): Record<string, any> {
  return {
    resolve: { alias: { '@': '/src' }, extensions: ['.js'] },
    plugins: [existingPlugin],
    mode: 'production',
  };
}

describe('withLismWordPress', () => {
  test('CSS エントリを生成 CSS の絶対パスへ alias し、既存 resolve.alias を保持する', async () => {
    const root = tmpDir();
    const outDir = path.join(root, '.lism-css/css');
    const config = await withLismWordPress(baseConfig(), { projectRoot: root });

    expect(config.resolve.alias['lism-css/main.css']).toBe(path.join(outDir, 'main.css'));
    expect(fs.existsSync(config.resolve.alias['lism-css/main.css'])).toBe(true);
    // 既存 alias / resolve の他フィールドは保持する。
    expect(config.resolve.alias['@']).toBe('/src');
    expect(config.resolve.extensions).toEqual(['.js']);
    // base の他フィールドも保持する。
    expect(config.mode).toBe('production');
  });

  test('user lism.config があれば config.js を完全一致($)で alias する', async () => {
    const root = tmpDir();
    writeUserConfig(root);
    const config = await withLismWordPress(baseConfig(), { projectRoot: root });

    expect(config.resolve.alias['lism-css/config.js$']).toBe(path.join(root, 'lism.config.js'));
  });

  test('user lism.config が無ければ config alias は付かない', async () => {
    const root = tmpDir();
    const config = await withLismWordPress(baseConfig(), { projectRoot: root });

    expect(config.resolve.alias['lism-css/config.js$']).toBeUndefined();
  });

  test('既存 plugins を保持しつつ lism plugin を 1 つ追加する', async () => {
    const root = tmpDir();
    const base = baseConfig();
    const config = await withLismWordPress(base, { projectRoot: root });

    expect(config.plugins).toHaveLength(base.plugins.length + 1);
    expect(config.plugins[0]).toBe(existingPlugin);
    // 追加 plugin は webpack plugin として apply を持つ。
    const added = config.plugins[config.plugins.length - 1];
    expect(typeof added.apply).toBe('function');
  });

  test('plugins / resolve が無い base でも壊れない', async () => {
    const root = tmpDir();
    const config = await withLismWordPress({} as Record<string, any>, { projectRoot: root });

    expect(config.resolve.alias['lism-css/main.css']).toBe(path.join(root, '.lism-css/css/main.css'));
    expect(config.plugins).toHaveLength(1);
  });

  test('追加 plugin: afterCompile で userConfigPath を fileDependencies へ登録し、watchRun で再生成する', async () => {
    const root = tmpDir();
    writeUserConfig(root);
    const config = await withLismWordPress(baseConfig(), { projectRoot: root });
    const plugin = config.plugins[config.plugins.length - 1];

    // fake compiler でフックを捕捉する。
    const captured: { watch?: () => Promise<void>; after?: (compilation: any) => void } = {};
    const compiler = {
      hooks: {
        watchRun: { tapPromise: (_name: string, fn: () => Promise<void>) => (captured.watch = fn) },
        afterCompile: { tap: (_name: string, fn: (compilation: any) => void) => (captured.after = fn) },
      },
    };
    plugin.apply(compiler);

    // afterCompile: lism.config.js が watch 依存へ登録される。
    const fileDependencies = new Set<string>();
    captured.after?.({ fileDependencies });
    expect(fileDependencies.has(path.join(root, 'lism.config.js'))).toBe(true);

    // watchRun: 再生成が throw せず走り、CSS が出力される。
    await expect(captured.watch?.()).resolves.not.toThrow();
    expect(fs.existsSync(path.join(root, '.lism-css/css/main.css'))).toBe(true);
  });

  test('full: true なら watchRun 再生成でも full.css を更新する', async () => {
    const root = tmpDir();
    const config = await withLismWordPress(baseConfig(), { projectRoot: root, full: true });
    const plugin = config.plugins[config.plugins.length - 1];
    const fullCss = path.join(root, '.lism-css/css/full.css');

    // 初回生成で full.css も出力される（full: false だと出ない）。
    expect(fs.existsSync(fullCss)).toBe(true);

    // full.css を削除し、watchRun で再生成されることを確認する（full: false 固定だと再生成されない）。
    fs.rmSync(fullCss);
    const captured: { watch?: () => Promise<void> } = {};
    const compiler = {
      hooks: {
        watchRun: { tapPromise: (_name: string, fn: () => Promise<void>) => (captured.watch = fn) },
        afterCompile: { tap: () => {} },
      },
    };
    plugin.apply(compiler);

    await expect(captured.watch?.()).resolves.not.toThrow();
    expect(fs.existsSync(fullCss)).toBe(true);
  });

  test('追加 prop 設定で projectRoot 直下に lism-env.d.ts を生成する', async () => {
    const root = tmpDir();
    writeUserConfig(root);
    await withLismWordPress(baseConfig(), { projectRoot: root });

    expect(fs.existsSync(path.join(root, 'lism-env.d.ts'))).toBe(true);
  });

  test('typegen: false なら lism-env.d.ts を生成しない', async () => {
    const root = tmpDir();
    writeUserConfig(root);
    await withLismWordPress(baseConfig(), { projectRoot: root, typegen: false });

    expect(fs.existsSync(path.join(root, 'lism-env.d.ts'))).toBe(false);
  });
});
