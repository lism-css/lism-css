---
name: lism-css-guide
description: "Lism CSS の実装ガイド。HTML・CSS・SCSSの編集、UIやページレイアウトの実装・コーディング、JSX・React・Astroでコンポーネントを実装・編集する時に参照。ユーティリティクラス・デザイントークン・レイアウトモジュール・命名規則・CSSのLayer規則・レスポンシブ対応・ベーススタイリングのルール・CSS設計を提供する。"
---

# Lism CSS Best Practices

このプロジェクトは CSS フレームワーク「Lism CSS」を使用しています。

Lism CSS は、WEBサイトの骨組みをテンポ良くサクっと作るための軽量なCSS設計フレームワークです。デザインに自然と心地よいリズムを生み出すトークン設計、レイアウトファーストなモジュール設計、CSS変数を活かした柔軟でレスポンシブなユーティリティ設計が特徴です。ビルドや設定は不要で、CSSを読み込むだけでも使えます。Every Layout のレイアウトプリミティブとハーモニックモジュラースケーリング、Tailwind CSS のユーティリティファーストアプローチ、ITCSS のレイヤー設計を融合した独自のCSS設計体系です。

MCP サーバー (`@lism-css/mcp`) が利用可能な場合は、コンポーネントやPropsの詳細情報をそちらから取得してください。

> **バージョン情報:** このガイドは `lism-css@0.11.0` 時点の情報に基づいています。プロジェクトで使用中の `lism-css` バージョンを確認し、このガイドのバージョンと異なる場合はユーザーに通知してください。

公式ドキュメント: https://lism-css.com/docs/overview/


## パッケージ構成

| npm パッケージ名 | 用途 |
|-----------|------|
| `lism-css` | コアCSSフレームワーク。レイアウトモジュール、デザイントークン、Property Class、React/Astroコンポーネントを提供 |
| `@lism-css/ui` | `lism-css` の上に構築されたインタラクティブな UI コンポーネントライブラリ。Accordion, Modal, Tabs 等を React/Astro で提供 |


## インストール

### CDN（CSSのみ）

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css@0/dist/css/main.css" rel="stylesheet" />
```

### npm パッケージ

```bash
npm i lism-css
# UI コンポーネントも使う場合
npm i @lism-css/ui
```

### CSS 読み込み

```js
import 'lism-css/main.css';
// UI コンポーネントのCSS
import '@lism-css/ui/style.css';
```

### コンポーネント読み込み

```jsx
// React
import { Box, Flex, Stack, Grid, Text, Media } from 'lism-css/react';
import { Accordion, Tabs, Modal, Button } from '@lism-css/ui/react';

// Astro
import { Box, Flex, Stack, Grid, Text, Media } from 'lism-css/astro';
import { Accordion, Tabs, Modal, Button } from '@lism-css/ui/astro';
```


## 実装ルール

### Props / クラスで書くもの（Lism に任せる）
- レイアウト構造（`Stack`, `Flex`, `Grid`, `Columns` 等のレイアウトモジュール）
- 余白・サイズ・フォントサイズなどのトークン値
- レスポンシブ切り替え
- 色・ボーダー・シャドウなどの装飾

### ネイティブ CSS で書くもの（適切な @layer 内で）
- アニメーション・トランジション
- 複雑なセレクタ（`:nth-child`, `::before`, `::after` 等）
- カスタムプロパティを使った独自の計算
- Lism のトークンやモジュールでカバーできない特殊なスタイル

### コンポーネント化のルール
- 同じスタイルの組み合わせが3箇所以上で使われる場合は、コンポーネントとして切り出す
- コンポーネントは Lism のレイアウトモジュールをベースに構築する
- カスタムクラスが必要な場合は `.c--{name}` の命名規則に従う

```jsx
// NG: 同じ構造をコピーペースト
<Box bgc="base-2" bdrs="20" p="30">...</Box>
<Box bgc="base-2" bdrs="20" p="30">...</Box>

// OK: コンポーネント化
function Card({ children }) {
  return <Box bgc="base-2" bdrs="20" p="30">{children}</Box>;
}
```


## 詳細リファレンス

このスキルには以下の詳細ファイルが含まれます。必要に応じて参照してください。

| ファイル | 内容 | 公式ドキュメント |
|---------|------|----------------|
| [tokens.md](./tokens.md) | デザイントークン・CSS変数 — 余白・フォントサイズ・角丸・影・カラー・パレット | [tokens](https://lism-css.com/docs/tokens/) |
| [base-styles.md](./base-styles.md) | ベーススタイリング — Reset CSS・HTML要素のベーススタイル・CSS変数（トークン） | [base-styles](https://lism-css.com/docs/base-styles/) |
| [set-class.md](./set-class.md) | `set--` クラス — `set--plain`/`set--shadow`/`set--hov`/`set--transition` 等のセットアップクラス | [set](https://lism-css.com/docs/set/) |
| [module-class.md](./module-class.md) | モジュールクラス — `is--`/`l--`/`a--`/`c--` クラスの一覧と用途 | [state](https://lism-css.com/docs/state/), [module-class](https://lism-css.com/docs/module-class/) |
| [utility-class.md](./utility-class.md) | ユーティリティクラス — `u--` クラスの一覧・SCSS ソースリンク・Property Class との違い | [utility-class](https://lism-css.com/docs/utility-class/) |
| [property-class.md](./property-class.md) | Property Class — `-{prop}:{value}` 記法・主要Prop一覧・特殊Prop（ボーダー・ホバー）・出力タイプ | [property-class](https://lism-css.com/docs/property-class/) |
| [prop-responsive.md](./prop-responsive.md) | レスポンシブ対応 — ブレークポイント・コンテナクエリ・HTML/コンポーネントでの指定方法 | [responsive](https://lism-css.com/docs/responsive/) |
| [lism-components.md](./lism-components.md) | コンポーネントシステム — コア・セマンティック・レイアウト・ステート・アトミック一覧、Lism Props、getLismProps | [components](https://lism-css.com/docs/components/) |
| [ui-components.md](./ui-components.md) | UIコンポーネント（`@lism-css/ui`）— Accordion・Modal・Tabs・Button 等の Props・構造・CLI | [components](https://lism-css.com/docs/components/) |
| [css-rules.md](./css-rules.md) | CSS設計ルール — Layer構造・命名規則・プレフィックス・カスタムCSS追加ルール | [css-methodology](https://lism-css.com/docs/css-methodology/) |

各ファイルの冒頭にはTOC（目次）があり、セクションごとの詳細URL・ソースURLがまとめて記載されています。
