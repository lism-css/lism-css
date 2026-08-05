/**
 * `dev` / `check` が共有する実行時状態。
 *
 * データディレクトリの検証結果に加え、生成 config・トークン CSS・vite 用の一時ディレクトリを
 * 1つのオブジェクトにまとめる。dev の watch で内容が差し替わっても、vite プラグイン側は
 * この runtime を参照し続けるだけで最新状態を読める。
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { readMockConfig, resolveDataDir } from './data-dir.js';
import { discoverPages } from './pages.js';
import { getMockPackageRoot, safeRealpath, toImportSpecifier } from './paths.js';
import { buildTokensArtifacts, loadTokens, writeConfigModule } from './tokens.js';
import type { MockupData, TokenGroupEntry } from './types.js';

export interface MockupRuntime {
  /** 最新の検証済みデータ（watch で差し替わる）。 */
  data: MockupData;
  /** 生成した lism.config モジュールの絶対パス。 */
  readonly configPath: string;
  /** 上の lism.config モジュールを置くディレクトリ（同じ入力なら起動をまたいで同じ場所）。 */
  readonly configDir: string;
  /** vite の `cacheDir`（依存の事前バンドル先。同じ入力なら起動をまたいで使い回す）。 */
  readonly cacheDir: string;
  /** 生成物を置く一時ディレクトリのルート（プロセス固有。`cleanup()` で消える）。 */
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
  /** 一時ディレクトリを削除する（`cacheDir` / `configDir` は次回起動のために残す）。 */
  cleanup(): void;
}

