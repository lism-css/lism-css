# 機能実装仕様書

プロジェクト概要は [`AGENTS.md`](./AGENTS.md) を参照。

---

## コンテンツコレクション

### 設定ファイル

- `src/content/config.ts` - コレクションスキーマ定義

### Frontmatter フィールド

| フィールド  | 型       | 必須 | デフォルト | 説明                                                    |
| ----------- | -------- | ---- | ---------- | ------------------------------------------------------- |
| title       | string   | ✅   | -          | 記事タイトル                                            |
| navtitle    | string   | -    | -          | サイドバー表示用タイトル（省略時は title）              |
| description | string   | ✅   | -          | 記事の説明                                              |
| date        | date     | ✅   | -          | 公開日                                                  |
| tags        | string[] | -    | []         | タグ一覧                                                |
| draft       | boolean  | -    | false      | 下書きフラグ                                            |
| hero        | string   | -    | -          | ヒーロー画像パス                                        |
| order       | number   | -    | 999        | サイドバーでの表示順序（小さい順、dir 指定時のみ有効）  |

### 下書き機能（draft）

| 環境       | 動作                                             |
| ---------- | ------------------------------------------------ |
| 本番環境   | 完全に除外（ページ生成されない、一覧にも非表示） |
| 開発環境   | 表示されるが `_draft` クラスが付与               |

---

## MDX グローバルコンポーネント

### 設定ファイル

- `src/components/mdx/index.ts` - エクスポート管理
- `src/pages/[...slug].astro` - `<Content components={...} />` で注入

### 現在のコンポーネント

| コンポーネント | 説明                                       |
| -------------- | ------------------------------------------ |
| `Callout`      | 注意書き・補足情報の表示                   |
| `LinkCard`     | 外部リンクをカード形式で表示（OGP 自動取得）|
| `Demo`      | CSS デモを iframe でプレビュー表示          |
| `DemoCode`  | Demo のコード表示部分                    |

---

## Markdown 拡張記法

### 設定ファイル

- `astro.config.ts` - プラグイン登録
- `src/lib/remark-linkcard.ts` - URL → LinkCard 変換
- `src/lib/remark-callout.ts` - :::記法 → Callout 変換
- `src/lib/rehype-blockquote-cite.ts` - blockquote の cite 属性変換

### 機能一覧

| 記法                | 変換先                              | プラグイン              |
| ------------------- | ----------------------------------- | ----------------------- |
| 外部リンク          | `target="_blank"` 自動付与          | rehype-external-links   |
| URL だけの段落      | `<LinkCard>`                        | remark-linkcard         |
| `:::type ... :::`   | `<Callout type="...">`              | remark-directive + remark-callout |
| `> [!cite url]`     | blockquote に cite 属性追加          | rehype-blockquote-cite  |

### Callout の type 一覧

`alert`（赤）, `point`（オレンジ）, `warning`（黄）, `check`（緑）, `help`（紫）, `note`（青）

---

## Demo コンポーネント

### 設定ファイル

- `src/components/mdx/Demo/` - Demo 関連コンポーネント
- `src/layouts/DemoLayout.astro` - プレビューページ用レイアウト

### ディレクトリ構成

```
src/pages/preview/{example-name}/
├── index.astro    # プレビューページ（DemoLayout 使用）
├── _src.html      # HTML ソース
└── _src.css       # CSS ソース（任意）
```

---

## LinkCard コンポーネント

### 設定ファイル

- `src/components/mdx/LinkCard.astro` - LinkCard コンポーネント
- `src/lib/ogpCache.ts` - OGP データのキャッシュ管理

### キャッシュ

| 項目       | 内容                        |
| ---------- | --------------------------- |
| 保存場所   | `.cache/ogp/[md5hash].json` |
| 有効期限   | 7 日間                      |

---

## 目次生成

### 設定ファイル

