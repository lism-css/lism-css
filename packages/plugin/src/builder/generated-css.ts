/**
 * 「config 反映済み CSS を任意の出力先へ事前生成し、bare CSS import の alias map を返す」中立 helper。
 *
 * Vite/Astro 統合は `lismDynamicCss` が bare CSS import（`import 'lism-css/main.css'`）をオンザフライで
 * 横取りしてコンパイルするが、Turbopack（Next.js）/ webpack にはその横取り口が無い。
 * そこでこれらの環境では、config 反映済み CSS を `<root>/.lism-css/css/*` のような実ディレクトリへ**事前生成**し、
 * `lism-css/<entry>.css` をその生成物へ alias で差し替える方式を取る（P0.5 で Next.js 16 / Turbopack 実機確認済み）。
 *
 * 本 helper は bundler 非依存。CLI の `buildCssToDir` を流用して出力し、生成結果から
 * 「`lism-css/<entry>.css`（bare specifier）→ 生成 CSS の絶対パス」の alias map を組み立てて返す。
 */
import path from 'node:path';

import { buildCssToDir } from './compile';
import { loadBuildConfigs } from './load-config';
import { scssDir } from './paths';
import { normalizePath } from './normalize-path';

// full 系は purge 併用前提のスーパーセット。既定では生成しない（main 系のみ）。
const FULL_ENTRIES_IGNORE = ['full.scss', 'full_no_layer.scss'];

export interface GenerateCssOptions {
  /** lism.config 探索の基点となるプロジェクトルート。 */
  projectRoot: string;
  /** 生成 CSS の出力先ディレクトリ（絶対パス推奨。例: `<root>/.lism-css/css`）。 */
  outDir: string;
  /** lism.config の明示パス。未指定時は projectRoot から探索する。 */
  configPath?: string;
  /** full.css / full_no_layer.css も生成するか（既定: false。purge 併用時に有効化）。 */
  full?: boolean;
  /** autoprefixer + cssnano を通すか（既定: true）。 */
  minify?: boolean;
  /** ログ出力関数。 */
  log?: (message: string) => void;
}

export interface GeneratedCss {
  /** 生成したエントリ名一覧（例: `main`, `base/set`）。 */
  entries: string[];
  /** `lism-css/<entry>.css`（bare specifier）→ 生成 CSS の絶対パス。 */
  aliasMap: Record<string, string>;
  /** 出力先ディレクトリの絶対パス。 */
  outDir: string;
  /** watch 対象にすべき lism.config の絶対パス（無ければ null）。 */
  userConfigPath: string | null;
}

/**
 * config 反映済み CSS を `outDir` へ生成し、alias map を返す。
 * 出力ファイルの実体は consumer 環境の同梱 src/scss を一時複製してコンパイルするため node_modules は書き換えない。
 */
export async function generateCssToDir(opts: GenerateCssOptions): Promise<GeneratedCss> {
  const { projectRoot, outDir, configPath, full = false, minify = true, log } = opts;

  const { mainConfig, fullConfig, userConfigPath } = await loadBuildConfigs(projectRoot, { configPath });
  const written = await buildCssToDir({
    scssDir,
    distDir: outDir,
    mainConfig,
    fullConfig,
    ignore: full ? [] : FULL_ENTRIES_IGNORE,
    minify,
    log,
  });

  const entries: string[] = [];
  const aliasMap: Record<string, string> = {};
  for (const abs of written) {
    // outDir からの相対パス（posix）でエントリ名を導出する。`main.css` → `main`, `base/set.css` → `base/set`。
    const entry = normalizePath(path.relative(outDir, abs)).replace(/\.css$/, '');
    entries.push(entry);
    aliasMap[`lism-css/${entry}.css`] = abs;
  }

  return { entries, aliasMap, outDir, userConfigPath };
}
