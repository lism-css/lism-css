import { readFileSync } from 'node:fs';
import { extractKnownLismSelectors, type KnownSelectorSet } from './core';

// purge 対象 CSS asset 判定用シグネチャ。Lism の既知プレフィックス（`l|c|a|is|has|set|u`）の BEM 風クラス、
// または `.-x` 形式の Property Class のいずれかを含むかで判定する。
// `.button--primary` のような一般的な BEM クラスを誤マッチさせないために、プレフィックスを限定している。
export const LISM_CSS_SIGNATURE = /\.(?:-[a-z]|(?:l|c|a|is|has|set|u)--)/;

export function loadDefaultKnownSelectors(): KnownSelectorSet | undefined {
  try {
    const css = readFileSync(new URL(/* @vite-ignore */ '../css/main.css', import.meta.url), 'utf8');
    return extractKnownLismSelectors(css);
  } catch {
    return undefined;
  }
}

export function formatReport(beforeBytes: number, afterBytes: number): string {
  const saved = beforeBytes - afterBytes;
  const pct = ((saved / beforeBytes) * 100).toFixed(1);
  return `CSS: ${beforeBytes} → ${afterBytes} bytes (-${saved} / -${pct}%)`;
}
