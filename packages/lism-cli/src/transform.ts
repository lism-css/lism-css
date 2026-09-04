import path from 'node:path';

export type FrameworkCategory = 'react' | 'astro' | 'shared';

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

  const posixPath = relativePath.split(path.sep).join('/');

  return content.replace(/\{\{HELPER\}\}/g, posixPath);
}

/** 入力はfetcher.tsのwalkFilesがPOSIX形式に正規化済みであること。 */
export function classifyFile(relativePath: string): FrameworkCategory {
  if (relativePath.startsWith('react/')) return 'react';
  if (relativePath.startsWith('astro/')) return 'astro';
  return 'shared';
}

/** 入力はPOSIX形式であること。 */
export function stripFrameworkPrefix(relativePath: string): string {
  if (relativePath.startsWith('react/')) return relativePath.slice('react/'.length);
  if (relativePath.startsWith('astro/')) return relativePath.slice('astro/'.length);
  return relativePath;
}

/** helperへの相対importを{{HELPER}}プレースホルダーへ置換する。 */
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

/** helper importはreplaceHelperImportsで置換済みのため、残る../は兄弟参照としてフラット化する。 */
export function flattenSiblingImports(content: string): string {
  let replaced = content.replace(/(from\s+['"])\.\.\/([^'"]+)(['"])/g, '$1./$2$3');
  replaced = replaced.replace(/(import\s+['"])\.\.\/([^'"]+)(['"])/g, '$1./$2$3');
  return replaced;
}

export interface TransformedFile {
  path: string;
  content: string;
  category: FrameworkCategory;
}

/** コンポーネントファイルを分類し、helper参照の収集とフラット化をまとめて行う。relativePathはPOSIX形式とする。 */
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
