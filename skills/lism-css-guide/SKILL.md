---
name: lism-css-guide
description: 'Lism CSSでUIやページを実装・修正する時に使う実装ガイド。Primitive選定・トークン照合・Property Class/Lism Props活用・レスポンシブ設計・アンチパターンセルフチェックを行う。c--*, l--*, a--*, is--*, has--*, set--*, u--*, -prop:value形式のクラスやトークンの逆引きにも使う。'
---

# Lism CSS実装ガイド

Lism CSSでUI・ページ・コンポーネントを実装する時の判断の起点です。単なるリファレンスではなく、**実装前チェック→実装→提出前セルフチェック**を必ず通し、Primitive・トークン・Property Class・レスポンシブ設計の取りこぼしを防ぎます。

公式ドキュメント: https://lism-css.com/docs/overview.md

> **バージョン情報:** このガイドは`lism-css@0.23.0`/`@lism-css/ui@0.23.0`時点の情報に基づきます。プロジェクトで使用中のバージョンが異なる場合は、ユーザーにその旨を伝え、パッケージ側の更新・またはこのスキルの更新を案内してください。

## 実装フロー（厳守）

資料確認は、コード上の操作の直前に行う。どの操作の手前で何を読むかは「資料確認トリガー」に従う。

0. **実行レベル判定**: 変更規模から「事前チェック実行レベル」（不要/軽量/通常/値照合付き）を判定する。「不要」に該当する場合、以降の手順は省略してよい。
1. **初期確認**: SKILL.mdだけで実装しない。実装対象に明らかに関係する最小限の詳細ファイルだけを先に開き、実装プランに「初期確認した資料」を列挙する。リンク表を眺めただけは確認済みにしない。
2. 目的別実装ガイドでPrimitive/コンポーネントの候補を選定する。
3. 実装前チェック（C0–C8）を行い、初期確認した資料、使うPrimitive、コンポーネント、トークン、レスポンシブ方針を列挙した**実装プラン**を出す。未読のまま採用できない判断は🔁を付け、対応する「読む資料」を実装プランの判断行に紐づける。
4. 「資料確認トリガー」に従い、各操作をコードに書く手前で対応資料を読み、🔁を✅または⏸へ解消する。
5. ⏸が残る項目（px丸め・任意色・挙動変更・公開クラス変更など）は、その部分を実装する前にユーザー確認する。確認が取れない場合の運用は「判定記号」の⏸の項に従う。
6. 実装する。
7. 提出前セルフチェックで実装プランと実装を照合し、🔁の未解消・資料確認ログとの対応・差分・漏れを処理する。

C0–C8の詳細と出力形式は[`references/authoring.md`](./references/authoring.md)にまとめています。

## 判定記号

実装プラン（実装前チェックの成果物）の各行に付ける記号です。

| 記号 | 意味 |
| --- | --- |
| ✅ | 確定。新規定義（コンポーネント/トークン/クラスなど）や合意済みの直書き例外は、行内に注記する（例: `✅新規`、`✅例外（1px罫線）`） |
| 🔁 | 資料確認トリガーに該当する未通過項目。対応操作をコードに書く手前で指定資料を読み、✅または⏸へ解消する。🔁のまま実装しない |
| ⏸  | 要ユーザー確認。確認まで実装しない |

直書き例外を`✅例外`にできるのは、`antipatterns.md`の「直書きしてよい例外」（1px罫線・transform微調整・@media閾値など）に該当する場合だけです。それ以外の例外化・丸め・新規トークンは⏸にします。この許可リストに例外カテゴリを自作して追加してはいけません。「正確に再現して」等のユーザー指示や実測値であることは`✅例外`の根拠になりません。デザイン値の既定の扱いは[`references/authoring.md`](./references/authoring.md)の「デザインデータ取り込みフロー」（入力種別と既定動作）に従います。

⏸のユーザー確認が取れない状況（自律実行など）では、原則準拠側の選択肢（すり合わせ済みの方針があればそれ、無ければ入力種別ごとの既定動作。例: 最寄りトークンへの丸め）を選び、前提として実装プランに明示した上で進め、完了報告で論点と代替案を列挙します。px直書き・例外カテゴリの新設・公開クラス変更・破壊的変更など逸脱側の選択肢は、この方式では採用できず⏸のままにします。

