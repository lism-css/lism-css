基準日: 2026-09-12・コミットe76345fc（作業ツリーの変更を含む）

# 制作データの同期と書き出し

設計用.aiの原寸マスターから、出力用.ai、SVG、React/Astroコンポーネントの順に生成します。Illustratorが必要なのは.aiの同期とSVG書き出しだけです。SVGからのパッケージビルドはIllustratorなしで実行できます。

## 編集元

編集元は`design/original/lism-icons-geometric-study.ai`の`01 Editable masters - 24px`レイヤーです。原寸マスターはregular・fill一覧の位置にあります。各アイコンを名前付きグループにし、塗りも線もない24×24の矩形をグループに含めて座標枠を保ちます。名前は小文字のkebab-caseとし、SVG名・コンポーネント名になります。

`design/lism-icons.ai`は同期で作り直す出力専用ファイルです。原寸アートボードとアイコンだけを持ち、ガイド・一覧・説明は含みません。出力用.aiや生成済みSVGへの編集は、次の同期で置き換わります。

アイコンの設計・一覧・作図説明の扱いは[設計文書](../design/original/design.md)を参照してください。

ガイドの共通シンボルと透明な座標枠は設計用.aiだけで使います。同期は原寸マスターレイヤーのみを読み取り、原寸内部にシンボルがあれば出力を変更する前に停止します。ガイドの整理・再配置は[edit-iconsの制作操作](../../../.claude/skills/edit-icons/references/editing.md#制作操作)で行い、ビルドから設計用.aiの配置を変更しません。

## 設計からパッケージへ同期する

Illustratorで設計用.aiの編集を保存してから、`packages/icons/`で実行します。

```bash
nr sync:design
```

書き出し後、リポジトリのルートでビルドします。アイコンパッケージ、コアの組み込みプリセット、コアの配布ファイルまで依存順に更新します。

```bash
nr build:icons
```

`sync:design`は次を順に行います。

1. マスターレイヤーのグループを読み取り、出力用.aiを生成する。
2. 出力用.aiの全アートボードを一時ディレクトリへSVGで書き出す。
3. SVGを検証し、`src/svg/`へ反映する。削除・改名された旧SVGも取り除く。
4. SVGからReact/Astroコンポーネントと共通データを生成する。

既存の出力用.aiは実行ごとの一時ディレクトリへバックアップします。保存前の出力用.aiが開かれている場合は、変更を保護するため停止します。一時ディレクトリの場所はコマンドが表示します。

収録数・順序・元の配置・個別のドット数や角丸を固定値で検証しません。出力に必要な24×24の座標枠、名前、SVGの対応形式を確認します。コンポーネント名の衝突を避けるため、ハイフンの有無だけが異なる名前は併用できません。

`src/svg/`の全入力が検証できてから置き換えます。空の書き出しや不正なSVGでは現在のSVGを変更しません。アイコンの追加・削除で収録一覧の設定を更新する必要はありません。

## 各段階を個別に実行する

以下はリポジトリのルートディレクトリで実行します。

```bash
icons_work_dir=$(mktemp -d)
na exec node packages/icons/scripts/gen-jsx.mjs "$icons_work_dir"
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/01-sync.jsx"
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/02-export.jsx"
na exec node packages/icons/scripts/verify-export.mjs "$icons_work_dir/export/SVG"
na exec node packages/icons/scripts/import-svg.mjs "$icons_work_dir/export/SVG"
nr build:icons
```

`gen-jsx.mjs`には`--source-path {設計用.ai}`と`--ai-path {出力用.ai}`を指定できます。生成したJSXには実行環境の絶対パスが含まれるため、Gitにはコミットしません。

出力用.aiをそのまま書き出したい場合は、新しい一時ディレクトリにスクリプトを生成し、`01-sync.jsx`を省いて`02-export.jsx`から実行します。

## SVGの正規化と生成

`generate.mjs`は`src/svg/`のSVGを列挙して、`src/react/`、`packages/astro/`、`src/data.ts`へ生成します。これらはGitで管理します。`--check`は生成物の一致を読み取り専用で確認します。削除されたアイコンの生成ファイルは通常の生成時に取り除きます。

`normalize-svg.mjs`は背景・ID・グループを除き、継承属性を反映して色を`currentColor`へ揃えます。幾何形状と描画順を保ち、線幅や線・塗りの併用は実データから引き継ぎます。`-fill`という名前だけで線の有無を決めません。24グリッド以外や、style・transform・外部参照など非対応の入力はエラーにします。

パッケージディレクトリで`nr test`、`nr typecheck`、`nr lint`を実行できます。テストでは追加・削除、異常時の非破壊性、生成の再現性、React/Astroでの描画、属性の上書き、tree-shakingを確認します。

## Lism CSSのプリセットへ反映する

コアへ同梱するアイコンは`config.mjs`の`coreIconNames`で選びます。これはパッケージ全体の収録一覧ではありません。SVGが存在する名前だけが共通データのコア一覧へ出力されます。

`lism-css`のIconプリセットは、コアのビルド時に`bin/generate-icon-presets.mjs`が`@lism-css/icons/data`から生成します。[設計からパッケージへ同期する手順](#設計からパッケージへ同期する)のビルドには、この更新も含まれます。

反映後の確認は`packages/lism-css/`で行います。

```bash
nr gen:icons:check
nr test:icon:astro
```

Illustrator固有の制約は[自動化の注意点](../../../documents/illustrator-automation.md)を参照してください。
