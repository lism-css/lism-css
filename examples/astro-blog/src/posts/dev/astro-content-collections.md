---
title: Astro Content Collections でブログを構築する
excerpt: フロントマターの型を Zod で守りながら、glob でディレクトリを束ねる。Astro Content Collections をブログの背骨に据えた話。
date: 2026.04.10
tags: [astro, content-collections, typescript]
readtime: 7 min
---

## なぜ Content Collections なのか

Markdown ファイルをただ読み込むだけなら、`import.meta.glob` でも十分にできる。それでもあえて Content Collections を選ぶ理由は、ひとつだけ。**フロントマターの型を、書き手が裏切れないようにする**ためだ。

`tags` を書き忘れた、`date` を `2026/04/10` と書いてしまった、そういう小さな揺れがビルド前に止まる。これは長く続けるブログには本当にありがたい。

## 最小構成のスキーマ

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    base: './src/posts',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    readtime: z.string(),
  }),
});

export const collections = { posts };
```

`pattern: '**/*.md'` にしておけば、`src/posts/dev/foo.md` のようにディレクトリでカテゴリを切れる。記事 ID は `dev/foo` のような形になる。

### ディレクトリ＝カテゴリという設計

カテゴリをフロントマターに書かず、置き場所そのもので決める。これが地味に効く。記事を書いている最中に「あれ、このカテゴリ何だっけ」と確認しに行く必要がなくなるし、ファイルを開いた瞬間にカテゴリが分かる。

```
src/posts/
  dev/
    astro-content-collections.md
    css-layer-management.md
  life/
    coffee-and-thinking.md
    kyoto-cafe.md
```

## ルーティング

URL もディレクトリ構造に揃えておくと、後から見返したときに迷わない。

```ts
// src/pages/[category]/[slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => {
    const [category, ...rest] = post.id.split('/');
    return {
      params: { category, slug: rest.join('/') },
      props: { post },
    };
  });
}
```

`post.id` から `category` と `slug` を取り出すヘルパーを `lib/categories.ts` に切り出しておくと、一覧ページ・タグページなど他の場所でも使いまわせる。

## タグページもついでに

タグはフロントマターの配列なので、全記事をなめて重複排除すれば一覧が作れる。

```ts
// src/pages/tag/[tag].astro
export async function getStaticPaths() {
  const posts = await getCollection('posts');
  const tags = new Set(posts.flatMap((p) => p.data.tags));
  return Array.from(tags).map((tag) => ({
    params: { tag },
    props: {
      posts: posts.filter((p) => p.data.tags.includes(tag)),
    },
  }));
}
```

> ファイルの置き場所が型になり、フロントマターが契約になる。

## おわりに

Content Collections は、書き手のミスを設計で吸収してくれる仕組みでもある。スキーマを一度書いてしまえば、あとはひたすら本文に集中できる。

ブログを長く続けるための、ささやかな保険として、これからも背骨に据えていきたい。
