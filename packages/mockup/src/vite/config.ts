/**
 * `dev` / `check` 共通の vite 設定組み立て。
 *
 * 両コマンドが同じ列挙・検証・境界ロジックを通るよう、プラグイン構成はここ1箇所で決める
 * （`check` 成功なのに `dev` で表示されない、という不一致を作らないため）。
 */
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { lismConfigAlias } from '@lism-css/plugin/vite';
import type { InlineConfig } from 'vite';

import { getMockPackageRoot, safeRealpath } from '../core/paths.js';
import type { MockupRuntime } from '../core/runtime.js';
import { buildImportAllowlist, type ImportAllowlist } from './allowlist.js';
import { importBoundaryPlugin } from './boundary.js';
import { lucideIconsPlugin } from './lucide-icons.js';
import { VIRTUAL_CHECK_ENTRY_ID, virtualModulesPlugin } from './virtual-modules.js';

export type MockupViteMode = 'dev' | 'build';

/** 文字列をそのまま照合する正規表現へ変換する。 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface MockupViteConfigOptions {
  runtime: MockupRuntime;
  /** 固定ビューアのディレクトリ（vite root）。 */
  viewerDir: string;
  mode: MockupViteMode;
  /**
   * 許可リスト。省略時はここで作る。
   * 構築は node_modules の走査を伴うため、コマンド側で先に作った場合はそれを渡して使い回す。
   */
  allowlist?: ImportAllowlist;
}

/** runtime の内容から許可リストを作る（`dev` / `check` が起動時の警告に使えるよう切り出している）。 */
export function createImportAllowlist(runtime: MockupRuntime): ImportAllowlist {
  return buildImportAllowlist({ dataDir: runtime.data.dataDir, extraPackages: runtime.data.config.imports });
}

/**
 * `server.fs.allow` に渡すルート一覧（多層防御。境界の本体は `importBoundaryPlugin`）。
 *
 * ビューア・データディレクトリ・生成物の一時ディレクトリ・依存キャッシュ（`cacheDir`）・
 * 生成 config のディレクトリ（`configDir`）と、`@lism-css/mockup` が所有する依存ツリーだけを許可する。
 * workspace リンクされたパッケージは node_modules 配下に無いため、許可パッケージの realpath も
 * 個別に足す。`imports` の追加パッケージをデータディレクトリ側から解決した場合は、
 * その依存も辿れるよう `dependencyRoots` も加わる。
 *
 * `cacheDir` と `configDir` は起動間で使い回すため一時ディレクトリの外（`os.tmpdir()` 直下）にある。
 * dev は事前バンドル済みの依存と生成 config をここから配信するので、
 * 明示的に許可しないと `fs.strict` に弾かれる。
 */
export function collectFsAllowRoots(options: {
  viewerDir: string;
  dataDir: string;
  tempDir: string;
  cacheDir: string;
  configDir: string;
  allowlist: ImportAllowlist;
}): string[] {
  const roots = new Set<string>([
    safeRealpath(getMockPackageRoot()),
    safeRealpath(options.viewerDir),
    options.dataDir,
    options.tempDir,
    options.cacheDir,
    options.configDir,
    ...options.allowlist.packageRoots,
    ...options.allowlist.dependencyRoots,
    ...options.allowlist.mockupDependencyRoots,
  ]);
  return [...roots];
}

/** `dev` / `check` 共通の vite 設定を作る。 */
export function createMockViteConfig({
  runtime,
  viewerDir,
  mode,
  allowlist = createImportAllowlist(runtime),
}: MockupViteConfigOptions): InlineConfig {
  const dataDir = runtime.data.dataDir;

  const config: InlineConfig = {
    // ユーザー側の vite 設定・.env は読まない（ビューアは CLI 同梱の固定配布物）。
    configFile: false,
    envFile: false,
    root: viewerDir,
    // データディレクトリへは書かず（読み取り専用の配布物でも動く）、起動間で使い回せる場所を使う。
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
        // dev の依存最適化が書き出す bundle（`cacheDir` 配下）へ解決した場合も許可する。
        // ページの bare import はここへ解決されるため、許可しないと「許可済みなのに封じ込め判定で拒否」になる。
        generatedDir: runtime.cacheDir,
        getPageSpecifiers: () => runtime.getPageSpecifiers(),
      }),
      // 境界チェックの後ろに置く。ページからの `lucide-react` は境界チェックが
      // 「許可済み bare import」と判定してから `this.resolve()` で解決し直す流れになるため、
      // 許可リスト側（VIRTUAL_PACKAGES）とこのプラグインの両方が揃って初めて通る。
      // ビューア自身の import は境界チェックを素通りしてここへ直接届く。
      lucideIconsPlugin(),
      // 事前バンドル済みの依存（cacheDir 配下）は Babel に通さない。
      // plugin-react は node_modules 配下を自動で除外するが、cacheDir は読み取り専用の
      // 配布物でも動くよう `os.tmpdir()` 配下に置いているため、その除外が効かない。
      // 除外しないと 1MB 級の react-dom を毎回 Babel が解析する（Fast Refresh の対象外なのに）。
      react({ exclude: [new RegExp(escapeRegExp(runtime.cacheDir))] }),
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
        allow: collectFsAllowRoots({
          viewerDir,
          dataDir,
          tempDir: runtime.tempDir,
          cacheDir: runtime.cacheDir,
          configDir: runtime.configDir,
          allowlist,
        }),
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
