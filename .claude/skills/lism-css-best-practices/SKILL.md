---
name: lism-css-best-practices
description: "Lism CSS フレームワークのベストプラクティスガイド。HTML・CSS・SCSSの編集、UIやページレイアウトの実装・コーディング、JSX・React・Astroでコンポーネントを実装・編集する時に参照。ユーティリティクラス・デザイントークン・レイアウトモジュール・命名規則・CSSのLayer規則・レスポンシブ対応・ベーススタイリングのルール・CSS設計を提供する。"
user-invocable: false
---

# Lism CSS Best Practices

このプロジェクトは CSS フレームワーク「Lism CSS」を使用しています。

MCP サーバー (`@lism-css/mcp`) が利用可能な場合は、コンポーネントやPropsの詳細情報をそちらから取得してください。

> **バージョン情報:** このガイドは `lism-css@0.11.0` 時点の情報に基づいています。プロジェクトで使用中の `lism-css` バージョンを確認し、このガイドのバージョンと異なる場合はユーザーに通知してください。

公式ドキュメント: https://lism-css.com/docs/overview/


## パッケージ構成

| パッケージ | 用途 |
|-----------|------|
| `lism-css` | コアCSS・レイアウトコンポーネント |
| `@lism-css/ui` | UIコンポーネント（Accordion, Modal, Tabs 等） |

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

| ファイル | 内容 |
|---------|------|
| [props.md](./props.md) | Props システム — 主要Props一覧・Prop Class記法・is--/set-- Props・レスポンシブ対応 |
| [tokens.md](./tokens.md) | デザイントークン — 余白・フォントサイズ・角丸・影・カラー・パレット |
| [css-rules.md](./css-rules.md) | CSS設計ルール — Layer構造・命名規則・プレフィックス・カスタムCSS追加ルール |
