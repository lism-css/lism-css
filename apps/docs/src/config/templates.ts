/**
 * テンプレートデータ設定
 *
 * カテゴリごとにテンプレートのリストを定義
 * MDXファイルを使わず、このデータから動的にページを生成
 */

import type { LangCode } from '@/config/site';

// テンプレートアイテムの型
export interface TemplateItem {
  id: string; // テンプレートID（例: cta001）
  title: string; // タイトル（例: CTA001）
  description: Record<LangCode, string>; // 言語別の説明文
  draft?: boolean; // 下書きフラグ（本番環境では非公開）
}

// カテゴリ情報の型
export interface TemplateCategory {
  label: string; // カテゴリ表示名
  items: TemplateItem[];
}

// テンプレートデータ（satisfiesでカテゴリ追加時に型定義の更新が不要になる）
const templates = {
  cta: {
    label: 'CTA',
    items: [
      {
        id: 'cta001',
        title: 'CTA001',
        description: {
          ja: 'CTA用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A CTA template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta002',
        title: 'CTA002',
        description: {
          ja: 'CTA用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A CTA template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta003',
        title: 'CTA003',
        description: {
          ja: 'CTA用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A CTA template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta004',
        title: 'CTA004',
        description: {
          ja: 'CTA用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A CTA template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
    ],
  },
  feature: {
    label: 'Feature',
    items: [
      {
        id: 'feature001',
        title: 'Feature001',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A template for featured content. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'feature002',
        title: 'Feature002',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下でレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A template for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature003',
        title: 'Feature003',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A template for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature004',
        title: 'Feature004',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A template for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature005',
        title: 'Feature005',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A template for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature006',
        title: 'Feature006',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A template for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature007',
        title: 'Feature007',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A template for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature008',
        title: 'Feature008',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A template for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature009',
        title: 'Feature009',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A template for featured content. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'feature010',
        title: 'Feature010',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A template for featured content. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'feature011',
        title: 'Feature011',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A template for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature012',
        title: 'Feature012',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は2カラム、「sm」以下は1カラムで表示されます。',
          en: 'A template for featured content. Below the "md" breakpoint, it displays in 2 columns, and below "sm" it switches to a single column.',
        },
      },
      {
        id: 'feature013',
        title: 'Feature013',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は2カラム、「sm」以下は1カラムで表示されます。',
          en: 'A template for featured content. Below the "md" breakpoint, it displays in 2 columns, and below "sm" it switches to a single column.',
        },
      },
      {
        id: 'feature014',
        title: 'Feature014',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A template for featured content. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'feature015',
        title: 'Feature015',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A template for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature016',
        title: 'Feature016',
        description: {
          ja: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A template for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
    ],
  },
  greeting: {
    label: 'Greeting',
    items: [
      {
        id: 'greeting001',
        title: 'Greeting001',
        description: {
          ja: '挨拶用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A greeting template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      { id: 'greeting002', title: 'Greeting002', description: { ja: '挨拶用のテンプレートです。', en: 'A greeting template.' } },
      {
        id: 'greeting003',
        title: 'Greeting003',
        description: {
          ja: '挨拶用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A greeting template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      { id: 'greeting004', title: 'Greeting004', description: { ja: '挨拶用のテンプレートです。', en: 'A greeting template.' } },
    ],
  },
  history: {
    label: 'History',
    items: [
      {
        id: 'history001',
        title: 'History001',
        description: {
          ja: '沿革コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A history/timeline template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'history002',
        title: 'History002',
        description: {
          ja: '沿革コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A history/timeline template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
    ],
  },
  information: {
    label: 'Information',
    items: [
      {
        id: 'information001',
        title: 'Information001',
        description: {
          ja: '情報用のテンプレートです。内容は全てダミーコンテンツです。',
          en: 'An information template. All content is placeholder text.',
        },
      },
      {
        id: 'information002',
        title: 'Information002',
        description: {
          ja: '情報用のテンプレートです。内容は全てダミーコンテンツです。',
          en: 'An information template. All content is placeholder text.',
        },
      },
      {
        id: 'information003',
        title: 'Information003',
        description: {
          ja: '情報用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。内容は全てダミーコンテンツです。',
          en: 'An information template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically. All content is placeholder text.',
        },
      },
      {
        id: 'information004',
        title: 'Information004',
        description: {
          ja: '情報用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。内容は全てダミーコンテンツです。',
          en: 'An information template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically. All content is placeholder text.',
        },
      },
    ],
  },
  member: {
    label: 'Member',
    items: [
      {
        id: 'member001',
        title: 'Member001',
        description: {
          ja: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member002',
        title: 'Member002',
        description: {
          ja: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member003',
        title: 'Member003',
        description: {
          ja: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member004',
        title: 'Member004',
        description: {
          ja: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member005',
        title: 'Member005',
        description: {
          ja: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member006',
        title: 'Member006',
        description: {
          ja: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
  navigation: {
    label: 'Navigation',
    items: [
      {
        id: 'navigation001',
        title: 'Navigation001',
        description: {
          ja: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation002',
        title: 'Navigation002',
        description: {
          ja: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。breakpoint「md」以下は1カラムで表示されます。',
          en: 'A navigation template. Items have a minimum width set, and the number of columns changes according to the container width. Below the "md" breakpoint, it displays in a single column.',
        },
      },
      {
        id: 'navigation003',
        title: 'Navigation003',
        description: {
          ja: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation004',
        title: 'Navigation004',
        description: {
          ja: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation005',
        title: 'Navigation005',
        description: {
          ja: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation006',
        title: 'Navigation006',
        description: {
          ja: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation007',
        title: 'Navigation007',
        description: {
          ja: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation008',
        title: 'Navigation008',
        description: {
          ja: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
  news: {
    label: 'News',
    items: [
      {
        id: 'news001',
        title: 'News001',
        description: {
          ja: 'お知らせ用のテンプレートです。breakpoint「sm」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements template. Below the "sm" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news002',
        title: 'News002',
        description: {
          ja: 'お知らせ用のテンプレートです。breakpoint「sm」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements template. Below the "sm" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news003',
        title: 'News003',
        description: {
          ja: 'お知らせ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news004',
        title: 'News004',
        description: {
          ja: 'お知らせ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news005',
        title: 'News005',
        description: {
          ja: 'お知らせ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news006',
        title: 'News006',
        description: {
          ja: 'お知らせ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
    ],
  },
  pricetable: {
    label: 'Price Table',
    items: [
      {
        id: 'pricetable001',
        title: 'PriceTable001',
        description: {
          ja: '価格表用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'pricetable002',
        title: 'PriceTable002',
        description: {
          ja: '価格表用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'pricetable003',
        title: 'PriceTable003',
        description: {
          ja: '価格表用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'pricetable004',
        title: 'PriceTable004',
        description: {
          ja: '価格表用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
    ],
  },
  section: {
    label: 'Section',
    items: [
      { id: 'section001', title: 'Section001', description: { ja: 'セクション用のテンプレートです。', en: 'A section template.' } },
      {
        id: 'section002',
        title: 'Section002',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section002-2',
        title: 'Section002-2',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section003',
        title: 'Section003',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section003-2',
        title: 'Section003-2',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section004',
        title: 'Section004',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      { id: 'section005', title: 'Section005', description: { ja: 'セクション用のテンプレートです。', en: 'A section template.' } },
      {
        id: 'section006',
        title: 'Section006',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section007',
        title: 'Section007',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section008',
        title: 'Section008',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section009',
        title: 'Section009',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'section009-2',
        title: 'Section009-2',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      { id: 'section010', title: 'Section010', description: { ja: 'セクション用のテンプレートです。', en: 'A section template.' } },
      { id: 'section011', title: 'Section011', description: { ja: 'セクション用のテンプレートです。', en: 'A section template.' } },
      {
        id: 'section012',
        title: 'Section012',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'section013',
        title: 'Section013',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section014',
        title: 'Section014',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section015',
        title: 'Section015',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'section015-2',
        title: 'Section015-2',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'section016',
        title: 'Section016',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section template. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section901',
        title: '調整中：Section901',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
        draft: true,
      },
      {
        id: 'section901-2',
        title: '調整中：Section901-2',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
        draft: true,
      },
      {
        id: 'section902',
        title: '調整中：Section902',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
        draft: true,
      },
      {
        id: 'section902-2',
        title: '調整中：Section902-2',
        description: {
          ja: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section template. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
        draft: true,
      },
    ],
  },
  testimonials: {
    label: 'Testimonials',
    items: [
      {
        id: 'testimonials001',
        title: 'Testimonials001',
        description: {
          ja: 'お客様の声用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A testimonials template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'testimonials002',
        title: 'Testimonials002',
        description: {
          ja: 'お客様の声用のテンプレートです。breakpoint毎にアイテムの幅が変更されます。またアイテムをスナップした際に特定の位置で止まります。',
          en: 'A testimonials template. Item widths change at each breakpoint. Items snap to specific positions when scrolled.',
        },
      },
    ],
  },
  works: {
    label: 'Works',
    items: [
      {
        id: 'works001',
        title: 'Works001',
        description: {
          ja: '実績用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A portfolio/works template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'works002',
        title: 'Works002',
        description: {
          ja: '実績用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A portfolio/works template. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
} satisfies Record<string, TemplateCategory>;

// カテゴリIDの型（templatesオブジェクトのキーから自動推論）
export type TemplateCategoryId = keyof typeof templates;

// templatesをエクスポート（型推論のため、定義とエクスポートを分離）
export { templates };

// カテゴリIDの配列
export const categoryIds = Object.keys(templates) as TemplateCategoryId[];
