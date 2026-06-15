/**
 * 単一 SCSS エントリ → CSS 文字列のオンザフライ・コンパイラ。Vite プラグイン（P2）が使う。
 *
 * 方針は P1 の `buildCssToDir` と同じ「一時ディレクトリ複製」方式:
 * src/scss をまるごと作業ディレクトリへ複製し、そこの `_prop-config*.scss` だけを user 設定由来で差し替える。
 * `@use './prop-config'` の相対参照を維持したまま node_modules を書き換えないため、素の sass 利用も壊さない。
 *
 * 差分は「ツリー一括 → ディスク出力」ではなく「単一エントリ → 文字列」を返す点と、
 * 作業ディレクトリ・コンパイル結果を config 署名でキャッシュして dev の再要求に応える点。
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { createHash } from 'node:crypto';
import * as sass from 'sass';
import postcss, { type AcceptedPlugin } from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import { serializeConfigScss, type BuildConfig } from './serialize';
import { writePropConfigFiles } from './compile';

/**
 * src/scss を glob して「エントリ名 → 相対 scss パス」のマップを作る。
 * `compileCssTree` と同じ規則（`_*` 除外・`X/index.scss` → `X`）でエントリ名を導出するため、
 * dist/css に出力される CSS（= `lism-css/<entry>.css` で import 可能なもの）と完全に対応する。
 * 入れ子（`base/set`, `primitives/atomic`, `primitives/layout` 等）も含む。
 */
export async function listCssEntries(scssDir: string): Promise<Map<string, string>> {
  const { globSync } = await import('glob');
  const files = globSync('**/*.scss', { cwd: scssDir, ignore: ['**/_*.scss'] });
  const map = new Map<string, string>();
  for (const rel of files) {
    const entry = rel.replace(/\.scss$/, '').replace(/\/index$/, '');
    map.set(entry, rel);
  }
  return map;
}

/** main / full の prop-config 直列化結果から作業ディレクトリの一意な署名を作る。 */
function configSignature(mainConfig: BuildConfig, fullConfig?: BuildConfig): string {
  // serializeConfigScss は $props に加えて $breakpoints も含むため、breakpoints 変更でも
  // 署名が変わり作業ディレクトリのキャッシュが正しく作り直される。
  const main = serializeConfigScss(mainConfig);
  const full = fullConfig ? serializeConfigScss(fullConfig) : '';
  return createHash('sha256').update(main).update('\0').update(full).digest('hex');
}

export interface CssCompilerOptions {
  /** src/scss の絶対パス。 */
  scssDir: string;
  /** autoprefixer に加えて cssnano も通すか（既定: false。Vite が最終 minify する想定）。 */
  minify?: boolean;
  /** ログ出力関数。 */
  log?: (message: string) => void;
}

export interface CssCompiler {
  /** 指定エントリを CSS 文字列へコンパイルする。同一 config・同一エントリは結果をキャッシュする。 */
  compile(entry: string, mainConfig: BuildConfig, fullConfig?: BuildConfig): Promise<string>;
  /** 指定エントリが存在するか。 */
  hasEntry(entry: string): Promise<boolean>;
  /** 全エントリ名。 */
  entries(): Promise<string[]>;
  /** 作業ディレクトリとキャッシュを破棄する（dev 終了時に呼ぶ）。 */
  dispose(): void;
}

/**
 * ステートフルな CSS コンパイラを作る。
 * config 署名でキーした作業ディレクトリ（src/scss の複製 + prop-config 差し替え）を保持し、
 * config が変わると作り直す。エントリ単位のコンパイル結果もメモ化する。
 */
export function createCssCompiler({ scssDir, minify = false, log }: CssCompilerOptions): CssCompiler {
  const plugins: AcceptedPlugin[] = minify ? [autoprefixer, cssnano] : [autoprefixer];

  let entryMap: Map<string, string> | null = null;
  let workspace: { dir: string; sig: string } | null = null;
  const cssCache = new Map<string, string>();

  async function getEntryMap(): Promise<Map<string, string>> {
    if (!entryMap) entryMap = await listCssEntries(scssDir);
    return entryMap;
  }

  function disposeWorkspace(): void {
    if (workspace) {
      fs.rmSync(workspace.dir, { recursive: true, force: true });
      workspace = null;
    }
    cssCache.clear();
  }

  function ensureWorkspace(mainConfig: BuildConfig, fullConfig?: BuildConfig): { dir: string; sig: string } {
    const sig = configSignature(mainConfig, fullConfig);
    if (workspace && workspace.sig === sig) return workspace;
    // config が変わった（または初回）: 旧作業ディレクトリとキャッシュを捨てて作り直す。
    disposeWorkspace();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-css-css-'));
    fs.cpSync(scssDir, dir, { recursive: true });
    writePropConfigFiles({ scssDir: dir, mainConfig, fullConfig });
    workspace = { dir, sig };
    log?.(`▶️ [lism-css] css workspace prepared (${sig.slice(0, 8)})`);
    return workspace;
  }

  return {
    async entries() {
      return [...(await getEntryMap()).keys()];
    },
    async hasEntry(entry) {
      return (await getEntryMap()).has(entry);
    },
    async compile(entry, mainConfig, fullConfig) {
      const rel = (await getEntryMap()).get(entry);
      if (!rel) throw new Error(`[lism-css] unknown CSS entry: "${entry}"`);
      const { dir, sig } = ensureWorkspace(mainConfig, fullConfig);
      // キャッシュキーに config 署名を含める。compile 中（await postcss）に別 config の
      // ビルドが割り込んで workspace を作り直しても、署名違いのキーには書き込まれないため、
      // 旧 config の結果を現行 config のキャッシュとして取り違えることがない。
      const cacheKey = `${sig}:${entry}`;
      const cached = cssCache.get(cacheKey);
      if (cached !== undefined) return cached;
      const compiled = sass.compile(path.join(dir, rel), { style: 'expanded' });
      const processed = await postcss(plugins).process(compiled.css, { from: undefined });
      cssCache.set(cacheKey, processed.css);
      return processed.css;
    },
    dispose() {
      disposeWorkspace();
    },
  };
}
