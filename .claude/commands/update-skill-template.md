# Skill Template Update

`.claude/skills/lism-css-guide/` 配下の 10 ファイルを、リポジトリの最新ソースに合わせて更新してください。


## 対象ファイルと更新内容

| ファイル | 更新内容 | 主なソース参照先 |
|----------|----------|-----------------|
| `SKILL.md` | バージョン情報・パッケージ構成・import パス・実装ルール・詳細ファイル一覧 | `packages/lism-css/package.json`, `packages/lism-ui/package.json`, 各パッケージの exports |
| `base-styles.md` | Reset CSS・HTML要素のベーススタイル・CSS変数（トークン）概要 | `packages/lism-css/src/scss/base/`, `packages/lism-css/src/scss/base/tokens/` |
| `set-class.md` | `set--` クラス — `set--plain`/`set--shadow`/`set--hov`/`set--transition` 等のセットアップクラス | `packages/lism-css/src/scss/base/set/`, `packages/lism-css/src/scss/base/tokens/_shadow.scss` |
| `module-class.md` | モジュールクラス — is--/l--/a--/c-- クラスの一覧と用途 | `packages/lism-css/src/scss/modules/`, `packages/lism-ui/src/`（c-- 系） |
| `utility-class.md` | ユーティリティクラス — `u--` クラスの一覧・Prop Class との違い | `packages/lism-css/src/scss/utility/` |
| `prop-class.md` | Prop Class — `-{prop}:{value}` 記法・主要 Prop 一覧・特殊 Prop（ボーダー・ホバー）・出力タイプ | `packages/lism-css/config/defaults/props.ts`, `packages/lism-css/src/scss/_prop-config.scss`, `packages/lism-css/src/scss/props/` |
| `prop-responsive.md` | レスポンシブ対応 — ブレークポイント・コンテナクエリ・HTML/コンポーネントでの指定方法 | `packages/lism-css/src/scss/_query.scss`, `packages/lism-css/src/lib/getBpData.ts` |
| `components.md` | コンポーネントシステム — コア・セマンティック・レイアウト・ステート・アトミック・UI コンポーネント一覧、getLismProps、CLI | `packages/lism-css/src/components/`, `packages/lism-ui/src/`, 各パッケージの exports |
| `tokens.md` | デザイントークン（余白・フォントサイズ・角丸・影・カラー・パレット） | `packages/lism-css/src/scss/base/tokens/`, `packages/lism-css/config/defaults/tokens.ts` |
| `css-rules.md` | CSS Layer 構造・命名規則・プレフィックス・カスタムCSS ルール | `packages/lism-css/src/scss/` |


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
| set-- に対応するコンポーネント Props | `packages/lism-css/config/defaults/states.ts`, `packages/lism-css/src/lib/types/StateProps.ts` |

### モジュールクラス関連

| 確認したい内容 | 参照先 |
|---|---|
| is-- / l-- / a-- クラス | `packages/lism-css/src/scss/modules/` 配下の SCSS（`state/`, `layout/`, `atomic/`） |
| c-- クラス | `packages/lism-ui/src/`（UIコンポーネントのCSS）。ユーザー定義は `@layer lism-custom` |
| プレフィックスと Layer の対応 | `packages/lism-css/src/scss/_with_layer.scss` |

### ユーティリティクラス関連

| 確認したい内容 | 参照先 |
|---|---|
| u-- クラス一覧 | `packages/lism-css/src/scss/utility/` 配下の SCSS |

### Prop Class 関連

| 確認したい内容 | 参照先 |
|---|---|
| Props 名と CSS プロパティの対応 | `packages/lism-css/config/defaults/props.ts` |
| Prop Class の SCSS 出力設定 | `packages/lism-css/src/scss/_prop-config.scss` |
| Prop Class のカテゴリ別 SCSS | `packages/lism-css/src/scss/props/` 配下（`_border.scss`, `_hover.scss` 等） |

### レスポンシブ対応関連

| 確認したい内容 | 参照先 |
|---|---|
| ブレークポイント・コンテナクエリ定義（CSS） | `packages/lism-css/src/scss/_query.scss` |
| レスポンシブ Props の正規化（JS） | `packages/lism-css/src/lib/getBpData.ts` |

### コンポーネント関連

| 確認したい内容 | 参照先 |
|---|---|
| コアコンポーネント一覧 | `packages/lism-css/src/components/` の export |
| UI コンポーネント一覧 | `packages/lism-ui/src/` の export |
| getLismProps の仕組み | `packages/lism-css/src/lib/getLismProps.ts`, `packages/lism-css/config/` |
| CLI ツール | `packages/lism-css/bin/` または `package.json` の bin フィールド |

### トークン関連

| 確認したい内容 | 参照先 |
|---|---|
| 余白・フォントサイズ・角丸・影 | `packages/lism-css/src/scss/base/tokens/` 配下の SCSS |
| カラー・パレット | `packages/lism-css/src/scss/base/tokens/` 配下のカラー関連 SCSS |
| JS/TS のトークン定義 | `packages/lism-css/config/defaults/tokens.ts` |

### CSS 設計関連

| 確認したい内容 | 参照先 |
|---|---|
| Layer 構造 | `packages/lism-css/src/scss/_with_layer.scss`, `packages/lism-css/src/scss/main.scss` |
| クラス命名規則・プレフィックス | `packages/lism-css/src/scss/modules/`, `packages/lism-css/src/scss/base/` |


## 作業手順

### 1. 現在のテンプレートとバージョン情報の取得

- `.claude/skills/lism-css-guide/` 配下の 10 ファイルを読み取る
- `packages/lism-css/package.json` からバージョンを取得し、`SKILL.md` のバージョン表記と比較する

### 2. ソースコードの読み取りと照合

各ファイルについて、上記のソース参照先を読み取り、テンプレートの内容と照合する。

チェック観点:
1. **値の正確性**: トークン値、Props 名、クラス名がソースと一致しているか
2. **網羅性**: ソースに存在するが、テンプレートに記載されていない重要な項目がないか
3. **存在確認**: テンプレートに記載されているが、ソースから削除された項目がないか
4. **コード例の正確性**: JSX / HTML のコード例が現在の API で動作するか
5. **バージョン情報**: SKILL.md のバージョン表記が最新か

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

- テンプレートはAI向けのリファレンスであり、全 Props・全トークンの完全な一覧ではない。代表的・頻出のものを記載する方針は維持する
- ソースに存在しない情報を推測で追加しないこと
- テンプレートの説明文は簡潔なスタイルを維持する（「です・ます」調ではなく体言止め中心）
- `詳細: URL` のリンクは変更しない（URL の有効性チェックは本コマンドの範囲外）
