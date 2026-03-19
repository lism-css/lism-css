# @lism-css/cli

[Lism UI](https://lism-css.com) のコンポーネントソースをプロジェクトに追加する CLI ツールです。

## 前提条件

- Node.js 18 以上
- `lism-css` がインストール済みであること

```bash
npm install lism-css
# or
pnpm add lism-css
```

## 使い方

### コンポーネントの追加

```bash
pnpm dlx @lism-css/cli add accordion
```

`lism-ui.json` が存在しない場合、対話形式でセットアップが始まります。

```
? フレームワークを選択してください: React
? コンポーネントの出力先ディレクトリ: src/components/ui
? helper の出力先ディレクトリ: src/components/ui/_helper
✔ lism-ui.json を作成しました。

accordion を展開中...
  作成: src/components/ui/Accordion/_style.css
  作成: src/components/ui/Accordion/getProps.js
  ...
```

### 複数コンポーネントを追加

```bash
pnpm dlx @lism-css/cli add accordion modal tabs
```

### 全コンポーネントを追加

```bash
pnpm dlx @lism-css/cli add --all
```

### コンポーネント一覧の確認

```bash
pnpm dlx @lism-css/cli list
```

### 初期設定（init）

`lism-ui.json` を対話形式で生成します。フレームワーク（React / Astro）や出力先ディレクトリを設定できます。

```bash
pnpm dlx @lism-css/cli init
```

`init` を実行しなくても、`add` コマンドの初回実行時に `lism-ui.json` がなければ自動でセットアップが始まります。事前に設定だけ済ませたい場合に使ってください。

## オプション

| オプション | 説明 |
|-----------|------|
| `-o, --overwrite` | 既存ファイルを確認なしで上書き |
| `-a, --all` | 全コンポーネントを追加 |

## 生成されるファイル構成

```
src/components/ui/
├── _helper/
│   ├── animation.ts
│   └── uuid.js
├── Accordion/
│   ├── _style.css
│   ├── getProps.js
│   ├── setAccordion.js
│   ├── script.js
│   └── react/
│       ├── Accordion.jsx
│       ├── AccIcon.jsx
│       └── index.js
└── Modal/
    ├── _style.css
    ├── ...
    └── react/
```

## lism-ui.json

`init` 時に生成される設定ファイルです。

```json
{
  "framework": "react",
  "componentsDir": "src/components/ui",
  "helperDir": "src/components/ui/_helper"
}
```

| フィールド | 説明 |
|-----------|------|
| `framework` | `"react"` または `"astro"` |
| `componentsDir` | コンポーネントの出力先ディレクトリ |
| `helperDir` | helper ファイルの出力先ディレクトリ |

## npx で実行できない場合

npm v11 以降では Safe Supply Chain 機能により、公開から間もないパッケージが `npx` でブロックされる場合があります。

```
npm error code ENOVERSIONS
npm error No versions available for @lism-css/cli
ℹ Safe-chain: Some package versions were suppressed due to minimum age requirement.
```

以下のいずれかで回避できます。

```bash
# チェックをスキップ
npx --safe-chain-skip-minimum-package-age @lism-css/cli add accordion

# pnpm dlx を使う（この制限なし）
pnpm dlx @lism-css/cli add accordion

# @antfu/ni の nlx を使う
nlx @lism-css/cli add accordion
```

## License

MIT
