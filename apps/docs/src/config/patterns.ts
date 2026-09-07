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
  titleEn?: string;
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
  hero: {
    label: 'Hero',
    description: {
      ja: 'ページ冒頭に置く、見た目まで作り込んだヒーローセクション。骨格だけのレイアウトが必要な場合はPage Layoutsを参照してください。',
      en: 'Fully styled hero sections placed at the top of a page. See Page Layouts when you need the bare structure instead.',
    },
    related: [
      {
        label: 'Page Layouts: Hero Fullscreen',
        path: '/page-layouts/sections/hero-fullscreen/',
      },
    ],
    items: [
      {
        id: 'hero01',
        title: 'Hero01',
        description: {
          ja: '画面の高さいっぱいの背景画像に、ヘッダー・中央コンテンツを重ねたヒーローです。',
          en: 'A full-height hero with a header and centered content layered over a background image.',
        },
      },
      {
        id: 'hero02',
        title: 'Hero02',
        description: {
          ja: '画面いっぱいの背景画像に、ヘッダー・大きな見出し・右下のスクロール表示を重ねたヒーローです。',
          en: 'A full-height hero with a header, a large heading and a scroll cue at the bottom right.',
        },
      },
      {
        id: 'hero03',
        title: 'Hero03',
        description: {
          ja: '余白で囲んだ角丸の背景画像に、ヘッダー・左下の大きな見出し・右下のスクロール表示を重ねたヒーローです。',
          en: 'A rounded, inset hero with a header, a large heading at the bottom left and a scroll cue at the bottom right.',
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
        id: 'feature01',
        title: '01 - アイコンで伝える3つの強み',
        description: {
          ja: 'アイコン・見出し・短い説明文で、サービスの強みを3つに整理するセクションです。',
          en: 'A section presenting three service strengths with icons, headings and short descriptions.',
        },
        titleEn: '01 - Three strengths with icons',
      },
      {
        id: 'feature02',
        title: '02 - 写真と説明で伝える強み',
        description: {
          ja: '写真と説明を交互に配置し、サービスの強みを順に紹介するセクションです。',
          en: 'A section presenting service strengths with alternating photos and descriptions.',
        },
        titleEn: '02 - Strengths shown through photos',
      },
    ],
  },
  process: {
    label: 'Process',
    description: {
      ja: '利用開始やサービス提供の手順を伝えるセクション。',
      en: 'Sections explaining the steps to get started or use a service.',
    },
    items: [
      {
        id: 'process01',
        draft: true,
        title: '01 - はじめるまでの3ステップ',
        description: {
          ja: '番号と罫線を使って、利用開始までの手順を順番に伝えるセクションです。',
          en: 'A section explaining the steps to get started with numbers and dividing lines.',
        },
        titleEn: '01 - Three steps to get started',
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
        id: 'pricetable01',
        title: 'PriceTable01',
        description: {
          ja: '価格表用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pricing table pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'pricetable02',
        title: '02 - 機能で選ぶ料金比較',
        description: {
          ja: '機能を行、プランを列に並べた料金比較表です。狭い幅では表だけを横にスクロールできます。',
          en: 'A pricing comparison section that helps visitors choose a plan by comparing its features.',
        },
        titleEn: '02 - Compare plans by feature',
      },
    ],
  },
  stats: {
    label: 'Stats',
    description: {
      ja: '実績・規模・成果を数字で伝えるセクション。',
      en: 'Sections that communicate results, scale and achievements through numbers.',
    },
    items: [
      {
        id: 'stats01',
        draft: true,
        title: '01 - 数字で伝える実績',
        description: {
          ja: '説明文と大きな数字を非対称に配置して、実績や規模を伝えるセクションです。',
          en: 'An asymmetrical section pairing descriptions with large numbers to communicate results and scale.',
        },
        titleEn: '01 - Results in numbers',
      },
    ],
  },
  logos: {
    label: 'Logo Cloud',
    description: {
      ja: '導入企業やパートナーのロゴを並べるセクション。',
      en: 'Sections displaying customer and partner logos.',
    },
    items: [
      {
        id: 'logos01',
        draft: true,
        title: '01 - 導入企業のロゴ',
        description: {
          ja: '余白と文字のロゴで導入企業を紹介するセクションです。企業名は架空のサンプルです。',
          en: 'A section introducing customers with text-based logos and generous spacing. Company names are fictional samples.',
        },
        titleEn: '01 - Customer logos',
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
        id: 'testimonials01',
        title: 'Testimonials01',
        description: {
          ja: 'お客様の声用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A testimonials pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'testimonials02',
        title: '02 - 導入成果と担当者の声',
        description: {
          ja: '成果を伝える見出しに、担当者の写真と声を組み合わせたセクションです。',
          en: 'A customer story highlighting measurable results and feedback from a company representative.',
        },
        titleEn: '02 - Customer results and feedback',
      },
    ],
  },
  posts: {
    label: 'Posts',
    description: {
      ja: 'ニュース・ブログ記事・制作実績など、投稿を一覧で紹介するセクション。',
      en: 'Sections that showcase news, blog posts, portfolio works and other entries.',
    },
    items: [
      {
        id: 'posts01',
        title: 'Posts01',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「sm」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "sm" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'posts02',
        title: 'Posts02',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'posts03',
        title: 'Posts03',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'posts04',
        title: 'Posts04',
        description: {
          ja: 'お知らせ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A news/announcements pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'posts05',
        title: 'Posts05',
        description: {
          ja: '実績用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A portfolio/works pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'posts06',
        title: 'Posts06',
        description: {
          ja: '実績用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A portfolio/works pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
  greeting: {
    label: 'Greeting',
    description: {
      ja: '挨拶文やメッセージを伝えるセクション。',
      en: 'Sections that deliver a greeting or message.',
    },
    items: [
      {
        id: 'greeting01',
        title: 'Greeting01',
        description: {
          ja: '挨拶用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A greeting pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'greeting02',
        title: 'Greeting02',
        description: {
          ja: '挨拶用のパターンです。',
          en: 'A greeting pattern.',
        },
      },
      {
        id: 'greeting03',
        title: 'Greeting03',
        description: {
          ja: '挨拶用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A greeting pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'greeting04',
        title: 'Greeting04',
        description: {
          ja: '挨拶用のパターンです。',
          en: 'A greeting pattern.',
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
        id: 'member01',
        title: 'Member01',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member02',
        title: 'Member02',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member03',
        title: 'Member03',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member04',
        title: 'Member04',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
      {
        id: 'member05',
        title: 'Member05',
        description: {
          ja: 'メンバー一覧用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A team member list pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
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
        id: 'history01',
        title: 'History01',
        description: {
          ja: '沿革コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A history/timeline pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'history02',
        title: 'History02',
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
        id: 'information01',
        title: 'Information01',
        description: {
          ja: '情報用のパターンです。内容は全てダミーコンテンツです。',
          en: 'An information pattern. All content is placeholder text.',
        },
      },
      {
        id: 'information02',
        title: 'Information02',
        description: {
          ja: '情報用のパターンです。内容は全てダミーコンテンツです。',
          en: 'An information pattern. All content is placeholder text.',
        },
      },
      {
        id: 'information03',
        title: 'Information03',
        description: {
          ja: '情報用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。内容は全てダミーコンテンツです。',
          en: 'An information pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically. All content is placeholder text.',
        },
      },
      {
        id: 'information04',
        title: 'Information04',
        description: {
          ja: '情報用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。内容は全てダミーコンテンツです。',
          en: 'An information pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically. All content is placeholder text.',
        },
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
        id: 'faq01',
        title: 'FAQ01',
        description: {
          ja: '質問と回答を常に表示するシンプルなFAQセクションです。dl・dt・ddでマークアップしています。',
          en: 'A simple FAQ section that always shows both questions and answers, marked up with dl, dt and dd.',
        },
      },
      {
        id: 'faq02',
        title: 'FAQ02',
        description: {
          ja: 'Accordionを使って回答を開閉できるFAQセクションです。項目数が多い場合に適しています。',
          en: 'An FAQ section using Accordion so answers can be expanded and collapsed. Suited to lists with many items.',
        },
      },
    ],
  },
  cta: {
    label: 'CTA',
    description: {
      ja: '問い合わせや申し込みなど、次の行動を促すセクション。',
      en: 'Sections that prompt the next action, such as making an inquiry or signing up.',
    },
    items: [
      {
        id: 'cta01',
        title: 'CTA01',
        description: {
          ja: 'CTA用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A CTA pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta02',
        title: 'CTA02',
        description: {
          ja: '資料請求・電話・フォームの3つの窓口を、文字と罫線で紹介する問い合わせセクションです。',
          en: 'A CTA pattern. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'cta03',
        title: '03 - 横長の申し込みCTA',
        description: {
          ja: '写真を使わず、一言のメッセージとボタンで申し込みを促す横長のCTAです。',
          en: 'A horizontal CTA encouraging sign-ups with a short message and a button, without photos.',
        },
        titleEn: '03 - A horizontal sign-up CTA',
      },
      {
        id: 'cta04',
        title: '04 - ニュースレター登録',
        description: {
          ja: 'メール入力欄を備えた登録セクションです。入力の確認を試せますが、実際の送信や登録は行いません。',
          en: 'A sign-up section with an email field. Input validation can be tried, but no data is submitted or registered.',
        },
        titleEn: '04 - Newsletter sign-up',
      },
      {
        id: 'cta05',
        title: 'CTA05',
        description: {
          ja: '背景写真の中央に説明とボタンを置くCTAです。',
          en: 'A section pattern.',
        },
      },
    ],
  },
  'content-links': {
    label: 'Content Links',
    description: {
      ja: '画像や説明文を添えて、関連ページやおすすめコンテンツへ案内するリンク集。',
      en: 'Collections of links with images and descriptions that guide visitors to related pages and recommended content.',
    },
    items: [
      {
        id: 'content-links01',
        title: 'ContentLinks01',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'content-links02',
        title: 'ContentLinks02',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下でレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'content-links03',
        title: 'ContentLinks03',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'content-links04',
        title: 'ContentLinks04',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'content-links05',
        title: 'ContentLinks05',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it switches to a single column layout with items stacked vertically.',
        },
      },
      {
        id: 'content-links06',
        title: 'ContentLinks06',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'content-links07',
        title: 'ContentLinks07',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'content-links08',
        title: 'ContentLinks08',
        description: {
          ja: '特徴・注目コンテンツ用のパターンです。breakpoint「md」以下は2カラム、「sm」以下は1カラムで表示されます。',
          en: 'A pattern for featured content. Below the "md" breakpoint, it displays in 2 columns, and below "sm" it switches to a single column.',
        },
      },
      {
        id: 'content-links09',
        title: 'ContentLinks09',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
  section: {
    label: 'General',
    description: {
      ja: '特定の用途に限定しない汎用的なセクション構成。見出し・本文・画像の組み合わせ方の作例です。',
      en: 'General-purpose section structures that are not tied to a specific use case. Examples of combining headings, body text and images.',
    },
    items: [
      {
        id: 'section01',
        title: 'General01',
        description: {
          ja: 'セクション用のパターンです。',
          en: 'A section pattern.',
        },
      },
      {
        id: 'section02',
        title: 'General02',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section03',
        title: 'General03',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section04',
        title: 'General04',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section05',
        title: 'General05',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'section06',
        title: 'General06',
        description: {
          ja: 'セクション用のパターンです。',
          en: 'A section pattern.',
        },
      },
      {
        id: 'section07',
        title: 'General07',
        description: {
          ja: 'セクション用のパターンです。',
          en: 'A section pattern.',
        },
      },
      {
        id: 'section08',
        title: 'General08',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。',
          en: 'A section pattern. Below the "md" breakpoint, it displays in a single column with items stacked vertically.',
        },
      },
      {
        id: 'section09',
        title: 'General09',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
      {
        id: 'section10',
        title: 'General10',
        description: {
          ja: 'セクション用のパターンです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。',
          en: 'A section pattern. Below the "md" breakpoint, the layout changes and item arrangement is adjusted.',
        },
      },
    ],
  },
  footer: {
    label: 'Footer',
    description: {
      ja: 'ページ末尾に置くカテゴリ一覧やサイト内リンクをまとめたセクション。',
      en: 'Sections at the bottom of a page that collect categories and site navigation links.',
    },
    items: [
      {
        id: 'footer01',
        title: 'Footer01',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。breakpoint「md」以下は1カラムで表示されます。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width. Below the "md" breakpoint, it displays in a single column.',
        },
      },
      {
        id: 'footer02',
        title: 'Footer02',
        description: {
          ja: 'ナビゲーション用のパターンです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。',
          en: 'A navigation pattern. Items have a minimum width set, and the number of columns changes according to the container width.',
        },
      },
    ],
  },
} satisfies Record<string, PatternCategory>;

export type PatternCategoryId = keyof typeof patterns;

export { patterns };

export const categoryIds: PatternCategoryId[] = [
  'hero',
  'feature',
  'process',
  'pricetable',
  'stats',
  'logos',
  'testimonials',
  'posts',
  'greeting',
  'member',
  'history',
  'information',
  'faq',
  'cta',
  'content-links',
  'section',
  'footer',
];

// 翻訳前の新規例と、片方の言語だけで整理した例を公開対象から分ける。
export function isPatternAvailable(item: Pick<PatternItem, 'languages'>, lang: LangCode): boolean {
  return !item.languages || item.languages.includes(lang);
}
