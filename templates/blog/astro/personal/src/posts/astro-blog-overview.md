---
title: 'blog-astro-personal の構成'
excerpt: Lism CSS リポジトリに同梱されている personal 向け Astro ブログテンプレートの仕様。エッセイ・日記向けに最適化した構成と、年月アーカイブ・タグの仕組みを順に解説する。
date: '2026-05-10'
tags: ['Astro', 'テンプレート']
---

Lism CSS リポジトリの `templates/blog/astro/personal/` には、Lism CSS と `@lism-css/ui` を使った個人ブログ（エッセイ・日記）向けの Astro テンプレートが入っている。文章中心の読み心地を重視した最小構成で、カテゴリのような階層的な分類軸は持たず、**年月アーカイブ** と **タグ** で過去記事をたどれるようにしている。

## 依存関係

`package.json` の依存は最小限。Astro と Lism CSS / `@lism-css/ui` だけを使う。

```json
{
  "dependencies": {
    "@lism-css/ui": "workspace:*",
    "astro": "^6.1.9",
    "lism-css": "workspace:*"
  }
}
```

`astro.config.mjs` では `@` を `/src` にエイリアスしているだけで、それ以外のインテグレーションは入れていない。記事は `.md` で書く前提。

## ディレクトリ構成

```
src/
├── components/      # Astro コンポーネント
├── config/          # サイト設定・ナビ
├── content.config.ts
├── layouts/         # ページレイアウト
├── lib/             # 純粋ロジック（OG 画像・年月アーカイブ集計）
├── pages/           # ルーティング
├── posts/           # 記事 Markdown（フラットに配置）
└── styles/
    └── global.css
```

## Content Collections

`src/content.config.ts` で記事用コレクションを定義している。タグやカテゴリは持たず、`title` / `excerpt` / `date` のみを必須とする。

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
  }),
});

export const collections = { posts };
```

記事ファイルは `src/posts/` 直下にフラットに置く。記事 ID はファイル名（拡張子なし）で、それがそのまま URL の slug として使われる。

## ルーティング

`src/pages/` 配下のファイル構成は次の通り。

| パス | 内容 |
| --- | --- |
| `[...page].astro` | トップ（全記事一覧）＋ページネーション |
| `posts/[slug].astro` | 記事詳細 |
| `archive/index.astro` | 年月アーカイブの目次（年月ごとの件数を一覧） |
| `archive/[year]/[month]/[...page].astro` | 年月別の記事一覧＋ページネーション |
| `404.astro` | 404 |

ページネーションには Astro の `paginate()` を使い、1ページあたりの件数は `siteConfig.pagination.postsPerPage`（デフォルト 6）を参照する。記事詳細では `getStaticPaths` 内で記事を日付降順にソートし、`prev` / `next` を index で受け渡している。

## 年月アーカイブ

`src/lib/archive.ts` に年月集計のヘルパーを置いている。`getArchiveSummaries()` は記事一覧から `{ year, month, count }` の配列を新しい順で返し、`getPostsByArchive(year, month)` で対象月の記事だけを抽出する。

```ts
import { getArchiveSummaries, getPostsByArchive } from '@/lib/archive';

const posts = await getCollection('posts');
const summaries = getArchiveSummaries(posts); // [{ year, month, count }, ...]
```

`archive/index.astro` ではこの集計結果をそのままリスト表示し、各行から `/archive/{year}/{month}/` にリンクしている。

## OGP

`Layout.astro` に Open Graph / Twitter Card のメタタグを組み込んでいる。OG 画像は [loos.tools/ogimg-maker](https://loos.tools/ogimg-maker/guide/) の API を `src/lib/ogImage.ts` から呼び出して生成する。デフォルトのスタイルは `siteConfig.ogImage` で調整可能。

```ts
const ogImage = buildOgImageUrl({
  title: post.data.title,
  foot: siteConfig.name,
});
```

## サイト設定

`src/config/site.ts` にサイト名・キャッチコピー・ページネーション件数・ナビ・OG 画像のデフォルト等をまとめている。テンプレートをカスタマイズする際の入口はここ。

```ts
export const siteConfig = {
  name: 'lism.blog',
  tagline: '読む、書く、考える、日々の記録',
  description: '読書、暮らし、考えごと。ゆっくり書き留めるパーソナルブログ。',
  lang: 'ja',
  pagination: { postsPerPage: 6 },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Archive', href: '/archive/' },
    { label: 'About', href: '/about/' },
  ],
  ogImage: { type: '1-5', frame: '1', bg: 'fill' },
  // ...
} as const;
```

## レイアウト

レイアウトは 2 つ。

- `Layout.astro` — `<html>` から `<body>` までの土台。OGP メタタグ・Web フォント（Noto Serif JP）の読み込み・`<Container>` の中に `<Stack min-h="100svh">` で Header / Main / Footer を縦積みする。
- `ArchiveLayout.astro` — `Layout` を基盤に、本文を `<Group isWrapper isContainer hasGutter>` で囲んだ一覧用レイアウト。

記事詳細ページでは本文の後に `ShareButtons` と `ArticleNav` を置き、X投稿・URLコピー・前後記事への移動を提供している。

## スタイル

`src/styles/global.css` で Lism CSS の CSS 変数を上書きし、紙面のような淡いクリーム色と明朝体（Noto Serif JP）を基調にしたトーンを作っている。

```css
@layer lism-base {
  :root {
    --base: hsl(45, 32%, 98%);
    --text: hsl(45, 8%, 10%);
    --brand: hsl(10, 56%, 50%);
    --ff--base: 'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
    --lts--base: 0.025em;
    --headings-fw: 500;
  }
}
```

記事本文のタイポグラフィ（h2 の下線、`blockquote` の左ボーダーなど）は `.c--articleBody` 配下の子孫セレクタとして `@layer lism-custom` に書いている。Markdown から生成される要素にはクラスを直接付けられないため、こうした装飾は CSS 側で記述する。
