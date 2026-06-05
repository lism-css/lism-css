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
 *
 * 言語別 thumb（en）は同じ規約で `screenshots/en/` 配下を参照する。撮影済みなら
 * `getThumb(tpl, 'en')` が en スクショを返し、未撮影なら ja にフォールバックする。
 */

import type { LangCode } from '@/config/site';
import type { ImageMetadata } from 'astro';

import { TEMPLATES as manifestTemplates, type CategoryId, type Stack, type TemplateDef } from '@templates/manifest';

/**
 * templates/ 配下の screenshots 画像を一括取得。
 * `screenshots/*.png`（ja）に加え `screenshots/en/*.png`（言語別）も拾う。
 * 比較用の `_baseline/` `_diff/` `_temp/` 配下はビルドに含めない。
 */
const screenshotModules = import.meta.glob<{ default: ImageMetadata }>(
  [
    '../../../../templates/**/screenshots/**/*.png',
    '!../../../../templates/**/screenshots/_baseline/**',
    '!../../../../templates/**/screenshots/_diff/**',
    '!../../../../templates/**/screenshots/_temp/**',
  ],
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
  /** en 用 thumb（`screenshots/en/` に撮影済みの場合のみ）。無い場合は thumb にフォールバック */
  thumbEn?: ImageMetadata;
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
   * 一覧カードのコマンドは `npm create lism@latest -- --template {category.id}` を案内する。
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
      ja: 'Lism CSS を導入した最小構成。検証や独自構成のベースに最適です。',
      en: 'Minimal configuration with Lism CSS. Ideal for testing or as a base for your own custom setup.',
    },
  },
  {
    id: 'blog',
    label: 'Blog',
    description: {
      ja: 'Lism CSSで構築したブログサイト用のテンプレート。',
      en: 'Blog site templates built with Lism CSS.',
    },
  },
  {
    id: 'lp',
    label: 'LP',
    description: {
      ja: 'Lism CSSで構築したLPページ用のテンプレート。',
      en: 'Landing page templates built with Lism CSS.',
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

/** 規約ベースの thumb ファイル名（screenshots 直下からの相対） */
function thumbFileName(tpl: Extract<TemplateDef, { sourcePath: string }>): string {
  return tpl.kind === 'single-project-variant' ? `${tpl.variant}.png` : 'top.png';
}

/** 規約ベースで thumb を解決（解決できなければビルド時に失敗させる） */
function resolveThumb(tpl: TemplateDef): ImageMetadata {
  if (!hasSourcePath(tpl)) {
    throw new Error(`[templates] thumb resolution unsupported for kind "${tpl.kind}" (slug: ${tpl.slug})`);
  }
  const key = `../../../../templates/${tpl.sourcePath}/screenshots/${thumbFileName(tpl)}`;
  const mod = screenshotModules[key];
  if (!mod) {
    throw new Error(`[templates] thumb not found for slug "${tpl.slug}" at ${key}`);
  }
  return mod.default;
}

/** en 用 thumb を解決（`screenshots/en/` 未撮影なら undefined → 呼び出し側で ja にフォールバック） */
function resolveThumbEn(tpl: TemplateDef): ImageMetadata | undefined {
  if (!hasSourcePath(tpl)) return undefined;
  const key = `../../../../templates/${tpl.sourcePath}/screenshots/en/${thumbFileName(tpl)}`;
  return screenshotModules[key]?.default;
}

/** manifest を docs 用 TemplateItem に変換 */
export const templates: TemplateItem[] = manifestTemplates.map((tpl: TemplateDef): TemplateItem => {
  const thumbEn = resolveThumbEn(tpl);
  return {
    slug: tpl.slug,
    category: tpl.category,
    stack: tpl.stack,
    title: tpl.title,
    description: tpl.description,
    thumb: resolveThumb(tpl),
    ...(thumbEn ? { thumbEn } : {}),
    ...(tpl.previewUrl ? { previewUrl: tpl.previewUrl } : {}),
    ...(tpl.draft ? { draft: tpl.draft } : {}),
    ...(tpl.features ? { features: tpl.features } : {}),
  };
});

/** 言語に応じた thumb を返す（en は en スクショ優先・未撮影なら ja にフォールバック） */
export function getThumb(tpl: TemplateItem, lang: LangCode): ImageMetadata {
  return lang === 'en' ? (tpl.thumbEn ?? tpl.thumb) : tpl.thumb;
}

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
