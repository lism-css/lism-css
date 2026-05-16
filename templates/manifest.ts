/**
 * テンプレート定義の Single Source of Truth (SSOT)。
 *
 * このファイルから:
 * - `packages/lism-cli/src/commands/create.ts` の TEMPLATES
 * - `apps/docs/src/config/templates.ts` の templates
 * の両方を組み立てる。CLI 側からも import されるため Astro / Vite 専用の型
 * （ImageMetadata 等）には依存しない。docs 専用フィールド（title / thumb /
 * previewUrl / draft）は docs 側で別オブジェクトとしてマージする。
 */

export type Stack = 'astro' | 'next' | 'vite' | 'html';
export type CategoryId = 'minimal' | 'blog' | 'lp' | 'web';

export interface LocalizedText {
  ja: string;
  en: string;
}

interface TemplateMetaBase {
  slug: string;
  category: CategoryId;
  stack: Stack;
  variant?: string;
  variantLabel?: LocalizedText;
  description: LocalizedText;
}

export interface ProjectTemplateDef extends TemplateMetaBase {
  kind: 'project';
  /** `templates/` 配下のプロジェクトディレクトリ（例: 'minimal/astro'） */
  sourcePath: string;
}

export interface BaseOverlayTemplateDef extends TemplateMetaBase {
  kind: 'base-overlay';
  basePath: string;
  overlayPath: string;
  rewritePackageName?: boolean;
}

export interface StaticHtmlTemplateDef extends TemplateMetaBase {
  kind: 'static-html';
  sourcePath: string;
}

/**
 * 単一の Astro / Vite プロジェクト内に複数 variant（src/pages/{variant}/）を同居させた構成。
 * CLI 抽出時に選択 variant の index.astro を src/pages/index.astro に持ち上げ、
 * 他 variant ディレクトリを削除して単独プロジェクトとして仕上げる。
 */
export interface SingleProjectVariantTemplateDef extends TemplateMetaBase {
  kind: 'single-project-variant';
  /** `templates/` 配下のプロジェクト全体パス（例: 'lp/astro'） */
  sourcePath: string;
  /** `src/pages/{variant}/` のディレクトリ名 */
  variant: string;
  /** 生成プロジェクトの package.json の name に書き換える値。未指定時は `slug` を使う */
  packageName?: string;
}

export type TemplateDef = ProjectTemplateDef | BaseOverlayTemplateDef | StaticHtmlTemplateDef | SingleProjectVariantTemplateDef;

/** 配信対象の templates 一覧 */
export const TEMPLATES: TemplateDef[] = [
  {
    slug: 'minimal-astro',
    kind: 'project',
    category: 'minimal',
    stack: 'astro',
    sourcePath: 'minimal/astro',
    description: { ja: 'Astro ベースの最小構成', en: 'Minimal Astro setup' },
  },
  {
    slug: 'minimal-vite',
    kind: 'project',
    category: 'minimal',
    stack: 'vite',
    sourcePath: 'minimal/vite',
    description: { ja: 'Vite + React ベースの最小構成', en: 'Minimal Vite + React setup' },
  },
  {
    slug: 'blog-astro-simple',
    kind: 'project',
    category: 'blog',
    variant: 'simple',
    variantLabel: { ja: 'Simple', en: 'Simple' },
    stack: 'astro',
    sourcePath: 'blog/astro/simple',
    description: { ja: 'タグのみのシンプルな Astro ブログ', en: 'Simple Astro blog with tags' },
  },
  {
    slug: 'blog-astro-full',
    kind: 'project',
    category: 'blog',
    variant: 'full',
    variantLabel: { ja: 'Full', en: 'Full' },
    stack: 'astro',
    sourcePath: 'blog/astro/full',
    description: { ja: 'カテゴリ・目次つきの Astro ブログ', en: 'Astro blog with categories and table of contents' },
  },
  {
    slug: 'lp-astro-minimal',
    kind: 'single-project-variant',
    category: 'lp',
    stack: 'astro',
    variant: 'minimal',
    variantLabel: { ja: 'Minimal', en: 'Minimal' },
    sourcePath: 'lp/astro',
    description: { ja: 'ミニマルな Astro ランディングページ', en: 'Minimal Astro landing page' },
  },
  {
    slug: 'lp-astro-natural',
    kind: 'single-project-variant',
    category: 'lp',
    stack: 'astro',
    variant: 'natural',
    variantLabel: { ja: 'Natural', en: 'Natural' },
    sourcePath: 'lp/astro',
    description: { ja: 'ナチュラルな雰囲気の Astro ランディングページ', en: 'Natural-themed Astro landing page' },
  },
  {
    slug: 'lp-astro-ryokan',
    kind: 'single-project-variant',
    category: 'lp',
    stack: 'astro',
    variant: 'ryokan',
    variantLabel: { ja: 'Ryokan', en: 'Ryokan' },
    sourcePath: 'lp/astro',
    description: { ja: '旅館・宿泊業向けの Astro ランディングページ', en: 'Astro landing page for ryokan / lodging' },
  },
];
