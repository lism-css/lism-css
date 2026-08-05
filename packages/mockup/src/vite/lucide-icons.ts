/**
 * `lucide-react` を仮想モジュールとして供給する vite プラグイン。
 *
 * ビューアも同梱テンプレートもユーザーのページも `import { Bell } from 'lucide-react'` と書くが、
 * `lucide-react` 本体は 37MB あり、npx 実行のたびにダウンロードされてしまう。
 * そこで実データだけを持つ `@iconify-json/lucide`（約 570KB）から、同じ import 構文で使える
 * モジュールを生成して差し替える。ユーザーが書く import 構文は一切変えない。
 *
 * 生成物は「全アイコンを含む1モジュール」にする。
 * - dev … アイコンごとにモジュールを分けると、ブラウザが 1,800 件を個別に取得してしまう。
 *   1モジュールなら1リクエストで済む。
 * - build（`check`） … 各アイコンの生成呼び出しに rollup の PURE アノテーションを付けてあるので、
 *   未使用アイコンは tree-shaking で落ちる。
 *
 * SVG は React 要素へ展開せず、Iconify の body 文字列を `dangerouslySetInnerHTML` でそのまま埋める
 * （1,800 アイコン分の要素ツリーを生成すると、出力サイズも生成コストも跳ね上がるため）。
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

import { MockupContractError } from '../core/types.js';

/** ページ・ビューアが書く bare specifier。 */
export const LUCIDE_PACKAGE_NAME = 'lucide-react';

export const VIRTUAL_LUCIDE_ID = 'virtual:lism-mockup/lucide-react';
/** rollup 慣習の `\0` 付き解決済み id（他プラグインが触らないようにするため）。 */
export const RESOLVED_VIRTUAL_LUCIDE_ID = `\0${VIRTUAL_LUCIDE_ID}`;

/** Iconify のアイコン1件（`icons.json` の `icons` の値）。 */
interface IconifyIcon {
  /** `<svg>` の中身（子要素の文字列）。 */
  body: string;
  /** アイコン固有の viewBox 幅（未指定ならアイコンセットの既定値）。 */
  width?: number;
  height?: number;
}

/** `@iconify-json/lucide` の `icons.json`。使うフィールドだけを型にしている。 */
export interface LucideIconSet {
  icons: Record<string, IconifyIcon>;
  /** `{ 別名: { parent: 本体名 } }`。lucide の非推奨名・旧名がここに入る。 */
  aliases?: Record<string, { parent: string }>;
  /** アイコンセット既定の viewBox サイズ（lucide は 24x24）。 */
  width?: number;
  height?: number;
}

/**
 * lucide-react が `<svg>` ルートに付ける既定値（`defaultAttributes` + `Icon` の初期値）。
 *
 * lism-css 側の `.a--icon:where(:not([fill]))` / `:where(:not([width]))` が属性の有無で分岐するため、
 * ここがずれると既存モックアップの見た目が変わる。lucide-react 0.577.0 の実装に合わせている。
 */
