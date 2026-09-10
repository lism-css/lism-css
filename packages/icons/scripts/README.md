基準日: 2026-09-10・コミットb8a6133e（作業ツリーの変更を含む）

# 制作データ用スクリプト

以下のコマンドは、リポジトリのルートディレクトリから実行してください。Illustratorを操作する手順では、macOS上でIllustratorを起動しておく必要があります。

`mapping.json`にはPhosphor Iconsとの対応を、`config.mjs`には対象アイコン・配置・点の設定を定義しています。`gen-jsx.mjs`は、`ai/`のテンプレートからIllustratorで実行するJSXファイルを生成します。生成したファイルには実行環境の絶対パスが含まれるため、Gitにはコミットしないでください。

アートボードは、コアの収録候補を上段に、追加パッケージ専用のアイコンを下段に配置します。下段では線を使うアイコンと塗りだけのアイコンの間にも余白を設けています。コア候補の一覧は`config.mjs`の`coreIconNames`で管理しています。

線と塗りを組み合わせるアイコンは`config.mjs`で`mixed: true`を指定します。検証では、線と塗りの両方が存在することを確認します。

## アートボードを並べ替える

Illustratorで編集元を開き、変更を保存してから実行してください。`config.mjs`の区分と配置に合わせて、アートボードと対応する絵を一緒に移動します。形状は作り直しません。

```bash
icons_work_dir=$(mktemp -d)
na exec node packages/icons/scripts/gen-jsx.mjs "$icons_work_dir/scripts"
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/scripts/06-relayout.jsx"
```

移動前に名前・グループ・線幅・点を検証し、同じ一時フォルダに`before-relayout.ai`を保存します。移動後も検証を行い、編集元を保存します。バックアップの上書きを防ぐため、実行ごとに新しい一時フォルダを使ってください。

## IllustratorファイルからSVGを書き出す

Illustratorで`packages/icons/design/lism-icons.ai`を開き、変更を保存してから実行してください。

```bash
icons_work_dir=$(mktemp -d)
na exec node packages/icons/scripts/gen-jsx.mjs "$icons_work_dir/scripts"
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/scripts/04-verify.jsx"
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/scripts/05-export.jsx"
na exec node packages/icons/scripts/verify-export.mjs "$icons_work_dir/scripts/export/SVG"
```

検証スクリプトは、ファイル一覧・viewBox・名前・線幅・点・角丸を確認します。不一致があればエラーを表示し、終了コード1を返します。書き出し処理でIllustratorファイルが変更されることはありません。

検証に成功したSVGを`packages/icons/src/svg/`へコピーします。アイコンを削除・改名した場合は、コピー先に残っている旧ファイルも削除してください。コピー後も同じ検証スクリプトで確認できます。

## コンポーネントを生成する

`generate.mjs`は`src/svg/`を正規化し、React・Astroコンポーネントと共通データを生成します。

```bash
na exec node packages/icons/scripts/generate.mjs
na exec node packages/icons/scripts/generate.mjs --check
nr build:icons
```

生成先は`src/react/`、`packages/astro/`、`src/data.ts`です。これらはGitで管理します。`--check`は書き込みを行わず、入力と生成物の不一致を検出します。全入力の検証と整形が成功してから書き込み、削除されたアイコンの古い生成ファイルも取り除きます。

`normalize-svg.mjs`は背景・ID・グループを除き、継承属性を反映して色を`currentColor`へ、線幅をルートへ集約します。円や角丸などの形状と描画順は維持します。線の結合方法などの例外と、混合アイコンの塗り指定は各要素に残します。24グリッド以外や、style・transform・外部参照など非対応の入力はエラーにします。

パッケージディレクトリで`nr test`、`nr typecheck`、`nr lint`を実行できます。テストでは生成の再現性、Reactでの描画、Astroでのビルド、属性の上書き、tree-shakingを確認します。ビルドとテストにIllustratorやGit LFSは不要です。

## コアのプリセットへ反映する

`lism-css`のIconプリセット（`src/components/atomic/Icon/presets.ts`）と`THIRD_PARTY_LICENSES`は、`bin/generate-icon-presets.mjs`が`@lism-css/icons/data`から生成します。`nr build:core`のビルド中に自動で実行されるため、`nr build:icons`のあとにビルドすれば反映されます。

```bash
nr build:core
```

反映後は`packages/lism-css`で次を実行し、生成物の鮮度とAstroでの描画を確認します。`test:icon:astro`はCIに含めていない手動の検証で、コア34種の線描画・`weight`と線幅指定・外部SVG・`@lism-css/ui`のAlert / Calloutを実際に`astro build`して確認します。

```bash
nr gen:icons:check
nr test:icon:astro
```

## 元のSVGから初期形状を再作成する

`design/raw/`のSVGから、新しいIllustratorファイルを作成できます。制作開始後に加えた変更は含まれないため、現在編集中のファイルとは別の保存先を指定してください。

```bash
icons_work_dir=$(mktemp -d)
na exec node packages/icons/scripts/gen-jsx.mjs "$icons_work_dir/scripts" --ai-path "$icons_work_dir/rebuilt.ai"
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/scripts/01-create.jsx"
for icons_jsx in "$icons_work_dir/scripts"/02-place-*.jsx; do
  bash packages/icons/scripts/run-ai.sh "$icons_jsx" || break
done
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/scripts/03-convert-dots.jsx"
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/scripts/04-verify.jsx"
bash packages/icons/scripts/run-ai.sh "$icons_work_dir/scripts/05-export.jsx"
na exec node packages/icons/scripts/verify-export.mjs "$icons_work_dir/scripts/export/SVG"
```

各コマンドが成功したことを確認してから、次の手順へ進んでください。作成処理は既存のファイルを上書きせず、開いている他のドキュメントにも影響しません。配置時には重複を確認し、角丸を補正したうえで線幅も含めて縮小します。点の変換は、すべての対象が検証を通過してから行います。

Illustrator固有の制約については、[自動化の注意点](../../../documents/illustrator-automation.md)をご覧ください。
