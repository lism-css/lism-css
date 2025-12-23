# AGENTS.md - AI エージェント向けプロジェクトガイド

このドキュメントは、AI エージェントがこのプロジェクトを効率的に作業するための概要をまとめたものです。

**各機能の詳細な実装については [`specifications.md`](./specifications.md) を参照してください。**

---

## 記事（`.mdx`）を編集する時の注意点

- **正確性最優先**: 曖昧な情報は載せない。無理に文字数を稼ぐ必要はない
- **文体**: です・ます調で、初心者向けの技術書籍のように親しみやすくフォーマルに

---

## プロジェクト概要

Astro + TypeScript + MDX で構築されたブログサイト。Starlight を使用せず、カスタム実装で構築。

| 機能           | 技術                           |
| -------------- | ------------------------------ |
| 検索           | Pagefind（静的検索ライブラリ） |
| 目次生成       | Starlight の generateToC 移植  |
| コードブロック | Expressive Code（Shiki ベース）|
| OG 画像生成    | satori + sharp（キャッシュ付き）|
| CSS            | lism-css                       |

---

## ファイル読み込みの制限

`/src/content/ja/` および `/src/content/en/` の `.mdx` ファイルは、**記事の執筆を依頼された場合のみ**読み込むこと。  
スタイル調整や機能実装・変更時には読み込み不要。

---

## 技術スタック

| カテゴリ           | 技術                            |
| ------------------ | ------------------------------- |
| フレームワーク     | Astro 5.x                       |
| 言語               | TypeScript                      |
| コンテンツ         | MDX                             |
| UI 補助            | React（必要な場合のみ）         |
| CSS フレームワーク | lism-css                        |
| コードハイライト   | astro-expressive-code           |
| 検索               | Pagefind + @pagefind/default-ui |
| OG 画像            | satori + sharp                  |
| パッケージマネージャ | pnpm                          |

---

## ディレクトリ構造

```
src/
├── components/           # UIコンポーネント
│   ├── Header.astro          # ヘッダー
│   ├── Footer.astro          # フッター
│   ├── Sidebar.astro         # 左サイドバー
│   ├── SiteNav.astro         # サイドバーナビゲーション
│   ├── TableOfContents.astro # 右サイドバー（目次）
│   ├── SearchModal.astro     # 検索モーダル
│   ├── LanguageSelect.astro  # 言語切り替え
│   ├── ThemeSwitch.astro     # テーマ切り替え
│   ├── mdx/                  # MDXグローバルコンポーネント
│   │   ├── index.ts              # エクスポート管理
│   │   ├── Callout.astro         # 注意書き
│   │   ├── LinkCard.astro        # 外部リンクカード
│   │   ├── Demo/              # CSSデモプレビュー
│   │   ├── InnerLink.astro       # 内部リンクカード
│   │   ├── YouTubeEmbed.astro    # YouTube埋め込み
│   │   └── CanUse.astro          # ブラウザ対応状況
│   └── ui/                   # 汎用UIコンポーネント
│       ├── PostCard.astro        # 記事カード
│       ├── PostNavigation.astro  # 前後記事ナビ
│       ├── Pagination.astro      # ページネーション
│       └── TagLink.astro         # タグリンク
├── config/               # サイト設定
│   ├── site.ts               # サイト全体設定・言語設定
│   ├── sidebar.ts            # サイドバーナビ設定
│   └── translations.ts       # UI翻訳テキスト
├── content/              # コンテンツコレクション（多言語）
│   ├── config.ts             # コレクションスキーマ定義
│   ├── ja/                   # 日本語記事（root言語）
│   └── en/                   # 英語記事（非root言語）
├── layouts/              # レイアウト
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
│   ├── index.astro           # トップ（root言語）
│   ├── [...slug].astro       # 記事詳細（root言語）
│   ├── page/[num].astro      # ページネーション
│   ├── tags/[tag].astro      # タグ一覧
│   ├── og/[...slug].png.ts   # OG画像
│   └── [lang]/               # 非root言語用ページ
│       ├── index.astro
│       ├── [...slug].astro
│       ├── page/[num].astro
│       ├── tags/[tag].astro
│       └── og/[...slug].png.ts
├── styles/               # スタイル
│   ├── main.scss             # エントリーポイント
│   ├── _base.scss            # ベーススタイル
│   ├── _layout.scss          # レイアウト
│   ├── _docs.scss            # 記事スタイル
│   ├── _code.scss            # コードブロック
│   └── _theme.scss           # テーマ変数
└── types/                # TypeScript型定義
    ├── pagefind.d.ts
    └── lism-css.d.ts
```

---

## 開発コマンド

```bash
pnpm install    # 依存関係インストール
pnpm dev        # 開発サーバー起動
pnpm build      # 本番ビルド（Pagefindインデックス生成含む）
pnpm preview    # ビルド + プレビューサーバー
```

---

## コーディング規約

1. **コメント**: 処理内容がわかりやすい簡易的なコメントを付ける
2. **既存コメント**: `memo:` や `NOTE:` で始まるコメントは削除禁止
3. **スタイル**: lism-css を使用。追加スタイルは `src/styles/` に記述

---

## パスエイリアス

```ts
'@': '/src',
'@ui': '/src/components/ui',
```

---

## ビルド後の出力

| パス                 | 内容                        |
| -------------------- | --------------------------- |
| `/dist/`             | 静的ビルド出力              |
| `/dist/pagefind/`    | Pagefind 検索インデックス   |
| `/dist/og/**/*.png`  | 各記事の OG 画像            |
| `.cache/og/`         | OG 画像のビルドキャッシュ   |
| `.cache/ogp/`        | 外部サイト OGP データのキャッシュ |
