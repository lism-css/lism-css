/**
 * `dev` / `check` 共通の vite 設定組み立て。
 *
 * 両コマンドが同じ列挙・検証・境界ロジックを通るよう、プラグイン構成はここ1箇所で決める
 * （`check` 成功なのに `dev` で表示されない、という不一致を作らないため）。
 */
import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { lismConfigAlias } from '@lism-css/plugin/vite';
import type { InlineConfig } from 'vite';

import { getMockPackageRoot, safeRealpath, walkAncestorDirs } from '../core/paths.js';
import type { MockupRuntime } from '../core/runtime.js';
import { buildImportAllowlist, type ImportAllowlist } from './allowlist.js';
import { importBoundaryPlugin } from './boundary.js';
import { VIRTUAL_CHECK_ENTRY_ID, virtualModulesPlugin } from './virtual-modules.js';

export type MockupViteMode = 'dev' | 'build';

export interface MockupViteConfigOptions {
  runtime: MockupRuntime;
  /** 固定ビューアのディレクトリ（vite root）。 */
  viewerDir: string;
  mode: MockupViteMode;
}

/** `from` から親方向へ辿って見つかる node_modules ディレクトリ（`@lism-css/mockup` の依存ツリー）。 */
function ancestorNodeModules(from: string): string[] {
  const found: string[] = [];
  for (const dir of walkAncestorDirs(from)) {
    const candidate = path.join(dir, 'node_modules');
    if (fs.existsSync(candidate)) found.push(safeRealpath(candidate));
  }
  return found;
}

/**
 * `server.fs.allow` に渡すルート一覧（多層防御。境界の本体は `importBoundaryPlugin`）。
 *
 * ビューア・データディレクトリ・生成物の一時ディレクトリと、`@lism-css/mockup` が所有する
 * 依存ツリーだけを許可する。workspace リンクされたパッケージは node_modules 配下に無いため、
 * 許可パッケージの realpath も個別に足す。
 */
export function collectFsAllowRoots(options: { viewerDir: string; dataDir: string; tempDir: string; allowlist: ImportAllowlist }): string[] {
  const mockRoot = getMockPackageRoot();
  const roots = new Set<string>([
    safeRealpath(mockRoot),
    safeRealpath(options.viewerDir),
    options.dataDir,
    options.tempDir,
    ...options.allowlist.packageRoots,
    ...ancestorNodeModules(mockRoot),
  ]);
  return [...roots];
}

/** `dev` / `check` 共通の vite 設定を作る。 */
export function createMockViteConfig({ runtime, viewerDir, mode }: MockupViteConfigOptions): InlineConfig {
  const allowlist = buildImportAllowlist();
  const dataDir = runtime.data.dataDir;

  const config: InlineConfig = {
    // ユーザー側の vite 設定・.env は読まない（ビューアは CLI 同梱の固定配布物）。
    configFile: false,
    envFile: false,
    root: viewerDir,
    // 読み取り専用の配布物・並行起動に備えてプロセス固有の一時ディレクトリを使う。
    cacheDir: runtime.cacheDir,
    clearScreen: false,
    // build のエラーは check 側で整形して出すため、vite 自身のログは抑える。
    logLevel: mode === 'build' ? 'silent' : 'info',
    plugins: [
      lismConfigAlias({ configPath: runtime.configPath }),
      virtualModulesPlugin(runtime),
      importBoundaryPlugin({
        dataDir,
        allowlist,
        getPageSpecifiers: () => runtime.getPageSpecifiers(),
      }),
      react(),
    ],
    resolve: {
      // ページ・ビューア・lism-ui が同じ React インスタンスを共有するようにする。
      dedupe: ['react', 'react-dom'],
    },
    server: {
      // localhost 限定。allowedHosts / CORS 全許可は使わない。
      host: 'localhost',
      fs: {
        strict: true,
        allow: collectFsAllowRoots({ viewerDir, dataDir, tempDir: runtime.tempDir, allowlist }),
      },
    },
  };

  if (mode === 'build') {
    config.build = {
      // bundle 検証だけが目的なのでファイルは書き出さない。
      write: false,
      minify: false,
      outDir: path.join(runtime.tempDir, 'build'),
      emptyOutDir: false,
      // 全ページを静的 import する仮想 entry を使う（tree-shaking で検証が空振りしないように）。
      rollupOptions: { input: VIRTUAL_CHECK_ENTRY_ID },
    };
  }

  return config;
}
