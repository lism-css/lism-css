---
description: skills/lism-css-guide/ の各ファイルを最新ソースと照合して更新する
---

# Skill Template Update

`skills/lism-css-guide/` 配下のルートファイル＋サブフォルダ（`primitives/` / `trait-class/` / `property-class/`）配下の詳細ファイルを、最新ソースに合わせて更新してください。`antipatterns*.md` と `references/` 配下は限定チェックのみ行います（後述の「限定チェック対象ファイル」を参照）。


## 対象ファイルと更新内容

### ルート直下の基本ファイル

| ファイル | 更新内容 | 主なソース参照先 |
|----------|----------|-----------------|
| `SKILL.md` | バージョン情報・パッケージ構成・import パス・実装ルール・詳細ファイル一覧・「クラス単位の詳細リファレンス」のリンク一覧 | `packages/lism-css/package.json`, `packages/lism-ui/package.json`, 各パッケージの exports |
| `base-styles.md` | Reset CSS・HTML要素のベーススタイル・CSS変数（トークン）概要 | `packages/lism-css/src/scss/base/`, `packages/lism-css/src/scss/base/tokens/` |
| `set-class.md` | `set--`クラス (`set--plain`,`set--revert`,`set--bxsh`,`set--hov`,`set--bdrsInner`) の一覧と用途解説 | `packages/lism-css/src/scss/base/set/`, `packages/lism-css/src/scss/base/tokens/`（`_tokens.scss` / `_tokens.gen.scss`） |
| `primitive-class.md` | Primitive クラス (`l--`, `a--`) の一覧と用途（※俯瞰マップに徹する。個別 Primitive へのリンクは載せない） | `packages/lism-css/src/scss/primitives/` |
| `trait-class.md` | Trait クラス (`is--`, `has--`) の一覧と用途（※俯瞰マップに徹する。個別 Trait の詳細は `trait-class/*.md`） | `packages/lism-css/src/scss/trait/`, `apps/docs/src/content/ja/trait-class.mdx` |
| `utility-class.md` | ユーティリティクラス (`u--` クラス) の一覧とProperty Class との違い | `packages/lism-css/src/scss/utility/` |
| `property-class.md` | Property Class (`-{prop}:{value}`) の記法と出力の解説、Prop早見リスト、分冊へのリンク一覧（全Prop表・特殊Propの詳細は `property-class/` 配下に分冊済み） | `packages/lism-css/config/defaults/props.ts`, `packages/lism-css/src/scss/_prop-config.gen.scss`, `packages/lism-css/src/scss/props/` |
| `responsive.md` | レスポンシブ対応 — ブレークポイント・コンテナクエリ・HTML/コンポーネントでの指定方法 | `packages/lism-css/src/scss/_query.scss`, `packages/lism-css/src/lib/getBpData.ts` |
| `components-core.md` | コアコンポーネント — セマンティック・Lism Props・getLismProps。Atomic/Trait/Layout の対応表には `primitives/*.md` への詳細リンクを保持する（※個別 Props・仕様の詳細は `primitives/*.md` 側に移管済み） | `packages/lism-css/src/components/`, 各パッケージの exports |
| `components-ui.md` | UIコンポーネント（`@lism-css/ui`）— Accordion・Modal・Tabs・Button 等の Props・構造・CLI | `packages/lism-ui/src/`, `packages/lism-cli/src/commands/ui/`（CLI）, 各パッケージの exports |
| `tokens.md` | デザイントークン（余白・フォントサイズ・角丸・影・カラー・パレット） | `packages/lism-css/src/scss/base/tokens/`, `packages/lism-css/config/defaults/tokens.ts` |
| `css-rules.md` | CSS Layer 構造・プレフィックス・Block Class (`b--`)・Custom Class (`c--`)・カスタムCSS ルール | `packages/lism-css/src/scss/` |
| `naming.md` | 命名規則 — CSS変数名・クラス名・Property Class の `{prop}` / `{value}` 省略ルール | `packages/lism-css/config/defaults/props.ts`, `apps/docs/src/content/ja/naming.mdx` |
| `customize.md` | カスタマイズ — @layerオフ・SCSS変数上書き・lism.config.js・CLIビルド | `packages/lism-css/src/scss/`, `packages/lism-cli/src/config.ts`（lism.config 読み込み）, `packages/plugin/src/`（`@lism-css/plugin`）, `apps/docs/src/content/ja/customize.mdx` |

