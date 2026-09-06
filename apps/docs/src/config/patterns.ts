// MDXを使わず、この定義データからパターンページを生成する
import type { LangCode } from '@/config/site';

// 関連ページへのリンク（言語プレフィックスなしのパスで保持し、表示時に言語を付与する）
export interface PatternRelatedLink {
  label: string;
  path: string;
}

export interface PatternItem {
  id: string;
  title: string;
  description: Record<LangCode, string>;
  draft?: boolean;
  languages?: LangCode[];
}

// ページ側では related の有無に関係なく、この共通型で受ける
export interface PatternCategory {
  label: string;
  description: Record<LangCode, string>;
  related?: PatternRelatedLink[];
  items: PatternItem[];
}

const patterns = {
  cta: {
    label: 'CTA',
    description: {
      ja: '問い合わせや申し込みなど、次の行動を促すセクション。',
      en: 'Sections that prompt the next action, such as making an inquiry or signing up.',
    },
    items: [
      {
        id: 'cta001',
        title: 'CTA001',
        description: {
          ja: 'CTA用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A CTA pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta002',
        title: 'CTA002',
        description: {
          ja: '資料請求・電話・フォームの3つの窓口を、文字と罫線で紹介する問い合わせセクションです。',
          en: 'A CTA pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta003',
        languages: ['en'],
        title: 'CTA003',
        description: {
          ja: 'CTA用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A CTA pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta004',
        languages: ['en'],
        title: 'CTA004',
        description: {
          ja: 'CTA用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A CTA pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta005',
        title: '横長の申し込みCTA',
        description: { ja: '写真を使わず、一言のメッセージとボタンで申し込みを促す横長のCTAです。', en: '' },
        languages: ['ja'],
      },
      {
        id: 'cta006',
        title: 'ニュースレター登録',
        description: { ja: 'メール入力欄を備えた登録セクションです。入力の確認を試せますが、実際の送信や登録は行いません。', en: '' },
        languages: ['ja'],
      },
    ],
  },
  faq: {
    label: 'FAQ',
    description: {
      ja: 'よくある質問と回答をまとめたセクション。質問と回答の対応関係を示す場合はdl・dt・ddでマークアップします。',
      en: 'Sections that collect frequently asked questions and answers. Use dl, dt and dd to express the question-answer relationship.',
    },
    items: [
      {
        id: 'faq001',
        title: 'FAQ001',
        description: {
          ja: '質問と回答を常に表示するシンプルなFAQセクションです。dl・dt・ddでマークアップしています。',
          en: 'A simple FAQ section that always shows both questions and answers, marked up with dl, dt and dd.',
        },
      },
      {
        id: 'faq002',
        title: 'FAQ002',
        description: {
          ja: 'Accordionを使って回答を開閉できるFAQセクションです。項目数が多い場合に適しています。',
          en: 'An FAQ section using Accordion so answers can be expanded and collapsed. Suited to lists with many items.',
        },
      },
    ],
  },
  feature: {
    label: 'Feature',
    description: {
      ja: 'サービスや商品の機能・強みを、説明文や画面・写真で伝えるセクション。',
      en: 'Sections that line up the features or highlights of a service or product.',
    },
    items: [
      {
        id: 'feature001',
        title: 'Feature001',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'feature002',
        title: 'Feature002',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下でレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature003',
        languages: ['en'],
        title: 'Feature003',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature004',
        title: 'Feature004',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature005',
        title: 'Feature005',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature006',
        title: 'Feature006',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature007',
        title: 'Feature007',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature008',
        languages: ['en'],
        title: 'Feature008',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature009',
        languages: ['en'],
        title: 'Feature009',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A pattern for featured content. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'feature010',
        languages: ['en'],
        title: 'Feature010',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'feature011',
        title: 'Feature011',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'feature012',
        languages: ['en'],
        title: 'Feature012',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は2カラム、「sm」以下は1カラムで表示されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it displays in 2 columns, and below "sm" it switches to a single column.',
        },
      },
      {
        id: 'feature013',
        title: 'Feature013',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は2カラム、「sm」以下は1カラムで表示されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it displays in 2 columns, and below "sm" it switches to a single column.',
        },
      },
      {
        id: 'feature014',
        languages: ['en'],
        title: 'Feature014',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'feature015',
        languages: ['en'],
        title: 'Feature015',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature016',
        languages: ['en'],
        title: 'Feature016',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'feature017',
        title: 'アイコンで伝える3つの強み',
        description: { ja: 'アイコン・見出し・短い説明文で、サービスの強みを3つに整理するセクションです。', en: '' },
        languages: ['ja'],
      },
      {
        id: 'feature018',
        title: '製品画面と機能紹介',
        description: { ja: '顧客対応の製品画面と機能説明を左右に並べ、使い方と利点を伝えるセクションです。', en: '' },
        languages: ['ja'],
      },
      {
        id: 'feature019',
        title: '写真と説明で伝える強み',
        description: { ja: '写真と説明を交互に配置し、サービスの強みを順に紹介するセクションです。', en: '' },
        languages: ['ja'],
      },
    ],
  },
  'content-links': {
    label: 'Content Links',
    description: { ja: '画像や説明文を添えて、関連ページやおすすめコンテンツへ案内するリンク集。', en: '' },
    items: [],
  },
  footer: {
    label: 'Footer',
    description: { ja: 'ページ末尾に置くカテゴリ一覧やサイト内リンクをまとめたセクション。', en: '' },
    items: [],
  },
  greeting: {
    label: 'Greeting',
    description: {
      ja: '挨拶文やメッセージを伝えるセクション。',
      en: 'Sections that deliver a greeting or message.',
    },
    items: [
      {
        id: 'greeting001',
        title: 'Greeting001',
        description: {
          ja: '挨拶用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A greeting pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      { id: 'greeting002', title: 'Greeting002', description: { ja: '挨拶用のパターンです。', en: 'A greeting pattern.' } },
      {
        id: 'greeting003',
        title: 'Greeting003',
        description: {
          ja: '挨拶用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A greeting pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      { id: 'greeting004', title: 'Greeting004', description: { ja: '挨拶用のパターンです。', en: 'A greeting pattern.' } },
    ],
  },
  hero: {
    label: 'Hero',
    description: {
      ja: 'ページ冒頭に置く、見た目まで作り込んだヒーローセクション。骨格だけのレイアウトが必要な場合はPage Layoutsを参照してください。',
      en: 'Fully styled hero sections placed at the top of a page. See Page Layouts when you need the bare structure instead.',
    },
    related: [{ label: 'Page Layouts: Hero Fullscreen', path: '/page-layouts/sections/hero-fullscreen/' }],
    items: [
      {
        id: 'hero001',
        title: 'Hero001',
        description: {
          ja: '画面の高さいっぱいの背景画像に、ヘッダー・中央コンテンツ・スクロール導線を重ねたヒーローです。',
          en: 'A full-height hero with a header, centered content and a scroll cue layered over a background image.',
        },
      },
      {
        id: 'hero002',
        title: 'Hero002',
        description: {
          ja: '価値提案とプロジェクト管理画面を左右に並べたヒーローです。狭い幅では縦に並びます。',
          en: 'A hero with text and an image side by side. Below the "md" breakpoint, it switches to a single column layout.',
        },
        languages: ['ja'],
      },
      {
        id: 'hero003',
        title: '開発ツールのヒーロー',
        description: { ja: '中央の見出しとターミナル画面で、開発ツールの価値を伝えるヒーローです。', en: '' },
        languages: ['ja'],
      },
      {
        id: 'hero004',
        title: '文字を主役にしたヒーロー',
        description: { ja: '大きな文字・番号・罫線で構成した、デザインスタジオのヒーローです。', en: '' },
        languages: ['ja'],
      },
    ],
  },
  history: {
    label: 'History',
    description: {
      ja: '沿革や年表を時系列で伝えるセクション。',
      en: 'Sections that present a history or timeline in chronological order.',
    },
    items: [
      {
        id: 'history001',
        title: 'History001',
        description: {
          ja: '沿革コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A history/timeline pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'history002',
        title: 'History002',
        description: {
          ja: '沿革コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A history/timeline pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
    ],
  },
  information: {
    label: 'Information',
    description: {
      ja: '所在地・営業時間などの基本情報を伝えるセクション。',
      en: 'Sections that present basic information such as location and business hours.',
    },
    items: [
      {
        id: 'information001',
        title: 'Information001',
        description: {
          ja: '情報用のパターンです。内容は全てダミーコンテンツです。',
          en: 'An information pattern. All content is placeholder text.',
        },
      },
      {
        id: 'information002',
        title: 'Information002',
        description: {
          ja: '情報用のパターンです。内容は全てダミーコンテンツです。',
          en: 'An information pattern. All content is placeholder text.',
        },
      },
      {
        id: 'information003',
        title: 'Information003',
        description: {
          ja: '情報用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。内容は全てダミーコンテンツです。',
          en: 'An information pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically. All content is placeholder text.',
        },
      },
      {
        id: 'information004',
        title: 'Information004',
        description: {
          ja: '情報用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。内容は全てダミーコンテンツです。',
          en: 'An information pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically. All content is placeholder text.',
        },
      },
    ],
  },
  member: {
    label: 'Member',
    description: {
      ja: 'メンバーやスタッフを一覧で紹介するセクション。',
      en: 'Sections that introduce team members or staff as a list.',
    },
    items: [
      {
        id: 'member001',
        title: 'Member001',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member002',
        title: 'Member002',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member003',
        title: 'Member003',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member004',
        title: 'Member004',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member005',
        languages: ['en'],
        title: 'Member005',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member006',
        title: 'Member006',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
  navigation: {
    label: 'Navigation',
    description: {
      ja: 'カテゴリや下層ページへの導線をまとめたセクション。',
      en: 'Sections that gather links to categories or lower-level pages.',
    },
    items: [
      {
        id: 'navigation001',
        languages: ['en'],
        title: 'Navigation001',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation002',
        title: 'Navigation002',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。breakpoint「md」以下は1カラムで表示されます。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width. Below the "md" breakpoint, it displays in a single column.',
        },
      },
      {
        id: 'navigation003',
        languages: ['en'],
        title: 'Navigation003',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation004',
        languages: ['en'],
        title: 'Navigation004',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation005',
        title: 'Navigation005',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation006',
        languages: ['en'],
        title: 'Navigation006',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation007',
        title: 'Navigation007',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'navigation008',
        languages: ['en'],
        title: 'Navigation008',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
  news: {
    label: 'News',
    description: {
      ja: 'お知らせや新着情報を一覧で並べるセクション。',
      en: 'Sections that list news and announcements.',
    },
    items: [
      {
        id: 'news001',
        title: 'News001',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「sm」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "sm" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news002',
        languages: ['en'],
        title: 'News002',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「sm」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "sm" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news003',
        title: 'News003',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news004',
        languages: ['en'],
        title: 'News004',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news005',
        title: 'News005',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'news006',
        title: 'News006',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
    ],
  },
  pricetable: {
    label: 'Price Table',
    description: {
      ja: '料金プランを比較できる形で並べるセクション。',
      en: 'Sections that lay out pricing plans for comparison.',
    },
    items: [
      {
        id: 'pricetable001',
        languages: ['en'],
        title: 'PriceTable001',
        description: {
          ja: '価格表用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'pricetable002',
        languages: ['en'],
        title: 'PriceTable002',
        description: {
          ja: '価格表用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'pricetable003',
        languages: ['en'],
        title: 'PriceTable003',
        description: {
          ja: '価格表用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'pricetable004',
        title: 'PriceTable004',
        description: {
          ja: '価格表用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'pricetable005',
        title: '機能で選ぶ料金比較',
        description: { ja: '機能を行、プランを列に並べた料金比較表です。狭い幅では表だけを横にスクロールできます。', en: '' },
        languages: ['ja'],
      },
    ],
  },
  // カテゴリid・アイテムid・previewディレクトリは `section` のまま据え置き、表示ラベルのみ `General` にしている。
  // 親グループ `Sections` とカテゴリ名が衝突するのを避けるため（#566）。
  section: {
    label: 'General',
    description: {
      ja: '特定の用途に限定しない汎用的なセクション構成。見出し・本文・画像の組み合わせ方の作例です。',
      en: 'General-purpose section structures that are not tied to a specific use case. Examples of combining headings, body text and images.',
    },
    items: [
      { id: 'section001', title: 'Section001', description: { ja: 'セクション用のパターンです。', en: 'A section pattern.' } },
      {
        id: 'section002',
        title: 'Section002',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section002-2',
        languages: ['en'],
        title: 'Section002-2',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section003',
        title: 'Section003',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section003-2',
        languages: ['en'],
        title: 'Section003-2',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section004',
        languages: ['en'],
        title: 'Section004',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      { id: 'section005', title: 'Section005', description: { ja: '背景写真の中央に説明とボタンを置くCTAです。', en: 'A section pattern.' } },
      {
        id: 'section006',
        languages: ['en'],
        title: 'Section006',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section007',
        languages: ['en'],
        title: 'Section007',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section008',
        title: 'Section008',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section009',
        languages: ['en'],
        title: 'Section009',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'section009-2',
        title: 'Section009-2',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      { id: 'section010', title: 'Section010', description: { ja: 'セクション用のパターンです。', en: 'A section pattern.' } },
      { id: 'section011', title: 'Section011', description: { ja: 'セクション用のパターンです。', en: 'A section pattern.' } },
      {
        id: 'section012',
        title: 'Section012',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'section013',
        title: 'Section013',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section014',
        languages: ['en'],
        title: 'Section014',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section015',
        languages: ['en'],
        title: 'Section015',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'section015-2',
        languages: ['en'],
        title: 'Section015-2',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'section016',
        title: 'Section016',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section901',
        languages: ['en'],
        title: '調整中：Section901',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
        draft: true,
      },
      {
        id: 'section901-2',
        languages: ['en'],
        title: '調整中：Section901-2',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
        draft: true,
      },
      {
        id: 'section902',
        languages: ['en'],
        title: '調整中：Section902',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
        draft: true,
      },
      {
        id: 'section902-2',
        languages: ['en'],
        title: '調整中：Section902-2',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
        draft: true,
      },
    ],
  },
  testimonials: {
    label: 'Testimonials',
    description: {
      ja: '利用者の声やレビューを紹介するセクション。',
      en: 'Sections that showcase customer voices and reviews.',
    },
    items: [
      {
        id: 'testimonials001',
        title: 'Testimonials001',
        description: {
          ja: 'お客様の声用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A testimonials pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'testimonials002',
        languages: ['en'],
        title: 'Testimonials002',
        description: {
          ja: 'お客様の声用のパターンです。breakpoint毎にアイテムの幅が変更されます。またアイテムをスナップした際に特定の位置で止まります。',
          en: 'A testimonials pattern. Item widths change at each breakpoint. Items snap to specific positions when scrolled.',
        },
      },
      {
        id: 'testimonials003',
        title: '一人の声を大きく紹介',
        description: { ja: '引用文と人物写真を大きく使い、一人の体験を伝えるセクションです。', en: '' },
        languages: ['ja'],
      },
      {
        id: 'testimonials004',
        title: '導入成果と担当者の声',
        description: { ja: '成果の数字と企業の担当者の声を組み合わせたセクションです。', en: '' },
        languages: ['ja'],
      },
    ],
  },
  works: {
    label: 'Works',
    description: {
      ja: '制作実績や導入事例を一覧で並べるセクション。',
      en: 'Sections that list portfolio works and case studies.',
    },
    items: [
      {
        id: 'works001',
        title: 'Works001',
        description: {
          ja: '実績用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A portfolio/works pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'works002',
        title: 'Works002',
        description: {
          ja: '実績用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A portfolio/works pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
  stats: {
    label: 'Stats',
    description: { ja: '実績・規模・成果を数字で伝えるセクション。', en: '' },
    items: [
      {
        id: 'stats001',
        title: '数字で伝える実績',
        description: { ja: '説明文と大きな数字を非対称に配置して、実績や規模を伝えるセクションです。', en: '' },
        languages: ['ja'],
      },
    ],
  },
  logos: {
    label: 'Logo Cloud',
    description: { ja: '導入企業やパートナーのロゴを並べるセクション。', en: '' },
    items: [
      {
        id: 'logos001',
        title: '導入企業のロゴ',
        description: { ja: '余白と文字のロゴで導入企業を紹介するセクションです。企業名は架空のサンプルです。', en: '' },
        languages: ['ja'],
      },
    ],
  },
  process: {
    label: 'Process',
    description: { ja: '利用開始やサービス提供の手順を伝えるセクション。', en: '' },
    items: [
      {
        id: 'process001',
        title: 'はじめるまでの3ステップ',
        description: { ja: '番号と罫線を使って、利用開始までの手順を順番に伝えるセクションです。', en: '' },
        languages: ['ja'],
      },
    ],
  },
} satisfies Record<string, PatternCategory>;

export const postsCategory = {
  label: 'Posts',
  description: {
    ja: 'ニュース・ブログ記事・制作実績など、投稿を一覧で紹介するセクション。',
    en: '',
  },
} satisfies Omit<PatternCategory, 'items'>;

export type PatternCategoryId = keyof typeof patterns;

export const patternCategoryOverrides: Partial<Record<LangCode, Record<string, PatternCategoryId>>> = {
  ja: {
    section005: 'cta',
    navigation002: 'footer',
    navigation005: 'footer',
    navigation007: 'content-links',
    feature001: 'content-links',
    feature002: 'content-links',
    feature004: 'content-links',
    feature005: 'content-links',
    feature006: 'content-links',
    feature007: 'content-links',
    feature011: 'content-links',
    feature013: 'content-links',
  },
};

export const patternCategoryAliases: Partial<Record<LangCode, Record<string, PatternCategoryId | 'posts'>>> = {
  ja: { news: 'posts', works: 'posts', navigation: 'content-links' },
};

export { patterns };

export const categoryIds = Object.keys(patterns) as PatternCategoryId[];

// 翻訳前の新規例と、片方の言語だけで整理した例を公開対象から分ける。
export function isPatternAvailable(item: Pick<PatternItem, 'languages'>, lang: LangCode): boolean {
  return !item.languages || item.languages.includes(lang);
}
