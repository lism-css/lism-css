# Skill Template Update

`skills/lism-css-guide/` 配下のルートファイル＋ `primitives/` サブフォルダ配下のプリミティブ詳細ファイルを、最新ソースに合わせて更新してください。


## 対象ファイルと更新内容

### ルート直下の基本ファイル

| ファイル | 更新内容 | 主なソース参照先 |
|----------|----------|-----------------|
| `SKILL.md` | バージョン情報・パッケージ構成・import パス・実装ルール・詳細ファイル一覧・プリミティブ別リファレンスへのリンク一覧 | `packages/lism-css/package.json`, `packages/lism-ui/package.json`, 各パッケージの exports |
| `base-styles.md` | Reset CSS・HTML要素のベーススタイル・CSS変数（トークン）概要 | `packages/lism-css/src/scss/base/`, `packages/lism-css/src/scss/base/tokens/` |
| `set-class.md` | `set--`クラス (`set--plain`,`set--shadow`,`set--hov`,`set--transition`,`set--gutter` 等) の一覧と用途解説 | `packages/lism-css/src/scss/base/set/`, `packages/lism-css/src/scss/base/tokens/_shadow.scss` |
| `primitive-class.md` | Primitive クラス (`is--`, `l--`, `a--`) と Component クラス (`c--`) の一覧と用途（※俯瞰マップに徹する。個別 Primitive へのリンクは載せない） | `packages/lism-css/src/scss/primitives/`, `packages/lism-ui/src/`（c-- 系） |
| `utility-class.md` | ユーティリティクラス (`u--` クラス) の一覧とProperty Class との違い | `packages/lism-css/src/scss/utility/` |
| `property-class.md` | Property Class (`-{prop}:{value}`)の一覧、記法と出力の解説、特殊Prop（ボーダー・ホバー） | `packages/lism-css/config/defaults/props.ts`, `packages/lism-css/src/scss/_prop-config.scss`, `packages/lism-css/src/scss/props/` |
| `prop-responsive.md` | レスポンシブ対応 — ブレークポイント・コンテナクエリ・HTML/コンポーネントでの指定方法 | `packages/lism-css/src/scss/_query.scss`, `packages/lism-css/src/lib/getBpData.ts` |
| `components-core.md` | コアコンポーネント — セマンティック・Lism Props・getLismProps。Atomic/Trait/Layout の対応表には `primitives/*.md` への詳細リンクを保持する（※個別 Props・仕様の詳細は `primitives/*.md` 側に移管済み） | `packages/lism-css/src/components/`, 各パッケージの exports |
| `components-ui.md` | UIコンポーネント（`@lism-css/ui`）— Accordion・Modal・Tabs・Button 等の Props・構造・CLI | `packages/lism-ui/src/`, 各パッケージの exports |
| `tokens.md` | デザイントークン（余白・フォントサイズ・角丸・影・カラー・パレット） | `packages/lism-css/src/scss/base/tokens/`, `packages/lism-css/config/defaults/tokens.ts` |
| `css-rules.md` | CSS Layer 構造・プレフィックス・Component クラス・カスタムCSS ルール | `packages/lism-css/src/scss/` |
| `naming.md` | 命名規則 — CSS変数名・クラス名・Property Class の `{prop}` / `{value}` 省略ルール | `packages/lism-css/config/defaults/props.ts`, `apps/docs/src/content/ja/naming.mdx` |
| `customize.md` | カスタマイズ — @layerオフ・SCSS変数上書き・lism.config.js・CLIビルド | `packages/lism-css/src/scss/`, `packages/lism-css/lism.config.js`, `apps/docs/src/content/ja/customize.mdx` |

### `primitives/` サブフォルダ配下の Primitive 詳細ファイル

各 Primitive に 1 ファイル。クラス名は camelCase のまま（例: `l--sideMain.md`, `l--tileGrid.md`, `is--boxLink.md`）、MDX 側は lowercase（`l--sidemain.mdx` 等）であることに注意。

ファイルの対応関係は SCSS と 1:1。カテゴリ別の更新内容は以下：

