# CLAUDE.md

このファイルは Claude Code および サブエージェント向けのガイドです。


## パッケージ概要

`lism-css` の上に構築されたインタラクティブな UI コンポーネントライブラリ。React と Astro の両方のコンポーネントを提供。

| 項目 | 内容 |
|------|------|
| npm パッケージ名 | `@lism-css/ui` |
| ソース | `src/` |
| 出力 | `dist/`（編集禁止） |
| ビルド | Vite（React） + build-css.js（CSS） |
| 依存 | `lism-css`（workspace） |
| peerDependencies | `react ^18 \|\| ^19` |


## 開発コマンド

```bash
pnpm dev        # 開発サーバー
pnpm build      # フルビルド（React + CSS）
pnpm build:css  # CSS のみ
```


## 主要ディレクトリ

| パス | 説明 |
|------|------|
| `src/components/` | コンポーネント本体 |
| `src/components/react.ts` | React エクスポート一覧 |
| `src/components/astro.ts` | Astro エクスポート一覧 |
| `src/helper/` | ユーティリティ関数 |
| `src/style.scss` | スタイルエントリポイント |


## コンポーネント構造

各コンポーネントは `react/` と `astro/` のサブディレクトリに分かれている：

```
components/ComponentName/
├── react/            # React コンポーネント（.jsx/.tsx）
│   ├── ComponentName.jsx
│   └── index.js
├── astro/            # Astro コンポーネント（.astro）
│   ├── ComponentName.astro
│   └── index.js
├── _style.css        # コンポーネント固有のスタイル
├── getProps.js|ts    # Props 処理ロジック（任意）
└── script.js         # クライアント JS（任意）
```

### エクスポート/インポート

ユーザーが以下のようにしてコンポーネントをインポートして利用できるように、各コンポーネントをエクスポートしている。

```js
// React
import { Accordion, Modal } from '@lism-css/ui/react';

// Astro
import { Accordion, Modal } from '@lism-css/ui/astro';
```


## 注意事項

- `dist/` ディレクトリは編集禁止（ビルド生成物）
- lint 設定はモノレポルートに配置
