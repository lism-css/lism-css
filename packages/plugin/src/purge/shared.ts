import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extractKnownLismSelectors, type KnownSelectorSet } from './core';
import type { KnownOption } from './options';

// 一般的なBEMを誤認しないよう、Lismの既知prefixかProperty Classを含むCSSだけを対象にする。
export const LISM_CSS_SIGNATURE = /\.(?:-[a-z]|(?:l|c|a|is|has|set|u)--)/;

// main/fullどちらでも未使用classを拾えるよう、default known selectorはスーパーセットのfull.cssから作る。
export function loadDefaultKnownSelectors(): KnownSelectorSet | undefined {
  try {
    const css = readFileSync(fileURLToPath(import.meta.resolve('lism-css/full.css')), 'utf8');
    return extractKnownLismSelectors(css);
  } catch {
    return undefined;
  }
}

// 動的CSSとの連携に備え、関数形式のknownはbuild時に遅延解決する。
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
