# lism-cli

[Lism CSS](https://lism-css.com) / [Lism UI](https://lism-css.com/ui) のための CLI ツール。`lism-cli` コマンドで新規プロジェクト生成・UI コンポーネント追加・AI スキル配置を行います。

## 前提条件

- Node.js 18 以上

## コマンド体系

```
lism-cli create [targetDir] [--template <name|category>]   # templates から新規プロジェクト
lism-cli ui    { init | add <names...> | list }            # Lism UI コンポーネントの追加
lism-cli skill { add [skill] | check | update }            # AI エージェント向け SKILL.md 配置
```

## 使い方

### プロジェクトを新規作成

```bash
# 対話モード
pnpm dlx lism-cli create

# テンプレート名・出力先を指定
pnpm dlx lism-cli create --template minimal-astro ./my-app

# カテゴリ名を指定（stack 以下の選択を対話で続行）
pnpm dlx lism-cli create --template minimal ./my-app

# 言語を指定（CLI 表示 + 生成テンプレートの言語）
pnpm dlx lism-cli create --template blog-astro-minimal --lang en ./my-blog
```

同じ動作は `pnpm create lism` / `npm create lism@latest` でも呼び出せます（`create-lism` パッケージ経由）。挙動は両者で共通です。

`--lang <ja|en>` は CLI の表示言語に加えて、**生成されるテンプレート本体の言語**にも反映されます。`--lang` を指定しない場合は、対話端末（TTY）ではほかのどの選択よりも先に言語選択プロンプトが表示され、選んだ言語で以降の表示とテンプレート生成が確定します（非対話環境・CI 等では `en` にフォールバック）。対応言語版を持つテンプレート（`blog-astro-minimal` / `blog-astro-personal` / `blog-astro-techlog` / `lp-astro-corporate` / `lp-astro-interior`）では、指定言語のサイト文言・サンプルコンテンツで生成されます。言語版が無いテンプレートは、指定言語に関わらず既存（ベース）の内容で生成されます。

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

初回実行時に `lism.config.{ts,mjs,js}` が無い場合は対話式セットアップが走り、`ui` セクションを持つ `lism.config.js` を新規作成します。

```
? フレームワークを選択してください: React
? コンポーネントの出力先ディレクトリ: src/components/ui
? helper の出力先ディレクトリ: src/components/ui/_helper
✔ lism.config.js を作成しました。
```

`ui init` で設定の生成のみ行うこともできます。既存の `lism.config.*` がある場合はファイルを書き換えず、貼り付け用の `ui` セクションのスニペットを表示します（CSS カスタマイズ用に先に作られた設定を壊さないため）。

### AI エージェント向けスキルの配置

同梱スキル（`SKILL.md` ほか一式）を各種 AI ツールの所定ディレクトリへ展開します。

同梱スキルは以下の 2 つです：

| スキル | 説明 |
|--------|------|
| `lism-css-guide` | Lism CSS で UI・ページを実装・修正する時に使う実装ガイド |
| `lism-css-refactor` | 既存の Lism CSS コードを、見た目や挙動を変えずに Lism らしい書き方へ整理するリファクタガイド |

```bash
# 対話モード（使用中のツールを自動検出）
pnpm dlx lism-cli skill add

# スキル名を指定して個別に導入
pnpm dlx lism-cli skill add lism-css-refactor

# ツールを明示指定
pnpm dlx lism-cli skill add --claude --cursor

# 全ツール
pnpm dlx lism-cli skill add --all

# 同梱スキルとローカルのファイル差分をチェック（変更 / 追加 / 削除のサマリ表示）
pnpm dlx lism-cli skill check

# 上書き更新
pnpm dlx lism-cli skill update --claude
```

`skill add` は引数なしで実行すると同梱スキルすべてを一括導入し、`skill add <skill>` でスキル名を指定すると、そのスキルだけを配置します。`check` / `update` はスキル引数を取らず、常に同梱スキル全体が対象です。

配置先の対応表（`<skill>` にはスキル名が入ります）：

| ツール | 配置先 |
|--------|--------|
| `--claude` | `.claude/skills/<skill>` |
| `--codex` | `.agents/skills/<skill>` |
| `--cursor` | `.cursor/skills/<skill>` |
| `--windsurf` | `.windsurf/skills/<skill>` |
| `--cline` | `.cline/skills/<skill>` |
| `--copilot` | `.github/skills/<skill>` |
| `--gemini` | `.gemini/skills/<skill>` |
| `--junie` | `.junie/skills/<skill>` |

## lism.config.js

`ui init` / `ui add` が生成・読み込む設定ファイル。CSS の設定（`tokens` 等）と CLI 設定を同居できます。

```js
export default {
  ui: {
    framework: 'react', // 'react' | 'astro'
    componentsDir: 'src/components/ui',
    helperDir: 'src/components/ui/_helper',
  },
};
```

設定ファイルは `lism.config.ts` / `lism.config.mjs` / `lism.config.js` に対応しており、この順で探索して最初に見つかったものを読み込みます。`lism-css` 本体の設定読込（`@lism-css/plugin` / `lism-css build`）も同じ探索順です。

旧 `lism-ui.json` は廃止予定（互換ロードのみ。起動時に deprecation 警告）。旧 `cli` セクション名も後方互換のため読み込めますが、deprecation 警告が出るので `ui` へのリネームを推奨します。

## パッケージが見つからないエラーが出る場合

npm / pnpm の Safe Supply Chain 機能により、公開から間もないパッケージがブロックされる場合があります。

```bash
npm exec --safe-chain-skip-minimum-package-age lism-cli create
pnpm --safe-chain-skip-minimum-package-age dlx lism-cli create
```

## License

MIT
