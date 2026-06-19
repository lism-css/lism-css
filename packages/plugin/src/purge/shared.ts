import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extractKnownLismSelectors, type KnownSelectorSet } from './core';
import type { KnownOption } from './options';

// purge 対象 CSS asset 判定用シグネチャ。Lism の既知プレフィックス（`l|c|a|is|has|set|u`）の BEM 風クラス、
// または `.-x` 形式の Property Class のいずれかを含むかで判定する。
// `.button--primary` のような一般的な BEM クラスを誤マッチさせないために、プレフィックスを限定している。
export const LISM_CSS_SIGNATURE = /\.(?:-[a-z]|(?:l|c|a|is|has|set|u)--)/;

// デフォルトの known selector 集合は full.css 由来にする。
// full.css は main.css のセレクタのスーパーセット（full preset のトークンクラス・拡張 BP・xs クラスを含む）なので、
// ユーザーが main.css / full.css のどちらを読み込んでいても未使用クラスを取りこぼさず purge 対象にできる。
export function loadDefaultKnownSelectors(): KnownSelectorSet | undefined {
  try {
    const css = readFileSync(fileURLToPath(import.meta.resolve('lism-css/full.css')), 'utf8');
    return extractKnownLismSelectors(css);
  } catch {
    return undefined;
  }
}

// known オプションを解決する。
// 関数形式（遅延解決）なら build 実行時に評価し、値形式ならそのまま、未指定なら full.css 由来のデフォルト集合を構築する。
// 関数形式は、動的 CSS ビルドプラグインが「マージ前の・自分が生成した素の CSS」から known を構築して渡すための連携ポイント（#424 進行順序 4）。
export function resolveKnownSelectors(known: KnownOption | undefined): KnownSelectorSet | undefined {
  if (typeof known === 'function') return known();
  return known ?? loadDefaultKnownSelectors();
}

const CSS_SOURCE_MAPPING_URL_RE = /\/\*[#@]\s*sourceMappingURL=.*?\*\//gs;
// 判定用は non-global にする。global な test() は lastIndex が前進して結果が呼び出し順に依存するため。
const HAS_CSS_SOURCE_MAPPING_URL_RE = /\/\*[#@]\s*sourceMappingURL=.*?\*\//s;

export function stripCssSourceMappingUrl(css: string): string {
  return css.replace(CSS_SOURCE_MAPPING_URL_RE, '').trimEnd();
}

export function hasCssSourceMappingUrl(css: string): boolean {
  return HAS_CSS_SOURCE_MAPPING_URL_RE.test(css);
}

export function formatReport(beforeBytes: number, afterBytes: number): string {
  const saved = beforeBytes - afterBytes;
  const pct = ((saved / beforeBytes) * 100).toFixed(1);
  return `CSS: ${beforeBytes} → ${afterBytes} bytes (-${saved} / -${pct}%)`;
}
