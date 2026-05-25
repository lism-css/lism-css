---
title: 'blog-astro-personal の構成'
excerpt: Lism CSS リポジトリに同梱されている personal 向け Astro ブログテンプレートの仕様まとめ。
date: '2026-05-10'
updated: '2026-05-25'
tags: ['Astro', 'テンプレート']
---

`templates/blog/astro/personal/`は、Lism CSSと`@lism-css/ui`を使った個人ブログ（エッセイ・日記）向けのAstroテンプレート。文章中心の読み心地を意識した構成で、**年月アーカイブ**・**タグ**・**OGPメタタグ**・**sitemap/robots.txt**をひととおり揃えてある。カテゴリのような階層的な分類軸は持たない。

## 依存

AstroとLism CSS/`@lism-css/ui`に加え、`@astrojs/sitemap`を入れている。`astro.config.mjs`はsitemap integrationと`@`→`/src`のエイリアスだけ。記事は`.md`。

## ディレクトリ構成

```
src/
├── components/      # Astro コンポーネント
├── config/site.ts   # サイト設定
├── content.config.ts
├── layouts/         # Layout / ArchiveLayout
├── lib/             # 年月アーカイブ・タグ・OG画像・sitemapのlastmodヘルパー
├── pages/           # ルーティング
├── posts/           # 記事 Markdown（フラットに配置）
└── styles/global.css
```

## ルーティング

| パス | 内容 |
| --- | --- |
| `[...page].astro` | トップ（全記事一覧）＋ページネーション |
| `posts/[slug].astro` | 記事詳細 |
| `archive/index.astro` | 年月アーカイブの目次 |
| `archive/[year]/[month]/[...page].astro` | 年月別一覧＋ページネーション |
| `tags/index.astro` | タグ一覧 |
| `tags/[tag]/[...page].astro` | タグ別一覧＋ページネーション |
| `about.astro` | About |
| `robots.txt.ts` | robots.txt |
| `404.astro` | 404 |

記事ファイル名（拡張子なし）がそのまま URL の slug。ページネーション件数は `siteConfig.pagination.postsPerPage`（デフォルト 6）。記事詳細では日付降順にソートした上で `prev` / `next` を index で受け渡す。

## 年月アーカイブ

`src/lib/archive.ts` の `getArchiveSummaries()` が記事一覧から `{ year, month, count }` の配列を新しい順で返し、`getPostsByArchive(year, month)` で対象月の記事を抽出する。`archive/index.astro` ではこれをリスト表示し、各行から `/archive/{year}/{month}/` にリンク。

## サイトマップと更新日

`@astrojs/sitemap`でビルド時にサイトマップを生成する。`astro.config.mjs`の`site`はsitemap/robots.txtの基準になるので、公開前にデプロイ先ドメインへ書き換える。

記事フロントマターには任意で`updated`を書ける。

```yaml
---
title: 記事タイトル
date: '2026-05-10'
updated: '2026-05-25'
---
```

`updated`があればそれを、なければ`date`をsitemapの`lastmod`に反映する。記事画面の表示や年月アーカイブの並び順には現状使っていない。

## OGP

`Layout.astro` に Open Graph / Twitter Card のメタタグを組み込み済み。OG 画像は [loos.tools/ogimg-maker](https://loos.tools/ogimg-maker/guide/) の API を `src/lib/ogImage.ts` から呼び出して生成する。デフォルトのスタイルは `siteConfig.ogImage` で変えられる。

## レイアウト

- `Layout.astro` — OGP メタタグ・Web フォント（Noto Serif JP）を `<head>` で読み込み、`<Container>` の中に `<Stack min-h="100svh">` で Header / Main / Footer を縦積み。
- `ArchiveLayout.astro` — `Layout` を基盤に、本文を `<Group isWrapper isContainer hasGutter><Stack g="50">` で囲んだ一覧用レイアウト。
- 記事詳細（`posts/[slug].astro`）は `<Group as="article" isWrapper isContainer hasGutter>` の中に「記事ヘッダー（Date・Heading・タグ）」「本文（`Flow.c--articleBody`）」「フッター（`ShareButtons` + `ArticleNav`）」を並べる。

## カスタマイズの入口

- `src/config/site.ts` — サイト名・キャッチコピー・ナビ（`Home` / `Archive` / `Tags` / `About`）・OG画像デフォルト（`{ type: '1-5', frame: true, bg: 'fill' }`）・SNS・コピーライト等
- `src/styles/global.css` — 紙面のような淡いクリーム色と明朝体（Noto Serif JP）を基調にしたトーン。Lism CSS のトークン上書きは `@layer lism-base`
- 記事本文のタイポグラフィ（h2 の下線、`blockquote` の左ボーダー等）は `.c--articleBody` 配下の子孫セレクタとして `@layer lism-custom` に書く（Markdown から生成される要素にはクラスを直接付けられないため）