> `lism-css-refactor`スキルは同じ記号を別の意味（✅=触らない、⬜=意図的に残す等）で使います。リファクタ時はrefactor側の定義に従い、どちらの意味で使っているかを表の見出しなどで明示してください。

## 実装プランのC一覧（実装前チェック項目）

このガイドでは、実装前に確認する項目を`C0`〜`C8`の番号で表します。`C`はCheck（確認）の略で、短く参照するためのラベルです。

| C | 見ること | 主な参照先 |
| --- | --- | --- |
| C0  | 入力整理:対象/粒度/フレームワーク/既存制約/不明点 | 既存コード・要件 |
| C1  | 構造・セマンティクス選定  | `primitive-class.md`、`components-core.md` |
| C2  | 再利用・コンポーネント境界  | `components-core.md`、`components-ui.md` |
| C3  | 命名設計 | `naming.md`、`css-rules.md`  |
| C4  | 状態・バリエーション設計  | `trait-class.md`、`antipatterns.md`  |
| C5  | 値・トークン照合  | `tokens.md`、`property-class.md` |
| C6  | レスポンシブ方針  | `responsive.md`、`is--container.md`  |
| C7  | CSSに書くもの/Propsに移すもの | `property-class.md`、`css-rules.md`  |
| C8  | 既定値の確認 | `primitives/l--*.md` |

## 事前チェック実行レベル

| レベル | 条件  | 確認するC  | 出力 |
| --- | --- | ----- | ----- |
| 不要 | 説明のみ/コード変更なし/既存の書き方に沿った微修正 | —  | — |
| 軽量 | 数行の小変更・既存パターン内の変更 | C1・C5中心 | 3〜5行の箇条書き |
| 通常 | 新規UI/コンポーネント/セクション | 必須=初期確認した資料、C0、C1、C5、C6。該当時だけC2/C3/C4/C7/C8 | 項目別の表 |
| 値照合付き | Figma/スクショ等のデザイン再現 | 通常+C5/C7を詳しく確認 | 項目別の表＋トークン差分表（差分列必須） |

通常レベルでも該当しないCは省略して構いません。表を形だけ埋めず、実装に影響する項目だけ列挙してください。

## 資料確認トリガー

次の表の左の操作をコードに書く手前で、右の資料をまだ読んでいない場合、その判断は🔁（未通過）にする。対応資料を読んで✅へ解消するか、判断できなければ⏸にする。**🔁のままコードへ反映してはいけません。**

| この操作をする手前で | この資料を読む |
| --- | --- |
| まだ読んでいないPrimitiveを使う  | 該当の`primitives/l--*.md` |
| まだ読んでいないTrait Classを使う  | 該当の`trait-class/*.md`または`trait-class.md`  |
| スタイル宣言をCSS（ファイル・`<style>`）に書く、またはProperty Class/Lism Propsへ移す | `property-class.md`  |
| hover/focus等の状態スタイルを書く  | `property-class/hov.md`（必要に応じて`trait-class/has--transition.md`） |
| トークン外の数値・色をコードに書く（丸める場合を含む。CSS/Props問わず） | `tokens.md`、`antipatterns.md`の「px / 固定値の直書き」節 |
| レスポンシブの切替を決める | `responsive.md`  |
| `c--*`を新しく作る/名前を付ける  | `naming.md`、`css-rules.md`の該当節 |
| `c--*`のCSSを書く  | `css-rules.md`の`@layer lism-component`/`c--*`節  |
| 状態・バリエーションを設計する | `trait-class.md` |

「必要なら参照」などの曖昧な表現で代替しない。対象操作の直前に読む。

## 最小ゲート

次のルールを常に守る。迷う・例外にする・既存実装と衝突する場合は、該当資料を読んで🔁を✅または⏸へ解消する。

- 構造は`<div>`+素のCSSよりPrimitiveを優先する。候補は「目的別実装ガイド」の表から選ぶ。
- `c--*`命名はBlockをcamelCase、Elementを`_`ひとつ、Modifierを`--`ふたつにする。`c--feature-card`や`__`は使わない。
- `c--*`のCSSは必ず`@layer lism-component`内に置く。
- トークン外のpx/rem/em値を勝手に丸めたり直書きしたりしない。丸め・新規トークン・直書き例外は⏸にする（`antipatterns.md`の「直書きしてよい例外」に該当する場合のみ`✅例外`にできる）。
- 単一要素にだけ効く宣言はCSSに書かず、まずLism Props/Property Classで表せないか確認する。CSSに残すのは擬似要素・子孫セレクタ・状態切替などProperty Classで書けない宣言だけにする。
- レスポンシブ値はbaseを必ず置く。container query運用なら必要な`isContainer`祖先を確認する。
- 状態は`data-*`/ARIA、見た目バリエーションは`c--name--variant`で表す。`is--active`のようにTrait Classを状態名へ流用しない。

