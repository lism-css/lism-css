# Lism CSS Documents

Astro + TypeScript + MDX で構築された、Lism CSS (`packages/lism-css`) & Lism UI (`packages/lism-ui`) 用のドキュメントサイト。

| 機能 | 技術 |
|------|------|
| フレームワーク | Astro 5.x |
| コンテンツ | MDX（コンテンツコレクション） |
| CSS | lism-css |
| 検索 | Pagefind（静的検索ライブラリ） |
| コードハイライト | Expressive Code（Shiki ベース） |
| OG 画像生成 | satori + sharp（キャッシュ付き） |
| 目次生成 | Starlight の generateToC 移植 |


## ディレクトリ構造

```
src/
├── components/           # UIコンポーネント
│   ├── Header.astro
│   ├── Footer.astro
│   ├── Sidebar.astro         # 左サイドバー
│   ├── SiteNav.astro         # サイドバーナビゲーション
│   ├── TableOfContents.astro # 右サイドバー（目次）
│   ├── SearchModal.astro     # 検索モーダル
│   ├── LanguageSelect.astro  # 言語切り替え
│   ├── ThemeSwitch.astro     # テーマ切り替え
│   ├── mdx/                  # MDXグローバルコンポーネント
│   │   ├── index.ts
│   │   └── Callout.astro
│   └── parts/                # 汎用UIコンポーネント
│       ├── PostCard.astro
│       ├── PostNavigation.astro
│       ├── Pagination.astro
│       └── TagLink.astro
├── config/               # サイト設定
│   ├── site.ts               # サイト全体設定・言語設定
│   ├── sidebar.ts            # サイドバーナビ設定
│   └── translations.ts       # UI翻訳テキスト
├── content/              # コンテンツコレクション（多言語）
│   ├── config.ts             # コレクションスキーマ定義
│   ├── ja/                   # 日本語記事（root言語）
│   └── en/                   # 英語記事（非root言語）
├── layouts/
│   ├── BaseLayout.astro      # 共通レイアウト
│   └── DemoLayout.astro      # プレビューページ用
├── lib/                  # ユーティリティ
│   ├── i18n.ts               # 多言語ユーティリティ
│   ├── content.ts            # コンテンツ取得
│   ├── pageHelpers.ts        # ページ共通ヘルパー
│   ├── generateToc.ts        # 目次生成
│   ├── ogImage.tsx           # OG画像テンプレート
│   ├── remark-callout.ts     # :::記法変換
│   └── expressive-code.config.ts
├── pages/                # ルーティング
│   ├── index.astro
│   ├── docs/[...slug].astro  # docs セクション
│   ├── ui/[...slug].astro    # ui セクション
│   ├── preview/              # Demo プレビューページ
│   ├── tags/[tag].astro
│   ├── og/[...slug].png.ts   # OG画像
│   └── [lang]/               # 非root言語用ページ
├── styles/
│   ├── main.scss             # エントリーポイント
│   ├── _base.scss
│   ├── _layout.scss
│   ├── _docs.scss
│   ├── _code.scss
│   └── _theme.scss
└── types/
    ├── pagefind.d.ts
    └── lism-css.d.ts
```


## セクション構造

サイトは `/docs/` と `/ui/` の2つのセクションに分かれており、URLに応じて異なるナビゲーションを表示します。

| セクション | URL | コンテンツ配置 | ページファイル |
|------------|-----|----------------|----------------|
| docs | `/docs/xxx/` | `content/{lang}/xxx.mdx` | `src/pages/docs/[...slug].astro` |
| ui | `/ui/xxx/` | `content/{lang}/ui/xxx.mdx` | `src/pages/ui/[...slug].astro` |