- `src/lib/generateToc.ts` - 目次生成アルゴリズム（Starlight 移植）
- `src/components/TableOfContents.astro` - 目次 UI
- `src/components/TocItem.astro` - 目次アイテム（再帰コンポーネント）

---

## サイドバーナビゲーション

### 設定ファイル

- `src/config/sidebar.ts` - サイドバー設定
- `src/components/SiteNav.astro` - サイドバーナビゲーション UI
- `src/components/parts/PostNavigation.astro` - 前後記事ナビゲーション

### セクション分け

サイトは `/docs/` と `/ui/` の2つのセクションに分かれており、URLに応じて異なるナビゲーションを表示します。

| セクション | URL           | コンテンツ配置                | 説明                   |
| ---------- | ------------- | ----------------------------- | ---------------------- |
| `docs`     | `/docs/xxx/`  | `content/{lang}/xxx.mdx`      | ドキュメント           |
| `ui`       | `/ui/xxx/`    | `content/{lang}/ui/xxx.mdx`   | UI コンポーネント      |

### ページファイル構造

| セクション | ページファイル                   |
| ---------- | -------------------------------- |
| `docs`     | `src/pages/docs/[...slug].astro` |
| `ui`       | `src/pages/ui/[...slug].astro`   |

### トップレベルリンク

全セクションで共通表示される大きめのナビゲーションボタンです。

| プロパティ  | 型                  | 説明                                     |
| ----------- | ------------------- | ---------------------------------------- |
| `type`      | `'toplink'`         | トップレベルリンクの識別子               |
| `label`     | `string`            | 表示ラベル                               |
| `translate` | `TranslateLabels`   | 他言語用ラベル（例: `{ en: 'Docs' }`）   |
| `link`      | `string`            | リンク先 URL                             |
| `icon`      | `React.ElementType` | アイコンコンポーネント（任意）           |

### セクション設定

各セクション（`docs`, `ui`）ごとにナビゲーション項目を定義します。

| プロパティ  | 説明                                      |
| ----------- | ----------------------------------------- |
| `label`     | セクション名                              |
| `translate` | 他言語用ラベル（例: `{ en: 'Layout' }`）  |
| `dir`       | 指定ディレクトリ内の記事を自動取得        |
| `items`     | メニューの並びを直接指定                  |

**NOTE**: `dir` と `items` はどちらか一方を指定。`dir` 指定時は `order` フィールドの昇順でソート。

### items の指定方法

| 型               | 説明                                                    |
| ---------------- | ------------------------------------------------------- |
| `string`         | URL 文字列（MDX の `navtitle` または `title` を表示）   |
| `LinkItem`       | 通常のリンク項目（`label`, `link`, `translate?`）       |
| `SeparatorItem`  | 区切り線（`type: 'separator'`）                         |

### ヘルパー関数

| 関数                       | 説明                                                        |
| -------------------------- | ----------------------------------------------------------- |
| `getSiteSection(pathname)` | URL からセクション（`'docs'` \| `'ui'`）を取得              |
| `extractSlugFromUrl(url)`  | URL から slug を抽出（`/docs/xxx/` → `xxx`, `/ui/yyy/` → `ui/yyy`） |
| `getTranslatedLabel()`     | 言語に応じたラベルを取得                                    |
| `isSeparator(item)`        | セパレータかどうかを判定                                    |
| `isTopLevelLink(item)`     | トップレベルリンクかどうかを判定                            |

---

## 検索機能（Pagefind）

### 設定ファイル

- `src/components/SearchModal.astro` - 検索モーダル UI
- `src/types/pagefind.d.ts` - Pagefind の型定義

### 仕様

- ビルド後に `/dist/pagefind/` にインデックス生成
- 開発環境では動作しない（メッセージ表示）
- `⌘K` / `Ctrl+K` でモーダル表示
- `<html lang="...">` 属性で言語別インデックス生成

### 検索対象の制御

