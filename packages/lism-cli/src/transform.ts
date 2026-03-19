import path from 'node:path';

/**
 * ファイル内容中の {{HELPER}} プレースホルダーを、
 * ファイル配置位置から helperDir への相対パスに置換する。
 *
 * 例:
 *   fileRelPath = "setAccordion.js"   (shared, コンポーネント直下)
 *   helperDir   = "_helper"
 *   → {{HELPER}} → ../_helper
 *
 *   fileRelPath = "astro/Item.astro"  (astro サブディレクトリ)
 *   helperDir   = "_helper"
 *   → {{HELPER}} → ../../_helper
 */
export function resolveHelperPlaceholder(content: string, fileRelPath: string, componentDir: string, helperDir: string): string {
	if (!content.includes('{{HELPER}}')) return content;

	// ファイルが配置されるディレクトリ（コンポーネントディレクトリ基準）
	const fileDir = path.join(componentDir, path.dirname(fileRelPath));
	const relativePath = path.relative(fileDir, helperDir);

	// Windows 対応: バックスラッシュを POSIX パスに変換
	const posixPath = relativePath.split(path.sep).join('/');

	return content.replace(/\{\{HELPER\}\}/g, posixPath);
}
