import path from 'node:path';

export type FrameworkCategory = 'react' | 'astro' | 'shared';

/**
 * registry 配信から除外する lism-ui 内部のエクスポートファイル。
 * コンポーネントディレクトリ直下のこの名前は無視する。
 */
export const EXCLUDE_COMPONENT_FILES = new Set(['__contexts.js', 'react.ts', 'astro.ts']);

/**
 * ファイル内容中の {{HELPER}} プレースホルダーを、
 * ファイル配置位置から helperDir への相対パスに置換する。
 *
 * 例:
 *   fileRelPath = "setAccordion.ts"   (shared, コンポーネント直下)
 *   helperDir   = "_helper"
 *   → {{HELPER}} → ../_helper
 *
 *   fileRelPath = "astro/Item.astro"  (astro サブディレクトリ)
 *   helperDir   = "_helper"
 *   → {{HELPER}} → ../../_helper
 */
export function resolveHelperPlaceholder(content: string, fileRelPath: string, componentDir: string, helperDir: string): string {
  if (!content.includes('{{HELPER}}')) return content;

  const fileDir = path.join(componentDir, path.dirname(fileRelPath));
  const relativePath = path.relative(fileDir, helperDir);

  // Windows 対応: バックスラッシュを POSIX パスに変換
  const posixPath = relativePath.split(path.sep).join('/');

  return content.replace(/\{\{HELPER\}\}/g, posixPath);
}

/** 相対パスを shared / react / astro に分類（lism-ui 側のコンポーネントディレクトリ基準） */
export function classifyFile(relativePath: string): FrameworkCategory {
  if (relativePath.startsWith('react/') || relativePath.startsWith('react\\')) return 'react';
  if (relativePath.startsWith('astro/') || relativePath.startsWith('astro\\')) return 'astro';
  return 'shared';
}

/** `react/` or `astro/` プレフィックスを剥がしてフラット化後のパスを返す */
export function stripFrameworkPrefix(relativePath: string): string {
  const normalized = relativePath.split(path.sep).join('/');
  if (normalized.startsWith('react/')) return normalized.slice('react/'.length);
  if (normalized.startsWith('astro/')) return normalized.slice('astro/'.length);
  return normalized;
}

/**
 * ファイル内容中の helper への相対 import を `{{HELPER}}/xxx` プレースホルダーに置換し、
 * 検出した helper 名一覧を返す。
 *
 * パターン例:
 *   from '../../helper/animation'     → from '{{HELPER}}/animation'
 *   from "../../../helper/uuid.js"    → from "{{HELPER}}/uuid.js"
 */
export function replaceHelperImports(content: string): { content: string; helpers: string[] } {
  const helpers = new Set<string>();

  const replaced = content.replace(
    /(from\s+['"])(\.\.\/)+helper\/([^'"]+)(['"])/g,
    (_m, prefix: string, _dots: string, helperPath: string, suffix: string) => {
      const helperName = helperPath.replace(/\.[^.]+$/, '');
      helpers.add(helperName);
      return `${prefix}{{HELPER}}/${helperPath}${suffix}`;
    }
  );

  return { content: replaced, helpers: [...helpers] };
}

/**
 * `react/` / `astro/` サブディレクトリの中身を親コンポーネントディレクトリへフラット化する際、
 * 親階層のファイル（`_style.css` / `getProps` / `setAccordion` 等）への
 * `from '../xxx'` / `import '../xxx'` の相対 import を `from './xxx'` / `import './xxx'` に書き換える。
 *
 * 注: helper import は replaceHelperImports で `{{HELPER}}/...` に置換済みのため、
 * 残っている `../` は兄弟参照のみと仮定できる。
 */
export function flattenSiblingImports(content: string): string {
  let replaced = content.replace(/(from\s+['"])\.\.\/([^'"]+)(['"])/g, '$1./$2$3');
  replaced = replaced.replace(/(import\s+['"])\.\.\/([^'"]+)(['"])/g, '$1./$2$3');
  return replaced;
}

export interface TransformedFile {
  /** コンポーネントディレクトリ基準のフラット化後相対パス */
  path: string;
  /** {{HELPER}} プレースホルダーに置換済みの内容 */
  content: string;
  category: FrameworkCategory;
}

/**
 * lism-ui の src/components/<Pascal>/ 配下のファイル 1 件に対して、
 * カテゴリ分類 + helper import 抽出 + フラット化処理までを一括で行う。
 *
 * @param relativePath コンポーネントディレクトリ基準の相対パス（POSIX 形式推奨）
 * @param rawContent   ファイル生内容
 */
export function transformComponentFile(relativePath: string, rawContent: string): { file: TransformedFile; helpers: string[] } {
  const { content: helperResolved, helpers } = replaceHelperImports(rawContent);
  const category = classifyFile(relativePath);
  const needsFlatten = category !== 'shared';
  const outPath = needsFlatten ? stripFrameworkPrefix(relativePath) : relativePath;
  const outContent = needsFlatten ? flattenSiblingImports(helperResolved) : helperResolved;
  return {
    file: { path: outPath, content: outContent, category },
    helpers,
  };
}
