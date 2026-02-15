# 機能実装仕様書

プロジェクトの概要・構造は [`README.md`](./README.md) を参照。


## コンテンツコレクション

- `src/content/config.ts` - コレクションスキーマ定義（Frontmatter フィールドもここで定義）
- 下書き（`draft: true`）は本番で除外、開発環境では `_draft` クラス付きで表示


## MDX グローバルコンポーネント

- `src/components/mdx/index.ts` - エクスポート管理
- `src/pages/[...slug].astro` - `<Content components={...} />` で注入
- コンポーネント: `Callout`, `LinkCard`, `Demo`, `DemoCode`


## Markdown 拡張記法

- `astro.config.ts` - プラグイン登録
- `src/lib/remark-linkcard.ts` - URL だけの段落 → `<LinkCard>` 変換
- `src/lib/remark-callout.ts` - `:::type ... :::` → `<Callout>` 変換
- `src/lib/rehype-blockquote-cite.ts` - blockquote の cite 属性変換
- Callout type: `alert`（赤）, `point`（橙）, `warning`（黄）, `check`（緑）, `help`（紫）, `note`（青）


## Demo コンポーネント

- `src/components/mdx/Demo/` - Demo 関連コンポーネント
- `src/layouts/DemoLayout.astro` - プレビューページ用レイアウト
- プレビューページは `src/pages/preview/{example-name}/` に配置（`index.astro`, `_src.html`, `_src.css`）


## LinkCard コンポーネント

- `src/components/mdx/LinkCard.astro` - コンポーネント本体
- `src/lib/ogpCache.ts` - OGP キャッシュ管理（`.cache/ogp/`、有効期限 7 日）


## 目次生成

- `src/lib/generateToc.ts` - 目次生成アルゴリズム（Starlight 移植）
- `src/components/TableOfContents.astro` - 目次 UI
- `src/components/TocItem.astro` - 目次アイテム（再帰コンポーネント）


## サイドバーナビゲーション

- `src/config/sidebar.ts` - サイドバー設定（セクションごとのナビ項目定義）
- `src/components/SiteNav.astro` - サイドバーナビゲーション UI
- `src/components/parts/PostNavigation.astro` - 前後記事ナビゲーション


## 検索機能（Pagefind）

- `src/components/SearchModal.astro` - 検索モーダル UI（`⌘K` / `Ctrl+K` で表示）
- ビルド後に `/dist/pagefind/` にインデックス生成（開発環境では動作しない）
- `data-pagefind-body` / `data-pagefind-ignore` で検索対象を制御


## OG 画像生成

- `src/pages/og/[...slug].png.ts` - OG 画像エンドポイント（root 言語）
- `src/pages/[lang]/og/[...slug].png.ts` - OG 画像エンドポイント（非 root 言語）
- `src/lib/ogImage.tsx` - OG 画像の JSX テンプレート
- `src/lib/pageHelpers.ts` - `generateOgImage()` 関数
- キャッシュ: `.cache/og/{lang}/{slug}/{hash}.png`


## コードブロック（Expressive Code）

- `src/lib/expressive-code.config.ts` - Expressive Code 設定
- `astro.config.ts` - integration 登録
- `showLineNumbers` / `startLineNumber=N` で行番号表示


## 多言語対応（i18n）

- `src/config/site.ts` - 言語設定
- `src/config/translations.ts` - UI 翻訳テキスト
- `src/lib/i18n.ts` - i18n ユーティリティ関数
- `src/lib/content.ts` - コンテンツ取得（未翻訳は root 言語にフォールバック）
- `src/components/LanguageSelect.astro` - 言語切り替え UI
- `src/components/TranslationNotice.astro` - 未翻訳注意書き
- URL: root 言語（ja）は `/docs/xxx/`、非 root 言語（en）は `/en/docs/xxx/`


## テーマ切り替え（ライト/ダークモード）

- `src/config/site.ts` - `theme.default` 設定
- `src/layouts/BaseLayout.astro` - テーマ初期化スクリプト
- `src/components/ThemeSwitch.astro` - テーマ切り替えボタン
- `src/styles/_theme.scss` - テーマ用 CSS 変数
- 優先順位: localStorage → `site.ts` の default → OS 設定


## ページネーション

- `src/config/site.ts` - `pagination.postsPerPage` 設定
- `src/components/ui/Pagination.astro` - ページネーションコンポーネント


## サイト設定

- `src/config/site.ts` - サイト全体の設定（サイト名、言語、著者、テーマ、GA など）
