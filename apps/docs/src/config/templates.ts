/**
 * Templates 一覧データ
 *
 * テンプレート（プロジェクト雛形）のメタデータを集約。
 * Templates ページの表示に利用する。
 *
 * NOTE: 将来的には packages/lism-cli 側の TEMPLATES 定義と共通化予定（別PR）。
 *       現状は CLI 側の定義（`packages/lism-cli/src/commands/create.ts`）と
 *       手動で同期する必要がある。
 */

import type { LangCode } from '@/config/site';
import type { ImageMetadata } from 'astro';

import minimalAstroThumb from '@templates/minimal/astro/screenshots/top.png';
import minimalViteThumb from '@templates/minimal/vite/screenshots/top.png';
import blogAstroSimpleThumb from '@templates/blog/astro/simple/screenshots/top.png';
import blogAstroFullThumb from '@templates/blog/astro/full/screenshots/top.png';
import lpAstroMinimalThumb from '@templates/lp/astro/screenshots/minimal.png';
import lpAstroNaturalThumb from '@templates/lp/astro/screenshots/natural.png';
import lpAstroRyokanThumb from '@templates/lp/astro/screenshots/ryokan.png';

export type Stack = 'astro' | 'next' | 'vite' | 'html';
export type CategoryId = 'minimal' | 'blog' | 'lp' | 'web';

export interface TemplateItem {
  slug: string;
  category: CategoryId;
  stack: Stack;
  title: Record<LangCode, string>;
  description: Record<LangCode, string>;
  thumb: ImageMetadata;
  /** プレビューサイトの URL（無い場合は undefined → ボタン非表示 or 無効化） */
  previewUrl?: string;
  /** true の場合、本番ビルドでは一覧・詳細ページ・パス生成から除外する（dev では表示） */
  draft?: boolean;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  description: Record<LangCode, string>;
}

/** カテゴリ定義（表示順） */
export const categories: CategoryDef[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: {
      ja: 'Lism CSS を導入した最小構成。検証や独自構成のベース向け。',
      en: 'Minimal starters with Lism CSS preconfigured.',
    },
  },
  {
    id: 'blog',
    label: 'Blog',
    description: {
      ja: '記事中心のサイト向けテンプレート。',
      en: 'Templates for article-oriented sites.',
    },
  },
  {
    id: 'lp',
    label: 'Landing Page',
    description: {
      ja: 'プロダクト・サービス紹介用の LP テンプレート。',
      en: 'Landing page templates for products and services.',
    },
  },
  {
    id: 'web',
    label: 'Web',
    description: {
      ja: '汎用的な Web サイト向けテンプレート。',
      en: 'General-purpose website templates.',
    },
  },
];

/** Stack 表示ラベル（CLI 側の STACK_LABELS と揃える） */
export const stackLabels: Record<Stack, string> = {
  astro: 'Astro',
  next: 'Next.js',
  vite: 'Vite + React',
  html: 'Static HTML',
};

/** Stack のフィルタ表示順 */
export const stackOrder: Stack[] = ['astro', 'html', 'vite', 'next'];

export const templates: TemplateItem[] = [
  {
    slug: 'minimal-astro',
    category: 'minimal',
    stack: 'astro',
    thumb: minimalAstroThumb,
    title: { ja: 'Minimal Astro', en: 'Minimal Astro' },
    description: {
      ja: 'Astro ベースの最小構成。Lism CSS を導入した状態から始められます。',
      en: 'A minimal Astro starter with Lism CSS already wired in.',
    },
  },
  {
    slug: 'minimal-vite',
    category: 'minimal',
    stack: 'vite',
    thumb: minimalViteThumb,
    title: { ja: 'Minimal Vite', en: 'Minimal Vite' },
    description: {
      ja: 'Vite + React ベースの最小構成。SPA や検証用に。',
      en: 'A minimal Vite + React starter.',
    },
  },
  {
    slug: 'blog-astro-simple',
    category: 'blog',
    stack: 'astro',
    thumb: blogAstroSimpleThumb,
    title: { ja: 'Blog Astro Simple', en: 'Blog Astro Simple' },
    description: {
      ja: 'タグのみのシンプルな Astro ブログ。軽い記事サイト向け。',
      en: 'A simple Astro blog with tag support for lightweight publishing.',
    },
  },
  {
    slug: 'blog-astro-full',
    category: 'blog',
    stack: 'astro',
    thumb: blogAstroFullThumb,
    title: { ja: 'Blog Astro Full', en: 'Blog Astro Full' },
    description: {
      ja: 'カテゴリ・目次つきの Astro ブログ。記事量が増えるサイト向け。',
      en: 'A fuller Astro blog with categories and table of contents.',
    },
  },
  {
    draft: true,
    slug: 'lp-astro-minimal',
    category: 'lp',
    stack: 'astro',
    thumb: lpAstroMinimalThumb,
    title: { ja: 'LP Minimal', en: 'LP Minimal' },
    description: {
      ja: 'ミニマルな雰囲気の Astro ランディングページ。',
      en: 'A minimal-style Astro landing page.',
    },
  },
  {
    draft: true,
    slug: 'lp-astro-natural',
    category: 'lp',
    stack: 'astro',
    thumb: lpAstroNaturalThumb,
    title: { ja: 'LP Natural', en: 'LP Natural' },
    description: {
      ja: 'ナチュラルな雰囲気の Astro ランディングページ。',
      en: 'A natural-themed Astro landing page.',
    },
  },
  {
    draft: true,
    slug: 'lp-astro-ryokan',
    category: 'lp',
    stack: 'astro',
    thumb: lpAstroRyokanThumb,
    title: { ja: 'LP Ryokan', en: 'LP Ryokan' },
    description: {
      ja: '旅館・宿泊業向けの Astro ランディングページ。',
      en: 'An Astro landing page for ryokan / lodging.',
    },
  },
];

/**
 * 本番ビルドで実際に公開されるテンプレートのみを含む派生リスト。
 * dev/preview では draft:true も含めて全件返す。
 * 一覧・詳細ページ・getStaticPaths はすべてこのリストを参照する。
 */
export const visibleTemplates: TemplateItem[] = import.meta.env.PROD ? templates.filter((tpl) => !tpl.draft) : templates;

/** category ごとに templates を分類した結果を返す */
export function groupByCategory(items: TemplateItem[] = visibleTemplates): Array<{ category: CategoryDef; items: TemplateItem[] }> {
  return categories
    .map((category) => ({
      category,
      items: items.filter((tpl) => tpl.category === category.id),
    }))
    .filter(({ items }) => items.length > 0);
}

/** templates 内に存在する stack の一覧（フィルタ chips 用） */
export function getAvailableStacks(items: TemplateItem[] = visibleTemplates): Stack[] {
  return stackOrder.filter((stack) => items.some((tpl) => tpl.stack === stack));
}

/** stack ごとの件数を返す */
export function countByStack(items: TemplateItem[] = visibleTemplates): Record<Stack, number> {
  return stackOrder.reduce(
    (acc, stack) => {
      acc[stack] = items.filter((tpl) => tpl.stack === stack).length;
      return acc;
    },
    {} as Record<Stack, number>
  );
}
