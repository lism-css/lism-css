/**
 * bp デフォルト非対応のプロパティに BP 指定（配列 / { sm, md, ... }）が渡された時に、
 * 開発環境でのみ警告を出す。呼び出し側で dev 判定・BP 指定有無の判定を済ませてから呼ぶ。
 *
 * 判定基準は JS ランタイムの propConfig.bp（config/defaults/props.ts）。
 * SCSS の $props 上書きは CSS 出力だけを変え JS には届かないため、SCSS で BP を
 * 再有効化済みのケースは誤検知になる。そのため抑制フラグは設けず、警告文に
 * 「SCSS でカスタマイズ済みなら無視して OK」の注記を添える方針とする。
 */

// bp:0 化されたプロパティのうち、論理プロパティで代替できるものの対応表。
const ALT_PROP_MAP: Record<string, string> = {
  pl: 'ps',
  pr: 'pe',
  pt: 'pbs',
  pb: 'pbe',
  ml: 'ms',
  mr: 'me',
  mt: 'mbs',
  mb: 'mbe',
};

// 同じ prop で毎レンダー警告し続けないよう、prop 単位で 1 回だけ出力する。
const warnedProps = new Set<string>();

export default function warnUnsupportedBp(propName: string): void {
  if (warnedProps.has(propName)) return;
  warnedProps.add(propName);

  const alt = ALT_PROP_MAP[propName];
  const lines = [`[lism-css] \`${propName}\` does not support breakpoint values by default.`];
  if (alt) {
    lines.push(`  - Use the logical property \`${alt}\` instead`);
  }
  lines.push(`  - ${alt ? 'Or e' : 'E'}nable it via SCSS $props: \`'${propName}': ( bp: 1 )\``);
  lines.push('  Docs: https://lism-css.com/en/docs/customize/config/');
  lines.push("  * If you've already customized this via SCSS, you can ignore this warning.");

  console.warn(lines.join('\n'));
}