/** `@lism-css/mockup` 自身のバージョン。読めない場合はキャッシュキー用の既定値を返す。 */
function readMockPackageVersion(packageRoot: string): string {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8')) as { version?: unknown };
    return typeof manifest.version === 'string' ? manifest.version : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 起動間で共有する生成物（vite の依存キャッシュ・生成 config）を置く場所のキー。
 *
 * 「事前バンドルの結果が変わる入力」をハッシュする。CLI のバージョンと実体位置
 * （別インストールなら同梱依存も別物）、データディレクトリ、`imports` の追加パッケージ
 * （プロジェクト側から解決するので事前バンドル対象が変わる）。
 * 入力が変われば別のディレクトリになるため、古いキャッシュを引き当てることはない。
 */
function sharedDirKey(dataDir: string, imports: readonly string[]): string {
  const packageRoot = safeRealpath(getMockPackageRoot());
  return (
    createHash('sha256')
      // `imports` は宣言順を変えても中身が同じなら同じキャッシュでよいので並べ替えてから混ぜる。
      .update(JSON.stringify([readMockPackageVersion(packageRoot), packageRoot, dataDir, [...imports].sort()]))
      .digest('hex')
      .slice(0, 16)
  );
}

/** 共有ディレクトリの置き場所（macOS の os.tmpdir() はシンボリックリンクなので realpath 化して使う）。 */
function sharedDirRoot(): string {
  return safeRealpath(os.tmpdir());
}

/**
 * vite の `cacheDir`（依存の事前バンドル先）の場所を決める。
 *
 * プロセス固有の一時ディレクトリに置くと毎回ゼロから事前バンドルし直しになるため、
 * `os.tmpdir()` 配下の安定した場所へ置いて起動間で使い回す（データディレクトリ側には書かないので、
 * 読み取り専用の配布物（npx キャッシュ等）から実行しても動く、という設計は維持できる）。
 *
 * 同じ入力で2つ同時に起動すると同じディレクトリを共有するが、vite 自身が `deps/_metadata.json` を
 * 見て再最適化の要否を判断するため、整合しないキャッシュをそのまま使うことはない（作り直しになるだけ）。
 * そのため、起動ごとにロックを取るような仕組みは持たない。
 */
export function resolveViteCacheDir(dataDir: string, imports: readonly string[] = []): string {
  return path.join(sharedDirRoot(), `lism-mockup-cache-${sharedDirKey(dataDir, imports)}`);
}

/**
 * 生成した lism.config モジュールを置くディレクトリを決める。
 *
 * ここも `cacheDir` と同じキーの安定パスにする。`lismConfigAlias()` はこのファイルのパスを
 * `resolve.alias` に入れ、vite は `resolve` をまるごと依存キャッシュのキーに含めるため、
 * パスが起動ごとに変わると毎回「vite config has changed」で事前バンドルをやり直してしまい、
 * `cacheDir` を共有した意味が無くなる。
 *
 * ただし `cacheDir` の中には置かない。vite の watcher は `<cacheDir>/**` を監視対象から外すため、
 * 中に置くと `tokens.json` の変更でこのモジュールを書き換えても invalidate されず、
 * ブラウザに古い config が残ってしまう。そのため兄弟ディレクトリにする。
 *
 * 同じデータディレクトリで2つ同時に起動すると同じファイルを共有するが、内容は
 * そのデータディレクトリの `tokens.json` だけから決まる（キーにデータディレクトリを含むため、
 * 共有する2プロセスは必ず同じ `tokens.json` を読む）ので、書き込む中身は常に同一になる。
 */
export function resolveGeneratedConfigDir(dataDir: string, imports: readonly string[] = []): string {
  return path.join(sharedDirRoot(), `lism-mockup-config-${sharedDirKey(dataDir, imports)}`);
}

/**
 * 共有 cacheDir の場所を決める。
 *
 * ディレクトリ自体は作らない。事前バンドルを行う `dev` では vite が必要になった時点で作るため、
 * キャッシュを使わない `check`（build）が空ディレクトリを残さずに済む。
 * 既にある場合だけ書き込めるか確かめ、書けないならプロセス固有の一時ディレクトリへ退避する
 * （`os.tmpdir()` を複数ユーザーで共有する環境で他ユーザー所有のディレクトリに当たっても起動を止めない。
 * キャッシュの再利用を諦めるだけで動作は変わらない）。
 */
function prepareViteCacheDir(dataDir: string, imports: readonly string[] | undefined, tempDir: string): string {
  const shared = resolveViteCacheDir(dataDir, imports ?? []);
  try {
    if (fs.existsSync(shared)) fs.accessSync(shared, fs.constants.W_OK);
    // 既にある場合に備えて realpath 化する（fs.allow の比較が realpath 基準のため）。
    // 未作成なら safeRealpath はパスをそのまま返す。
    return safeRealpath(shared);
  } catch {
    const fallback = path.join(tempDir, 'vite-cache');
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

/**
 * 生成 config の置き場所を用意する。
 *
 * `cacheDir` と違い、ここは起動直後に書き込むのでディレクトリを作る。
 * 書き込めない場合はプロセス固有の一時ディレクトリへ退避する（キャッシュ再利用を諦めるだけ）。
 */
function prepareGeneratedConfigDir(dataDir: string, imports: readonly string[] | undefined, tempDir: string): string {
  const shared = resolveGeneratedConfigDir(dataDir, imports ?? []);
  try {
    fs.mkdirSync(shared, { recursive: true });
    fs.accessSync(shared, fs.constants.W_OK);
    return safeRealpath(shared);
  } catch {
    return tempDir;
  }
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

  // 読み取り専用の配布物（npx キャッシュ等）でも動くよう、生成物はすべて os.tmpdir() 配下へ置く。
  // macOS の os.tmpdir() はシンボリックリンクのため、realpath 化してから使う（fs.allow の比較が realpath 基準）。
  const tempDir = safeRealpath(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-mockup-')));
  // 依存の事前バンドルと生成 config だけは起動間で同じ場所に置く
  // （tempDir とは別。理由は resolveViteCacheDir / resolveGeneratedConfigDir 参照）。
  const cacheDir = prepareViteCacheDir(data.dataDir, data.config.imports, tempDir);
  const configDir = prepareGeneratedConfigDir(data.dataDir, data.config.imports, tempDir);

  const configPath = writeConfigModule(configDir, data.tokens);
  const { css: tokensCss, groups: tokensData } = await buildTokensArtifacts(data.dataDir, configPath, data.tokens, data.darkTokens);

  let specifierSource: MockupData['pages'] | null = null;
  let specifiers: ReadonlySet<string> = new Set();

  const runtime: MockupRuntime = {
    data,
    configPath,
    configDir,
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
      // 同じパスへ書き直す（vite の watcher がこのファイルの変更を拾ってモジュールを invalidate する）。
      writeConfigModule(configDir, tokens);
      runtime.data = { ...runtime.data, tokens, darkTokens };
      const { css, groups } = await buildTokensArtifacts(runtime.data.dataDir, configPath, tokens, darkTokens);
      runtime.tokensCss = css;
      runtime.tokensData = groups;
    },

    cleanup() {
      try {
        // 消すのは生成物の一時ディレクトリだけ。cacheDir / configDir は次回起動で事前バンドルを
        // 省くために残す（configDir を消すと同じ入力でも起動ごとに作り直しになり、
        // 同時起動しているもう1つのプロセスの config まで消してしまう）。
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // 削除できなくても致命的ではない（OS の一時ディレクトリ掃除に任せる）。
      }
    },
  };

  return runtime;
}