| 属性                          | 説明                         |
| ----------------------------- | ---------------------------- |
| `data-pagefind-body`          | 検索対象にする               |
| `data-pagefind-ignore`        | 検索対象から除外             |
| `data-pagefind-ignore="all"`  | 要素と子要素すべてを除外     |

---

## OG 画像生成

### 設定ファイル

- `src/pages/og/[...slug].png.ts` - OG 画像エンドポイント（root 言語）
- `src/pages/[lang]/og/[...slug].png.ts` - OG 画像エンドポイント（非 root 言語）
- `src/lib/ogImage.tsx` - OG 画像の JSX テンプレート
- `src/lib/pageHelpers.ts` - `generateOgImage()` 関数

### キャッシュ

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| 保存場所   | `.cache/og/{lang}/{slug}/{hash}.png` |
| キャッシュキー | タイトル + タグ + 言語の MD5 ハッシュ |

### Vercel CDN キャッシュ

`vercel.json` で OG 画像の CDN キャッシュを設定。

| キャッシュ | 期間 |
| ---------- | ---- |
| CDN        | 1年（再デプロイでパージ） |
| ブラウザ   | 1日 |

---

## コードブロック（Expressive Code）

### 設定ファイル

- `src/lib/expressive-code.config.ts` - Expressive Code 設定
- `astro.config.ts` - integration 登録

### 行番号表示オプション

````mdx
```js showLineNumbers
// 行番号を表示
```

```js startLineNumber=10
// 10 行目から開始
```
````

---

## 多言語対応（i18n）

### 設定ファイル

- `src/config/site.ts` - 言語設定
- `src/config/translations.ts` - UI 翻訳テキスト
- `src/lib/i18n.ts` - i18n ユーティリティ関数
- `src/lib/content.ts` - コンテンツ取得ユーティリティ
- `src/lib/pageHelpers.ts` - ページ共通ヘルパー
- `src/content/config.ts` - コレクション定義
- `src/components/LanguageSelect.astro` - 言語切り替え UI
- `src/components/TranslationNotice.astro` - 未翻訳注意書き

### URL 構造

| 言語         | 記事 URL          | タグ URL             |
| ------------ | ----------------- | -------------------- |
| ja（root）   | `/introduction`   | `/tags/CSS設計`      |
| en（非 root）| `/en/introduction`| `/en/tags/CSS設計`   |

### コンテンツディレクトリ

```
src/content/
├── config.ts      # コレクションスキーマ定義
├── ja/            # 日本語記事（root 言語）
└── en/            # 英語記事（非 root 言語、未翻訳は ja にフォールバック）
```

### ページファイル構造

```
src/pages/
├── index.astro              # トップ（root 言語）
├── [...slug].astro          # 記事詳細（root 言語）
├── page/[num].astro         # ページネーション（root 言語）
├── tags/[tag].astro         # タグ一覧（root 言語）
├── og/[...slug].png.ts      # OG 画像（root 言語）
└── [lang]/
    ├── index.astro          # トップ（非 root 言語）
    ├── [...slug].astro      # 記事詳細（非 root 言語）
    ├── page/[num].astro     # ページネーション（非 root 言語）
    ├── tags/[tag].astro     # タグ一覧（非 root 言語）
    └── og/[...slug].png.ts  # OG 画像（非 root 言語）
```

### i18n 主要関数

| 関数                      | 説明                                      |
| ------------------------- | ----------------------------------------- |
| `getRootLang()`           | root 言語コードを取得                     |
| `isRootLang(lang)`        | 指定言語が root 言語かどうか              |
| `getLangFromUrl(url)`     | URL から言語コードを判定                  |
| `getLocalizedUrl(path, lang)` | 言語に応じた URL を生成               |
| `getTranslations(lang)`   | 指定言語の翻訳オブジェクトを取得          |
| `t(lang, category)`       | 翻訳テキストを取得                        |

