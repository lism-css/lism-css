---
title: About
description: lism.blog について
---

## このサイトについて

lism.blog は、日々のこと・考えたこと・読んだものを書き留めるための小さな雑記帳です。
紙の手帳のような静かな読み心地を目指して、紙面に近い色味と明朝体を基調にしています。

## 使用している技術

このサイトは [Astro](https://astro.build/) と [lism CSS](https://lism-css.com/) を使って構築されています。
ブログテンプレートとしての参考実装も兼ねており、リポジトリの `examples/astro-blog/` 配下で全文を公開しています。

## このページについて

`/about/` のような固定ページは、Astro の Content Collections の `pages` コレクションとして
Markdown で管理されています。新しい固定ページを追加するには、`src/static-pages/` 配下に
Markdown ファイルを置くだけで `/{ファイル名}/` として公開されます。

> 「書くために書く」のではなく、「考えるために書く」場所でありたい。