### `property-class/` サブフォルダ配下の分冊ファイル

`property-class.md` から分冊された詳細ファイル。本体と分冊の間で内容の重複・矛盾が生じないよう、セットで照合すること。

| ファイル | 更新内容 | 主なソース参照先 |
|----------|----------|-----------------|
| `property-class/all-props.md` | 全 Prop 一覧の詳細表（プリセット値クラス・BP 対応） | `packages/lism-css/config/defaults/props.ts`, `packages/lism-css/src/scss/_prop-config.gen.scss` |
| `property-class/bd.md` | ボーダー（`bd` 系）の詳細 | `packages/lism-css/src/scss/props/_border.scss`, `apps/docs/src/content/ja/property-class/bd.mdx` |
| `property-class/hov.md` | ホバー（`hov` 系）の詳細 | `packages/lism-css/src/scss/props/_hover.scss`, `apps/docs/src/content/ja/property-class/hov.mdx` |
| `property-class/max-sz.md` | `-max-sz:full` / `-max-sz:bleed` 等の特殊クラスの詳細 | `packages/lism-css/src/scss/props/_size.scss`, `apps/docs/src/content/ja/property-class/max-sz.mdx` |

### `primitives/` / `trait-class/` サブフォルダ配下の Primitive 詳細ファイル

各 Primitive に 1 ファイル。ファイル名はクラス名そのままの camelCase（例: `l--withSide.md`, `l--tileGrid.md`, `is--boxLink.md`）。MDX 情報源（`apps/docs/src/content/ja/` 配下）も同じ camelCase ファイル名。

ファイルの対応関係は原則 SCSS と 1:1。ただし例外があり、`l--box` / `a--decorator` は対応する `_{name}.scss` を持たない。逆に `_coverLink.scss`（`is--coverLink`）は独立した詳細ファイルがなく、 `is--boxLink.md` 内で扱う（後述の「注意事項」参照）。カテゴリ別の更新内容は以下：

| カテゴリ | 更新内容 | 主なソース参照先 |
|----------|----------|-----------------|
| Layout（`primitives/l--*.md`） | クラス名 / 対応コンポーネント / 専用 Props / 使い方・既定の挙動 / 関連プリミティブ | `packages/lism-css/src/scss/primitives/layout/`, `apps/docs/src/content/ja/primitives/l--*.mdx` |
| Trait（`trait-class/is--*.md` / `has--*.md`） | 同上 + Trait 固有の挙動（`href` → `<a>`、`contentSize`、`@sm`/`@md` バリエーション等） | `packages/lism-css/src/scss/trait/`, `apps/docs/src/content/ja/trait-class/is--*.mdx`（`has--*` は個別 MDX 未作成のため `trait-class.mdx` を参照） |
| Atomic（`primitives/a--*.md`） | クラス名 / 対応コンポーネント / 専用 Props / HTML 出力構造 / 関連プリミティブ | `packages/lism-css/src/scss/primitives/atomic/`, `apps/docs/src/content/ja/primitives/a--*.mdx` |

各 `primitives/*.md` / `trait-class/*.md` は以下の構成を維持すること：

- Front matter なし、`# {クラス名} / <Component>` の h1 で開始
    - 対応コンポーネントを持たない `has--*` は h1 を `# {クラス名}` のみとし、概要文の後に `- Lism props: hasXxx（<Lism hasXxx> 等）` の行を置く