### 新しい言語を追加する手順

1. `src/config/site.ts` の `langs` に言語を追加
2. `src/content/` に言語ディレクトリを作成
3. `src/content/config.ts` にコレクションを追加
4. `src/config/translations.ts` に翻訳テキストを追加
5. 翻訳記事を作成（未翻訳の記事は root 言語にフォールバック）

---

## テーマ切り替え（ライト/ダークモード）

### 設定ファイル

- `src/config/site.ts` - `theme.default` 設定
- `src/layouts/BaseLayout.astro` - テーマ初期化スクリプト（`<head>` 内）
- `src/components/ThemeSwitch.astro` - テーマ切り替えボタン
- `src/styles/_theme.scss` - テーマ用 CSS 変数

### テーマの優先順位

1. `localStorage` に保存された値
2. `site.ts` の `theme.default` 設定
3. `'system'` の場合は OS のシステム設定

---

## 前後記事ナビゲーション

### 設定ファイル

- `src/components/parts/PostNavigation.astro` - ナビゲーションコンポーネント

### 並び順ロジック

1. 現在の URL から セクション（`docs` or `ui`）を判定
2. 該当セクションの `sidebar.ts` 設定に従って記事を順序付け
3. `dir` 指定の場合は `order` の昇順でソート（未指定は 999）
4. `order` が同じ場合は `date` の降順でソート
5. 現在の記事の前後を取得して表示

---

## ページネーション

### 設定ファイル

- `src/config/site.ts` - `pagination.postsPerPage` 設定
- `src/components/ui/Pagination.astro` - ページネーションコンポーネント
- `src/pages/index.astro` - 1 ページ目
- `src/pages/page/[num].astro` - 2 ページ目以降

### URL 構造

| ページ       | URL          |
| ------------ | ------------ |
| 1 ページ目   | `/`          |
| 2 ページ目〜 | `/page/2`, `/page/3`, ... |

---

## サイト設定

### 設定ファイル

- `src/config/site.ts` - サイト全体の設定

### 主な設定項目

| 項目            | 説明                                    |
| --------------- | --------------------------------------- |
| `publish`       | サイトを公開するかどうか                |
| `name`          | サイト名                                |
| `description`   | サイトの説明                            |
| `langs`         | 多言語設定                              |
| `author`        | 著者情報                                |
| `links`         | 関連リンク                              |
| `pagination`    | ページネーション設定                    |
| `theme`         | テーマ設定                              |
| `googleAnalytics` | Google Analytics 測定 ID              |

---

## レイアウト構造

### 設定ファイル

- `src/layouts/BaseLayout.astro` - 共通レイアウト
- `src/styles/` - スタイルファイル

### PC（1024px 以上）

```
+--------------------------------------------------+
|                    Header                        |
+------------+----------------------+--------------+
|  Sidebar   |       Main          |     TOC      |
|  (250px)   |     (content)       |   (250px)    |
|            |     + Footer        |              |
+------------+----------------------+--------------+
```

### モバイル（1024px 未満）

サイドバーと目次は非表示。

---

## 実装済み機能一覧

- [x] Astro + TypeScript + MDX 基盤
- [x] React 統合
- [x] lism-css CSS フレームワーク
- [x] Expressive Code コードハイライト
- [x] コンテンツコレクション
- [x] 目次生成
- [x] 3 カラムレスポンシブレイアウト
- [x] Pagefind 検索（モーダル形式、ショートカット対応）
- [x] OG 画像自動生成（キャッシュ機構付き）
- [x] タグ別記事一覧
- [x] ダークモード対応
- [x] MDX グローバルコンポーネント
- [x] 外部リンクカード（OGP 自動取得、キャッシュ付き）
- [x] Markdown 拡張記法
- [x] 前後記事ナビゲーション
- [x] ページネーション
- [x] 多言語対応（i18n）
- [x] Google Analytics 対応
