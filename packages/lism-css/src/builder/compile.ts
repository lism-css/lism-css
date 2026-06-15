/**
 * 「config → CSS」変換の共有コア。
 *
 * 方針: 同梱の SCSS（`_setting.scss` 等）は `@use './prop-config'` のまま **ディスク実ファイル**を参照する。
 * これにより素の sass / docs の `@use 'lism-css/scss/setting' with (...)` 等のスタンドアロン利用が維持される。
 *
 * ユーザー設定を反映した CSS を作る時は、**node_modules を書き換えず**に、src/scss を一時ディレクトリへ
 * 複製してそこの `_prop-config*.scss` だけ差し替えてコンパイルする（インプレース書き換えの廃止）。
 * パッケージ自身のビルドは、同梱デフォルトの `_prop-config*.scss` を更新しつつ src/scss を直接コンパイルする。
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import * as sass from 'sass';
import postcss, { type AcceptedPlugin } from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import { serializeConfigScss, serializeTokenValues, type BuildConfig } from './serialize';

export type { BuildConfig } from './serialize';

const MAIN_PROP_CONFIG = '_prop-config.scss';
const FULL_PROP_CONFIG = '_prop-config-full.scss';
// トークン値（#431）の生成 partial。base/tokens/*.scss の後に @forward され、追加 + 上書きの両立を担う。
const TOKEN_VALUES_PARTIAL = 'base/tokens/_token-values.scss';
// 生成物であることを明示するヘッダ。値が空でもこのヘッダは常に書き出され、同梱デフォルトと一致させる。
const TOKEN_VALUES_HEADER =
  '// このファイルは lism.config.js の tokenValues から自動生成されます。直接編集しないでください（次回ビルド時に上書きされます）。\n';

function resolvePostcssPlugins(minify: boolean): AcceptedPlugin[] {
  // minify=true: 従来どおり autoprefixer + cssnano（dist/css 出力相当）。
  // minify=false: autoprefixer のみ（Vite が最終 minify する用途）。
  return minify ? [autoprefixer, cssnano] : [autoprefixer];
}

export interface WritePropConfigOptions {
  /** prop-config を書き出す scss ディレクトリ。 */
  scssDir: string;
  /** main 系の prop-config を生成する CONFIG（マージ済み・Set 化前）。 */
  mainConfig: BuildConfig;
  /** full 系の prop-config を生成する CONFIG。省略時は full を書き出さない。 */
  fullConfig?: BuildConfig;
}

/**
 * 直列化した prop-config を scssDir へ書き出す。
 * パッケージ自身のビルドで同梱デフォルトを更新する用途と、一時ディレクトリへの注入の双方で使う。
 */
export function writePropConfigFiles({ scssDir, mainConfig, fullConfig }: WritePropConfigOptions): void {
  fs.writeFileSync(path.join(scssDir, MAIN_PROP_CONFIG), serializeConfigScss(mainConfig), 'utf8');
  if (fullConfig) {
    fs.writeFileSync(path.join(scssDir, FULL_PROP_CONFIG), serializeConfigScss(fullConfig), 'utf8');
  }
  // tokenValues は userConfig 由来で main/full 共通のため、main 系から 1 ファイルだけ生成する。
  // base/tokens から @forward され、main.css / full.css / no_layer 系のいずれにも同じ値が乗る。
  fs.writeFileSync(path.join(scssDir, TOKEN_VALUES_PARTIAL), TOKEN_VALUES_HEADER + serializeTokenValues(mainConfig), 'utf8');
}

export interface CompileTreeOptions {
  /** エントリを探索する scss ディレクトリの絶対パス。 */
  scssDir: string;
  /** 出力先 dist/css の絶対パス。 */
  distDir: string;
  /** 追加で除外するエントリ（glob パターン。例: ['full.scss', 'full_no_layer.scss']）。 */
  ignore?: string[];
  /** autoprefixer + cssnano を通すか（既定: true）。 */
  minify?: boolean;
  /** ログ出力関数（既定: console.log）。 */
  log?: (message: string) => void;
}

/**
 * scssDir 配下の全エントリ（`_*.scss` を除く）をコンパイルして distDir へ書き出す。
 * prop-config は scssDir に存在する実ファイルを `@use './prop-config'` 経由で読む。
 */
export async function compileCssTree({ scssDir, distDir, ignore = [], minify = true, log = console.log }: CompileTreeOptions): Promise<string[]> {
  // glob は CJS 互換だが ESM からも利用可能。動的 import で external 化に追従。
  const { globSync } = await import('glob');

  const plugins = resolvePostcssPlugins(minify);

  // NOTE: CLI 経由だと cwd がプロジェクト側になるため、cwd を明示し absolute で受け取る。
  const files = globSync('**/*.scss', { cwd: scssDir, ignore: ['**/_*.scss', ...ignore], absolute: true });
  log(`▶️ [compileCssTree] ${files.length} entries`);

  const written: string[] = [];
  for (const filePath of files) {
    const fileName = filePath.replace(`${scssDir}/`, '');
    const distPath = path.resolve(distDir, fileName).replace('.scss', '.css').replace('/index.css', '.css');

    const compiled = sass.compile(filePath, { style: 'expanded' });
    const processed = await postcss(plugins).process(compiled.css, { from: undefined });
    writeCss(distPath, processed.css);
    written.push(distPath);
  }

  return written;
}

export interface BuildToDirOptions {
  /** ソースの scss ディレクトリ（インストール済みパッケージの src/scss）。書き換えない。 */
  scssDir: string;
  /** 出力先 dist/css の絶対パス。 */
  distDir: string;
  /** main 系が読む prop-config を生成する CONFIG（isFullMode 時は full preset 適用済みを渡す）。 */
  mainConfig: BuildConfig;
  /** full 系が読む prop-config を生成する CONFIG。 */
  fullConfig?: BuildConfig;
  /** 追加で除外するエントリ（glob パターン）。 */
  ignore?: string[];
  /** autoprefixer + cssnano を通すか（既定: true）。 */
  minify?: boolean;
  /** ログ出力関数（既定: console.log）。 */
  log?: (message: string) => void;
}

/**
 * ユーザー設定を反映した CSS を生成する（CLI 用）。
 * scssDir を一時ディレクトリへ複製し、そこの prop-config だけ差し替えてコンパイルする。
 * インストール済みの node_modules/src/scss は一切書き換えない。
 */
export async function buildCssToDir({
  scssDir,
  distDir,
  mainConfig,
  fullConfig,
  ignore = [],
  minify = true,
  log = console.log,
}: BuildToDirOptions): Promise<string[]> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-css-scss-'));
  try {
    // src/scss をまるごと複製（相対 @use が一時ディレクトリ内で完結するように）。
    fs.cpSync(scssDir, tmpDir, { recursive: true });
    // ユーザー設定由来の prop-config を一時ディレクトリ側にだけ上書き。
    writePropConfigFiles({ scssDir: tmpDir, mainConfig, fullConfig });
    return await compileCssTree({ scssDir: tmpDir, distDir, ignore, minify, log });
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function writeCss(filePath: string, css: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, css);
}
