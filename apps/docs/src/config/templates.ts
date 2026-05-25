/**
 * Templates 一覧データ
 *
 * テンプレート定義の SSOT は `templates/manifest.ts`。
 * このファイルでは manifest から CLI / docs 共通フィールド（slug / category / stack /
 * variant / title / description / previewUrl / draft）を受け取り、docs 専用の
 * `thumb`（ImageMetadata）を規約ベースで解決して `TemplateItem[]` を組み立てる。
 *
 * thumb 解決ルール:
 * - kind === 'single-project-variant': `templates/{sourcePath}/screenshots/{variant}.png`
 * - それ以外:                          `templates/{sourcePath}/screenshots/top.png`
 */

import type { LangCode } from '@/config/site';
import type { ImageMetadata } from 'astro';

import { TEMPLATES as manifestTemplates, type CategoryId, type Stack, type TemplateDef } from '@templates/manifest';

/**
 * templates/ 配下の screenshots/*.png を一括取得。
 * `_baseline/` 配下は差分検出用のベースライン画像なのでビルドに含めない。
 */
const screenshotModules = import.meta.glob<{ default: ImageMetadata }>(
  ['../../../../templates/**/screenshots/*.png', '!../../../../templates/**/_baseline/**'],
  { eager: true }
);

export type { CategoryId, Stack };

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
  /** 紹介カードに表示する機能リスト（任意） */
  features?: Record<LangCode, string[]>;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  description: Record<LangCode, string>;
  /**
   * true の場合、カテゴリ内の複数テンプレートを「中身共通・stack 違い」として
   * 1枚のカードに集約表示し、詳細ページもカテゴリ単位の1ページに統合する。
   * 一覧カードのコマンドは `pnpm create lism --template {category.id}` を案内する。
   */
  aggregateView?: boolean;
  /** 集約カードで代表サムネとして使う template slug（aggregateView 時のみ参照） */
  aggregateRepresentativeSlug?: string;
}

/** カテゴリ定義（表示順） */
export const categories: CategoryDef[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    aggregateView: true,
    aggregateRepresentativeSlug: 'minimal-vite',
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

/** sourcePath を持つ TemplateDef かどうか（thumb 解決に必要） */
function hasSourcePath(tpl: TemplateDef): tpl is Extract<TemplateDef, { sourcePath: string }> {
  return 'sourcePath' in tpl;
}

/** 規約ベースで thumb を解決（解決できなければビルド時に失敗させる） */
function resolveThumb(tpl: TemplateDef): ImageMetadata {
  if (!hasSourcePath(tpl)) {
    throw new Error(`[templates] thumb resolution unsupported for kind "${tpl.kind}" (slug: ${tpl.slug})`);
  }
  const file = tpl.kind === 'single-project-variant' ? `${tpl.variant}.png` : 'top.png';
  const key = `../../../../templates/${tpl.sourcePath}/screenshots/${file}`;
  const mod = screenshotModules[key];
  if (!mod) {
    throw new Error(`[templates] thumb not found for slug "${tpl.slug}" at ${key}`);
  }
  return mod.default;
}

/** manifest を docs 用 TemplateItem に変換 */
export const templates: TemplateItem[] = manifestTemplates.map(
  (tpl: TemplateDef): TemplateItem => ({
    slug: tpl.slug,
    category: tpl.category,
    stack: tpl.stack,
    title: tpl.title,
    description: tpl.description,
    thumb: resolveThumb(tpl),
    ...(tpl.previewUrl ? { previewUrl: tpl.previewUrl } : {}),
    ...(tpl.draft ? { draft: tpl.draft } : {}),
    ...(tpl.features ? { features: tpl.features } : {}),
  })
);

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

/**
 * 集約表示対象カテゴリ（aggregateView: true）の代表 template を返す。
 * 一覧カードのサムネ・タイトル・description のベースに使う。
 */
export function getAggregateRepresentative(category: CategoryDef, items: TemplateItem[] = visibleTemplates): TemplateItem | undefined {
  if (!category.aggregateView) return undefined;
  const slug = category.aggregateRepresentativeSlug;
  if (slug) {
    const found = items.find((tpl) => tpl.slug === slug);
    if (found) return found;
  }
  return items.find((tpl) => tpl.category === category.id);
}

/** カテゴリ内の全 template を返す（stack 表示順） */
export function getCategoryTemplates(categoryId: CategoryId, items: TemplateItem[] = visibleTemplates): TemplateItem[] {
  const filtered = items.filter((tpl) => tpl.category === categoryId);
  return [...filtered].sort((a, b) => stackOrder.indexOf(a.stack) - stackOrder.indexOf(b.stack));
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
