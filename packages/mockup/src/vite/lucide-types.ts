/**
 * 公開する `lucide-react` の型定義（`types/lucide-react.d.ts`）を生成する。
 *
 * ページの `.tsx` は型を落とすだけで検査しないため、型安全が要る利用者は自分で `tsc` を実行する。
 * そのとき `lucide-react` はディスク上に存在しない（CLI が仮想モジュールとして供給する）ので、
 * 何もしないと `Cannot find module 'lucide-react'` になる。そこでビルド時にこのファイルを生成し、
 * パッケージへ同梱して利用者の tsconfig から参照してもらう。
 *
 * 宣言する内容は `lucide-icons.ts` が実際に生成する export と同じ範囲にする
 * （型では通るのに `check` で落ちる、という食い違いを作らないため）。
 * 手書きの一覧にしないのは、アイコン名の追加・改名に追従できず必ず古くなるため。
 */
import { buildLucideIconIndex, LUCIDE_PACKAGE_NAME, type LucideIconSet } from './lucide-icons.js';

/** アイコン一覧より前の、内容が固定の部分。 */
const PREAMBLE = `/**
 * Type declarations for the \`${LUCIDE_PACKAGE_NAME}\` module that @lism-css/mockup supplies.
 *
 * Generated from @iconify-json/lucide. Do not edit.
 *
 * @lism-css/mockup does not depend on the real \`${LUCIDE_PACKAGE_NAME}\` package (45MB of icon
 * modules that npx would download on every run). The CLI resolves the specifier to a module
 * generated from @iconify-json/lucide instead, so the import stays exactly the same but there
 * is no package on disk to read types from. These declarations describe what that generated
 * module provides, and nothing else:
 *
 * - every lucide icon, in both the \`Bell\` and \`BellIcon\` spelling, plus lucide's own aliases
 * - \`Icon\` and \`createLucideIcon\`
 *
 * \`icons\` (the record of every icon) is deliberately missing: reading it would pull every icon
 * into the bundle, which is what the generated module exists to avoid. Package subpaths
 * (\`${LUCIDE_PACKAGE_NAME}/icons/...\`) are not available either. Both are reported by
 * \`lism-mockup check\`.
 *
 * Pages are not type-checked by \`lism-mockup check\`. To check them yourself, point your own
 * tsconfig at this file — see "Type checking" in the @lism-css/mockup README.
 */
declare module '${LUCIDE_PACKAGE_NAME}' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

  /** SVG elements an icon's data may hold (the same reduced list lucide-react declares). */
  type SVGElementType = 'circle' | 'ellipse' | 'g' | 'line' | 'path' | 'polygon' | 'polyline' | 'rect';

  export type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;

  type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;

  /** Props every icon accepts: any SVG attribute plus lucide's own sizing props. */
  export interface LucideProps extends ElementAttributes {
    /** Rendered as both \`width\` and \`height\`. Defaults to \`24\`. */
    size?: string | number;
    /** Keeps the stroke visually the same thickness when \`size\` changes. */
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

  /** One icon drawn as data: a list of \`[element, attributes]\` pairs. */
  export type IconNode = [elementName: SVGElementType, attrs: Record<string, string>][];

  interface IconComponentProps extends LucideProps {
    iconNode: IconNode;
  }

  /** Generic icon component: renders the \`iconNode\` data it is handed. */
  export const Icon: ForwardRefExoticComponent<Omit<IconComponentProps, 'ref'> & RefAttributes<SVGSVGElement>>;

  /** Builds an icon component out of \`iconNode\` data. */
  export const createLucideIcon: (iconName: string, iconNode: IconNode) => LucideIcon;
`;

/** 生成物の相対パス（パッケージルート起点）。README の案内と揃える。 */
export const LUCIDE_TYPES_FILE = 'types/lucide-react.d.ts';

/** `icons.json` から、公開する `.d.ts` の中身を組み立てる。 */
export function generateLucideTypes(iconSet: LucideIconSet): string {
  const index = buildLucideIconIndex(iconSet);
  // 生成モジュール側と同じ順序・同じ名前の一覧にする（片方だけ増減したら差分で分かる）。
  const icons = [...index.keyByExportName.keys()].map((exportName) => `  export const ${exportName}: LucideIcon;`);

  return [PREAMBLE, '  // Icons', ...icons, '}', ''].join('\n');
}
