---
title: 'blog-astro-minimal の構成'
excerpt: Lism CSS リポジトリに同梱されている最小構成の Astro ブログテンプレートの仕様。Content Collections・タグ・ルーティング・レイアウト・主要コンポーネントを順に解説する。
date: 2026.04.10
tags: [Astro, Lism CSS, テンプレート]
---

Lism CSS リポジトリの `templates/blog/astro/minimal/` には、Lism CSS と `@lism-css/ui` を使った最小構成の Astro ブログテンプレート（記事一覧 / 詳細 / Tags のみ）が入っている。この記事では、そのディレクトリ構成と動作仕様を整理する。

## 依存関係

`package.json` の依存は最小限で、Astro と Lism CSS / `@lism-css/ui` だけを使う。

```json
{
  "dependencies": {
    "@lism-css/ui": "workspace:*",
    "astro": "^6.1.9",
    "lism-css": "workspace:*"
  }
}
```

`astro.config.mjs` では `@` を `/src` にエイリアスしているだけで、それ以外のインテグレーションは入れていない。

## ディレクトリ構成

```
src/
├── components/      # Astro コンポーネント
├── config/          # サイト設定・ナビ
├── content.config.ts
├── layouts/         # ページレイアウト
├── lib/             # 純粋ロジック（タグ集計など）
├── pages/           # ルーティング
├── posts/           # 記事 Markdown（フラットに配置）
└── styles/
    └── global.css
```

## Content Collections

`src/content.config.ts` で記事用コレクションを定義している。

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };
```

記事ファイルは `src/posts/` 直下にフラットに置くだけ。記事 ID はファイル名（拡張子なし）になり、それがそのまま URL の slug として使われる。

## 記事の分類はタグのみ

記事の分類はフロントマターの `tags` だけで管理する。カテゴリのような階層は持たず、必要なら複数タグを付けることで柔軟に分類できる。

```yaml
---
title: 朝のルーティンについて
date: 2026.03.28
tags: [習慣, ライフスタイル]
---
```

タグ別アーカイブは `/tag/{tag}/` に生成され、フッターには全タグを一覧表示する `TagCloud` を配置している。

## サイト設定

`src/config/site.ts` にサイト名・キャッチコピー・ページネーション件数・コピーライト等をまとめている。テンプレートをカスタマイズする際の入口はここ。

```ts
export const siteConfig = {
  name: 'lism.blog',
  tagline: 'ブログのキャッチコピー',
  description: 'ブログの説明文をここに入力してください。',
  lang: 'ja',
  pagination: { postsPerPage: 6 },
  nav: [
    { label: 'Home', href: '/' },
  ],
  sns: [
    { label: 'GitHub', icon: 'logo-github', href: 'https://github.com/lism-css/lism-css' },
    { label: 'X', icon: 'logo-x', href: 'https://x.com/lismcss' },
  ],
  footer: {
    copyright: '© 2026 Lism CSS',
    nav: [
      { label: 'Home', href: '/' },
    ],
  },
} as const;
```

ヘッダーとモバイルメニューで共有するナビ項目は `siteConfig.nav` に、SNS リンクは `siteConfig.sns` にまとめている。About / Privacy などの固定ページが必要になったら、`src/pages/` 配下に `.astro` ファイルを追加し、`siteConfig.nav` / `siteConfig.footer.nav` に項目を足す。

## ルーティング

`src/pages/` 配下のファイル構成は次の通り。

| パス | 内容 |
| --- | --- |
| `[...page].astro` | トップ（全記事一覧）＋ページネーション |
| `posts/[slug].astro` | 記事詳細 |
| `tag/[tag]/[...page].astro` | タグ別一覧＋ページネーション |
| `404.astro` | 404 |

ページネーションには Astro の `paginate()` を使い、1ページあたりの件数は `siteConfig.pagination.postsPerPage`（デフォルト 6）を参照する。

## レイアウト

レイアウトは 2 つ。

- `Layout.astro` — `<html>` から `<body>` までの土台。`<Container>` の中に `<Stack min-h="100svh">` で Header / Main / Footer を縦積みする。
- `ArchiveLayout.astro` — `Layout` を基盤に、本文を `<Group isWrapper isContainer hasGutter>` で囲んだ一覧用レイアウト。

```astro
<Layout title={title}>
  <Group isWrapper isContainer hasGutter>
    <slot />
  </Group>
</Layout>
```

### 記事詳細のレイアウト構造

記事詳細ページ（`posts/[slug].astro`）は、`Group isWrapper isContainer hasGutter` の中に「記事ヘッダー（Date・Heading・タグ一覧）」と「本文（`Flow`）」を縦に並べるだけのシンプルな構造になっている。シェアボタンや前後記事ナビ、TOC などは含めていない。必要に応じて自分で追加していくのがおすすめ。

```astro
<Layout ...>
  <Group isWrapper isContainer hasGutter>
    {/* 記事ヘッダー（Date・Heading・タグ一覧） */}
    <Group as="header">...</Group>

    {/* 本文 */}
    <Flow as="article" class="c--articleBody" mbs="50">
      <Content />
    </Flow>
  </Group>
</Layout>
```

## スタイルの上書き

`src/styles/global.css` で Lism CSS の CSS 変数を上書きしてサイトのトーンを作っている。

```css
@layer lism-base {
  :root {
    --base: #fbfaf7;
    --base-2: #f3f2ee;
    --text: #1a1a1a;
    --text-2: #4c4c4c;
    --divider: #e8e6e1;
    --brand: #c8553d;
    --link: #c8553d;
    --ff--base: 'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
    --ff--accent: -apple-system, 'BlinkMacSystemFont', 'Hiragino Sans', sans-serif, 'Segoe UI Emoji';
    --lts--s: 0.01em;
    --lts--base: 0.025em;
    --lts--l: 0.075em;
    --lts--xl: 0.15em;
    --headings-fw: 500;
  }
}
```

記事本文のタイポグラフィ（h2 の下線、`blockquote` の左ボーダーなど）は `.c--articleBody` 配下の子孫セレクタとして `@layer lism-base` に書いている。Markdown から生成される要素にはクラスを直接付けられないため、こういった部分は CSS で書いていきます。
