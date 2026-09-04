# lism-cli

[Lism CSS](https://lism-css.com) / [Lism UI](https://lism-css.com/ui) のためのCLIツール。`lism-cli` コマンドで新規プロジェクト生成・UIコンポーネント追加・AIスキル配置を行います。

## 前提条件

- Node.js 18 以上

## コマンド体系

```
lism-cli create [targetDir] [--template <name|category>] [--lang <ja|en>]  # templates から新規プロジェクト
lism-cli init  [--ui-framework <react|astro>] [--ui-dir <path>]  # lism.config ファイルの新規生成
lism-cli ui    { add <names...> | list }                    # Lism UI コンポーネントの追加
lism-cli skill { add [skill] | check | update }             # AI エージェント向け SKILL.md 配置
lism-cli mockup                                             # 画面モックアップ作成の案内
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

`--lang <ja|en>` は CLIの表示言語に加えて、**生成されるテンプレート本体の言語**にも反映されます。`--lang` を指定しない場合は、対話端末（TTY）ではほかのどの選択よりも先に言語選択プロンプトが表示され、選んだ言語で以降の表示とテンプレート生成が確定します（非対話環境・CI等では `en` にフォールバック）。対応言語版を持つテンプレート（`blog-astro-minimal` / `blog-astro-personal` / `blog-astro-techlog` / `lp-astro-corporate` / `lp-astro-interior` / `lp-astro-ryokan`）では、指定言語のサイト文言・サンプルコンテンツで生成されます。言語版が無いテンプレートは、指定言語に関わらず既存（ベース）の内容で生成されます。

### lism.config の生成

既存プロジェクトに Lism CSS を後付けする場合など、設定ファイルのひな形が必要なときは `init` を使います。

```bash
pnpm dlx lism-cli init
```

core 設定（`tokens` / `props` 等、コメントアウトされたひな形）を持つ `lism.config.js` を新規作成します。対話の中で「Lism UI のコンポーネントも使いますか？」と確認され（デフォルト: No）、Yes と答えた場合のみ `ui` セクション（`framework` / `dir`）も併せて生成されます。

`ui` セクションの値はオプションで先渡しできます。指定されなかった質問だけが対話で行われます。

- `--ui-framework <react|astro>`: framework の選択をスキップし、UI 利用の確認のみ行います（この場合のデフォルトは Yes）
- `--ui-dir <path>`: UI コンポーネントの出力先。指定すると UI 利用の意思とみなし、確認を省略して framework の選択のみ行います

非対話環境（CI 等）では質問を出せないため、`--ui-framework` があれば `ui` セクション込みで生成し、無ければ `ui` セクション無しで生成します（`--ui-dir` のみの指定はエラーになります）。

既に `lism.config.{ts,mjs,js}` がある場合は何も変更しません（`ui` セクションの後付けは、後述の `ui add` 実行時に表示されるスニペットを貼り付けてください）。

### UIコンポーネントの追加

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

コンポーネントは [`packages/lism-ui/src/components`](https://github.com/lism-css/lism-css/tree/main/packages/lism-ui/src/components) から [giget](https://github.com/unjs/giget) 経由で直接取得されるため、既存コンポーネントの実装を更新するだけでCLI側も自動で追従します。ただし、コンポーネントを追加・削除した場合は `lism-ui` 側で `registry-index.json` を再生成（ビルド時の `gen:registry`）してcommitする必要があります（`ui list` / `ui add --all` が参照するカタログのため）。

`ui` セクションの設定が見つからない状態で `ui add` を実行すると、対話式セットアップが走ります。

```
? フレームワークを選択してください: React
```

出力先ディレクトリは既定値（`src/components/ui`）が使われます。変更したい場合は `--ui-dir` フラグで指定してください。

`ui add` は入力した値をその回の実行に使うだけで設定ファイルは書き換えず、最後に `lism.config.*` へ貼り付けるための `ui` セクションのスニペットを案内します（CSSカスタマイズ用に先に作られた設定を壊さないため）。

設定をファイルとして残すには、`lism.config.*` が無い場合は `lism-cli init`（前述）で `ui` セクション込みの設定ファイルを生成し、既にある場合は上記スニペットを貼り付けてください。

### AI エージェント向けスキルの配置

同梱スキル（`SKILL.md` ほか一式）を各種AIツールの所定ディレクトリへ展開します。

同梱スキルは以下の3つです：

| スキル | 説明 |
|--------|------|
| `lism-css-guide` | Lism CSSでUI・ページを実装・修正する時に使う実装ガイド |
| `lism-css-refactor` | 既存の Lism CSSコードを、見た目や挙動を変えずにLismらしい書き方へ整理するリファクタガイド |
| `lism-mockup-guide` | `@lism-css/mockup`で画面モックアップを組む時のワークフローとデータ契約のガイド（`lism-css-guide`併用前提） |

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

### 画面モックアップの案内

`lism-cli mockup` は、画面モックアップを作成するCLI [`@lism-css/mockup`](https://www.npmjs.com/package/@lism-css/mockup) の使い方を表示するだけのコマンドです。`lism-cli` 自体はモックアップ機能を持ちません。

```bash
pnpm dlx lism-cli mockup
```

モックアップの作成・検証・プレビューは `@lism-css/mockup` を直接実行してください。

```bash
npx @lism-css/mockup init [dir]    # ひな形＋契約説明書の生成
npx @lism-css/mockup check [dir]   # 非対話の検証
npx @lism-css/mockup dev [dir]     # devサーバー起動（ブラウザ確認用）
```

AIエージェントにモックアップを作らせる場合は、`lism-mockup-guide` スキル（前述の `skill add`）も併せて導入してください。

## lism.config.js

`ui add` が読み込む設定ファイル（新規作成するのは `init`）。CSSの設定（`tokens` 等）とUI設定を同居できます。

```js
export default {
  ui: {
    framework: 'react', // 'react' | 'astro'
    dir: 'src/components/ui',
  },
};
```

helper の配置先は個別に設定できず、常に `{dir}/_helper` に固定されます。旧キー `ui.componentsDir` は `ui.dir` が無い場合のみ後方互換として読み込まれます。

設定ファイルは `lism.config.ts` / `lism.config.mjs` / `lism.config.js` に対応しており、この順で探索して最初に見つかったものを読み込みます。`lism-css` 本体の設定読込（`@lism-css/plugin` / `lism-css build`）も同じ探索順です。

旧 `cli` セクション名も後方互換のため読み込めますが、deprecation警告が出るので `ui` へのリネームを推奨します。

## パッケージが見つからないエラーが出る場合

npm / pnpmには、公開から間もないバージョンのインストールを一定期間ブロックする仕組みがあります（npmの`min-release-age`設定、pnpmの`minimumReleaseAge`設定）。公開直後の`lism-cli`を実行すると、このガードによりパッケージが見つからないエラーになる場合があります。次のように一時的に無効化して実行できます。

```bash
npm exec --min-release-age 0 lism-cli create
pnpm dlx --config.minimumReleaseAge=0 lism-cli create
```

Aikido Securityのsafe-chainなど、サードパーティのサプライチェーン保護ツールを導入している場合は、そのツール側の設定（例: `SAFE_CHAIN_MINIMUM_PACKAGE_AGE_HOURS=0`）も確認してください。

## License

MIT
