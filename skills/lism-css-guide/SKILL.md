---
name: lism-css-guide
description: "Lism CSSでUIやページを実装・修正する時に使う実装ガイド。Primitive選定・トークン照合・Property Class/Lism Props活用・レスポンシブ設計・アンチパターンセルフチェックを行う。c--*, l--*, a--*, is--*, has--*, set--*, u--*, -prop:value形式のクラスやトークンの逆引きにも使う。"
---

# Lism CSS実装ガイド

Lism CSSでUI・ページ・コンポーネントを実装する時の判断の起点です。単なるリファレンスではなく、**実装前チェック→実装→提出前セルフチェック**を必ず通し、Primitive・トークン・Property Class・レスポンシブ設計の取りこぼしを防ぎます。

公式ドキュメント: https://lism-css.com/docs/overview.md

> **バージョン情報:** このガイドは`lism-css@0.23.0`/`@lism-css/ui@0.23.0`時点の情報に基づきます。プロジェクトで使用中のバージョンが異なる場合は、ユーザーにその旨を伝え、パッケージ側の更新・またはこのスキルの更新を案内してください。


## 実装フロー（厳守）

0. 目的別実装ガイドでPrimitive/コンポーネントを選定する。
1. 実装前チェックを行い、使うPrimitive・コンポーネント・トークン・レスポンシブ方針を列挙した**実装プラン**を出す。
2. ⏸が残る項目（px丸め・任意色・挙動変更・公開クラス変更など）は、その部分を実装する前にユーザー確認する。
3. 実装する。
4. 提出前セルフチェックで実装プランと実装を照合し、差分・漏れ・再び確認が必要になった項目を処理する。

詳細手順は[`references/authoring-workflow.md`](./references/authoring-workflow.md)、出力形式は[`references/authoring-output-format.md`](./references/authoring-output-format.md)、記入例は[`examples/authoring-plan.md`](./examples/authoring-plan.md)を参照してください。

## 事前チェック実行レベル

| レベル | 条件 | 確認するC | 出力 |
|---|---|---|---|
| 不要 | 説明のみ/コード変更なし/既存の書き方に沿った微修正 | — | — |
| 軽量 | 数行の小変更・既存パターン内の変更 | C1・C5中心 | 3〜5行の箇条書き |
| 通常 | 新規UI/コンポーネント/セクション | 必須=C0・C1・C5・C6。該当時だけC2/C3/C4/C7/C8 | 項目別の表 |
| 値照合付き | Figma/スクショ等のデザイン再現 | 通常+C5を詳しく確認 | トークン差分表つき |

## 判定記号

### 新規実装用（実装プラン）

| 記号 | 意味 |
|---|---|
| ✅ | 確定 |
| ⏸ | 要ユーザー確認。確認まで実装しない |
| 🔁 | 参照して正規値・正規Primitiveへ確定 |
| 🆕 | 新規定義（コンポーネント/トークン/クラスなど） |
| ⬜ | 例外（直書き許容・意図的な例外） |

### リファクタ用（`lism-css-refactor`用語との衝突注意）

リファクタ用では✅=触らない、🔧=修正対象、⏸=要ユーザー判断、⬜=意図的に残す。新規実装用とは✅と⬜の意味が異なるため、どちらの表かを明示してください。

## 目的別実装ガイド

