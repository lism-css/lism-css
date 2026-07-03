
# package更新を反映

`packages/lism-css`や`packages/lism-ui`側の実装（Props・CSS・コンポーネント）が変わった際、`apps/docs`のMDXドキュメントが古い記述のままになっていないか照合・修正するには`/docs-update`コマンドを使う。

`/docs-update`は`lism-docs-editor`サブエージェントをディレクトリグループ単位で並列起動し、Props名・コード例・HTML出力・importパス・リンク切れなどをソースコードと突き合わせて1パスで修正する（詳細は`.claude/commands/docs-update.md`を参照）。

## cdn読み込みの紹介部分のバージョン番号を更新する処理

`packages/lism-css`のバージョンを上げても、`installation.mdx`等に書かれたCDN URL（`cdn.jsdelivr.net/npm/lism-css@x.y.z/...`）のバージョン番号は自動では更新されない。`nr sync:cdn-versions`を実行すると、`packages/lism-css/package.json`の`version`を読み取り、対象ファイル（`apps/docs`のinstallation.mdx/base-styles.mdx、ルートとlism-cssパッケージのREADME.md、`packages/mcp/src/data/overview.json`）内のCDN URLを一括で書き換える。

# 翻訳

`content/ja/`のMDXを正として`content/en/`に翻訳・同期するには`/docs-translation`コマンドを使う。ja/とen/の差分を検出して新規作成・更新・削除・スキップに分類し、ユーザーの実行確認を得たうえで`lism-docs-translator`サブエージェントを並列起動して翻訳する（詳細は`.claude/commands/docs-translation.md`を参照）。

使い方

## 全ファイルを同期
`ja/`配下の全`.mdx`ファイルを対象にする。

```
/docs-translation
```

## content/ja直下のみ
サブディレクトリを除外し、`ja/`直下のファイルのみ対象にする。

```
/docs-translation root
```

## 特定ディレクトリのみ
指定したディレクトリ配下のみ対象にする。

```
/docs-translation ui/
```

## 特定ファイルのみ
指定した1ファイルのみ対象にする。

```
/docs-translation overview.mdx
```


# llms.txtの更新

`llms.txt`を個別に更新するコマンドは無い。`nr build:docs`（Astroビルド）実行時に、ビルド後のHTMLを処理する`docs-md` integration（`apps/docs/src/integrations/docs-md/`）が`content/en/`配下のMDXフロントマターを集計して`dist/llms.txt`を自動生成する。処理の詳細は`documents/docs-md.md`を参照。
