---
title: 'blog-astro-minimal の構成'
excerpt: Lism CSS リポジトリに同梱されている最小構成の Astro ブログテンプレートの仕様まとめ。
date: '2026-04-10'
tags: [Astro, Lism CSS, テンプレート]
---

`templates/blog/astro/minimal/`は、Lism CSSと`@lism-css/ui`を使った最小構成のAstroブログテンプレート。記事一覧/記事詳細/タグ別一覧/About/sitemap/robots.txtだけ。年月アーカイブ・カテゴリ・TOC・検索などが必要なら別のテンプレートをベースにする。

## 依存

AstroとLism CSS/`@lism-css/ui`に加え、`@astrojs/sitemap`を入れている。`astro.config.mjs`はsitemap integrationと`@`→`/src`のエイリアスだけ。記事は`.md`。

## ディレクトリ構成

```
src/
├── components/      # Astro コンポーネント
├── config/site.ts   # サイト設定（ナビ・SNS等）
├── content.config.ts
├── layouts/         # Layout / ArchiveLayout
├── lib/             # タグ関連ヘルパー
├── pages/           # ルーティング
├── posts/           # 記事 Markdown（フラットに配置）
└── styles/global.css
```

## 記事の分類はタグのみ

フロントマターの `tags` で分類する。カテゴリのような階層は持たない。タグ別アーカイブは `/tags/{tag}/` に生成され、フッターには全タグを並べる `TagCloud` を置いている。

```yaml
---
title: 朝のルーティンについて
date: '2026-03-28'
tags: [習慣, ライフスタイル]
---
```

## ルーティング

| パス | 内容 |
| --- | --- |
| `[...page].astro` | トップ（全記事一覧）＋ページネーション |
| `posts/[slug].astro` | 記事詳細 |
| `tags/[tag]/[...page].astro` | タグ別一覧＋ページネーション |
| `about.astro` | About |
| `robots.txt.ts` | robots.txt |
| `404.astro` | 404 |

記事ファイル名（拡張子なし）がそのまま URL の slug。ページネーション件数は `siteConfig.pagination.postsPerPage`（デフォルト 6）。

## サイトマップ

`@astrojs/sitemap`でビルド時にサイトマップを生成する。`astro.config.mjs`の`site`はsitemap/robots.txtの基準になるので、公開前にデプロイ先ドメインへ書き換える。

## レイアウト

- `Layout.astro` — `<Container>` の中に `<Stack min-h="100svh">` で Header / Main / Footer を縦積み。
- `ArchiveLayout.astro` — `Layout` を基盤に、本文を `<Group isWrapper isContainer hasGutter><Stack g="50">` で囲んだ一覧用レイアウト。
- 記事詳細（`posts/[slug].astro`）は `<Group as="article" isWrapper isContainer hasGutter>` の中に「記事ヘッダー（Date・Heading・タグ）」「本文（`Flow.c--articleBody`）」「前後記事ナビ（`ArticleNav`）」を並べたシンプル構成。シェアボタンや TOC は持たない。

## カスタマイズの入口

- `src/config/site.ts` — サイト名・キャッチコピー・ナビ・SNS・コピーライト等
- `src/styles/global.css` — Lism CSS のトークン上書き。デフォルトでは `--base` と `--lts--xl` だけ有効化していて、他は候補をコメントで残してある
- 記事本文のタイポグラフィ（`blockquote` / `pre` / `table` など）は `.c--articleBody` 配下の子孫セレクタとして `@layer lism-custom` に書く（Markdown から生成される要素にはクラスを直接付けられないため）