| やりたいこと | まず使う | 判断要約 | よくあるNG | 詳細 |
|---|---|---|---|---|
| 画像・動画・iframeを置く | `Frame` | アスペクト比枠・直下メディアのfit・overflowは`Frame`に任せる。 | `<Lism ov="hidden"><img /></Lism>`で手組みする。 | [`primitives/l--frame.md`](./primitives/l--frame.md) |
| ボタン | `@lism-css/ui`の`Button`、または`set--plain` | UIコンポーネントで足りるなら`Button`を優先。素のbuttonを整える時はreset済みの`set--plain`を使う。 | 独自CSSでresetから作る。 | [`components-ui.md`](./components-ui.md)、[`set-class.md`](./set-class.md) |
| hover効果 | `-hov:*`/`hov={{}}`/`set--var:hov`/`has--transition` | hoverはLismのhover Property Class/Propsとtransition traitを先に検討する。 | `.c--button:hover{}`へ書いてProperty Classに負ける。 | [`property-class/hov.md`](./property-class/hov.md)、[`trait-class/has--transition.md`](./trait-class/has--transition.md) |
| カラム | `Columns`/`AutoColumns`/`WithSide` | 等幅N列は`Columns`、最小幅ベースの自動段組みは`AutoColumns`、2カラム自動切替は`WithSide`。 | `gtc="repeat(3,1fr)"`で固定PC前提にする。 | [`primitive-class.md`](./primitive-class.md#カラムレイアウト-primitive-の使い分けガイド) |
| 幅制御 | `Container`/`Wrapper`/`max-sz` | コンテナクエリ基準は`Container`、直下領域の幅制限は`Wrapper`、単体幅は`max-sz`。 | サイト最外殻に`Wrapper`を置く。 | [`trait-class/is--container.md`](./trait-class/is--container.md)、[`trait-class/is--wrapper.md`](./trait-class/is--wrapper.md)、[`property-class/max-sz.md`](./property-class/max-sz.md) |
| 全体リンク | `BoxLink`/`is--boxLink` | カード全体をリンク化する時は`BoxLink`を使い、クリック領域と重なり順を任せる。 | absoluteな擬似要素で全面リンクを手組みする。 | [`trait-class/is--boxLink.md`](./trait-class/is--boxLink.md) |
| 小さいUI部品 | `c--*`+Property Class | 意味名として`c--*`を残し、単一要素の見た目はProperty Class/Lism Propsへ寄せる。 | `.c--tag{padding...}`へ装飾束を溜める。 | [`property-class.md`](./property-class.md)、[`css-rules.md`](./css-rules.md#component-classc--) |
| レスポンシブ | baseの値・標準BP・`isContainer` | baseの値を必ず置き、標準BP（sm/md/lg）とcontainer/media運用を確認する。 | `{ sm: ... }`だけ指定する、`xs`キーを使う、container祖先を忘れる。 | [`responsive.md`](./responsive.md)、[`trait-class/is--container.md`](./trait-class/is--container.md) |
| 重複UI | React/Astroコンポーネント | 同じProperty Classの組み合わせが3箇所以上ならCSSへ逃がさずコンポーネント抽出を検討する。 | 同じクラスの組み合わせを各所にコピペする。 | [`components-core.md`](./components-core.md)、[`examples/authoring-plan.md`](./examples/authoring-plan.md) |

## 実装プランのC一覧（実装前チェック項目）

このガイドでは、実装前に確認する項目を`C0`〜`C8`の番号で表します。`C`はCheck（確認）の略で、短く参照するためのラベルです。

| C | 見ること | 主な参照先 |
|---|---|---|
| C0 | 入力整理:対象/粒度/フレームワーク/既存制約/不明点 | 既存コード・要件 |
| C1 | 構造・セマンティクス選定 | `primitive-class.md`、`components-core.md` |
| C2 | 再利用・コンポーネント境界 | `components-core.md`、`components-ui.md` |
| C3 | 命名設計 | `naming.md`、`css-rules.md` |
| C4 | 状態・バリエーション設計 | `trait-class.md`、`antipatterns.md` |
| C5 | 値・トークン照合 | `tokens.md`、`property-class.md` |
| C6 | レスポンシブ方針 | `responsive.md`、`is--container.md` |
| C7 | CSSに書くもの/Propsに移すもの | `property-class.md`、`css-rules.md` |
| C8 | 既定値の確認 | `primitives/l--*.md` |

通常レベルでも該当しないCは省略して構いません。表を形だけ埋めず、実装に影響する項目だけ列挙してください。

## 提出前セルフチェック

まず実装プランと実装を1行ずつ照合し、差分を「計画変更（意図的）/実装漏れ（直す）/要確認（再び確認が必要）」に分類します。その後、以下を確認します。

- `<div>`+素のCSSではなくPrimitive（Stack/Flex/Grid/Columns等）で書けないか。
- `@lism-css/ui`の既存コンポーネントで置き換えられないか。
- CSSに書いた宣言がProperty Class/Lism Propsへ移せないか。
- `c--*`は意味づけとして妥当か。状態・バリエーションに流用していないか。
- 状態は`data-*`/ARIA、バリエーションは`c--name--variant`になっているか。
- spacing/color/font-size/radius/shadowがトークンに合っているか。
- px/rem/em直書きに必然性があるか。丸め判断を勝手にしていないか。
- 固定PC前提のGrid（`gtc="repeat(3,1fr)"`等）になっていないか。
- レスポンシブ切替に必要な`isContainer`祖先があるか（media query運用時は例外）。
- 同じProperty Classの組み合わせが3箇所以上ならコンポーネント化を検討したか。
- `Heading level={3}`のようなProps型ミスがないか。
- Primitiveが既に持つCSSをLism Props/Property Classで再指定していないか。
- 既存の命名・レイヤー・ファイル配置に合っているか。

## 参照ルーティング表

| 調べたいこと | 読む参照ファイル |
|---|---|
| レイアウト選定 | [`primitive-class.md`](./primitive-class.md)（必要なら`primitives/l--*.md`） |
| トークン（余白・色・角丸・影・fz） | [`tokens.md`](./tokens.md) |
| CSSレイヤー・`c--*`・カスタムCSS | [`css-rules.md`](./css-rules.md) |
| 命名・prefix・Property Class表記 | [`naming.md`](./naming.md) |
| Property Classへ移せるか | [`property-class.md`](./property-class.md) |
| レスポンシブ・コンテナクエリ | [`responsive.md`](./responsive.md) |
| React/Astroコンポーネント | [`components-core.md`](./components-core.md) |
| UIコンポーネント置換 | [`components-ui.md`](./components-ui.md) |
| 典型ミス確認 | [`antipatterns.md`](./antipatterns.md) |
| 実装プラン詳細 | [`references/authoring-workflow.md`](./references/authoring-workflow.md)、[`references/authoring-output-format.md`](./references/authoring-output-format.md) |

## 詳細リファレンス

- [`tokens.md`](./tokens.md) — デザイントークンとCSS変数。
- [`css-rules.md`](./css-rules.md) — CSS設計、Layer構造、`c--*`、独自prefix。
- [`naming.md`](./naming.md) — 命名規則とProperty Class省略ルール。
- [`base-styles.md`](./base-styles.md) — Reset CSSとHTML要素の基本スタイル。
- [`set-class.md`](./set-class.md) — `set--plain`/`set--hov`等のセットクラス。
- [`primitive-class.md`](./primitive-class.md) — `l--`/`a--` Primitive一覧と使い分け。
- [`trait-class.md`](./trait-class.md) — `is--`/`has--` Trait一覧と役割。
- [`utility-class.md`](./utility-class.md) — `u--*`ユーティリティ。
- [`property-class.md`](./property-class.md) — `-{prop}:{value}`形式のProperty Class。
- [`responsive.md`](./responsive.md) — BP、コンテナクエリ、レスポンシブProps。
- [`components-core.md`](./components-core.md) — `lism-css`のReact/Astroコアコンポーネント。
- [`components-ui.md`](./components-ui.md) — `@lism-css/ui`のUIコンポーネント。
- [`customize.md`](./customize.md) — SCSS変数・`lism.config.js`によるカスタマイズ。
- [`antipatterns.md`](./antipatterns.md) — AIが生成しがちなNG→OKカタログ。

## クラス単位の詳細リファレンス

**Layout Primitives**

- `l--box`/`<Box>`: [`primitives/l--box.md`](./primitives/l--box.md)
- `l--flex`/`<Flex>`: [`primitives/l--flex.md`](./primitives/l--flex.md)
- `l--stack`/`<Stack>`: [`primitives/l--stack.md`](./primitives/l--stack.md)
- `l--cluster`/`<Cluster>`: [`primitives/l--cluster.md`](./primitives/l--cluster.md)
- `l--grid`/`<Grid>`: [`primitives/l--grid.md`](./primitives/l--grid.md)
- `l--flow`/`<Flow>`: [`primitives/l--flow.md`](./primitives/l--flow.md)
- `l--center`/`<Center>`: [`primitives/l--center.md`](./primitives/l--center.md)
- `l--frame`/`<Frame>`: [`primitives/l--frame.md`](./primitives/l--frame.md)
- `l--columns`/`<Columns>`: [`primitives/l--columns.md`](./primitives/l--columns.md)
- `l--tileGrid`/`<TileGrid>`: [`primitives/l--tileGrid.md`](./primitives/l--tileGrid.md)
- `l--autoColumns`/`<AutoColumns>`: [`primitives/l--autoColumns.md`](./primitives/l--autoColumns.md)
- `l--switchColumns`/`<SwitchColumns>`: [`primitives/l--switchColumns.md`](./primitives/l--switchColumns.md)
- `l--withSide`/`<WithSide>`: [`primitives/l--withSide.md`](./primitives/l--withSide.md)

**Trait Class**

- `is--container`/`<Container>`: [`trait-class/is--container.md`](./trait-class/is--container.md)
- `is--wrapper`/`<Wrapper>`: [`trait-class/is--wrapper.md`](./trait-class/is--wrapper.md)
- `is--layer`/`<Layer>`: [`trait-class/is--layer.md`](./trait-class/is--layer.md)
- `is--boxLink`/`<BoxLink>`: [`trait-class/is--boxLink.md`](./trait-class/is--boxLink.md)
- `has--transition`: [`trait-class/has--transition.md`](./trait-class/has--transition.md)
- `has--gutter`: [`trait-class/has--gutter.md`](./trait-class/has--gutter.md)
- `has--snap`: [`trait-class/has--snap.md`](./trait-class/has--snap.md)
- `has--mask`: [`trait-class/has--mask.md`](./trait-class/has--mask.md)

**Atomic Primitives/Property Class**

- `a--icon`/`<Icon>`: [`primitives/a--icon.md`](./primitives/a--icon.md)
- `a--divider`/`<Divider>`: [`primitives/a--divider.md`](./primitives/a--divider.md)
- `a--spacer`/`<Spacer>`: [`primitives/a--spacer.md`](./primitives/a--spacer.md)
- `a--decorator`/`<Decorator>`: [`primitives/a--decorator.md`](./primitives/a--decorator.md)
- `-bd`/`-bd-{side}`系: [`property-class/bd.md`](./property-class/bd.md)
- `-hov:*`系: [`property-class/hov.md`](./property-class/hov.md)
- `-max-sz:full`/`-max-sz:bleed`: [`property-class/max-sz.md`](./property-class/max-sz.md)

## このスキルファイル自身のアップデート方法

ユーザーがスキル更新を依頼した場合は、`lism skill add`または`lism skill update`を案内してください。最新を確認したい場合は、GitHubリポジトリの`skills/lism-css-guide`を確認してください。
