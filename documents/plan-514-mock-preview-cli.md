# Plan: デザインモック用プレビューCLI（ビューア同梱・データファイル方式）とモック作成スキル（#514）

> 状態: Ready
> 対象Issue: [#514](https://github.com/lism-css/lism-css/issues/514)

> **注記（実装後の改称）**
> このプランは実装当時の記録です。実装後に名称を「Lism Mockup」へ統一したため、本文中の旧名称は現在それぞれ次に読み替えてください。
>
> | プラン本文の表記 | 現在の名称 |
> | --- | --- |
> | `@lism-css/mock` | `@lism-css/mockup` |
> | `lism-mock`（bin） | `lism-mockup` |
> | `lism-cli mock` | `lism-cli mockup` |
> | `lism-mock-guide` | `lism-mockup-guide` |
> | `packages/mock/` | `packages/mockup/` |
> | `mock.config.json` | `mockup.config.json` |
> | `virtual:lism-mock/*` | `virtual:lism-mockup/*` |
>
> 呼称も「デザインモック」ではなく「画面モックアップ（モックアップ）」に統一しています。

## 概要 / ゴール

「AIエージェントに最初からLismベースでデザインモックを組ませる」ための仕組みを作る。構成要素は3つ。

1. **データ契約**: エージェント（またはユーザー）が書くのは決まった形式のデータファイルのみ
   - `pages/*.jsx|tsx` — 各画面のコンポーネント（default export）
   - `tokens.json` — プロジェクト固有のデザイントークン
   - `mock.config.json` — ラベル・並び順等のメタデータと`schemaVersion`
2. **プレビューCLI（新パッケージ`@lism-css/mock`）**: vite devサーバー同梱の固定ビューア。`lism-mock init` / `lism-mock dev` / `lism-mock check`を提供
3. **エージェントスキル**: データ契約の仕様＋Lismベースでモックを組むワークフローだけの薄いスキル。実装の詳細指針は既存の`lism-css-guide`を参照して重複させない

完了時の状態：

- 「`lism-mock init`でひな形生成 → ページを書く → `lism-mock check`で自己検証 → `lism-mock dev`で人間がブラウザ確認」という流れが成立する
- スキル未導入の環境でも、`init`の生成物（サンプル＋契約説明書）から正しい書き方を把握できる
- スキーマ違反・import契約違反・bundle失敗のあるモックを`check`が非0 exitで検出でき、エージェントがその状態のモックを「完成」と報告しない（render時エラーは対象外。「受容済みリスク」参照）

## 背景

現状、AIはLismを十分に学習していないため、「まずAIに自由にデザインモックを作らせる → `lism-css-guide`でLism化する」という二度手間になっている。最初からLismベースでモックを組める仕組みがあればこれを解消でき、モック自体がLismの正しい書き方の見本・実装の下敷きになる。

方式はZenn CLI（zenn-editor・MIT）の`preview`と同じ「**アプリ本体（ビューア）はCLI同梱の固定配布物、ユーザーが書くのはデータファイルだけ**」の分離方式。スキルにviteプロジェクトのスキャフォールド手順を書く方式は、手順の陳腐化・モックごとのインフラ差分・エージェントの失敗ポイント増のため採らない（Issue「やらないこと」）。

## 前提（コードで裏取り済み）

- `packages/create-lism/tsup.config.ts`は`noExternal: [/.*/]`で`lism-cli`の依存を丸ごとバンドルしている → viteを`lism-cli`本体のdependenciesに入れると`pnpm create lism`のバンドルが破綻・肥大化する（別パッケージ分離の根拠）
- `lism-cli`はcommanderベース、Node `>=18.0.0`、依存は`@inquirer/prompts` / `commander` / `giget` / `jiti` / `picocolors`のみの軽量構成。サブコマンドは`packages/lism-cli/src/commands/`配下（create / init / skill / ui）
- パッケージ名・bin名の既存慣習: `@lism-css/mcp`がbin `lism-mcp`を持つ。UIパッケージは`@lism-css/ui`（`./react`・`./style.css`をエクスポート、`react` / `react-dom`はpeerDependencies）
- `@lism-css/plugin`はNode `^20.19.0 || >=22.12.0`。再利用対象の公開状況（`packages/plugin/package.json`のexportsと`src/builder/index.ts`で確認済み）：
  - **公開済み（`@lism-css/plugin/builder`エントリ）**: `serializeTokens(CONFIG: BuildConfig)`（トークンをCSS文字列化。`TOKEN_VAR_PREFIX` / `TOKEN_SCOPE`の変数名ルール・`.set--s`等への再宣言を処理済み）、`loadBuildConfigs()` / `computeBuildConfigs()`（デフォルトconfigとのdeep-mergeを含む`BuildConfig`構築）、`CONFIG_TARGET_ID` / `resolveConfigAliasPath()`（alias対象idと解決helper）
  - **未公開（内部実装のみ）**: `lismConfigAlias()`（`src/builder/vite-config-alias.ts`）。`lism-css/config.js`を指定configへaliasするviteプラグインで、`configPath`明示オプション・`optimizeDeps.exclude`への追加・config変更時のフルリロードまで実装済みだが、現在は`lismCss()`統合プラグインの内部でのみ使われ、`./vite`エントリからexportされていない → **PR 1で公開exportに追加する（実装プラン参照）**
- Reactコンポーネントの色props（`c` / `bgc`等）の`var(--…)`変換は、`lism-css`の`config/index.ts`が**モジュール初期化時に**`lism-css/config.js`を読むことで機能する。つまりトークン登録はLismコンポーネントのimportより前（=alias解決の仕組み）で行う必要がある
- viteの`import.meta.glob`はglob引数がリテラル必須・Vite root基準のため、固定ビューア側の静的コードから実行時指定の外部ディレクトリをglobできない（[Vite公式](https://vite.dev/guide/features.html#glob-import-caveats)）
- viteの`server.fs.allow`は「許可済みファイルからimportされたファイル」をallow外でも扱えるため、単独ではimport境界を保証できない（[Vite公式](https://vite.dev/config/server-options.html#server-fs-allow)）
- vite buildは既定でroot配下`dist/`へ書き込み、devは`node_modules/.vite`をキャッシュに使う → 読み取り専用の配布物（`pnpm dlx`のキャッシュ等）で動かすには出力・キャッシュ先の分離が必要
- スキルの配布元は`skills/`配下（現在は`lism-css-guide`と`lism-css-refactor`）。`lism-cli skill add`は個別スキル名の引数指定に対応しているが、**スキル間の依存を宣言・自動導入する仕組みはない**（`skillAddCommand(skillArg, options)`）
- `pnpm-workspace.yaml`は`packages/*`を含むため、新パッケージ追加時のワークスペース設定変更は不要

## 決定事項と採用理由

### パッケージ・コマンドの正本（実行契約）

- パッケージ名は`@lism-css/mock`、binは`lism-mock`（`@lism-css/mcp`→`lism-mcp`の既存慣習に合わせる）
- サブコマンドは次の3つ。`[dir]`はデータディレクトリで、省略時はカレントディレクトリ
  - `lism-mock init [dir]` — ひな形＋契約説明書の生成
  - `lism-mock dev [dir]` — devサーバー起動（ブラウザ確認用）
  - `lism-mock check [dir]` — 非対話の検証（エージェントの自己確認用）
- 未インストール環境では`npx @lism-css/mock init`等で実行できる（binが単一なのでnpxはそのまま解決する）
- `lism-cli mock`はv1では**案内のみ**のサブコマンドとして追加する。`@lism-css/mock`の実行コマンドを表示して終了するだけで、依存追加なし・Node 18のまま動く。spawnによる委譲はしない（Nodeバージョン差・初回ネットワーク失敗など失敗ポイントが増えるため）。スキルと契約説明書が案内する正本コマンドは`lism-mock`（または`npx @lism-css/mock`）とする
- vite + react + react-domを含む実体を`lism-cli`から分離する理由: create-lismのバンドル破綻回避（前提参照）。`@lism-css/mock`のNode要件はviteと`@lism-css/plugin`に合わせ`^20.19.0 || >=22.12.0`

### lism-css / lism-uiの同梱方針: 通常のdependencies

ビューアのビルド済み成果物に焼き込まず、`@lism-css/mock`の通常のdependencies（`lism-css` / `@lism-css/ui` / `react` / `react-dom`）としてnode_modulesから解決する。

- インストール時点のバージョンで固定され、CLIアップデートで更新される（特別な仕組み不要）
- `pnpm dlx` / `npx`での都度実行なら毎回最新
- `import { ... } from 'lism-css/react'`がCLI側のnode_modulesで解決されるため、実プロジェクトと同じ見た目のimportが自然に手に入る

モック内のimportを実プロジェクトと厳密に揃える契約は不要。Astroプロジェクト向けのモックでも`.jsx`（React）で組む。モックの目的は「デザインと、それを実装するクラス・コンポーネントが把握できること」のため。

### pages/の接続方式: CLIが列挙する仮想モジュール

`import.meta.glob`は使えない（前提参照）ため、次の方式で固定ビューアと外部データディレクトリを接続する。

- vite rootは**パッケージ内の固定ビューア**に向ける
- CLI内部のviteプラグインがデータディレクトリの`pages/`をスキャンし、仮想モジュール`virtual:lism-mock/pages`（画面一覧のメタデータ＋各ページの動的import）を生成してビューアへ供給する。ページ実体は絶対パスでimportする（`server.fs.allow`にデータディレクトリを含めることで許可）
- devではviteの`server.watcher`で`pages/`と`mock.config.json`・`tokens.json`を監視し、ページの追加・削除・config変更時に仮想モジュールをinvalidateしてフルリロードする
- **ページ列挙・スキーマ検証のロジックは`dev`と`check`で共通の関数に切り出し**、両者の結果が食い違わないようにする

### tokens.jsonの形式と反映経路

形式は**lism.config互換**（`{ color: { brand: "..." }, space: { "30": "..." } }`）。反映は「Reactランタイム（props→`var()`変換）」と「CSS変数定義」の2経路が必要で、次の一本道に確定する。

1. 起動時・`check`時に`tokens.json`を読み、スキーマ検証する。**契約違反（color以外への新キー追加・不正な型など）は警告にせず、`dev` / `check`とも非0終了する**（警告にすると`check`成功の意味が崩れるため）
2. 検証済みトークンから、一時ディレクトリにlism.config形式のconfigモジュール（JSファイル）を生成する
3. `lismConfigAlias({ configPath: 生成configのパス })`で`lism-css/config.js`をaliasする。`optimizeDeps.exclude`（事前バンドルへの焼き込み防止）と生成config変更時のフルリロードは既存実装がそのまま面倒を見る。**`lismConfigAlias()`は現在未公開のため、PR 1で`@lism-css/plugin`の`./vite`エントリ（`src/builder/vite.ts`）にre-export1行を追加して公開する**（mock側で同等プラグインを自作すると`optimizeDeps.exclude`・フルリロードのロジックが二重管理になるため再利用を選ぶ。統合プラグイン`lismCss()`をそのまま使わない理由: SCSSコンパイル・typegen等のモックに不要な機能を含むため）
4. CSS側は`loadBuildConfigs(projectRoot, { configPath: 生成configのパス })`で`BuildConfig`を構築し、`serializeTokens()`でCSS化してビューアに注入する（`:root`直書きしない理由: トークン種別ごとの変数名ルールと`.set--s` / `.set--bxsh`への再宣言が必要なため）。tokens-onlyの生成configを既定値とマージして構築できることは現行コードで確認済み（プランレビューでも検証済み）
5. `tokens.json`変更時はconfigモジュール再生成→フルリロード（部分HMRはしない。configが全コンポーネントに効くため追従しきれない — 既存`lismConfigAlias`と同じ判断）
6. `check`も1〜4と同じ検証・生成関数を通す

新キー追加は**colorのみ許可**。その他のトークンは既存キーの値上書きのみ（新キー対応は将来検討）。

- 理由: 実需要はプロジェクト固有のセマンティック色（`canvas` / `success`等）の追加が中心で、colorの新キーは既存機構（deep-merge＋propsの`var()`変換）だけで動くため追加コストが小さい
- 制約: 新キーのcolorにはProperty Classが生成されないため、props経由または`var()`直書きで使う旨を契約に明記する

### import境界: resolverでの強制（`server.fs.allow`は多層防御）

`server.fs.allow`だけでは境界を保証できない（前提参照）ため、CLI内部のviteプラグイン（`resolveId`フック）で境界を強制する。**このプラグインは`dev`と`check`の両方に適用する。**

規則は**importer（誰がimportしているか）で分類**して適用する。仮想モジュールによる正常なページ読み込みと、ユーザーファイルからの脱出拒否を両立させるため。

1. **信頼済みコード（`virtual:lism-mock/pages`・固定ビューア）からのページimport**: `virtual:lism-mock/pages`はCLI自身がページ列挙結果から生成するモジュールで、各ページを絶対パスでimportする。resolverは対象のrealpathがデータディレクトリ配下であること（=列挙結果に含まれること）を検証して許可する
2. **ユーザーファイル（realpathがデータディレクトリ配下のファイル）からのimport**: 次の2種類のみ許可する
   - 許可リストのbare import（下記）
   - データディレクトリ内で完結する相対import（解決結果のrealpathがデータディレクトリ配下であることを検証。`../`による脱出はエラー）
   - 上記以外 — **絶対パス指定・`/@fs/`直書き・許可外のbare import — は契約違反として明示的なエラーメッセージで拒否**する
3. **それ以外（ビューア自身のコード・vite内部モジュール）**: 通常解決

補足規則：

- **bare importの許可リストは「実在する公開exportのspecifier単位」で定義**し、パッケージ名の前方一致にしない。`@lism-css/ui`はルート`.`をexportしておらず、exportsは`./react`・`./react/Accordion`等の**個別エントリ**（`./react/*`ワイルドカードは存在しない）のため、前方一致で許可すると「許可済みなのにbundleできないspecifier」を生む。許可リストは起動時に対象パッケージの`package.json`のexportsマップから実在specifierへ展開して構築する。対象パッケージ: `react` / `react-dom` / `lism-css` / `@lism-css/ui` / アイコンライブラリ（未決事項1）。加えてJSX変換が注入する`react/jsx-runtime` / `react/jsx-dev-runtime`を許可する
- 許可bare importの解決は`@lism-css/mock`自身を起点に固定する。**解決には`import.meta.resolve()`等のESM（`import`条件）の解決を使う**。`createRequire()`は使えない — `lism-css` / `@lism-css/ui`の対象exportsは`import`条件のみで、require条件では解決に失敗するため（Node 20.19+要件なので`import.meta.resolve()`は利用可能）。許可外を「解決失敗任せ」にしない理由: CLIの依存ツリーに偶然存在するパッケージが解決できてしまう事故を防ぐため
- クエリ付きimport（`?raw` / `?url`等）は、クエリを除いたパス部分に同じ規則を適用する
- **相対importで許可する対象**: `.jsx` / `.tsx` / `.css` / 画像（`.png` / `.jpg` / `.jpeg` / `.gif` / `.svg` / `.webp`）。**`pages/`に付随するCSS・画像はv1から契約に含める**（Lismクラスだけで完結しないモックの実需要があるため）
- `server.fs.allow`はデータディレクトリ・固定ビューア・`@lism-css/mock`所有のnode_modulesに制限して多層防御として維持。localhost限定を既定とし、`allowedHosts: true`やCORS全許可は使わない

### `check`の保証範囲（v1）

`check`が保証するのは次の3点まで。**exit codeとエラー内容（対象ファイル・原因）をターミナルへ返す。**

1. `mock.config.json` / `tokens.json`のスキーマ検証
2. import境界検証（上記resolverと同一実装）
3. 全ページのbundle成功（vite buildで構文エラー・未解決import・変換エラーを検出。`build.write: false`でファイルは書き出さない）

**render時エラーは検出対象外**（default exportがReactコンポーネントでない、初回render中の例外、ブラウザAPI依存のエラー等）。これらは人間の`dev`ブラウザ確認に残す（「受容済みリスク」参照）。Node上でページを実行して検証する方式は、ブラウザAPI依存のページが偽陽性で落ちるためv1では採らない。

### 対応拡張子とJSX変換: `.jsx` / `.tsx`の両方をv1から受け入れ

viteのesbuild変換は型を解決せず剥がすだけなので`.tsx`受け入れのコストはほぼゼロ。**型チェックは行わない**ことを明記する（エージェントはTSXを書きがちなので、拒否するより受け入れる方が失敗ポイントが減る）。

devのJSX変換は`@vitejs/plugin-react`を採用する（Fast Refresh込みの標準構成）。境界resolverは、変換が注入するモジュール — dev時の`react/jsx-dev-runtime`、Fast Refreshの`/@react-refresh`等のプラグイン内部モジュール — を信頼済みとして誤拒否しない。`.jsx` / `.tsx`ページがdevサーバーで実際に表示されることは統合テストで確認する（変換方式を将来変えてもテストで吸収できるようにする）。

### 画面一覧の正本は`pages/`の自動発見

`mock.config.json`の画面リストを正本にせず、`pages/`配下のファイルを自動発見して画面一覧にする。`mock.config.json`はラベル・並び順・カテゴリ等のメタデータ上書きのみ。理由: config登録を正本にすると「ページを追加したのに登録を忘れて表示されない」というエージェントの失敗パターンを生むため。

スキーマの基本事項も確定する：

- **ページID** = `pages/`からの相対パスから拡張子を除いたもの（例: `pages/dashboard.jsx` → `dashboard`）。ビューアのURLクエリにもこのIDを使い、共有URLを環境・列挙順に依存させない
- 同名で`.jsx`と`.tsx`が並存した場合はID衝突として`dev` / `check`ともエラー
- 並び順の既定はIDの辞書順。`mock.config.json`で上書き可能
- `mock.config.json`が実在しないページIDを参照している場合は契約違反としてエラー（自動発見が正本のため、幽霊参照はエージェントの消し忘れ・タイポのシグナル）
- `schemaVersion`は必須とし、`dev` / `check`の開始時に検証する

### `init`の衝突・失敗時の挙動

- 生成予定ファイルの衝突を**事前に全件チェック**し、1件でも既存ファイルがあれば**無変更で非0終了**する（衝突ファイルの一覧を表示）
- `--force`オプションで上書き続行できる
- 生成中のI/O失敗時は、生成済みファイルの一覧を表示して非0終了する（部分生成が残ることをメッセージで明示し、再実行手順を案内する）

### ページ内ロジックの規約

- `useState`やイベント処理は許可
- API通信・認証・永続化・業務ロジックは対象外
- JSXは任意コードなので「信頼できるモックのみ実行する」旨をドキュメントに明記

### エージェント利用の成立要件（3点）

1. **非対話の検証コマンド`lism-mock check`**: devサーバーのエラーオーバーレイはブラウザにしか出ないため、上記保証範囲をターミナルで検証できるコマンドを用意する。これがないとエージェントは壊れたモックを「完成しました」と報告してしまう
2. **devサーバーの扱いをスキルで明示**: 常駐プロセスのためフォアグラウンド実行すると作業が止まる。「バックグラウンドで起動 or ユーザーに起動してもらう」「エージェント自身の確認は`check`で行う（ブラウザ確認はユーザーの役割）」を手順書に明記
3. **`lism-mock init`でひな形＋契約説明書を生成**: 正しい形式のサンプル一式（サンプルページ・`tokens.json`・`mock.config.json`）と、データ契約の要約を書いた説明書（README / AGENTS.md）を生成する。スキル未導入環境でも「init実行 → 生成物を見て真似る」で正しく書ける。スキルがある場合も初手が「まずinit」で統一される

### スキルの依存関係: 依存メタデータ機構は作らない（v1）

新スキルは`lism-css-guide`併用が前提だが、`lism-cli skill add`にスキル間依存の宣言・自動導入機構をv1では追加しない。代わりに：

- 新スキル本文の冒頭と`init`が生成する契約説明書に「`lism-css-guide`併用が必須」であることを明記する
- 導入手順としては引数なしの`lism-cli skill add`（全スキル一括導入）を推奨として案内する

## 実装プラン

### Phase 1: データ契約仕様の策定＋`@lism-css/mock`パッケージ実装（PR 1）

`packages/mock/`（npm名`@lism-css/mock`、bin `lism-mock`）を新規作成する。あわせて`packages/plugin`へ最小変更を1点入れる（このPRで両パッケージを変更する）。

0. **`@lism-css/plugin`の公開export追加（最小変更）**: `src/builder/vite.ts`に`export { lismConfigAlias, type LismConfigAliasOptions } from './vite-config-alias';`を追加し、`@lism-css/plugin/vite`から利用可能にする。既存の`lismCss()`の挙動は変えない
1. **データ契約の仕様確定**（パッケージREADMEとして同梱。`init`の契約説明書はこの要約）
   - `tokens.json`のスキーマ（lism.config互換の範囲、colorのみ新キー許可、違反はエラー）
   - `mock.config.json`の項目定義（`schemaVersion`必須、ページID・ラベル・並び順・カテゴリ。スキーマ基本事項は決定事項参照）
   - importホワイトリストと相対importの許可範囲（決定事項参照）
   - ページ規約（default export、`useState`可、業務ロジック不可）
2. **共通コア**（`dev` / `check`で共有する関数群）
   - データディレクトリの検証（存在・`schemaVersion`・`pages/`）
   - ページ列挙（ID採番・`.jsx`/`.tsx`衝突検出・`mock.config.json`とのマージ）
   - `tokens.json`の検証とconfigモジュール生成・`serializeTokens()`によるCSS化
   - import境界を強制するviteプラグイン（`resolveId`）と仮想モジュール`virtual:lism-mock/pages`の供給プラグイン
3. **ビューア**（パッケージ内の固定React app）
   - 画面ギャラリー表示（カテゴリ分けナビ付き）
   - URLクエリでのページID指定と履歴連動（特定画面のURL共有）
   - ダークモード切り替え（`set--dark`トグル）
   - CSS読み込み順: lism-cssのCSS → `@lism-css/ui/style.css` → tokens生成CSS → ページ付随CSS（トークン上書きが効く順序を統合テストで確認）
4. **`dev`コマンド**（viteの`createServer`を使う薄いラッパー）
   - `configFile: false`でユーザー側のvite設定を読まない。rootは固定ビューア
   - `lismConfigAlias()`で`lism-css/config.js`を生成configへalias
   - `server.fs.allow`制限・localhost限定（決定事項参照）
   - `cacheDir`はプロセス固有の一時ディレクトリに向け、終了時にcleanupする（読み取り専用配布物・並行起動への対応）
   - `pages/`・`mock.config.json`・`tokens.json`の監視と仮想モジュールinvalidate＋フルリロード
5. **`check`コマンド**: スキーマ検証＋import境界検証＋全ページのbundle検証（`build.write: false`）。exit codeとエラー内容（対象ファイル・原因）をターミナルへ
6. **`init`コマンド**: 事前衝突チェック→サンプル一式＋契約説明書の生成（`--force`対応）
7. **`lism-cli mock`サブコマンド**: `@lism-css/mock`の実行コマンドを案内するのみ（`packages/lism-cli/src/commands/`に追加。依存追加なし）
8. **テスト**: リポジトリ慣習に合わせvitestでcolocated（`*.test.ts`）。「失敗・競合の確認」の各行＋一時データディレクトリを使ったdev / buildの統合テスト

### Phase 2: エージェントスキル作成（PR 2）

`skills/`配下に新スキルを作成する（スキル名は`lism-mock-guide`を想定。Phase 2開始時に確定）。

- 内容は「データ契約の仕様＋Lismベースでモックを組むワークフロー」のみの薄い構成。実装の詳細指針は`lism-css-guide`参照で重複させない
- ワークフローに明記する事項：
  - `lism-css-guide`併用が必須（冒頭に記載）
  - 初手は`lism-mock init`
  - devサーバーはバックグラウンド起動またはユーザー起動。エージェント自身の確認は`lism-mock check`（checkの保証はビルド検証まで、render確認はユーザーの役割）
  - colorの新キートークンはProperty Classが生成されない（props / `var()`直書きで使う）
- `skills/`配下の既存ルールに従う（各ファイル260行以下目安、頻出違反は先頭200行以内、MCPの案内はしない）

### PR分割の理由

パッケージ本体（契約仕様含む）とスキルの2 PR構成。スキルは確定した契約仕様を参照して書くため、パッケージ側を先にマージする依存関係がある。契約仕様だけを先行PRにはしない（実装しながら仕様の穴が見つかるのが確実なため、仕様と実装は同一PRで固める）。

## 未決事項・要確認・事前準備

1. **importホワイトリストに含めるアイコンライブラリの選定**: 同梱するdependenciesが増えるため、何を入れるか（入れないか）を実装開始前に決める
2. **状態バリアント切り替えのビューア機能**: 「ページがバリアントを宣言 → ビューアのUIで切り替え」の外出し案をv1に入れるか。入れない場合も、`mock.config.json`スキーマの将来拡張（`schemaVersion`更新）で追加できる設計であることをPhase 1で確認する

（解消済み: `serializeTokens()` / `loadBuildConfigs()` / `computeBuildConfigs()`は`@lism-css/plugin/builder`の公開APIで、`loadBuildConfigs(projectRoot, { configPath })`によるtokens-only構築が可能なことも確認済み。`@lism-css/mock`のdependenciesに`@lism-css/plugin`を追加して使う）

## 不変条件

- ページからimportできるのは「許可リストのbare import（mockパッケージ所有のnode_modulesへ解決）」と「データディレクトリ内の相対import」のみ。データディレクトリ外のファイルはdevサーバー経由でもcheck経由でも読めない
- devサーバーはlocalhost限定で、`server.fs.allow`はデータディレクトリ・固定ビューア・mockパッケージのnode_modulesのみ
- `dev`と`check`は同一の列挙・検証・境界ロジックを通る（`check`成功なのに`dev`で表示されない、の不一致を作らない）
- `lism-cli`本体のdependenciesにvite / react系を追加しない（create-lismのバンドルサイズと動作を壊さない）
- `check`が失敗するモックをスキルのワークフロー上「完成」とさせない
- `schemaVersion`が検証できないデータディレクトリでは`dev` / `check`とも動作しない
- `init`は`--force`なしで既存ファイルを一切変更しない

## 失敗・競合の確認

| 場面 | 期待する動作 | 検証方法 |
| --- | --- | --- |
| ページの構文エラー・未解決import | `check`が非0 exitし、対象ファイルとエラー内容を表示 | ユニットテスト |
| `schemaVersion`欠落・非対応バージョン | `dev` / `check`ともエラー停止し、修正方法を案内 | ユニットテスト |
| `tokens.json`の契約違反（color以外への新キー・不正な型） | `dev` / `check`とも非0終了（警告扱いにしない） | ユニットテスト |
| 許可外のbare import | resolverが契約違反として明示エラー（dev / check両方） | ユニットテスト |
| ユーザーファイルからのデータディレクトリ外参照（`../`・絶対パス・`/@fs/`・`?raw`等クエリ付き） | resolverが拒否しエラー表示（dev / check両方）。仮想モジュール経由の正規ページimportは通る | ユニットテスト |
| `.jsx` / `.tsx`の同名ページ | ID衝突としてエラー | ユニットテスト |
| `mock.config.json`が実在しないページIDを参照 | 契約違反としてエラー | ユニットテスト |
| `pages/`が空・データディレクトリ不正 | 分かりやすいエラーメッセージで停止 | ユニットテスト |
| `init`実行先に既存ファイルがある | 無変更で非0終了し衝突一覧を表示。`--force`で上書き | ユニットテスト |
| `init`途中のI/O失敗 | 生成済み一覧を表示して非0終了（部分生成の明示と再実行案内） | ユニットテスト |
| devサーバーのポート競合 | viteの既定挙動（自動で別ポート）に従う | 手動確認 |
| 複数プロジェクトでの並行起動 | プロセス固有`cacheDir`により干渉しない | 統合テスト |

## 受容済みリスク・対象外

- **render時エラーは`check`の対象外**: default exportがReactコンポーネントでない、初回render中の例外、ブラウザAPI依存のエラーは`check`では検出されない。人間の`dev`ブラウザ確認の役割とする（スキル・契約説明書にも`check`の保証範囲を明記）。Node上でのrender検証はブラウザAPI依存ページの偽陽性があるためv1では見送り
- **JSXは任意コード実行**: サンドボックス化はしない。「信頼できるモックのみ実行する」のドキュメント明記で受容
- **`init`のI/O失敗時に部分生成物が残り得る**: 事前衝突チェックで通常ケースは防ぎ、異常時は生成済み一覧の表示と再実行案内で受容
- **ユーザープロジェクトのlism-cssバージョンとの厳密一致は求めない**: 主にプロジェクト初期のモック作成用途のため
- **color以外のトークン新キー追加**: 将来検討
- **型チェック**: 行わない（`.tsx`はesbuildで型を剥がすだけ）
- **静的HTML生成方式・スキャフォールド方式・`lism-cli mock`のspawn委譲**: 採用しない

## 完了条件 / テスト方針

- `init` → `check` → `dev`のスモークが通る（initの生成物が無修正でcheck成功・ブラウザ表示できる）
- `check`は「失敗・競合の確認」の各行をユニットテストでカバーする
- 一時データディレクトリを使ったdev / buildの統合テストを持つ（仮想モジュール供給・import境界・トークン反映はモック中心のユニットテストだけでは保証できないため）。次のケースを含める：
  - `.jsx` / `.tsx`ページがdevサーバーで実際に表示される（JSX変換・Fast Refresh注入モジュールの誤拒否検出）
  - 親側（データディレクトリの上位）に同名パッケージ（`react`等）を置いても、`@lism-css/mock`所有のnode_modulesへ解決される
  - 許可リストの実在specifierのimportが成功し、存在しないサブパス（例: `@lism-css/ui/react/存在しない名前`）が拒否される
- `tokens.json`のcolor新キーが、Reactコンポーネントのprops（`c`等）経由で`var(--…)`に変換されて描画に反映される
- space等の上書きトークンが`.set--s`スコープを含め正しくCSS化され、ビューアのCSS読み込み順（lism-css → `@lism-css/ui/style.css` → tokens生成CSS → ページ付随CSS）でトークン上書きが効く
- packした`@lism-css/mock`を親にReact等がない環境へインストールし、`init` → `check`が通る配布形態のスモークテストを行う（CIまたはリリース前の手動手順として整備）
- `nr build`（固定ビューア・binの配布漏れ検出）・`nr lint` / `nr typecheck` / `nr test`が通る
- スキルはデータ契約と齟齬がないこと（契約説明書とスキル本文の二重管理になるため、レビューで突き合わせる）
