# lism-cli

[Lism CSS](https://lism-css.com) / [Lism UI](https://lism-css.com/ui) のための CLI ツール。`lism` コマンドで新規プロジェクト生成・UI コンポーネント追加・AI スキル配置を行います。

## 前提条件

- Node.js 18 以上

## コマンド体系

```
lism create [targetDir] [--template <name>]   # examples から新規プロジェクト
lism ui    { init | add <names...> | list }   # Lism UI コンポーネントの追加
lism skill { add | check | update }           # AI エージェント向け SKILL.md 配置
```

## 使い方

### プロジェクトを新規作成

```bash
# 対話モード
pnpm dlx lism-cli create

# テンプレート名・出力先を指定
pnpm dlx lism-cli create --template astro-minimal ./my-app
```

同じ動作は `pnpm create lism` / `npm create lism@latest` でも呼び出せます（`create-lism` パッケージ経由）。

### UI コンポーネントの追加

```bash
# 単一 / 複数
pnpm dlx lism-cli ui add accordion
pnpm dlx lism-cli ui add accordion modal tabs

# 全コンポーネント
pnpm dlx lism-cli ui add --all

# 一覧
pnpm dlx lism-cli ui list

# 特定の ref（ブランチ / タグ / コミット）から取得
pnpm dlx lism-cli ui add accordion --ref dev
```

コンポーネントは [`packages/lism-ui/src/components`](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components) から [giget](https://github.com/unjs/giget) 経由で直接取得されます。`lism-ui` を更新するだけで CLI 側も自動で追従します。

初回実行時に `lism.config.js` が無い場合は対話式セットアップが走り、`cli` セクションを書き込みます。

```
? フレームワークを選択してください: React
? コンポーネントの出力先ディレクトリ: src/components/ui
? helper の出力先ディレクトリ: src/components/ui/_helper
✔ lism.config.js を作成しました。
```

`ui init` で設定の生成のみ行うこともできます。既存の `lism.config.js` には `cli` セクションのみ追記されます。

### AI エージェント向けスキルの配置

`SKILL.md` を各種 AI ツールの所定ディレクトリへ展開します。

```bash
# 対話モード（使用中のツールを自動検出）
pnpm dlx lism-cli skill add

# ツールを明示指定
pnpm dlx lism-cli skill add --claude --cursor

# 全ツール
pnpm dlx lism-cli skill add --all

# 同梱スキルとローカルのファイル差分をチェック（変更 / 追加 / 削除のサマリ表示）
pnpm dlx lism-cli skill check

# 上書き更新
pnpm dlx lism-cli skill update --claude
```

配置先の対応表：

| ツール | 配置先 |
|--------|--------|
| `--claude` | `.claude/skills/lism-css-guide` |
| `--codex` | `.agents/skills/lism-css-guide` |
| `--cursor` | `.cursor/skills/lism-css-guide` |
| `--windsurf` | `.windsurf/skills/lism-css-guide` |
| `--cline` | `.cline/skills/lism-css-guide` |
| `--copilot` | `.github/skills/lism-css-guide` |
| `--gemini` | `.gemini/skills/lism-css-guide` |
| `--junie` | `.junie/skills/lism-css-guide` |

## lism.config.js

`ui init` / `ui add` が生成・読み込む設定ファイル。CSS の設定（`tokens` 等）と CLI 設定を同居できます。

```js
export default {
  cli: {
    framework: 'react', // 'react' | 'astro'
    componentsDir: 'src/components/ui',
    helperDir: 'src/components/ui/_helper',
  },
};
```

`lism.config.mjs` も同様に読み込まれます。旧 `lism-ui.json` は廃止予定（互換ロードのみ。起動時に deprecation 警告）。

> **Note:** TypeScript の `lism.config.ts` は現在未対応です。`lism-css` 本体の SCSS ビルド（`vite-plugin-lism-css` / `lism-css build`）も `.ts` を読み込まない設計のため、設定ファイルは `.js` / `.mjs` で記述してください。

## パッケージが見つからないエラーが出る場合

npm / pnpm の Safe Supply Chain 機能により、公開から間もないパッケージがブロックされる場合があります。

```bash
npm exec --safe-chain-skip-minimum-package-age lism-cli create
pnpm --safe-chain-skip-minimum-package-age dlx lism-cli create
```

## License

MIT
