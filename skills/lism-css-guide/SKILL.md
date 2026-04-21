---
name: lism-css-guide
description: "Lism CSS の設計・実装に関するガイド。CSSの編集・追加、UIコンポーネントやレイアウトの実装・編集時に参照。c--*, l--*, a--*, is--*, has--*, set--*, u--* -prop:value 形式のクラス・トークン(CSS変数)・命名規則・Layer規則・レスポンシブ対応について調べる時にも参照。"
---

# Lism CSS Best Practices

このスキルは、「Lism CSS」によるCSS設計理論の全体像と、実装時のベストプラクティスに関するガイドを提供します。

調和と統一感を生み出すデザイントークン設計、`@layer`で管理されるプリミティブ設計、CSS変数を活かした柔軟でレスポンシブなユーティリティ設計が特徴です。

> **バージョン情報:** このガイドは `lism-css@0.16.0` / `@lism-css/ui@0.16.0` 時点の情報に基づいています。プロジェクトで使用中のバージョンを確認し、このガイドのバージョンと異なる場合はユーザーに通知してください。

公式ドキュメント: https://lism-css.com/docs/overview/


## インストール

### CDNでCSSファイルのみ読み込む場合

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css@0.16.0/dist/css/main.css" rel="stylesheet" />
```

### npm パッケージ

- `lism-css` — コアパッケージ。Lism CSS本体となるCSSファイル、レイアウトプリミティブ、デザイントークン、Property Class、React/Astroコンポーネントを提供。
- `@lism-css/ui` — `lism-css` を使って構築された UI コンポーネントライブラリ。Accordion, Modal, Tabs, Button, Badge, Callout 等を React/Astro で提供。

### CSS 読み込み

```js
import 'lism-css/main.css';
```

### コンポーネント読み込み例

```jsx
// React
import { Flex, Stack, Grid, Columns } from 'lism-css/react';
import { Accordion, Tabs, Button } from '@lism-css/ui/react';

// Astro
import { Flex, Stack, Grid, Columns } from 'lism-css/astro';
import { Accordion, Tabs, Button } from '@lism-css/ui/astro';
```


## 実装ルール

### 基本方針: できる限りLism CSSの用意しているクラス・CSS変数・コンポーネントを使って書く

まずは以下のチェックリストを確認しながら、Lism CSS でできることが何かを考えてから実装方針を立ててください。

- `l--`,`a--`,`is--` などの Primitive Class や `c--` などの Component Class を用いることができるか？（React, Astroの場合は `Lism`, `Stack`, `Flex`, `Columns` 等のコンポーネントを利用して構築できるか？）
- Lism の用意している `set--`系クラス、`u--`系クラスは使えないか？
- Property Class (`-{prop}:{value}` or `<Lism prop="value">`))を使ってスタイリングできるか？
- 値をレスポンシブに切り替える時は Lism の Property Class (`-{prop}_{bp}` or `<Lism prop={[...]}>`)を使って実装できるか？
- カラー・余白・フォントサイズ・タイポグラフィ・行間（ハーフレディング）・サイズ・角丸・シャドウなどはトークン値を流用できないか？
- その他、Lismが用意するCSS変数を活用できないか？

### ネイティブCSS で書くもの（必要に応じて適切な `@layer` 内で書くこと）

- Lismにないアニメーションやhoverエフェクト（適宜クラスを追加して使用する）
- 独自コンポーネントの実装に合わせた`c--`クラス(`@layer lism-component`内で定義する)
- 複雑なセレクタ（`:nth-child`, `::before`, `::after` 等）を使用する必要があるスタイル
- カスタムプロパティを使った独自の計算式が必要なスタイル
- その他、Lism のトークンやプリミティブでカバーできない特殊なスタイル

### コンポーネント化のルール

- 同じスタイルの組み合わせが3箇所以上で使われる場合は、コンポーネントとして切り出すことを検討する。
- コンポーネントはできる限り `<Lism>`系コアコンポーネントやレイアウトプリミティブ（`Stack`, `Flex`, `Columns` 等）をベースに構築すること。
- カスタムクラスが必要な場合は `.c--{name}` の命名規則に従う。

### 間違いやすい例

| NG | OK | 理由 |
|----|-----|------|
| `<Heading level={3}>` | `<Heading level="3">` | `level` は文字列型（`'1'`〜`'6'`） |
| `hov="shadow"` | `hov="-bxsh"` | Lism の省略名は `bxsh`（box-shadow） |
| `bgc="secondary"` | `bgc="base-2"` | カラートークンの間違い |
| `p="8"`, `g="6"` | `p="20"`, `g="10"` | スペーストークンの間違い |

#### NG: レスポンシブの考慮漏れ・Gridの直書き

渡されたPCサイズのデザインだけをみて、カラムレイアウトを`<Grid gtc="repeat(3, 1fr)>`のように固定してしまわないようにすること。
特に指示がなければ、レスポンシブを意識して実装する。`<Columns>`（`l--columns`）を使ってブレイクポイントで切り替えるか、`l--withSide`や`l--autoColumns`で自動レスポンシブを採用することを検討する。

