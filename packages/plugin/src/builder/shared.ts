import { createCssCompiler } from './compile-entry';
import { loadBuildConfigs } from './load-config';
import { scssDir } from './paths';
import type { LismDynamicCssOptions } from './dynamic-css';
import { extractKnownLismSelectors, type KnownSelectorSet } from '../purge/core';
import type { LismPurgeOptions } from '../purge/options';

export interface LismCssOptions extends LismDynamicCssOptions {
  /** purge を有効化する。`true` で既定設定、オブジェクトで `lismPurge` のオプションを指定。 */
  purge?: boolean | LismPurgeOptions;
  /** 型 `.d.ts` 自動生成（lism-env.d.ts）を無効化する（既定: 有効）。 */
  typegen?: boolean;
}

export type PurgeResolution = {
  enabled: boolean;
  opts: LismPurgeOptions;
  useGeneratedKnown: boolean;
};

/** config 反映済みの full.css をコンパイルして known セレクタ集合を作る（build 時に一度だけ実行）。 */
export async function buildConfigAwareKnown(root: string, configPath?: string): Promise<KnownSelectorSet | undefined> {
  const compiler = createCssCompiler({ scssDir });
  try {
    const { mainConfig, fullConfig } = await loadBuildConfigs(root || process.cwd(), { configPath });
    const css = await compiler.compile('full', mainConfig, fullConfig);
    return extractKnownLismSelectors(css);
  } catch {
    // 失敗時は呼び出し側で同梱 full.css 由来のデフォルトへフォールバックする。
    return undefined;
  } finally {
    compiler.dispose();
  }
}

/** purge を有効化するか + 生成 known を使うか（user が known 明示時は使わない）を判定する。 */
export function resolvePurge(purge: LismCssOptions['purge']): PurgeResolution {
  const enabled = !!purge;
  const opts: LismPurgeOptions = typeof purge === 'object' ? purge : {};
  return { enabled, opts, useGeneratedKnown: enabled && opts.known === undefined };
}
