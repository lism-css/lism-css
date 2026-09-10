基準日: 2026-09-10・コミットd8b6ba43

# 制作データ用スクリプト

以下のコマンドは、リポジトリのルートディレクトリから実行してください。Illustratorを操作する手順では、macOS上でIllustratorを起動しておく必要があります。

`mapping.json`にはPhosphor Iconsとの対応を、`config.mjs`には対象アイコン・配置・点の設定を定義しています。`gen-jsx.mjs`は、`ai/`のテンプレートからIllustratorで実行するJSXファイルを生成します。生成したファイルには実行環境の絶対パスが含まれるため、Gitにはコミットしないでください。

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