- 概要文（1〜2文）の後に、見出しを付けず `公式ドキュメント（使い方・コード例）: {URL}` の1行リンクを置く。URL は以下の形式を維持し、誤って書き換えないこと：
    - 個別ページが存在する場合は URL もクラス名そのまま（camelCase を維持）
        - Layout / Atomic（`l--*` / `a--*`）: `https://lism-css.com/docs/primitives/{class}.md`（例: `l--withSide.md`）
        - Trait（`is--*` / `has--*`）: `https://lism-css.com/docs/trait-class/{class}.md`（例: `is--boxLink.md`）
    - 個別ページが未作成の場合は、一覧ページのアンカーを指す: `https://lism-css.com/docs/trait-class.md#{class}`（現状 `has--*` 系はすべて個別ページが未作成のためこの形式を使う。例: `trait-class.md#has--transition`）
    - SCSS raw URL の行は置かない（SCSS ソースの参照先は本指示書の「ソースの参照先マップ」を使う）
- 以降は必要に応じたセクション（`## 既定の挙動`、`## 専用Props`、`## 使い方`、HTML 構造、動作の仕組み、特殊仕様、Opt-in スタイル、`has--*` の `## SCSS 定義` / `## CSS 変数` など）
- 末尾は `## 関連プリミティブ`（`has--*` は `## 関連`。3〜4個に絞る）
- コード例は専用の Usage セクションを設けず、解説に必要な箇所へ JSX / HTML / SCSS コードブロックで記載する（MDX の `<Preview>` / `<PreviewArea>` / `<PreviewCode>` / `<SrcCode>` 等のカスタムコンポーネントは廃棄）
- コード例で使う要素・クラス・コンポーネントは `lism-css` パッケージに含まれるものだけに限定する（`@lism-css/ui` のコンポーネント解説を除く）

### 限定チェック対象ファイル

`antipatterns.md` / `antipatterns-layout.md` / `references/` 配下（`authoring.md`, `verification.md`, `page-sections.md`）は、失敗例・執筆ノウハウの蓄積ファイルのため、通常のソース同期とは扱いを分ける。

- 構成・文章の書き換えや、失敗例・ノウハウの追加削除は行わない（運用ルールは CLAUDE.md の注意事項を参照）
- チェックするのは、記載されているクラス名・Props 名・コード例・ファイルパスが現在のソースでも有効かどうかのみ
- 無効になった箇所は値の置き換えのみ最小修正する。例自体が成立しなくなっている場合（対象 API の廃止等）は修正せず、差分サマリーで報告してユーザーに判断を仰ぐ


## 情報の優先順位

1. **パッケージソース（絶対基軸）**: `packages/lism-css/` と `packages/lism-ui/` のソースコードが常に正
2. **ドキュメント（補足）**: `apps/docs/` の MDX は解説の参考として使うが、ソースと矛盾する場合はソースを優先


## ソースの参照先マップ

### ベーススタイル関連

| 確認したい内容 | 参照先 |
|---|---|
| Reset CSS | `packages/lism-css/src/scss/reset.scss` |
| HTML要素のベーススタイル | `packages/lism-css/src/scss/base/` 配下の SCSS |
| CSS変数（トークン）概要 | `packages/lism-css/src/scss/base/tokens/` |

### `set--` クラス関連

| 確認したい内容 | 参照先 |
|---|---|
| set-- クラス一覧 | `packages/lism-css/src/scss/base/set/` 配下の SCSS、`packages/lism-css/src/scss/base/tokens/_tokens.scss` / `_tokens.gen.scss`（set--bxsh のシャドウトークン） |
| set prop の処理ロジック | `packages/lism-css/src/lib/helper/mergeSet.ts` |

### プリミティブクラス / トレイトクラス / カスタムクラス関連

| 確認したい内容 | 参照先 |
|---|---|
| is-- クラス | `packages/lism-css/src/scss/trait/is/` 配下の SCSS |
| has-- クラス | `packages/lism-css/src/scss/trait/has/` 配下の SCSS |
| l-- クラス | `packages/lism-css/src/scss/primitives/layout/` 配下の SCSS |
| a-- クラス | `packages/lism-css/src/scss/primitives/atomic/` 配下の SCSS |
| c-- クラス | `packages/lism-ui/src/`（UIコンポーネントのCSS）。ユーザー独自は `@layer lism-custom` |
| プレフィックスと Layer の対応 | `packages/lism-css/src/scss/_with_layer.scss` |
| 個別プリミティブの使い方・専用 Props | `apps/docs/src/content/ja/primitives/*.mdx`（サンプル・文言の情報源。ファイル名は Skill 側と同じ camelCase） |
| プリミティブ詳細の React/Astro 側の Props 実装 | `packages/lism-css/src/components/layout/`, `state/`, `atomic/` |

