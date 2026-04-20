# lism-css

[English](./README.md) | [日本語](./README.ja.md)

[![npm version](https://img.shields.io/npm/v/lism-css.svg)](https://www.npmjs.com/package/lism-css)
[![License: MIT](https://img.shields.io/npm/l/lism-css.svg)](https://github.com/lism-css/lism-css/blob/main/LICENSE)

## lism-css とは？

Lism CSS は、WEBサイトのレイアウトを素早く、かつ美しく構築するための軽量な **CSS設計フレームワーク**です。

[Every Layout](https://every-layout.dev/) のレイアウトプリミティブ、[Tailwind CSS](https://tailwindcss.com/) のユーティリティファーストアプローチ、[ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) のレイヤリング等に着想を得て、それらを統合して設計されています。

ビルドステップや設定は不要です。CDN 経由で CSS ファイルを読み込むか、npm からインポートするだけですぐに使い始められます。  
React / Astro 向けのコンポーネントも提供しており、propsを通じてCSSクラスとカスタムプロパティに変換されるため、ランタイムでのスタイル生成なしにコンポーネントベースの開発が可能です。

## 特徴

- **軽量** - CSS バンドル全体で約 30 KB（gzip 圧縮時 約 8 KB）と、軽量です。
- **ゼロビルドフレームワーク** — CSS ファイルを読み込むだけで、プレーン HTML でも動作します。ビルドツール、プリプロセッサ、設定は不要。CDN または npm で利用可能。
- **レイアウト優先のプリミティブアーキテクチャ** — レイアウトプリミティブ（`l--flex`、`l--stack`、`l--grid`、`l--columns`、`l--center`、`l--sideMain` など）で、カスタム CSS を書かずに一般的なレイアウトパターンを組み立てられます。
- **CSS レイヤー構造** — `@layer`（lism-base → lism-trait → lism-primitive → lism-component → lism-custom → lism-utility）を使用した明確な詳細度管理。`lism-trait` は `is--` / `has--` の Trait クラス用レイヤー、`lism-primitive` の内部は `layout` / `atomic` のサブレイヤーに分かれています。`lism-component` は BEM 構造の `c--` コンポーネント用レイヤー、`lism-custom` はユーザー独自プレフィックスのクラス用レイヤーです。詳細度の衝突を最小限に抑えます。
- **デザイントークン** — カラー、スペーシング、フォントサイズ、シャドウ、ボーダー半径を CSS カスタムプロパティで管理。変数を上書きするだけで簡単にカスタマイズできます。
- **柔軟なプロップクラス** — `-{prop}:{value}` の命名規則（例: `-p:20`、`-bgc:base-2`、`-fz:l`）で CSS プロパティをユーティリティクラスにマッピングし、素早く読みやすいスタイリングを実現します。
- **レスポンシブシステム** — ブレークポイント固有のクラスと CSS 変数（例: `-p_sm`、`-p_md`）にデフォルトでコンテナクエリを採用し、親要素ベースのレスポンシブデザインを実現。メディアクエリへの切り替えも可能。
- **React & Astro コンポーネント** — React と Astro の両方に対応した専用コンポーネントが、props を Lism CSS のクラスと変数に自動変換します。`class="l--stack -g:20"` の代わりに `<Stack g="20">` と書けます。

## インストール

### CDN（ビルド不要）

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css@0/dist/css/main.css" rel="stylesheet" />
```

### npm

```bash
npm i lism-css
```

または

```bash
pnpm add lism-css
```

## セットアップ

グローバルスタイルとして CSS をインポートします:

```js
import 'lism-css/main.css';
```

**Next.js** の場合は、`layout.js`（App Router）または `_app.js`（Pages Router）で読み込みます。

**Astro** の場合は、`node_modules` から `.astro` コンポーネントをインポートできるよう、`astro.config.js` に以下を追加します:

```js
export default defineConfig({
  vite: {
    ssr: {
      noExternal: ['lism-css'],
    },
  },
});
```

## 使い方

### React

```jsx
import { Box, Flex, Stack, Grid, Text, Heading } from 'lism-css/react';

<Stack g="20">
  <Heading tag="h2" fz="xl">Welcome</Heading>
  <Flex g="20" ai="center">
    <Box p="20" bgc="base-2" bdrs="20">
      <Text fz="l">Card A</Text>
    </Box>
    <Box p="20" bgc="base-2" bdrs="20">
      <Text fz="l">Card B</Text>
    </Box>
  </Flex>
</Stack>
```

### Astro

```astro
---
import { Box, Flex, Stack, Text, Heading } from 'lism-css/astro';
---

<Stack g="20">
  <Heading tag="h2" fz="xl">Welcome</Heading>
  <Flex g="20" ai="center">
    <Box p="20" bgc="base-2" bdrs="20">
      <Text fz="l">Card A</Text>
    </Box>
    <Box p="20" bgc="base-2" bdrs="20">
      <Text fz="l">Card B</Text>
    </Box>
  </Flex>
</Stack>
```

### HTML（CSS のみ）

```html
<div class="l--stack -g:20">
  <h2 class="-fz:xl">Welcome</h2>
  <div class="l--flex -g:20 -ai:center">
    <div class="-p:20 -bgc:base-2 -bdrs:20">
      <p class="-fz:l">Card A</p>
    </div>
    <div class="-p:20 -bgc:base-2 -bdrs:20">
      <p class="-fz:l">Card B</p>
    </div>
  </div>
</div>
```

## コアコンポーネント

Lism CSS は以下の React / Astro コンポーネントを提供します:

**レイアウトコンポーネント:**
Lism, Box, Flow, Flex, Cluster, Stack, Grid, FluidCols, SwitchCols, SideMain, Center, Columns, Frame

**構造コンポーネント:**
Container, Wrapper, Layer, BoxLink

**コンテンツコンポーネント:**
Text, Heading, Inline, Link, Group, List

**アトミックコンポーネント:**
Icon, Media, Decorator, Divider, Spacer

すべてのコンポーネントは Lism props（例: `p`、`m`、`g`、`fz`、`bgc`、`bdrs`）を受け取り、CSS クラスと変数に自動的にマッピングされます。

## CSS クラスシステム

Lism CSS は構造化された命名規則を CSS クラスに使用しています:

| タイプ | パターン | 例 |
|--------|---------|-----|
| レイアウトプリミティブ | `l--{name}` | `l--flex`, `l--grid`, `l--stack`, `l--center`, `l--columns`, `l--sideMain` |
| トレイトプリミティブ | `is--{name}` | `is--wrapper`, `is--container`, `is--layer` |
| プロップクラス | `-{prop}:{value}` | `-p:20`, `-m:auto`, `-bgc:base-2`, `-fz:l`, `-ta:center` |
| ブレークポイント | `-{prop}_{bp}` | `-p_sm`, `-g_md`, `-fz_lg` |
| ユーティリティクラス | `u--{name}` | `u--cbox` |

## レスポンシブシステム

レスポンシブ値は、ブレークポイント固有のクラスと CSS 変数を使って設定します:

**HTML:**

```html
<div class="-p:20 -p_sm -p_md" style="--p_sm:var(--s30);--p_md:var(--s40)">
  <p>sm (480px) と md (800px) のブレークポイントでパディングが変化</p>
</div>
```

**JSX (React / Astro):**

```jsx
<Lism p={['20', '30', '40']}>
  <p>sm (480px) と md (800px) のブレークポイントでパディングが変化</p>
</Lism>
```

デフォルトブレークポイント: `sm` = 480px、`md` = 800px、`lg` = 1120px（デフォルトでコンテナクエリを使用）。

## デザイントークン

Lism CSS は一貫したデザインのための CSS カスタムプロパティを提供します:

- **カラー:** `--base`、`--base-2`、`--text`、`--text-2`、`--link`、`--divider`、`--brand`、`--accent`、パレットカラー（`--red`、`--blue`、`--green` など）
- **スペーシング:** `--s5`, `--s10`, `--s15`, `--s20`, `--s30`, `--s40` … `--s80`（rem 値にマッピング）
- **フォントサイズ:** `--fz--2xs` 〜 `--fz--5xl`
- **ボーダー半径:** `--bdrs--10`（0.25rem）〜 `--bdrs--99`（99rem）
- **シャドウ:** `--bxsh--10` 〜 `--bxsh--40`（シャドウカラー設定可能）
- **コンテナサイズ:** `--sz--xs`（32rem）〜 `--sz--xl`（1600px）

## UI コンポーネント

インタラクティブな UI コンポーネント（Accordion、Modal、Tabs、Alert、Avatar、Badge、Button など）については、別パッケージの [@lism-css/ui](https://www.npmjs.com/package/@lism-css/ui) を参照してください。

```bash
npm i @lism-css/ui
```

## AI ツール連携

### llms.txt

AI アシスタントや LLM ベースのツール向けに、機械可読なドキュメントインデックスを提供しています:

```
https://lism-css.com/llms.txt
```

### MCP サーバー

AI コーディングツール向けの MCP（Model Context Protocol）サーバーが利用可能です:

**Claude Code:**

```bash
claude mcp add lism-css -- npx -y @lism-css/mcp
```

**Cursor:**

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "lism-css": {
      "command": "npx",
      "args": ["-y", "@lism-css/mcp"]
    }
  }
}
```

**VS Code (GitHub Copilot):**

```json
// .vscode/mcp.json
{
  "servers": {
    "lism-css": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@lism-css/mcp"]
    }
  }
}
```

## ドキュメント

詳細なドキュメントは [lism-css.com](https://lism-css.com) をご覧ください。

## コミュニティ

フィードバックや質問は、[Lism CSS Discord サーバー](https://discord.gg/6PMcFHvc4h)までお気軽にどうぞ。

## クレジット

- [Phosphor Icons](https://phosphoricons.com/) — MIT License ([source](https://github.com/phosphor-icons))

## ライセンス

MIT