## 目的別実装ガイド

やりたいことからPrimitive/コンポーネントの候補を引く表です。候補が複数ある行は括弧内の基準で使い分けます。

| やりたいこと | 使う候補 | 詳細  |
| --- | --- | --- |
| 縦並び | `Stack`/`Flow` | `primitives/l--stack.md`、`primitives/l--flow.md`  |
| 横並び | `Cluster`（折り返す）/`Flex`（細かく制御する） | `primitives/l--cluster.md`、`primitives/l--flex.md`  |
| カラム | `Columns`（等幅N列）/`AutoColumns`（最小幅ベースの自動段組み）/`WithSide`（2カラム自動切替）  | `primitive-class.md#カラムレイアウト-primitive-の使い分けガイド`  |
| 幅制御 | `Container`（コンテナクエリ基準）/`Wrapper`（直下領域の幅制限）/`max-sz`（単体の幅）  | `trait-class/is--container.md`、`trait-class/is--wrapper.md`、`property-class/max-sz.md` |
| 画像・動画・iframeを置く | `Frame`（アスペクト比枠・直下メディアのfit・overflowを任せる）  | `primitives/l--frame.md`  |
| ボタン | `@lism-css/ui`の`Button`。素の`<button>`を整えるならreset済みの`set--plain` | `components-ui.md`、`set-class.md`  |
| hover効果  | `-hov:*`/`hov={{}}`/`set--hov`/`has--transition`（component CSSの`:hover`より先に検討） | `property-class/hov.md`、`trait-class/has--transition.md`  |
| ボックス・カードの全体リンク | `BoxLink`/`is--boxLink`（クリック領域と重なり順を任せる） | `trait-class/is--boxLink.md`  |
| 小さいUI部品 | `c--*`＋Property Class（`c--*`は意味名に留め、単一要素の見た目はProperty Class/Lism Propsへ） | `property-class.md`、`css-rules.md#component-classc--` |

## 提出前セルフチェック

まず実装プランと実装を1行ずつ照合し、差分を「計画変更（意図的）/実装漏れ（直す）/要確認（再び確認が必要）」に分類します。その後、以下を確認します。

**プロセス照合**

- 実装プラン内の🔁が、提出前に✅または⏸へ解消されているか。🔁のままコードに反映した判断がないか。
- 資料確認ログの各行が、実装プラン内の判断項目と対応しているか。未読のまま採用したPrimitive/トークン/命名/レスポンシブ判断がないか。

**ルール照合**

- 「最小ゲート」の各項目に違反していないか。
- [`antipatterns.md`](./antipatterns.md)のTOCを開き、実装コードに該当しうる項目を1つずつ照合する。リンク表を眺めただけは確認済みにしない。

**プラン再審査**

実装プランの判定自体を再審査します。プラン段階で✅にした逸脱は実装との差分照合では検出できない（差分ゼロ＝合格になってしまう）ため、差分照合とは別に行います。

- `✅例外`を含む✅判定を、最小ゲート・`antipatterns.md`の「直書きしてよい例外」・すり合わせ済みの値マッピング方針に再照合する。許可リスト外の`✅例外`は⏸へ戻す。
- 値照合付きレベルでは、トークン差分表（差分列付き）が存在するか確認する。無ければその実装プランは無効。差分表を作成して照合をやり直す。
- 実行レベル判定が妥当だったかを見直す（「不要」「軽量」への過小判定でチェックを省略していないか）。

**個別確認（最小ゲート・antipatternsでカバーされない項目）**

- `@lism-css/ui`の既存コンポーネントで置き換えられないか。
- 同じProperty Classの組み合わせが3箇所以上ならコンポーネント化を検討したか。
- 既存の命名・レイヤー・ファイル配置に合っているか。
- デザイン再現（値照合付き）では、レンダリング結果の確認を完了報告の前提にする。環境的に確認できない場合は、完了報告にユーザーへの目視確認依頼を含める。HTTPステータスやビルド成功だけで完了扱いにしない。

## 詳細リファレンス