### ユーティリティクラス関連

| 確認したい内容 | 参照先 |
|---|---|
| u-- クラス一覧 | `packages/lism-css/src/scss/utility/` 配下の SCSS |

### Property Class 関連

| 確認したい内容 | 参照先 |
|---|---|
| Props 名と CSS プロパティの対応 | `packages/lism-css/config/defaults/props.ts` |
| Property Class の SCSS 出力設定 | `packages/lism-css/src/scss/_prop-config.gen.scss`（生成ファイル。full 版は `_prop-config-full.gen.scss`） |
| Property Class のカテゴリ別 SCSS | `packages/lism-css/src/scss/props/` 配下（`_border.scss`, `_hover.scss` 等） |

### レスポンシブ対応関連

| 確認したい内容 | 参照先 |
|---|---|
| ブレークポイント・コンテナクエリ定義（CSS） | `packages/lism-css/src/scss/_query.scss` |
| レスポンシブ Props の正規化（JS） | `packages/lism-css/src/lib/getBpData.ts` |

### コンポーネント関連（components-core.md / components-ui.md）

| 確認したい内容 | 参照先 |
|---|---|
| コアコンポーネント一覧 | `packages/lism-css/src/components/` の export（`layout/`, `state/`, `atomic/` サブディレクトリ構成） |
| UI コンポーネント一覧 | `packages/lism-ui/src/` の export |
| getLismProps の仕組み | `packages/lism-css/src/lib/getLismProps.ts`, `packages/lism-css/config/` |
| ヘルパー関数 | `packages/lism-css/src/lib/helper/`（mergeSet, atts, isNumStr 等） |
| CLI ツール | `packages/lism-cli/src/commands/`（`create` / `init` / `ui` / `skill` サブコマンド） |

### カスタマイズ関連（customize.md）

| 確認したい内容 | 参照先 |
|---|---|
| @layer オフ | `packages/lism-css/src/scss/`（`main.scss` / `main_no_layer.scss` / `full_no_layer.scss` / `_with_layer.scss`） |
| SCSS 設定変数 | `packages/lism-css/src/scss/_setting.scss` 等の `$lism-` 変数定義 |
| lism.config.js | `packages/lism-cli/src/config.ts`（読み込み処理）, `packages/plugin/src/builder/`（ビルド時の参照） |
| CLI ビルド | `packages/lism-cli/src/`, `packages/plugin/src/`（`@lism-css/plugin`） |
| ドキュメント | `apps/docs/src/content/ja/customize.mdx` |

### トークン関連

| 確認したい内容 | 参照先 |
|---|---|
| 余白・フォントサイズ・角丸・影 | `packages/lism-css/src/scss/base/tokens/_tokens.scss` / `_tokens.gen.scss` |
| カラー・パレット | 同上（`_tokens.scss` / `_tokens.gen.scss` 内のカラー定義） |
| JS/TS のトークン定義 | `packages/lism-css/config/defaults/tokens.ts` |

### CSS 設計関連

| 確認したい内容 | 参照先 |
|---|---|
| Layer 構造 | `packages/lism-css/src/scss/_with_layer.scss`（`@layer lism-base, lism-trait, lism-primitive, lism-block, lism-component, lism-custom, lism-utility;`。`lism-component` は後方互換用に宣言のみ残存） |
| クラス命名規則・プレフィックス | `packages/lism-css/src/scss/primitives/`, `packages/lism-css/src/scss/base/` |


## 作業手順

対象ファイルが多いため、カテゴリ単位（ルート基本ファイル / `property-class/` / `primitives/` / `trait-class/`）で分担し、照合は researcher、更新は worker サブエージェントへ委譲して並列で進めてよい。差分サマリーはメインエージェントが集約する。

