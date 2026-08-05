/**
 * `dev` / `check` が共有する実行時状態。
 *
 * データディレクトリの検証結果に加え、生成 config・トークン CSS・vite 用の一時ディレクトリを
 * 1つのオブジェクトにまとめる。dev の watch で内容が差し替わっても、vite プラグイン側は
 * この runtime を参照し続けるだけで最新状態を読める。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { readMockConfig, resolveDataDir } from './data-dir.js';
import { discoverPages } from './pages.js';
import { safeRealpath, toImportSpecifier } from './paths.js';
import { buildTokensArtifacts, loadTokens, writeConfigModule } from './tokens.js';
import type { MockupData, TokenGroupEntry } from './types.js';

export interface MockupRuntime {
  /** 最新の検証済みデータ（watch で差し替わる）。 */
  data: MockupData;
  /** 生成した lism.config モジュールの絶対パス。 */
  readonly configPath: string;
  /** vite の `cacheDir`（プロセス固有）。 */
  readonly cacheDir: string;
  /** 生成物を置く一時ディレクトリのルート。 */
  readonly tempDir: string;
  /** `serializeTokens()` の結果（`virtual:lism-mockup/tokens.css` の中身）。 */
  tokensCss: string;
  /** 上の CSS が定義するトークンの内訳（`virtual:lism-mockup/tokens` の中身）。 */
  tokensData: TokenGroupEntry[];
  /** 仮想モジュールが生成する動的 import 指定子の集合（境界チェックの照合用）。 */
  getPageSpecifiers(): ReadonlySet<string>;
  /** `mockup.config.json` と `pages/` を読み直す。 */
  refreshPages(): void;
  /** トークンファイルを読み直し、config モジュール・トークン CSS・トークン一覧を作り直す。 */
  refreshTokens(): Promise<void>;
  /** 一時ディレクトリを削除する。 */
  cleanup(): void;
}

/** データディレクトリを検証して `MockupData` を作る。 */
export async function loadMockData(dir: string): Promise<MockupData> {
  const dataDir = resolveDataDir(dir);
  const config = readMockConfig(dataDir);
  const pages = discoverPages(dataDir, config);
  const { tokens, darkTokens } = await loadTokens(dataDir);
  return { dataDir, config, pages, tokens, darkTokens };
}

/** データディレクトリを検証し、vite を動かすための一時生成物まで用意する。 */
export async function prepareMockRuntime(dir: string): Promise<MockupRuntime> {
  const data = await loadMockData(dir);

  // 読み取り専用の配布物（npx キャッシュ等）でも動くよう、生成物はすべて一時ディレクトリへ置く。
  // macOS の os.tmpdir() はシンボリックリンクのため、realpath 化してから使う（fs.allow の比較が realpath 基準）。
  const tempDir = safeRealpath(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-mockup-')));
  const cacheDir = path.join(tempDir, 'vite-cache');
  fs.mkdirSync(cacheDir, { recursive: true });

  const configPath = writeConfigModule(tempDir, data.tokens);
  const { css: tokensCss, groups: tokensData } = await buildTokensArtifacts(data.dataDir, configPath, data.tokens, data.darkTokens);

  let specifierSource: MockupData['pages'] | null = null;
  let specifiers: ReadonlySet<string> = new Set();

  const runtime: MockupRuntime = {
    data,
    configPath,
    cacheDir,
    tempDir,
    tokensCss,
    tokensData,

    getPageSpecifiers() {
      if (specifierSource !== runtime.data.pages) {
        specifierSource = runtime.data.pages;
        specifiers = new Set(specifierSource.map((page) => toImportSpecifier(page.file)));
      }
      return specifiers;
    },

    refreshPages() {
      const config = readMockConfig(runtime.data.dataDir);
      const pages = discoverPages(runtime.data.dataDir, config);
      runtime.data = { ...runtime.data, config, pages };
    },

    async refreshTokens() {
      const { tokens, darkTokens } = await loadTokens(runtime.data.dataDir);
      writeConfigModule(tempDir, tokens);
      runtime.data = { ...runtime.data, tokens, darkTokens };
      const { css, groups } = await buildTokensArtifacts(runtime.data.dataDir, configPath, tokens, darkTokens);
      runtime.tokensCss = css;
      runtime.tokensData = groups;
    },

    cleanup() {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // 削除できなくても致命的ではない（OS の一時ディレクトリ掃除に任せる）。
      }
    },
  };

  return runtime;
}
