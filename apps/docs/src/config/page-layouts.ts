/**
 * Page Layouts データ設定
 *
 * ページ骨格レベル（フロントページ、記事レイアウト、404 等）のレイアウト集。
 * カテゴリごとにアイテムを定義し、preview 実体は src/pages/preview/page-layouts/{category}/{id}/index.astro に配置する。
 */

import type { LangCode } from '@/config/site';

// Page Layout アイテムの型
export interface PageLayoutItem {
  id: string; // レイアウトID（例: one-column）
  title: string; // 表示タイトル（例: One Column）
  description: Record<LangCode, string>; // 言語別の説明文
  draft?: boolean; // 下書きフラグ（本番環境では非公開）
}

// カテゴリ情報の型
export interface PageLayoutCategory {
  label: string; // カテゴリ表示名
  description: Record<LangCode, string>; // カテゴリの概要
  items: PageLayoutItem[];
}

// Page Layouts データ（satisfies でカテゴリ追加時に型定義の更新が不要）
const pageLayouts = {
  page: {
    label: 'Page',
    description: {
      ja: 'ヒーローセクションのあるフロントページ等、ページ全体のレイアウト。',
      en: 'Full-page layouts such as front pages with hero sections.',
    },
    items: [],
  },
  article: {
    label: 'Article',
    description: {
      ja: '記事ページのレイアウト。1カラム・2カラム、タイトル位置やシェアボタン配置のパターン等。',
      en: 'Article page layouts such as 1-column / 2-column structures and title or share button placements.',
    },
    items: [
      {
        id: 'one-column',
        title: 'One Column',
        description: {
          ja: '1カラム構成の記事レイアウト。タイトル・本文・コメントエリアが縦に並びます。',
          en: 'A single-column article layout with title, body, and comment area stacked vertically.',
        },
      },
      {
        id: 'two-columns',
        title: 'Two Columns',
        description: {
          ja: '2カラム構成の記事レイアウト。記事本文とサイドバーが横並びになります。',
          en: 'A two-column article layout with the article body and sidebar arranged side by side.',
        },
      },
    ],
  },
  others: {
    label: 'Others',
    description: {
      ja: '404 ページのようなセンター寄せレイアウト等、その他。',
      en: 'Other layouts such as centered 404 pages.',
    },
    items: [],
  },
} satisfies Record<string, PageLayoutCategory>;

// カテゴリIDの型（pageLayouts のキーから自動推論）
export type PageLayoutCategoryId = keyof typeof pageLayouts;

// pageLayouts をエクスポート（型推論のため、定義とエクスポートを分離）
export { pageLayouts };

// カテゴリIDの配列（表示順）
export const categoryIds = Object.keys(pageLayouts) as PageLayoutCategoryId[];
