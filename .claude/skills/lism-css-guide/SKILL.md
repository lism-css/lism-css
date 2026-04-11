---
name: lism-css-guide
description: "Lism CSS の実装ガイド。HTML・CSS・SCSSの編集、UIやページレイアウトの実装・コーディング、JSX・React・Astroでコンポーネントを実装・編集する時に参照。ユーティリティクラス・デザイントークン・レイアウトモジュール・命名規則・CSSのLayer規則・レスポンシブ対応・ベーススタイリングのルール・CSS設計を提供する。"
---

# Lism CSS Best Practices

このスキルは、「Lism CSS」によるCSS設計理論の全体像と、実装時のベストプラクティスに関するガイドを提供します。

調和と統一感を生み出すデザイントークン設計、`@layer`で管理されるモジュール設計、CSS変数を活かした柔軟でレスポンシブなユーティリティ設計が特徴です。

> **バージョン情報:** このガイドは `lism-css@0.12.0` / `@lism-css/ui@0.12.0` 時点の情報に基づいています。プロジェクトで使用中のバージョンを確認し、このガイドのバージョンと異なる場合はユーザーに通知してください。

公式ドキュメント: https://lism-css.com/docs/overview/


## インストール

### CDNでCSSファイルのみ読み込む場合

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css@0.12.0/dist/css/main.css" rel="stylesheet" />
```

### npm パッケージ

- `lism-css` — コアパッケージ。Lism CSS本体となるCSSファイル、レイアウトモジュール、デザイントークン、Property Class、React/Astroコンポーネントを提供。
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

- `l--`,`a--`,`is--`, `c--`などのModule Classを用いることができるか？（React, Astroの場合は `Lism`, `Stack`, `Flex`, `Columns` 等のコンポーネントを利用して構築できるか？）
- Lism の用意している `set--`系クラス、`u--`系クラスは使えないか？
- Property Class (`-{prop}:{value}` or `<Lism prop="value">`))を使ってスタイリングできるか？
- 値をレスポンシブに切り替える時は Lism の Property Class (`-{prop}_{bp}` or `<Lism prop={[...]}>`)を使って実装できるか？
- カラー・余白・フォントサイズ・タイポグラフィ・行間（ハーフレディング）・サイズ・角丸・シャドウなどはトークン値を流用できないか？
- その他、Lismが用意するCSS変数を活用できないか？

### ネイティブCSS で書くもの（必要に応じて適切な `@layer` 内で書くこと）

- Lismにないアニメーションやhoverエフェクト（適宜クラスを追加して使用する）
- 独自コンポーネントの実装に合わせた`c--`クラス(`@layer lism-modules`内で定義する)
- 複雑なセレクタ（`:nth-child`, `::before`, `::after` 等）を使用する必要があるスタイル
- カスタムプロパティを使った独自の計算式が必要なスタイル
- その他、Lism のトークンやモジュールでカバーできない特殊なスタイル

### コンポーネント化のルール

- 同じスタイルの組み合わせが3箇所以上で使われる場合は、コンポーネントとして切り出すことを検討する。
- コンポーネントはできる限り `<Lism>`系コアモジュールやレイアウトモジュール（`Stack`, `Flex`, `Columns` 等）をベースに構築すること。
- カスタムクラスが必要な場合は `.c--{name}` の命名規則に従う。

### 間違いやすい例

| NG | OK | 理由 |
|----|-----|------|
| `<Heading level={3}>` | `<Heading level="3">` | `level` は文字列型（`'1'`〜`'6'`） |
| `hov="shadow"` | `hov="bxsh"` | Lism の省略名は `bxsh`（box-shadow） |
| `bgc="secondary"` | `bgc="base-2"` | カラートークンの間違い |
| `p="8"`, `g="6"` | `p="20"`, `g="10"` | スペーストークンの間違い |

#### NG: レスポンシブの考慮漏れ・Gridの直書き

渡されたPCサイズのデザインだけをみて、カラムレイアウトを`<Grid gtc="repeat(3, 1fr)>`のように固定してしまわないようにすること。
特に指示がなければ、レスポンシブを意識して実装する。`<Columns>`（`l--columns`）を使ってブレイクポイントで切り替えるか、`l--sideMain`や`l--fluidCols`で自動レスポンシブを採用することを検討する。

また、Lism CSSではコンテナクエリを採用しているため、レスポンシブの値切り替えには先祖要素で `isContainer`(`is--container`クラス) が必要なことに注意。

#### NG: コンテンツ幅のハードコーディング

ページ全体のデザインデータを渡された時、サイト幅やセクションエリアのサイズをpxでハードコーディングする前に、`--sz--`トークンを活用できないかをまずは考えてください。
`<Lism as="section" max-sz="m"`>(`-max-sz:m`クラス) などの指定でコンテンツ幅を管理することができます。


## 詳細リファレンス

このスキルには以下の詳細ファイルが含まれます。必要に応じて参照してください。

- [tokens.md](./tokens.md) — Lismで利用できるデザイントークンとCSS変数。（余白・フォントサイズ・タイポグラフィ・角丸・影・カラー・不透明度）
- [css-rules.md](./css-rules.md) — CSS設計の概要。（Layer構造・クラスの分類・命名規則・プレフィックスのつけ方・カスタムCSSの追加ルール）
- [base-styles.md](./base-styles.md) — HTML要素のベーススタイリング。（Reset CSSやHTML要素の基本スタイルをカスタマイズできるCSS変数）
- [set-class.md](./set-class.md) — ベーススタイル・変数セットに使用する`set--` クラスの一覧と用途。
- [module-class.md](./module-class.md) — レイアウトやコンポーネントに使用するモジュールクラス（`is--`/`l--`/`a--`/`c--` クラス）の一覧と用途。
- [utility-class.md](./utility-class.md) — 具体的な用途・装飾・機能を持つユーティリティクラス（`u--` クラス）の一覧と用途。
- [property-class.md](./property-class.md) — 単一のCSSプロパティに対応するProperty Class（`-{prop}:{value}`形式のクラス）の一覧・記法。
- [prop-responsive.md](./prop-responsive.md) — レスポンシブ対応（ブレークポイント・コンテナクエリ）の書き方・仕様。
- [components-core.md](./components-core.md) — `lism-css`パッケージに含まれるコアコンポーネントの一覧と用途。（React, Astroで使える`<Lism>`・Lism Props・getLismProps ）
- [components-ui.md](./components-ui.md) — `@lism-css/ui`パッケージに含まれるUIコンポーネント（Accordion・Modal・Tabs・Button 等）の Props・構造とCLIコマンドによるインストール方法。

これら各ファイルの冒頭にはTOC（目次）があり、セクションごとの詳細URL・ソースURLがまとめて記載されています。


## このスキルファイル自身のアップデート方法

`skills add lism-css/lism-css` を再実行してください。
更新があるか確認したい場合は、[GitHub リポジトリ](https://github.com/lism-css/lism-css/tree/main/.claude/skills/lism-css-guide) を直接チェックしてください。