また、Lism CSSではコンテナクエリを採用しているため、レスポンシブの値切り替えには先祖要素で `isContainer`(`is--container`クラス) が必要なことに注意。

#### NG: コンテンツ幅のハードコーディング

ページ全体のデザインデータを渡された時、サイト幅やセクションエリアのサイズをpxでハードコーディングする前に、`--sz--`トークンを活用できないかをまずは考えてください。
`<Lism as="section" max-sz="m"`>(`-max-sz:m`クラス) などの指定でコンテンツ幅を管理することができます。


## 詳細リファレンス

このスキルには以下の詳細ファイルが含まれます。必要に応じて参照してください。

- [tokens.md](./tokens.md) — Lismで利用できるデザイントークンとCSS変数。（余白・フォントサイズ・タイポグラフィ・角丸・影・カラー・不透明度）
- [css-rules.md](./css-rules.md) — CSS設計の概要。（Layer構造・クラスの分類・プレフィックスのつけ方・Component クラス（`c--`）・カスタムCSSの追加ルール）
- [naming.md](./naming.md) — 命名規則の詳細。（CSS変数名・クラス名・Property Class の `{prop}` / `{value}` の省略ルール）
- [base-styles.md](./base-styles.md) — HTML要素のベーススタイリング。（Reset CSSやHTML要素の基本スタイルをカスタマイズできるCSS変数）
- [set-class.md](./set-class.md) — ベーススタイル・変数セットに使用する`set--` クラスの一覧と用途。
- [primitive-class.md](./primitive-class.md) — レイアウトを組み立てる Primitive クラス（`l--`/`a--`）の一覧と用途。
- [trait-class.md](./trait-class.md) — 要素に役割・機能を宣言する Trait クラス（`is--`/`has--`）の一覧と用途。
- [utility-class.md](./utility-class.md) — 具体的な用途・装飾・機能を持つユーティリティクラス（`u--` クラス）の一覧と用途。
- [property-class.md](./property-class.md) — 単一のCSSプロパティに対応するProperty Class（`-{prop}:{value}`形式のクラス）の一覧・記法。
- [prop-responsive.md](./prop-responsive.md) — レスポンシブ対応（ブレークポイント・コンテナクエリ）の書き方・仕様。
- [components-core.md](./components-core.md) — `lism-css`パッケージに含まれるコアコンポーネントの一覧と用途。（React, Astroで使える`<Lism>`・Lism Props・getLismProps ）
- [components-ui.md](./components-ui.md) — `@lism-css/ui`パッケージに含まれるUIコンポーネント（Accordion・Modal・Tabs・Button 等）の Props・構造とCLIコマンドによるインストール方法。
- [customize.md](./customize.md) — SCSS変数の上書きによる、lism-cssのコアCSSの挙動カスタマイズ方法・`lism.config.js` によるコアコンポーネント挙動のカスタマイズ方法。