| カテゴリ | 更新内容 | 主なソース参照先 |
|----------|----------|-----------------|
| Layout（`primitives/l--*.md`） | クラス名 / 対応コンポーネント / SCSS raw URL / 専用 Props / Usage（基本パターン + 応用）/ 関連プリミティブ | `packages/lism-css/src/scss/primitives/layout/`, `apps/docs/src/content/ja/primitives/l--*.mdx` |
| Trait（`trait-class/is--*.md`） | 同上 + Trait 固有の挙動（`href` → `<a>`、`contentSize`、`@sm`/`@md` バリエーション等） | `packages/lism-css/src/scss/trait/`, `apps/docs/src/content/ja/trait-class/is--*.mdx` |
| Atomic（`primitives/a--*.md`） | クラス名 / 対応コンポーネント / 専用 Props / Usage / HTML 出力構造 | `packages/lism-css/src/scss/primitives/atomic/`, `apps/docs/src/content/ja/primitives/a--*.mdx` |

各 `primitives/*.md` / `trait-class/*.md` は以下の構成を維持すること（Phase 2 で確定したテンプレート）：

- Front matter なし、`# {クラス名} / <Component>` の h1 で開始
- `## 基本情報`（クラス名 / コンポーネント / SCSSソース / ドキュメント）。URL は以下の形式を維持し、誤って書き換えないこと：
    - SCSSソース: `https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/{primitives/{layout|atomic}|trait}/_{name}.scss`
        - **SCSS ファイルが存在する Primitive / Trait のみ記載する**。`l--box` や `a--decorator` のように対応する `_{name}.scss` を持たない場合は、この行自体を省略する
    - ドキュメント（人間向け）: Layout/Atomic は `https://lism-css.com/docs/primitives/{lowercase}/`、Trait は `https://lism-css.com/docs/trait-class/{lowercase}/` — `{lowercase}` はクラス名の小文字版（例: `l--sideMain.md` → `l--sidemain`）
- `## 専用Props`（該当プリミティブのみ）
- `## Usage`（JSX + HTML コードブロックのペアで記載。MDX の `<Preview>` / `<PreviewArea>` / `<PreviewCode>` / `<SrcCode>` 等のカスタムコンポーネントは廃棄）
- 必要に応じて追加セクション（HTML 構造、動作の仕組み、特殊仕様、Opt-in スタイル、注意点 など）
- `## 関連プリミティブ`（3〜4個に絞る）
- コード例で使う要素・クラス・コンポーネントは `lism-css` パッケージに含まれるものだけに限定する（`@lism-css/ui` のコンポーネント解説を除く）


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
| set-- クラス一覧 | `packages/lism-css/src/scss/base/set/` 配下の SCSS、`packages/lism-css/src/scss/base/tokens/_shadow.scss`（set--shadow） |
| set prop の処理ロジック | `packages/lism-css/src/lib/helper/mergeSet.ts` |

### プリミティブクラス / コンポーネントクラス関連

| 確認したい内容 | 参照先 |
|---|---|
| is-- / l-- / a-- クラス | `packages/lism-css/src/scss/primitives/` 配下の SCSS（`trait/`, `layout/`, `atomic/`） |
| c-- クラス | `packages/lism-ui/src/`（UIコンポーネントのCSS）。ユーザー独自は `@layer lism-component` または `@layer lism-custom` |
| プレフィックスと Layer の対応 | `packages/lism-css/src/scss/_with_layer.scss` |
| 個別プリミティブの使い方・専用 Props | `apps/docs/src/content/ja/primitives/*.mdx`（サンプル・文言の情報源）。ファイル名は lowercase なので camelCase の Skill ファイル名との対応に注意 |
| プリミティブ詳細の React/Astro 側の Props 実装 | `packages/lism-css/src/components/layout/`, `state/`, `atomic/` |

### ユーティリティクラス関連

| 確認したい内容 | 参照先 |
|---|---|
| u-- クラス一覧 | `packages/lism-css/src/scss/utility/` 配下の SCSS |

### Property Class 関連

| 確認したい内容 | 参照先 |
|---|---|
| Props 名と CSS プロパティの対応 | `packages/lism-css/config/defaults/props.ts` |
| Property Class の SCSS 出力設定 | `packages/lism-css/src/scss/_prop-config.scss` |
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
| CLI ツール | `packages/lism-css/bin/` または `package.json` の bin フィールド |

### カスタマイズ関連（customize.md）