### 1. 現在のテンプレートとバージョン情報の取得

- `skills/lism-css-guide/` 配下のルートファイル＋ `primitives/` / `trait-class/` / `property-class/` 配下の全ファイルを読み取る（限定チェック対象の `antipatterns*.md` / `references/` 配下も読む）
- `packages/lism-css/package.json` と `packages/lism-ui/package.json` からバージョンを取得し、`SKILL.md` のバージョン表記（`lism-css@x.y.z` / `@lism-css/ui@x.y.z`）と比較する
- `primitives/` / `trait-class/` 配下の存在チェック: `packages/lism-css/src/scss/primitives/{layout,atomic}/` および `packages/lism-css/src/scss/trait/{is,has}/` 配下の SCSS と `primitives/*.md` / `trait-class/*.md` が 1:1 対応しているか（例外は「注意事項」参照）、さらに `SKILL.md` の「クラス単位の詳細リファレンス」セクションのリンクと実ファイルが一致するかを確認（数値ではなくソースの実体を基準にする）

### 2. ソースコードの読み取りと照合

各ファイルについて、上記のソース参照先を読み取り、テンプレートの内容と照合する。

チェック観点:
1. **値の正確性**: トークン値、Props 名、クラス名がソースと一致しているか
2. **網羅性**: ソースに存在するが、テンプレートに記載されていない重要な項目がないか
3. **存在確認**: テンプレートに記載されているが、ソースから削除された項目がないか
4. **コード例の正確性**: JSX / HTML のコード例が現在の API で動作するか
5. **バージョン情報**: SKILL.md のバージョン表記が最新か
6. **プリミティブ詳細ファイルの整合性**: `primitives/*.md` の専用 Props・ドキュメント URL・関連プリミティブ相互リンク先が現在のソース構成と一致しているか
7. **ファイル行数**: 各ファイルが 260 行以下の目安（CLAUDE.md の注意事項）に収まっているか。超過ファイルは本コマンドでは分割せず、分割候補として差分サマリーで報告する

### 3. テンプレートの更新

差分が見つかった場合、テンプレートを更新する。

更新ルール:
- 既存の構成（セクション構造・テーブル形式）は維持する
- 値の修正・行の追加削除のみ行い、文体やフォーマットの変更はしない
- 新規セクションの追加が必要な場合は、既存のスタイルに合わせる

### 4. 差分サマリーの報告

変更点をファイルごとにまとめてユーザーに報告する。
変更がなかったファイルについても「変更なし」と報告する。
260 行を超えているファイルがあれば、分割候補として合わせて報告する。


## 注意事項

- ソースに存在しない情報を推測で追加しないこと
- テンプレートの説明文は簡潔なスタイルを維持する（「です・ます」調ではなく体言止め中心）
- `詳細: URL` のリンクは変更しない（URL の有効性チェックは本コマンドの範囲外）
- スキルファイル内のソースコードへのリンクは、必ず raw URL 形式（`https://raw.githubusercontent.com/lism-css/lism-css/main/{path}`）を使用すること。`https://github.com/lism-css/lism-css/blob/main/...` 形式は使わない。ディレクトリへのリンク（`tree/`）はそのまま GitHub URL で可
- スキルファイル内の公式ドキュメント (`https://lism-css.com/...`) へのリンクは AI が直接読み込めるよう `.md` 版を使用する（例: `https://lism-css.com/docs/primitives/l--box.md`）。ただし `.md` 版が存在しない URL（`/demo/...`、`/ui/` トップ等）は対象外として現状の HTML URL のまま維持する
- `primitives/*.md` / `trait-class/*.md` と MDX 情報源は、いずれもクラス名そのままの camelCase ファイル名（例: `l--withSide.md` ↔ `l--withSide.mdx`）
- `is--skipFlow` / `is--side` / `is--coverLink` は独立した詳細ファイルを作らず、それぞれ `l--flow.md` / `l--withSide.md` / `is--boxLink.md` 内で言及する方針を維持する（`is--coverLink` は `_coverLink.scss` が存在するが独立ファイル化しない）
