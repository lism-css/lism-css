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
│   ├── Head.astro
│   ├── Header.astro
│   ├── Footer.astro
│   ├── Sidebar.astro         # 左サイドバー
│   ├── SiteNav.astro         # サイドバーナビゲーション
│   ├── TableOfContents.astro # 右サイドバー（目次）
│   ├── TocItem.astro
│   ├── FixedToc.astro
│   ├── SearchModal.astro     # 検索モーダル
│   ├── LanguageSelect.astro  # 言語切り替え
│   ├── ThemeSwitch.astro     # テーマ切り替え
│   ├── ShareBtns.astro
│   ├── SNSLinks.astro
│   ├── JsonLd.astro          # 構造化データ出力
│   ├── TranslationNotice.astro # 機械翻訳の注意書き
│   ├── mdx/                  # MDXグローバルコンポーネント
│   │   ├── index.ts
│   │   ├── AstroCode.astro
│   │   ├── Callout.astro
│   │   ├── CopyBtn.astro
│   │   ├── DocsLink.astro
│   │   ├── ImportPackage.astro
│   │   ├── ModLink.astro
│   │   ├── PropBadge.astro
│   │   └── SrcCode.astro
│   ├── parts/                # 汎用UIコンポーネント
│   │   ├── Gradbox.astro
│   │   ├── NavLink.astro
│   │   ├── Pagination.astro
│   │   └── PostNavigation.astro
│   ├── ex/                   # MDX 内サンプル用コンポーネント
│   └── Preview/              # コードプレビュー UI
├── config/               # サイト設定
│   ├── site.ts               # サイト全体設定・言語設定
│   ├── sidebar.ts            # サイドバーナビ設定
│   ├── templates.ts          # テンプレートカテゴリ設定
│   └── translations.ts       # UI翻訳テキスト
├── content.config.ts     # コンテンツコレクションスキーマ定義
├── content/              # コンテンツコレクション（多言語）
│   ├── ja/                   # 日本語記事（root言語）
│   ├── en/                   # 英語記事（非root言語）
│   └── token-previews.jsx    # トークンプレビュー用JSX
├── layouts/
│   ├── BaseLayout.astro      # 共通レイアウト
│   ├── SimpleLayout.astro    # シンプルレイアウト
│   ├── DemoLayout.astro      # デモページ用
│   └── DemoPageLayout.astro  # デモページ（フルレイアウト）用
├── lib/                  # ユーティリティ
│   ├── i18n.ts               # 多言語ユーティリティ
│   ├── content.ts            # コンテンツ取得
│   ├── contentSlug.ts        # スラッグ解決
│   ├── pageHelpers.ts        # ページ共通ヘルパー
│   ├── generateToc.ts        # 目次生成
│   ├── ogImage.tsx           # OG画像テンプレート
│   ├── jsonLd.ts             # 構造化データ生成
│   ├── sitemap-lastmod.ts    # サイトマップ用更新日付
│   ├── templates.ts          # テンプレート取得
│   ├── remark-directive.ts   # :::記法変換（remark）
│   ├── rehype-blockquote-cite.ts # blockquote 拡張（rehype）
│   └── expressive-code.config.ts
├── pages/                # ルーティング
│   ├── index.astro
│   ├── 404.astro
│   ├── docs/[...slug].astro  # docs セクション
│   ├── docs/og/[...slug].png.ts # docs 用 OG画像
│   ├── ui/index.astro        # ui セクションのトップ
│   ├── ui/[...slug].astro    # ui セクション
│   ├── ui/og/[...slug].png.ts # ui 用 OG画像
│   ├── templates/            # テンプレート一覧／詳細
│   ├── preview/templates/    # テンプレートのプレビュー
│   ├── demo/                 # 各種デモページ
│   ├── page-layout/          # ページレイアウトのサンプル
│   └── [lang]/               # 非root言語用ページ
├── styles/
│   ├── main.scss             # エントリーポイント
│   ├── _base.scss
│   ├── _layout.scss
│   ├── _contents.scss
│   ├── _parts.scss
│   ├── _preview.scss
│   ├── _code.scss
│   ├── _lg.scss
│   ├── _theme.scss
│   ├── _docs/                # docs 系の個別スタイル
│   └── _memo/                # 検証用メモスタイル
├── img/                  # 画像アセット
├── utils/                # 汎用ユーティリティ
│   └── getSvgUrl.ts
├── types/
│   └── pagefind.d.ts
└── env.d.ts
```


## セクション構造

サイトは `/docs/` と `/ui/` の2つのセクションに分かれており、URLに応じて異なるナビゲーションを表示します。

| セクション | URL | コンテンツ配置 | ページファイル |
|------------|-----|----------------|----------------|
| docs | `/docs/xxx/` | `content/{lang}/xxx.mdx` | `src/pages/docs/[...slug].astro` |
| ui | `/ui/xxx/` | `content/{lang}/ui/xxx.mdx` | `src/pages/ui/[...slug].astro` |

