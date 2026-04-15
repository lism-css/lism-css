# @lism-css/ui

[English](./README.md) | [日本語](./README.ja.md)

[![npm version](https://img.shields.io/npm/v/@lism-css/ui.svg)](https://www.npmjs.com/package/@lism-css/ui)
[![License: MIT](https://img.shields.io/npm/l/@lism-css/ui.svg)](https://github.com/lism-css/lism-css/blob/main/LICENSE)

## @lism-css/ui とは？

`@lism-css/ui` は、[lism-css](https://www.npmjs.com/package/lism-css) の上に構築されたインタラクティブな UI コンポーネントライブラリです。アコーディオン、モーダル、タブなど、よく使う UI パターンの React / Astro コンポーネントを提供します。

すべてのコンポーネントは Lism CSS のレイアウトシステムとデザイントークンを前提としています。

## 利用可能なコンポーネント

| コンポーネント | 説明 |
|---------------|------|
| **Accordion** | ネイティブ `<details>` 要素を使った展開可能なコンテンツセクション |
| **Alert** | アイコンとカラーバリエーション付きのコンテキストフィードバックメッセージ |
| **Avatar** | ユーザープロフィール用の円形画像表示 |
| **Badge** | 小さなステータスラベルやカウンター |
| **Button** | バリエーションとサイズ付きのスタイル付きボタン |
| **Callout** | ヒント、警告、注意書き用のハイライトコンテンツブロック |
| **Chat** | 会話形式のレイアウト用チャットバブル UI |
| **Details** | スタイル付きネイティブ `<details>` / `<summary>` 要素 |
| **Modal** | バックドロップ付きダイアログオーバーレイ |
| **NavMenu** | ネストアイテム対応のナビゲーションメニュー |
| **ShapeDivider** | SVG シェイプによる装飾的なセクションディバイダー |
| **Tabs** | タブ付きコンテンツパネル |
| **DummyText** | プロトタイピング用のプレースホルダーテキスト |
| **DummyImage** | プロトタイピング用のプレースホルダー画像 |

## インストール

```bash
npm i @lism-css/ui lism-css
```

または

```bash
pnpm add @lism-css/ui lism-css
```

> `lism-css` は必須のピア依存関係です。

## セットアップ

グローバルスタイルとして CSS をインポートします:

```js
import 'lism-css/main.css';
import '@lism-css/ui/style.css';
```

**Astro** の場合は、`astro.config.js` に以下も追加します:

```js
export default defineConfig({
  vite: {
    ssr: {
      noExternal: ['lism-css', '@lism-css/ui'],
    },
  },
});
```

## 使い方

### React

```jsx
import { Accordion, Modal, Tabs, Button } from '@lism-css/ui/react';
import { Stack, Text } from 'lism-css/react';

<Stack g="20">
  <Accordion>
    <Accordion.Heading>FAQ の質問</Accordion.Heading>
    <Accordion.Body>
      <Text>回答の内容がここに入ります。</Text>
    </Accordion.Body>
  </Accordion>

  <Button href="/about" variant="outline">
    詳しく見る
  </Button>
</Stack>
```

### Astro

```astro
---
import { Accordion, Modal, Tabs, Button } from '@lism-css/ui/astro';
import { Stack, Text } from 'lism-css/astro';
---

<Stack g="20">
  <Accordion>
    <Accordion.Heading>FAQ の質問</Accordion.Heading>
    <Accordion.Body>
      <Text>回答の内容がここに入ります。</Text>
    </Accordion.Body>
  </Accordion>

  <Button href="/about" variant="outline">
    詳しく見る
  </Button>
</Stack>
```

## lism-css との関係

Lism CSS は2つのパッケージで構成されています:

- **[lism-css](https://www.npmjs.com/package/lism-css)** — レイアウトコンポーネント（Box、Flex、Stack、Grid など）、デザイントークン、プロップクラス、レスポンシブシステムを提供するコア CSS フレームワーク。
- **@lism-css/ui**（このパッケージ）— コアのレイアウトシステムを拡張し、すぐに使えるインターフェースパターン（Accordion、Modal、Tabs など）を提供するインタラクティブ UI コンポーネント。

`@lism-css/ui` を使用するには `lism-css` のインストールが必要です。

## AI ツール連携

AI コーディングツールが Lism CSS のドキュメントを参照するための MCP サーバーが利用可能です:

```bash
claude mcp add lism-css -- npx -y @lism-css/mcp
```

その他のセットアップ方法については、[lism-css README](https://www.npmjs.com/package/lism-css#ai-tool-integration) を参照してください。

## ドキュメント

詳細なドキュメントは [lism-css.com](https://lism-css.com) をご覧ください。

## ライセンス

MIT
