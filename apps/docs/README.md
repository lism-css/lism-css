# Lism CSS Documents

Astro + TypeScript + MDX で構築された、Lism CSS (`packages/lism-css`) & Lism UI (`packages/lism-ui`) 用のドキュメントサイト。

| 機能 | 技術 |
|------|------|
| フレームワーク | Astro 6.x |
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
│   ├── templates/            # テンプレート一覧・詳細用UI
│   ├── ex/                   # MDX 内サンプル用コンポーネント
│   └── Preview/              # コードプレビュー UI
├── config/               # サイト設定
│   ├── site.ts               # サイト全体設定・言語設定
│   ├── sidebar.ts            # サイドバーナビ設定
│   ├── patterns.ts           # パターンカテゴリ設定
│   ├── page-layouts.ts       # ページレイアウトカテゴリ設定
│   ├── templates.ts          # テンプレートカテゴリ設定
│   ├── redirects.ts          # リダイレクト設定
│   └── translations.ts       # UI翻訳テキスト
├── content.config.ts     # コンテンツコレクションスキーマ定義
├── content/              # コンテンツコレクション（多言語）
│   ├── ja/                   # 日本語記事（root言語）
│   ├── en/                   # 英語記事（非root言語）
│   └── token-previews.jsx    # トークンプレビュー用JSX
├── integrations/
│   └── docs-md/               # ビルド時にHTML→Markdown変換・llms.txt/ui.md生成を行うAstro integration
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
│   ├── patterns.ts           # パターン取得
│   ├── page-layouts.ts       # ページレイアウト取得
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
│   ├── patterns/             # パターン一覧／詳細
│   ├── page-layouts/         # ページレイアウト一覧／詳細
│   ├── templates/            # テンプレート一覧／詳細
│   ├── preview/patterns/     # パターンのプレビュー
│   ├── preview/page-layouts/ # ページレイアウトのプレビュー
│   ├── demo/                 # 各種デモページ
│   └── [lang]/               # 非root言語用ページ（docs・ui 以外の各セクションを含む）
├── styles/
│   ├── main.scss             # エントリーポイント
│   ├── _base.scss
│   ├── _layout.scss
│   ├── _contents.scss
│   ├── _parts.scss
│   ├── _preview.scss
│   ├── _code.scss
│   ├── _kv-editor.scss
│   ├── _theme.scss
│   ├── _docs/                # docs 系の個別スタイル
│   └── _memo/                # 検証用メモスタイル
├── assets/               # OG画像生成用のフォント・画像
├── img/                  # 画像アセット
├── utils/                # 汎用ユーティリティ
│   └── getSvgUrl.ts
├── types/
│   └── pagefind.d.ts
└── env.d.ts
```


## セクション構造

サイトは `docs` / `ui` / `patterns` / `page-layouts` / `templates` / `demo` の複数セクションで構成されています。`docs` と `ui` はコンテンツコレクション（MDX）を、それ以外は `src/config/` の設定データをコンテンツソースとします。日本語（root言語）はプレフィックス無し、英語は `/en/` 配下で提供されます。

| セクション | URL（ja） | コンテンツソース | ページファイル |
|------------|-----------|-------------------|----------------|
| docs | `/docs/xxx/` | `content/{lang}/xxx.mdx` | `src/pages/docs/[...slug].astro` |
| ui | `/ui/xxx/` | `content/{lang}/ui/xxx.mdx` | `src/pages/ui/[...slug].astro` |
| patterns | `/patterns/{category}/` | `src/config/patterns.ts` | `src/pages/patterns/` |
| page-layouts | `/page-layouts/{category}/` | `src/config/page-layouts.ts` | `src/pages/page-layouts/` |
| templates | `/templates/` | `src/config/templates.ts` | `src/pages/templates/` |
| demo | `/demo/xxx/` | 各ページ内に直接記述 | `src/pages/demo/` |

英語版（`docs` / `ui` / `patterns` / `page-layouts` / `templates`）は `src/pages/[lang]/` 配下にまとめて実装されています。


## docs-md integration

`src/integrations/docs-md/` は、ビルド後の HTML を AI エージェント向けの Markdown に変換する Astro integration です。`docs` / `ui` セクションの各ページを `dist/{path}.md` として出力するほか、`/ui/` 一覧ページ用の `dist/ui.md` と、サイト全体のインデックスとなる `dist/llms.txt` を生成します。詳細な処理フローは [`documents/docs-md.md`](../../documents/docs-md.md) を参照してください。
