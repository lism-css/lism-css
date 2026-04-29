---
title: Lism CSS の概要
excerpt: Lism CSS は @layer によるレイヤ管理・デザイントークン・Property Class・レイアウトプリミティブ・React/Astro コンポーネントをひとつにまとめた軽量な CSS 設計フレームワーク。主要な構成要素を整理する。
date: 2026.04.20
tags: [Lism CSS]
---

Lism CSS は、ユーティリティクラスとコンポーネント、デザイントークン、`@layer` によるカスケード制御をひとつにまとめた CSS 設計フレームワーク。`lism-css` パッケージにコア CSS と React / Astro 向けのレイアウトコンポーネントが、`@lism-css/ui` パッケージに Accordion / Modal / Tabs / Button などの UI コンポーネントが含まれる。

この記事では、Lism CSS を構成する主要なレイヤを順に整理する。

## CSS Layers

Lism CSS のスタイルは複数の `@layer` に分かれて配置されており、レイヤの宣言順がそのまま優先度になる。`lism-base` → `lism-component` → `lism-utility` の順で重ねられているため、詳細度を気にせず Property Class で上書きできる。

カスタム CSS を追加する際も、用途に合わせていずれかのレイヤに乗せる。

```css
@layer lism-base {
  :root {
    --base: #fbfaf7;
    --text: #1a1a1a;
    --brand: #c8553d;
  }
}

@layer lism-component {
  .c--postList > li {
    border-block-end: 1px solid var(--divider);
  }
}
```

## デザイントークン

色・余白・フォントサイズ・行間・字間・角丸・影など、ほぼすべての意匠は CSS 変数として公開されている。スペーストークンは `--s5`〜`--s80`（フィボナッチ数列ベース）、フォントサイズは `--fz--2xs`〜`--fz--5xl`（調和数列ベース）、角丸は `--bdrs--10` 系、カラーは `--base` / `--base-2` / `--text` / `--text-2` / `--divider` / `--link` / `--brand` / `--accent` といったセマンティック名で公開されている。

サイトのトーン調整は、これらの変数を `:root` で上書きするだけで済む。

なお、`--keycolor` は通常のカラートークンと役割が異なり、「軸となる色」をボックス単位で指定するための変数として位置づけられている（`u--cbox` などのユーティリティと組み合わせて使う）。

## Property Class

単一の CSS プロパティに対応するクラスが `-{prop}:{value}` の形式で用意されている。値はトークンキーを指定する（`p="20"` は `--s20`、`fz="s"` は `--fz--s` を参照）。

```html
<div class="-p:20 -bgc:base-2 -bdrs:10 -fz:s">…</div>
```

ブレイクポイントごとの切り替えは `_{bp}` サフィックスを付ける。コンテナクエリベースのため、先祖要素に `is--container` が必要になる。

```html
<div class="-d:none -d:flex_md">…</div>
```

## レイアウトプリミティブ

`l--{name}` クラスとそれに対応する React / Astro コンポーネントがレイアウト用に用意されている。代表的なもの：

| コンポーネント | 用途 |
| --- | --- |
| `Stack` | 縦積み |
| `Flex` | 横並び（折り返し可） |
| `Cluster` | インラインの集まり |
| `Grid` | グリッド |
| `Columns` | レスポンシブなカラム |
| `WithSide` | サイドバー付きの2カラム |
| `Center` | 中央寄せ |
| `Frame` | アスペクト比固定の枠 |
| `Flow` | 直下要素に上マージンを流す |

```astro
---
import { Stack, Flex, Heading, Text } from 'lism-css/astro';
---

<Stack g="20">
  <Flex g="10" ai="center">
    <Heading level="2" fz="l">{title}</Heading>
    <Text fz="xs" c="text-2">{date}</Text>
  </Flex>
  <Text c="text-2">{excerpt}</Text>
</Stack>
```

## Trait クラス

「役割の宣言」を表す `is--{name}` プレフィックスのクラスが用意されている。

- `is--container` — コンテナクエリの基点
- `is--wrapper` — 最大幅と内側余白の制御
- `is--layer` — 子要素を `position: absolute` で重ねる土台
- `is--boxLink` — 子の `<a>` をブロック全体のリンクに拡張

ステート切替（active 等）やバリエーションには使わない。状態は `data-*` 属性、バリエーションは `c--{name}--{variant}` の BEM Modifier で表現する。

## コンポーネントクラス（c--）

プロジェクト固有のコンポーネントは `c--{name}` プレフィックスのクラスで定義する。Property Class で書ける宣言はマークアップに移し、CSS には擬似クラス・状態切替・子孫セレクタなど CSS でしか書けない宣言だけを残す。

```html
<span class="c--tag -fz:xs -px:10 -py:5 -bgc:base-2 -bdrs:10">React</span>
```

```css
@layer lism-component {
  .c--tag:hover {
    background-color: var(--divider);
  }
}
```

## インストール

CDN で CSS だけ読み込むことも、npm パッケージとして導入することもできる。

```bash
pnpm add lism-css @lism-css/ui
```

```js
import 'lism-css/main.css';
```

```jsx
// React
import { Stack, Flex, Grid } from 'lism-css/react';
import { Accordion, Modal, Tabs } from '@lism-css/ui/react';

// Astro
import { Stack, Flex, Grid } from 'lism-css/astro';
import { Accordion, Modal, Tabs } from '@lism-css/ui/astro';
```

詳細は [公式ドキュメント](https://lism-css.com/) を参照。
