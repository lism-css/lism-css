# CLAUDE.md

このファイルは Claude Code および サブエージェント向けのガイドです。

**各機能の詳細な実装については [`specifications.md`](./specifications.md) を参照してください。**

---

## プロジェクト概要

Astro + TypeScript + MDX で構築されたドキュメントサイト。Starlight を使用せず、カスタム実装で構築。

| 機能 | 技術 |
|------|------|
| フレームワーク | Astro 5.x |
| コンテンツ | MDX（コンテンツコレクション） |
| CSS | lism-css |
| 検索 | Pagefind（静的検索ライブラリ） |
| コードハイライト | Expressive Code（Shiki ベース） |
| OG 画像生成 | satori + sharp（キャッシュ付き） |
| 目次生成 | Starlight の generateToC 移植 |

---

## 開発コマンド

```bash
pnpm dev      # 開発サーバー起動
pnpm build    # 本番ビルド（Pagefindインデックス生成含む）
pnpm preview  # プレビューサーバー
```

---

## ファイル読み込みの制限

`/src/content/ja/` および `/src/content/en/` の `.mdx` ファイルは、**記事の執筆を依頼された場合のみ**読み込むこと。
スタイル調整や機能実装・変更時には読み込み不要。

---

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
│   │   ├── Callout.astro
│   │   └── LinkCard.astro
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
│   ├── ogpCache.ts           # OGPキャッシュ管理
│   ├── remark-callout.ts     # :::記法変換
│   ├── remark-linkcard.ts    # URL→LinkCard変換
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

---

## セクション構造

サイトは2つのセクションに分かれています：

| セクション | URL | コンテンツ |
|------------|-----|------------|
| docs | `/docs/xxx/` | `content/{lang}/xxx.mdx` |
| ui | `/ui/xxx/` | `content/{lang}/ui/xxx.mdx` |

---

## 記事（MDX）編集時の注意

- **正確性最優先**: 曖昧な情報は載せない。無理に文字数を稼ぐ必要はない
- **文体**: です・ます調で、初心者向けの技術書籍のように親しみやすくフォーマルに

---

## コーディング規約

1. **コメント**: 処理内容がわかりやすい簡易的なコメントを付ける
2. **既存コメント**: `memo:` や `NOTE:` で始まるコメントは削除禁止
3. **スタイル**: lism-css を使用。追加スタイルは `src/styles/` に記述

---

## パスエイリアス

```ts
'@': '/src'
'@parts': '/src/components/parts'
```

---

## ビルド後の出力

| パス | 内容 |
|------|------|
| `/dist/` | 静的ビルド出力（編集禁止） |
| `/dist/pagefind/` | Pagefind 検索インデックス |
| `/dist/og/**/*.png` | 各記事の OG 画像 |
| `.cache/og/` | OG 画像のビルドキャッシュ |
| `.cache/ogp/` | 外部サイト OGP データのキャッシュ |