| 確認したい内容 | 参照先 |
|---|---|
| @layer オフ | `packages/lism-css/src/scss/`（`main.scss` / `_with_layer.scss`） |
| SCSS 設定変数 | `packages/lism-css/src/scss/` 配下の `$lism-` 変数定義 |
| lism.config.js | `packages/lism-css/lism.config.js`（存在する場合） |
| CLI ビルド | `packages/lism-css/bin/` または `package.json` の bin フィールド |
| ドキュメント | `apps/docs/src/content/ja/customize.mdx` |

### トークン関連

| 確認したい内容 | 参照先 |
|---|---|
| 余白・フォントサイズ・角丸・影 | `packages/lism-css/src/scss/base/tokens/` 配下の SCSS |
| カラー・パレット | `packages/lism-css/src/scss/base/tokens/` 配下のカラー関連 SCSS |
| JS/TS のトークン定義 | `packages/lism-css/config/defaults/tokens.ts` |

### CSS 設計関連

| 確認したい内容 | 参照先 |
|---|---|
| Layer 構造 | `packages/lism-css/src/scss/_with_layer.scss`, `packages/lism-css/src/scss/main.scss`（`lism-base` → `lism-primitive`{`trait`,`layout`,`atomic`} → `lism-component` → `lism-custom` → `lism-utility`） |
| クラス命名規則・プレフィックス | `packages/lism-css/src/scss/primitives/`, `packages/lism-css/src/scss/base/` |


## 作業手順

### 1. 現在のテンプレートとバージョン情報の取得

- `skills/lism-css-guide/` 配下のルートファイル＋ `primitives/` 配下の全ファイルを読み取る
- `packages/lism-css/package.json` からバージョンを取得し、`SKILL.md` のバージョン表記と比較する
- `primitives/` 配下の存在チェック: `packages/lism-css/src/scss/primitives/{layout,trait,atomic}/` 配下の SCSS と `primitives/*.md` が 1:1 対応しているか、さらに `SKILL.md` の「プリミティブ単位の詳細リファレンス」セクションのリンクと実ファイルが一致するかを確認（数値ではなくソースの実体を基準にする）

### 2. ソースコードの読み取りと照合

各ファイルについて、上記のソース参照先を読み取り、テンプレートの内容と照合する。

チェック観点:
1. **値の正確性**: トークン値、Props 名、クラス名がソースと一致しているか
2. **網羅性**: ソースに存在するが、テンプレートに記載されていない重要な項目がないか
3. **存在確認**: テンプレートに記載されているが、ソースから削除された項目がないか
4. **コード例の正確性**: JSX / HTML のコード例が現在の API で動作するか
5. **バージョン情報**: SKILL.md のバージョン表記が最新か
6. **プリミティブ詳細ファイルの整合性**: `primitives/*.md` の専用 Props・SCSS raw URL・ドキュメント URL・関連プリミティブ相互リンク先が現在のソース構成と一致しているか

### 3. テンプレートの更新

差分が見つかった場合、テンプレートを更新する。

更新ルール:
- 既存の構成（セクション構造・テーブル形式）は維持する
- 値の修正・行の追加削除のみ行い、文体やフォーマットの変更はしない
- 新規セクションの追加が必要な場合は、既存のスタイルに合わせる

### 4. 差分サマリーの報告

変更点をファイルごとにまとめてユーザーに報告する。
変更がなかったファイルについても「変更なし」と報告する。


## 注意事項

- ソースに存在しない情報を推測で追加しないこと
- テンプレートの説明文は簡潔なスタイルを維持する（「です・ます」調ではなく体言止め中心）
- `詳細: URL` のリンクは変更しない（URL の有効性チェックは本コマンドの範囲外）
- スキルファイル内のソースコードへのリンクは、必ず raw URL 形式（`https://raw.githubusercontent.com/lism-css/lism-css/main/{path}`）を使用すること。`https://github.com/lism-css/lism-css/blob/main/...` 形式は使わない。ディレクトリへのリンク（`tree/`）はそのまま GitHub URL で可
- `primitives/*.md` は camelCase（実クラス名）、MDX 情報源は lowercase。同期対応を間違えないこと
- `is--skipFlow` / `is--side` は独立した `primitives/*.md` を作らず、それぞれ `l--flow.md` / `l--sideMain.md` 内で言及する方針を維持する
