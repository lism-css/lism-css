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
          ja: '1カラムの記事レイアウト。タイトル・本文がシンプルに縦に並びます。',
          en: 'A one-column article layout. The title and body text are arranged simply in a vertical sequence.',
        },
      },
      {
        id: 'two-columns',
        title: 'Two Columns',
        description: {
          ja: '2カラムの記事レイアウト。記事本文とサイドバーが横並びになります。',
          en: 'A two-column article layout. The main article body and the sidebar are arranged side-by-side.',
        },
      },
      {
        id: 'one-column-bleed-title',
        title: 'One Column with Full-bleed Title',
        description: {
          ja: 'タイトル領域を全幅 (full-bleed) で表示する1カラムの記事レイアウト。',
          en: 'A one-column article layout with a full-bleed title area.',
        },
      },
      {
        id: 'two-columns-bleed-title',
        title: 'Two Columns with Full-bleed Title',
        description: {
          ja: 'タイトル領域を全幅 (full-bleed) で表示する2カラムの記事レイアウト。',
          en: 'A two-column article layout with a full-bleed title area.',
        },
      },
    ],
  },
  sections: {
    label: 'Sections',
    description: {
      ja: 'ヒーローや片側ブリードなど、ページの一部に組み込めるセクション単位のレイアウト例。',
      en: 'Section-level layout examples that can be embedded into a page, such as hero sections and one-sided bleed layouts.',
    },
    items: [
      {
        id: 'hero-fullscreen',
        title: 'Hero Fullscreen',
        description: {
          ja: 'ビューポート全体を覆うヒーローセクション。背景画像にタイトルやサブテキストを重ねて表示します。',
          en: 'A hero section that covers the entire viewport, with a title and subtitle overlaid on a background image.',
        },
      },
      {
        id: 'one-side-bleed',
        title: 'One Side Bleed',
        description: {
          ja: '片側だけがコンテンツ幅を突き抜けるレイアウト。テキストとビューポート端まで広がる画像を横並びに配置します。',
          en: 'A layout where only one side bleeds beyond the content width, placing text alongside an image that extends to the viewport edge.',
        },
      },
      {
        id: 'fullwide-sections',
        title: 'Fullwide Sections',
        description: {
          ja: '背景を全幅にしつつ、コンテンツ幅を維持するレイアウトの例',
          en: 'An example of a layout that keeps the content width fixed while making the background full-width',
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
    items: [
      {
        id: '404',
        title: '404 Not Found',
        description: {
          ja: '404 Not Found ページのレイアウト。ヘッダーとフッターの間に、ページが見つからない旨のメッセージを中央寄せで配置します。',
          en: 'A 404 Not Found page layout with a centered "page not found" message between the header and footer.',
        },
      },
    ],
  },
} satisfies Record<string, PageLayoutCategory>;

// カテゴリIDの型（pageLayouts のキーから自動推論）
export type PageLayoutCategoryId = keyof typeof pageLayouts;

// pageLayouts をエクスポート（型推論のため、定義とエクスポートを分離）
export { pageLayouts };

// カテゴリIDの配列（表示順）
export const categoryIds = Object.keys(pageLayouts) as PageLayoutCategoryId[];
