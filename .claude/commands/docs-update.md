# Docs Update

`apps/docs` 内の MDX ファイルを最新のソースコードと照合し、古い記述や誤りがあればチェック・修正してください。

対象ファイルやディレクトリが指示されていればその対象範囲のみ修正する。
未指定なら全 mdx ファイルを対象とする。


## 情報の優先順位

1. **パッケージソース（絶対基軸）**: `packages/lism-css/` と `packages/lism-ui/` のソースコードが常に正
2. **ドキュメント（更新対象）**: `apps/docs/` の MDX は更新対象。ソースと矛盾していればソースに合わせる

### ソースの参照先

| 確認したい内容 | 参照先 |
|---|---|
| コンポーネントの Props 定義・デフォルト値 | `packages/lism-css/config/defaults/**` |
| CSS の仕様（クラス名・変数・トークン） | `packages/lism-css/src/scss/` |
| React コンポーネントの実装 | `packages/lism-css/src/components/**/*.tsx` |
| Astro コンポーネントの実装 | `packages/lism-css/packages/astro/**/*.astro` |
| lism-ui コンポーネントの実装 | `packages/lism-ui/src/components/` |


## 対象ファイルの分類とグルーピング

| グループ | ディレクトリ | 内容 | 照合対象 |
|---|---|---|---|
| A | `core-components/` | Lism コアコンポーネント | `lism-css` のコンポーネント・Props 定義 |
| B | `modules/` | CSS モジュール | `lism-css` の SCSS・コンポーネント |
| C | `props/` | Props システム | `lism-css` の config・SCSS |
| D | `ui/`（`examples/` 除く） | `@lism-css/ui` コンポーネント | `lism-ui` のソース |
| E | `ui/examples/` | コンポーネント組み合わせ例 | `lism-css` のコンポーネント |
| F | その他（`overview.mdx` 等） | 概要・導入ガイド | `package.json`、実際の設定 |

※ ファイル数が少ないグループは統合して構わない


## 作業手順

### 1. 対象ファイルの特定

- `$ARGUMENTS` でファイルやディレクトリが指定されていれば、そのファイルのみ対象とする
- 指定がなければ `apps/docs/src/content/ja/` 配下の全 `.mdx` ファイルを対象とする
- ただし `_demo/` 配下は除外する
- 対象ファイルをディレクトリ別にグルーピングする

### 2. サブエージェント並列起動

`lism-docs-editor` サブエージェント（sonnet）をグループ単位で並列起動する。

各サブエージェントには以下を伝える：
- 担当する mdx ファイルパスの一覧
- 参照すべきソースファイルのパス一覧（内容はサブエージェント自身が読み取る）
- チェック観点（下記参照）

### 3. チェック観点

各 mdx ファイルについて、以下の観点でチェックする：

1. **Props の正確性**: Props 名、型、デフォルト値が最新のソースと一致しているか
2. **コード例の正確性**: JSX のコード例が現在のコンポーネント API で動作するか
3. **HTML 出力例の正確性**: 出力される HTML（クラス名、属性）が最新の SCSS と一致するか
4. **import パスの正確性**: `lism-css/astro`, `@lism-css/ui/astro` 等のパスが正しいか
5. **リンク切れ**: 内部リンク（`/docs/...`）の参照先が存在するか
6. **説明文の正確性**: 機能の説明がソースの実際の挙動と一致しているか
7. **ダミーコンポーネントの不使用**: `/ui/` 以外の MDX の `<PreviewCode>` 内コードブロックで `<DummyText>` や `<DummyImage>` が使われていないこと。`<PreviewArea>` 内は許容。コード例では実際のテキスト・HTML要素を直接記述する。テキスト内容は `packages/lism-ui/src/components/DummyText/texts.ts` を参照
8. **PreviewArea 内のテキスト独立行**: `<PreviewArea>` 内の JSX 式において、テキストだけが独立した行になっているケース（`[インデント][テキスト][改行]` のパターン）がないかチェックする。Astro の MDX 解釈により、JSX コンポーネントの子要素としてテキストが独立行にあると `<p>` タグが自動生成されてしまうため、そのようなテキストは `<Fragment>` で囲う必要がある。ただし `<DummyText />` 等の自己閉じコンポーネントや、JSX タグの開始・終了行はテキストではないので対象外。
   - NG: `<Hoge>\n    テキスト内容\n  </Hoge>`（テキストが独立行）
   - OK: `<Hoge>テキスト内容</Hoge>`（1行に収まっている）
   - OK: `<Hoge>\n    <Fragment>テキスト内容</Fragment>\n  </Hoge>`（Fragment で囲っている）

### 4. 差分サマリーの報告

各サブエージェントの結果をまとめて、変更点のサマリーをユーザーに報告する。
修正はサブエージェントが1パスで実施済み。ユーザーは `git diff` で確認できる。


## レイアウトモジュール (`modules/l--*.mdx`) の構成テンプレート

`l--*.mdx` ファイルはセクション構成が統一されている。更新時もこの構成を維持すること。

```
---
title / description
---

import文

導入文（モジュールの概要説明）

## CSS                              ← CSSファイルがある場合のみ（box は省略）

<SrcCode path='src/scss/modules/layout/_xxx.scss' />

## Lismコンポーネント                  ← en: ## Lism Component

### Import

<ImportPackage component='Xxx' />

### 専用Props                        ← en: ### Props（専用Propsがある場合のみ）

| プロパティ | 説明 |
|---|---|
| ... | ... |

## Usage

### サブタイトル1                     ← 各例に ### 見出しを付ける（目次に表示される）

<Preview>...</Preview>

### サブタイトル2

<Preview>...</Preview>
```

### 構成上の注意点

- **CSS セクション**: `<SrcCode>` を使用（`<EmbedCode>` は使わない）
- **専用Props**: そのコンポーネント固有のPropsのみ記載。Grid/Flex等の共通Propsへの参照リンクは不要
- **Usage の見出し**: 全ての使用例（またはグループ）に `###` 見出しを付与する
- **追加セクション**: flow（`## l--flow を入れ子にする時の注意点`）、sidemain（`## Grid を使って似たレイアウトを構成する例`）のように、Usage 後に補足セクションがある場合はそのまま維持する
- **sidemain の CSS**: SrcCode の後に基本構造図（`.is--side` の説明）を配置する


## 注意事項

- ソースに存在しない情報を推測で追加しないこと
- 文体は「です・ます調」を維持すること（`apps/docs/CLAUDE.md` 参照）
- `memo:` や `NOTE:` で始まるコメントは削除禁止
- mdx 内の `<Preview>`, `<PreviewCode>` 等の構造は変更しないこと
- 修正内容は最小限にとどめ、文体やフォーマットの変更は行わない
- フォーマットの統一化は本コマンドの目的外。内容の正確性チェックに集中すること