const LUCIDE_DEFAULTS = {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** lucide-react の `toCamelCase`（`shared/src/utils/toCamelCase`）と同じ変換。 */
function toCamelCase(value: string): string {
  return value.replace(/^([A-Z])|[\s\-_]+(\w)/g, (_match, first: string | undefined, rest: string | undefined) =>
    rest ? rest.toUpperCase() : (first as string).toLowerCase()
  );
}

/**
 * lucide-react の `toPascalCase` と同じ変換（kebab → PascalCase）。
 *
 * 数字の扱いが素朴な実装と違う（`arrow-up-0-1` → `ArrowUp01`）ため、
 * 自前ルールを推測せず lucide-react の実装をそのまま写している。
 */
export function toPascalCase(value: string): string {
  const camel = toCamelCase(value);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/** lucide-react の `toKebabCase` と同じ変換（PascalCase → kebab、数字は分割しない）。 */
function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * lucide-react が `<svg>` に付ける class 文字列を組み立てる。
 *
 * `createLucideIcon` は `lucide-<kebab(pascal(name))>` と `lucide-<name>` の2つを候補にし
 * （`trash-2` なら `lucide-trash2` と `lucide-trash-2`）、`Icon` 側で先頭に `lucide` を足す。
 * 重複は取り除かれるので、同じ結果になるようここでも重複を落とす。
 */
export function lucideClassName(iconKey: string): string {
  const candidates = ['lucide', `lucide-${toKebabCase(toPascalCase(iconKey))}`, `lucide-${iconKey}`];
  return [...new Set(candidates)].join(' ');
}

/**
 * `<svg>` ルートが持つのと同じ値を、body 側の要素から取り除く。
 *
 * Iconify の body は最適化のために `fill="none" stroke="currentColor" …` を子要素へ書き出すが、
 * それを残すと `color` / `strokeWidth` などの props がルートにしか効かなくなる
 * （子要素の presentation attribute が継承値より強いため）。
 *
 * 取り除くのは「その属性の出現がすべてルートの既定値と同じ」ときだけにする。
 * `palette` のように一部の子要素だけ `fill="currentColor"` を持つアイコンは、
 * 値が混在するのでその属性は丸ごと残す（消すと塗りが変わってしまう）。
 */
export function stripInheritedAttributes(body: string): string {
  const inherited: [attribute: string, value: string][] = [
    ['fill', LUCIDE_DEFAULTS.fill],
    ['stroke', LUCIDE_DEFAULTS.color],
    ['stroke-width', String(LUCIDE_DEFAULTS.strokeWidth)],
    ['stroke-linecap', LUCIDE_DEFAULTS.strokeLinecap],
    ['stroke-linejoin', LUCIDE_DEFAULTS.strokeLinejoin],
  ];

  let result = body;
  for (const [attribute, value] of inherited) {
    // 属性は必ず空白区切りで並ぶので、先頭の空白ごと照合する。
    // これで `stroke="…"` が `stroke-width="…"` に誤って一致することもない。
    const pattern = new RegExp(`\\s${attribute}="([^"]*)"`, 'g');
    const found = [...result.matchAll(pattern)];
    if (found.length === 0 || found.some((match) => match[1] !== value)) continue;
    result = result.replace(pattern, '');
  }
  return result;
}

/** 生成対象のアイコン1件。 */
export interface LucideIconEntry {
  /** `icons.json` のキー（kebab-case）。 */
  key: string;
  /** lucide-react と同じ PascalCase の export 名。 */
  exportName: string;
  /** `<svg>` に付ける class 文字列。 */
  className: string;
  /** `<svg>` の viewBox。 */
  viewBox: string;
  /** `dangerouslySetInnerHTML` に流す body。 */
  body: string;
}

/** export 名 → アイコンの索引。 */
export interface LucideIconIndex {
  /** 実体を持つアイコン（`icons.json` の `icons`）。宣言順。 */
  readonly entries: readonly LucideIconEntry[];
  /** export 名 → `icons.json` のキー。エイリアスも本体のキーへ解決済み。 */
  readonly keyByExportName: ReadonlyMap<string, string>;
  /** export 名から `icons.json` のキーを引く。未知の名前は候補付きの契約エラー。 */
  iconKeyFor(exportName: string): string;
}

/** 似た名前の候補（大文字小文字を無視した完全一致 → 前方一致）を1つ返す。 */
function findSuggestion(exportName: string, names: Iterable<string>): string | null {
  const lower = exportName.toLowerCase();
  let prefixMatch: string | null = null;
  for (const name of names) {
    const candidate = name.toLowerCase();
    if (candidate === lower) return name;
    if (prefixMatch === null && candidate.startsWith(lower)) prefixMatch = name;
  }
  return prefixMatch;
}

/**
 * `icons.json` から「lucide-react の export 名 → アイコン」の索引を作る。
 *
 * 名前の対応は文字列変換を推測で書かず、`icons.json` のキー一覧から機械的に生成する。
 * `Icon` サフィックス付きの別名（`BellIcon`）と `aliases`（`Sidebar` → `panel-left`）も含める。
 */
export function buildLucideIconIndex(iconSet: LucideIconSet): LucideIconIndex {
  const setWidth = iconSet.width ?? 24;
  const setHeight = iconSet.height ?? 24;

  const entries: LucideIconEntry[] = [];
  const keyByExportName = new Map<string, string>();

  // 実体のあるアイコンを先に登録する。エイリアスと PascalCase が衝突したとき
  // （`arrow-up-01` と `arrow-up-0-1` はどちらも `ArrowUp01`）に本体側を勝たせるため。
  for (const [key, icon] of Object.entries(iconSet.icons)) {
    const exportName = toPascalCase(key);
    entries.push({
      key,
      exportName,
      className: lucideClassName(key),
      viewBox: `0 0 ${icon.width ?? setWidth} ${icon.height ?? setHeight}`,
      body: stripInheritedAttributes(icon.body),
    });
    keyByExportName.set(exportName, key);
  }

  // 別名は「本体名 → `Icon` サフィックス → エイリアス名 → エイリアスの `Icon` サフィックス」の
  // 優先順で登録する。既に埋まっている名前は上書きしない。
  const addAlias = (exportName: string, key: string): void => {
    if (!keyByExportName.has(exportName)) keyByExportName.set(exportName, key);
  };
  for (const entry of entries) addAlias(`${entry.exportName}Icon`, entry.key);
  for (const [alias, { parent }] of Object.entries(iconSet.aliases ?? {})) {
    // 本体が存在しないエイリアスは生成対象にしない（データ側の不整合をコードへ持ち込まない）。
    if (!(parent in iconSet.icons)) continue;
    addAlias(toPascalCase(alias), parent);
  }
  for (const [alias, { parent }] of Object.entries(iconSet.aliases ?? {})) {
    if (!(parent in iconSet.icons)) continue;
    addAlias(`${toPascalCase(alias)}Icon`, parent);
  }

  return {
    entries,
    keyByExportName,
    iconKeyFor(exportName: string): string {
      const key = keyByExportName.get(exportName);
      if (key !== undefined) return key;

      const suggestion = findSuggestion(exportName, keyByExportName.keys());
      throw new MockupContractError(
        `"${exportName}" is not an icon of ${LUCIDE_PACKAGE_NAME}.` +
          (suggestion === null ? '' : ` Did you mean "${suggestion}"?`) +
          ' See https://lucide.dev/icons/ for the available icons.'
      );
    },
  };
}

/**
 * 仮想モジュールのコードを生成する。
 *
 * ランタイムは `createElement` + `dangerouslySetInnerHTML` だけで、lucide-react の
 * `Icon` / `createLucideIcon` が作る `<svg>` と同じルート属性・class 名になるようにしている。
 * props（`size` / `color` / `strokeWidth` / `absoluteStrokeWidth` / `className` / その他 SVG 属性 / `ref`）も
 * lucide-react と同じ意味で受け取る。
 */
export function generateLucideModule(iconSet: LucideIconSet): string {
  const index = buildLucideIconIndex(iconSet);
  const { size, color, strokeWidth, fill, strokeLinecap, strokeLinejoin } = LUCIDE_DEFAULTS;

  // モジュールスコープの識別子は小文字始まりか UPPER_SNAKE にしてある。
  // アイコンの const 名は必ず PascalCase なので、両者が衝突することはない。
  const runtime = `// Generated by @lism-css/mockup from @iconify-json/lucide. Do not edit.
import { createElement, forwardRef } from 'react';

const DEFAULT_VIEW_BOX = '0 0 ${size} ${size}';

/** Same as lucide-react's hasA11yProp: skip aria-hidden when the caller passes a11y props. */
function hasA11yProp(props) {
  for (const prop in props) {
    if (prop.startsWith('aria-') || prop === 'role' || prop === 'title') return true;
  }
  return false;
}

/**
 * Builds one icon component.
 * The attributes, their order and the class name match what lucide-react 0.577.0 renders.
 */
function icon(displayName, iconClassName, body, viewBox = DEFAULT_VIEW_BOX) {
  const Component = forwardRef(
    (
      {
        size = ${size},
        color = '${color}',
        strokeWidth = ${strokeWidth},
        absoluteStrokeWidth,
        className,
        children,
        ...rest
      },
      ref
    ) => {
      const props = {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox,
        fill: '${fill}',
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? (Number(strokeWidth) * ${size}) / Number(size) : strokeWidth,
        strokeLinecap: '${strokeLinecap}',
        strokeLinejoin: '${strokeLinejoin}',
        className: className ? iconClassName + ' ' + className : iconClassName,
        ref,
        ...(!children && !hasA11yProp(rest) ? { 'aria-hidden': 'true' } : null),
        ...rest,
      };

      // React cannot take both children and dangerouslySetInnerHTML, so when the caller
      // passes children the body goes into a bare <g>, which does not affect rendering.
      return !children
        ? createElement('svg', { ...props, dangerouslySetInnerHTML: { __html: body } })
        : createElement('svg', props, createElement('g', { dangerouslySetInnerHTML: { __html: body } }), children);
    }
  );
  Component.displayName = displayName;
  return Component;
}
`;

  const declarations = index.entries.map((entry) => {
    const args = [entry.exportName, entry.className, entry.body].map((value) => JSON.stringify(value));
    // 既定と違う viewBox を持つアイコンだけ第4引数を足す（ほぼ全アイコンが 24x24 のため）。
    if (entry.viewBox !== `0 0 ${size} ${size}`) args.push(JSON.stringify(entry.viewBox));
    return `const ${entry.exportName} = /*#__PURE__*/ icon(${args.join(', ')});`;
  });

  // export 文は 1文にまとめず適度に分割する（1文が数千指定子になるのを避けるため）。
  const specifiers = [...index.keyByExportName.keys()].map((exportName) => {
    // 索引経由で引き直すことで、生成コードが必ず実在するアイコンだけを指すようにする。
    const local = toPascalCase(index.iconKeyFor(exportName));
    return exportName === local ? exportName : `${local} as ${exportName}`;
  });
  const exportStatements: string[] = [];
  for (let i = 0; i < specifiers.length; i += 500) {
    exportStatements.push(`export { ${specifiers.slice(i, i + 500).join(', ')} };`);
  }

  return [runtime, ...declarations, '', ...exportStatements, ''].join('\n');
}

let cachedIconSet: LucideIconSet | null = null;

/**
 * `@iconify-json/lucide` の `icons.json` を読む（1プロセス1回）。
 *
 * JSON の import 属性ではなくファイル読み込みにしているのは、`dist/`（ESM）と vitest の
 * どちらから実行しても同じ書き方で動かすため。`@iconify-json/lucide` は `./icons.json` を
 * 条件なしで export しているので、`createRequire()` でも解決できる。
 */
export function loadLucideIconSet(): LucideIconSet {
  if (cachedIconSet === null) {
    const file = createRequire(import.meta.url).resolve('@iconify-json/lucide/icons.json');
    cachedIconSet = JSON.parse(fs.readFileSync(file, 'utf-8')) as LucideIconSet;
  }
  return cachedIconSet;
}

/**
 * `lucide-react` を仮想モジュールへ解決する vite プラグイン。
 *
 * `importBoundaryPlugin` は許可済み bare import を `this.resolve(..., { skipSelf: true })` で
 * 解決し直すため、このプラグインも `enforce: 'pre'` に置いて vite の node 解決より先に応答する。
 * ビューア自身の import は境界チェックを通らず（データディレクトリ外のため）ここへ直接届く。
 */
export function lucideIconsPlugin(): Plugin {
  let code: string | null = null;

  return {
    name: 'lism-mockup:lucide-icons',
    enforce: 'pre',

    resolveId(source) {
      return source === LUCIDE_PACKAGE_NAME ? RESOLVED_VIRTUAL_LUCIDE_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_LUCIDE_ID) return null;
      code ??= generateLucideModule(loadLucideIconSet());
      return code;
    },
  };
}