これら各ファイルの冒頭にはTOC（目次）があり、セクションごとの詳細URL・ソースURLがまとめて記載されています。

### クラス単位の詳細リファレンス


**Layout Primitives**

- `l--box` / `<Box>`: [primitives/l--box.md](./primitives/l--box.md)
- `l--flex` / `<Flex>`: [primitives/l--flex.md](./primitives/l--flex.md)
- `l--stack` / `<Stack>`: [primitives/l--stack.md](./primitives/l--stack.md)
- `l--cluster` / `<Cluster>`: [primitives/l--cluster.md](./primitives/l--cluster.md)
- `l--grid` / `<Grid>`: [primitives/l--grid.md](./primitives/l--grid.md)
- `l--flow` / `<Flow>`: [primitives/l--flow.md](./primitives/l--flow.md)
- `l--center` / `<Center>`: [primitives/l--center.md](./primitives/l--center.md)
- `l--frame` / `<Frame>`: [primitives/l--frame.md](./primitives/l--frame.md)
- `l--columns` / `<Columns>`: [primitives/l--columns.md](./primitives/l--columns.md)
- `l--tileGrid` / `<TileGrid>`: [primitives/l--tileGrid.md](./primitives/l--tileGrid.md)
- `l--autoColumns` / `<AutoColumns>`: [primitives/l--autoColumns.md](./primitives/l--autoColumns.md)
- `l--switchColumns` / `<SwitchColumns>`: [primitives/l--switchColumns.md](./primitives/l--switchColumns.md)
- `l--withSide` / `<WithSide>`: [primitives/l--withSide.md](./primitives/l--withSide.md)

**Trait Class (is--)**

- `is--container` / `<Container>`: [trait-class/is--container.md](./trait-class/is--container.md)
- `is--wrapper` / `<Wrapper>`: [trait-class/is--wrapper.md](./trait-class/is--wrapper.md)
- `is--layer` / `<Layer>`: [trait-class/is--layer.md](./trait-class/is--layer.md)
- `is--boxLink` / `<BoxLink>`: [trait-class/is--boxLink.md](./trait-class/is--boxLink.md)

**Trait Class (has--)**

- `has--transition` (`hasTransition` prop): [trait-class/has--transition.md](./trait-class/has--transition.md)
- `has--gutter` (`hasGutter` prop): [trait-class/has--gutter.md](./trait-class/has--gutter.md)
- `has--snap` (`hasSnap` prop): [trait-class/has--snap.md](./trait-class/has--snap.md)
- `has--mask` (`hasMask` prop): [trait-class/has--mask.md](./trait-class/has--mask.md)

**Atomic Primitives**

- `a--icon` / `<Icon>`: [primitives/a--icon.md](./primitives/a--icon.md)
- `a--divider` / `<Divider>`: [primitives/a--divider.md](./primitives/a--divider.md)
- `a--spacer` / `<Spacer>`: [primitives/a--spacer.md](./primitives/a--spacer.md)
- `a--decorator` / `<Decorator>`: [primitives/a--decorator.md](./primitives/a--decorator.md)

**Property Class（特殊仕様）**

- `-bd` / `-bd-{side}` 系: [property-class/bd.md](./property-class/bd.md)
- `-hov:*` 系: [property-class/hov.md](./property-class/hov.md)
- `-max-sz:full` / `-max-sz:container`: [property-class/max-sz.md](./property-class/max-sz.md)


## このスキルファイル自身のアップデート方法

`skills add lism-css/lism-css` を再実行してください。
更新があるか確認したい場合は、[GitHub リポジトリ](https://github.com/lism-css/lism-css/tree/main/skills/lism-css-guide) を直接チェックしてください。