各ファイルの内容と、読むタイミングの目安です。

| ファイル | 内容 | こんな時に読む |
| --- | --- | --- |
| `primitive-class.md` | `l--`/`a--` Primitive一覧と使い分け | レイアウト選定（必要なら`primitives/l--*.md`も） |
| `trait-class.md` | `is--`/`has--` Trait一覧と役割  | 状態・バリエーション設計 |
| `property-class.md` | `-{prop}:{value}`形式のProperty Class | CSSをProperty Class/Propsへ移せるか  |
| `utility-class.md` | `u--*`ユーティリティ  | ユーティリティの確認 |
| `set-class.md` | `set--plain`/`set--hov`等のセットクラス | reset済みボタン等を使う  |
| `tokens.md` | デザイントークンとCSS変数 | 余白・色・角丸・影・fzの照合 |
| `naming.md` | 命名規則とProperty Class省略ルール  | 命名・prefix・Property Class表記 |
| `css-rules.md` | CSS設計・Layer構造・`c--*`・独自prefix  | CSSレイヤー・`c--*`・カスタムCSS |
| `responsive.md` | BP・コンテナクエリ・レスポンシブProps | レスポンシブ・コンテナクエリ |
| `base-styles.md` | Reset CSSとHTML要素の基本スタイル | 素のHTML要素の既定を確認 |
| `components-core.md` | `lism-css`のReact/Astroコアコンポーネント | React/Astroコンポーネント  |
| `components-ui.md` | `@lism-css/ui`のUIコンポーネント  | UIコンポーネント置換 |
| `customize.md` | SCSS変数・`lism.config.js`によるカスタマイズ  | トークン/設定をカスタマイズ  |
| `antipatterns.md` | AIが生成しがちなNG→OKカタログ | 典型ミス確認 |
| `references/authoring.md` | 実装プランの作り方（C0–C8詳細・出力フォーマット） | 実装プランを作る/書式を確認  |

## クラス単位の詳細リファレンス

**Layout Primitives**

- `l--box`/`<Box>`: `primitives/l--box.md`
- `l--flex`/`<Flex>`: `primitives/l--flex.md`
- `l--stack`/`<Stack>`: `primitives/l--stack.md`
- `l--cluster`/`<Cluster>`: `primitives/l--cluster.md`
- `l--grid`/`<Grid>`: `primitives/l--grid.md`
- `l--flow`/`<Flow>`: `primitives/l--flow.md`
- `l--center`/`<Center>`: `primitives/l--center.md`
- `l--frame`/`<Frame>`: `primitives/l--frame.md`
- `l--columns`/`<Columns>`: `primitives/l--columns.md`
- `l--tileGrid`/`<TileGrid>`: `primitives/l--tileGrid.md`
- `l--autoColumns`/`<AutoColumns>`: `primitives/l--autoColumns.md`
- `l--switchColumns`/`<SwitchColumns>`: `primitives/l--switchColumns.md`
- `l--withSide`/`<WithSide>`: `primitives/l--withSide.md`

**Trait Class**

- `is--container`/`<Container>`: `trait-class/is--container.md`
- `is--wrapper`/`<Wrapper>`: `trait-class/is--wrapper.md`
- `is--layer`/`<Layer>`: `trait-class/is--layer.md`
- `is--boxLink`/`<BoxLink>`: `trait-class/is--boxLink.md`
- `has--transition`: `trait-class/has--transition.md`
- `has--gutter`: `trait-class/has--gutter.md`
- `has--snap`: `trait-class/has--snap.md`
- `has--mask`: `trait-class/has--mask.md`

**Atomic Primitives/Property Class**

- `a--icon`/`<Icon>`: `primitives/a--icon.md`
- `a--divider`/`<Divider>`: `primitives/a--divider.md`
- `a--spacer`/`<Spacer>`: `primitives/a--spacer.md`
- `a--decorator`/`<Decorator>`: `primitives/a--decorator.md`
- `-bd`/`-bd-{side}`系: `property-class/bd.md`
- `-hov:*`系: `property-class/hov.md`
- `-max-sz:full`/`-max-sz:bleed`: `property-class/max-sz.md`

## このスキルファイル自身のアップデート方法

ユーザーがスキル更新を依頼した場合は、`lism skill add`または`lism skill update`を案内してください。最新を確認したい場合は、GitHubリポジトリの`skills/lism-css-guide`を確認してください。
