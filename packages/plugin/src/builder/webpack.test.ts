// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { withLismWebpack } from './webpack';

const dirs: string[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-webpack-'));
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

/** フックを捕捉する fake compiler を作る。 */
function fakeCompiler(): {
  compiler: any;
  captured: { watch?: () => Promise<void>; after?: (compilation: any) => void };
} {
  const captured: { watch?: () => Promise<void>; after?: (compilation: any) => void } = {};
  const compiler = {
    hooks: {
      watchRun: { tapPromise: (_name: string, fn: () => Promise<void>) => (captured.watch = fn) },
      afterCompile: { tap: (_name: string, fn: (compilation: any) => void) => (captured.after = fn) },
    },
  };
  return { compiler, captured };
}

describe('withLismWebpack', () => {
  describe('css オプション', () => {
    test('css: true で CSS エントリを生成 CSS の絶対パスへ alias し、既存 resolve.alias を保持する', async () => {
      const root = tmpDir();
      const outDir = path.join(root, '.lism-css/css');
      const config = await withLismWebpack(baseConfig(), { projectRoot: root, css: true });

      expect(config.resolve.alias['lism-css/main.css']).toBe(path.join(outDir, 'main.css'));
      expect(fs.existsSync(config.resolve.alias['lism-css/main.css'])).toBe(true);
      // 既存 alias / resolve の他フィールドは保持する。
      expect(config.resolve.alias['@']).toBe('/src');
      expect(config.resolve.extensions).toEqual(['.js']);
      // base の他フィールドも保持する。
      expect(config.mode).toBe('production');
    });

    test('css 既定（false）では CSS 事前生成も CSS alias も行わない（.lism-css/css を作らない）', async () => {
      const root = tmpDir();
      const config = await withLismWebpack(baseConfig(), { projectRoot: root });

      expect(config.resolve.alias['lism-css/main.css']).toBeUndefined();
      expect(fs.existsSync(path.join(root, '.lism-css/css'))).toBe(false);
    });

    test('css: true で full: true なら full.css も初回生成する', async () => {
      const root = tmpDir();
      await withLismWebpack(baseConfig(), { projectRoot: root, css: true, full: true });

      expect(fs.existsSync(path.join(root, '.lism-css/css/full.css'))).toBe(true);
    });
  });

  describe('config オプション', () => {
    test('既定（config: true）で user lism.config を完全一致($)で alias する（css: false でも有効）', async () => {
      const root = tmpDir();
      writeUserConfig(root);
      const config = await withLismWebpack(baseConfig(), { projectRoot: root });

      expect(config.resolve.alias['lism-css/config.js$']).toBe(path.join(root, 'lism.config.js'));
      // css は張らない。
      expect(config.resolve.alias['lism-css/main.css']).toBeUndefined();
    });

    test('config: false なら user lism.config があっても config alias を張らない', async () => {
      const root = tmpDir();
      writeUserConfig(root);
      const config = await withLismWebpack(baseConfig(), { projectRoot: root, config: false });

      expect(config.resolve.alias['lism-css/config.js$']).toBeUndefined();
    });

    test('user lism.config が無ければ config alias は付かない', async () => {
      const root = tmpDir();
      const config = await withLismWebpack(baseConfig(), { projectRoot: root });

      expect(config.resolve.alias['lism-css/config.js$']).toBeUndefined();
    });
  });

  describe('plugins / watch', () => {
    test('既定（watch: true）で既存 plugins を保持しつつ lism plugin を 1 つ追加する', async () => {
      const root = tmpDir();
      const base = baseConfig();
      const config = await withLismWebpack(base, { projectRoot: root });

      expect(config.plugins).toHaveLength(base.plugins.length + 1);
      expect(config.plugins[0]).toBe(existingPlugin);
      const added = config.plugins[config.plugins.length - 1];
      expect(typeof added.apply).toBe('function');
    });

    test('watch: false なら plugin を追加しない', async () => {
      const root = tmpDir();
      const base = baseConfig();
      const config = await withLismWebpack(base, { projectRoot: root, watch: false });

      expect(config.plugins).toHaveLength(base.plugins.length);
      expect(config.plugins[0]).toBe(existingPlugin);
    });

    test('plugins / resolve が無い base でも壊れない', async () => {
      const root = tmpDir();
      const config = await withLismWebpack({} as Record<string, any>, { projectRoot: root, css: true });

      expect(config.resolve.alias['lism-css/main.css']).toBe(path.join(root, '.lism-css/css/main.css'));
      expect(config.plugins).toHaveLength(1);
    });
  });

  describe('追加 plugin の挙動', () => {
    test('css: true: afterCompile で userConfigPath を fileDependencies へ登録し、watchRun で CSS を再生成する', async () => {
      const root = tmpDir();
      writeUserConfig(root);
      const config = await withLismWebpack(baseConfig(), { projectRoot: root, css: true });
      const plugin = config.plugins[config.plugins.length - 1];

      const { compiler, captured } = fakeCompiler();
      plugin.apply(compiler);

      // afterCompile: lism.config.js が watch 依存へ登録される。
      const fileDependencies = new Set<string>();
      captured.after?.({ fileDependencies });
      expect(fileDependencies.has(path.join(root, 'lism.config.js'))).toBe(true);

      // watchRun: 再生成が throw せず走り、CSS が出力される。
      await expect(captured.watch?.()).resolves.not.toThrow();
      expect(fs.existsSync(path.join(root, '.lism-css/css/main.css'))).toBe(true);
    });

    test('css: false: watchRun は CSS を再生成しない（.lism-css/css を作らない）が、config は fileDependencies へ登録する', async () => {
      const root = tmpDir();
      writeUserConfig(root);
      const config = await withLismWebpack(baseConfig(), { projectRoot: root });
      const plugin = config.plugins[config.plugins.length - 1];

      const { compiler, captured } = fakeCompiler();
      plugin.apply(compiler);

      // css / typegen いずれも無効なので watchRun は tap されない。
      expect(captured.watch).toBeUndefined();
      expect(fs.existsSync(path.join(root, '.lism-css/css'))).toBe(false);

      // afterCompile での config 登録は維持する。
      const fileDependencies = new Set<string>();
      captured.after?.({ fileDependencies });
      expect(fileDependencies.has(path.join(root, 'lism.config.js'))).toBe(true);
    });

    test('css: true / full: true なら watchRun 再生成でも full.css を更新する', async () => {
      const root = tmpDir();
      const config = await withLismWebpack(baseConfig(), { projectRoot: root, css: true, full: true });
      const plugin = config.plugins[config.plugins.length - 1];
      const fullCss = path.join(root, '.lism-css/css/full.css');

      expect(fs.existsSync(fullCss)).toBe(true);

      // full.css を削除し、watchRun で再生成されることを確認する。
      fs.rmSync(fullCss);
      const { compiler, captured } = fakeCompiler();
      plugin.apply(compiler);

      await expect(captured.watch?.()).resolves.not.toThrow();
      expect(fs.existsSync(fullCss)).toBe(true);
    });
  });

  describe('typegen オプション', () => {
    test('typegen: true なら追加 prop 設定で projectRoot 直下に lism-env.d.ts を生成する', async () => {
      const root = tmpDir();
      writeUserConfig(root);
      await withLismWebpack(baseConfig(), { projectRoot: root, typegen: true });

      expect(fs.existsSync(path.join(root, 'lism-env.d.ts'))).toBe(true);
    });

    test('typegen 既定（false）では lism-env.d.ts を生成しない', async () => {
      const root = tmpDir();
      writeUserConfig(root);
      await withLismWebpack(baseConfig(), { projectRoot: root });

      expect(fs.existsSync(path.join(root, 'lism-env.d.ts'))).toBe(false);
    });
  });
});
