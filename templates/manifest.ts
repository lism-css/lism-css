/**
 * テンプレート定義の Single Source of Truth (SSOT)。
 *
 * このファイルから:
 * - `packages/lism-cli/src/commands/create.ts` の TEMPLATES
 * - `apps/docs/src/config/templates.ts` の templates
 * の両方を組み立てる。CLI 側からも import されるため Astro / Vite 専用の型
 * （ImageMetadata 等）には依存しない。サムネ画像（ImageMetadata）は docs 側で
 * `templates/{sourcePath}/screenshots/{top または variant}.png` の規約から解決する。
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
  title: LocalizedText;
  description: LocalizedText;
  /** プレビューサイトの URL（無い場合は docs でボタン非表示） */
  previewUrl?: string;
  /** true の場合、CLI の一覧・選択・slug 解決から除外、docs でも本番ビルドで非表示 */
  draft?: boolean;
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
    title: { ja: 'Minimal Astro', en: 'Minimal Astro' },
    description: { ja: 'Astro ベースの最小構成', en: 'Minimal Astro setup' },
  },
  {
    slug: 'minimal-vite',
    kind: 'project',
    category: 'minimal',
    stack: 'vite',
    sourcePath: 'minimal/vite',
    title: { ja: 'Minimal Vite', en: 'Minimal Vite' },
    description: { ja: 'Vite + React ベースの最小構成', en: 'Minimal Vite + React setup' },
    previewUrl: 'https://lism-minimal-vite.pages.dev/',
  },
  {
    slug: 'blog-astro-minimal',
    kind: 'project',
    category: 'blog',
    variant: 'minimal',
    variantLabel: { ja: 'Minimal', en: 'Minimal' },
    stack: 'astro',
    sourcePath: 'blog/astro/minimal',
    title: { ja: 'Blog Minimal', en: 'Blog Minimal' },
    description: { ja: '記事一覧 / 詳細 / Tags のみの最小構成の Astro ブログ', en: 'Minimal Astro blog with posts and tags only' },
    previewUrl: 'https://lism-blog-astro-minimal.pages.dev/',
  },
  {
    slug: 'blog-astro-personal',
    kind: 'project',
    category: 'blog',
    variant: 'personal',
    variantLabel: { ja: 'Personal', en: 'Personal' },
    stack: 'astro',
    sourcePath: 'blog/astro/personal',
    title: { ja: 'Blog Personal', en: 'Blog Personal' },
    description: {
      ja: '個人ブログ・エッセイ向け。年月アーカイブつきの落ち着いた Astro ブログ',
      en: 'Personal / essay-style Astro blog with monthly archives',
    },
    draft: true,
  },
  {
    slug: 'blog-astro-techlog',
    kind: 'project',
    category: 'blog',
    variant: 'techlog',
    variantLabel: { ja: 'Tech Log', en: 'Tech Log' },
    stack: 'astro',
    sourcePath: 'blog/astro/techlog',
    title: { ja: 'Blog Tech Log', en: 'Blog Tech Log' },
    description: {
      ja: '技術ブログ向け。コードハイライト・カテゴリ・タグ・TOC・年月アーカイブ・検索を装備した Astro ブログ',
      en: 'Tech blog with code highlighting, categories, tags, TOC, monthly archives and search',
    },
    draft: true,
  },
  {
    slug: 'lp-astro-minimal',
    kind: 'single-project-variant',
    category: 'lp',
    stack: 'astro',
    variant: 'minimal',
    variantLabel: { ja: 'Minimal', en: 'Minimal' },
    sourcePath: 'lp/astro',
    title: { ja: 'LP Minimal', en: 'LP Minimal' },
    description: { ja: 'ミニマルな Astro ランディングページ', en: 'Minimal Astro landing page' },
    draft: true,
  },
  {
    slug: 'lp-astro-natural',
    kind: 'single-project-variant',
    category: 'lp',
    stack: 'astro',
    variant: 'natural',
    variantLabel: { ja: 'Natural', en: 'Natural' },
    sourcePath: 'lp/astro',
    title: { ja: 'LP Natural', en: 'LP Natural' },
    description: { ja: 'ナチュラルな雰囲気の Astro ランディングページ', en: 'Natural-themed Astro landing page' },
    draft: true,
  },
  {
    slug: 'lp-astro-ryokan',
    kind: 'single-project-variant',
    category: 'lp',
    stack: 'astro',
    variant: 'ryokan',
    variantLabel: { ja: 'Ryokan', en: 'Ryokan' },
    sourcePath: 'lp/astro',
    title: { ja: 'LP Ryokan', en: 'LP Ryokan' },
    description: { ja: '旅館・宿泊業向けの Astro ランディングページ', en: 'Astro landing page for ryokan / lodging' },
    draft: true,
  },
];
