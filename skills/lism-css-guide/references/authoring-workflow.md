# Authoring Workflow（FP0–FP8）

Lism CSSで新規UI・セクション・コンポーネントを書く前に使うpreflight詳細です。各FPは「列挙/照合・verdict/決め方/route先/OK・避ける罠/事前に潰す失敗/guide依存」の7フィールドで判断します。

verdictはforward系を使います: ✅確定 / ⏸要ユーザー確認 / 🔁参照して確定 / 🆕新規定義 / ⬜例外。

## FP0: 入力整理

- **列挙**: 対象（ページ/セクション/部品）、粒度、framework（React/Astro/素のHTML）、既存制約（命名・レイヤー・公開class・CMS・外部JS・E2E）、不明点。
- **照合・verdict**: base値が読めない、状態の有無、反復数、忠実度方針など不明点は⏸。
- **決め方**: 既存コードの命名・レイヤー・実装パターンを先に確認してから方針を置く。
- **route先**: なし。デザイン入力と既存コードが情報源。
- **OK・避ける罠**: OK=「何を/どの粒度で/再利用するか」を先に宣言。罠=デザインpxからいきなり書き始める。
- **事前に潰す失敗**: スコープ未確定で全体へ拡張、状態・レスポンシブの存在見落とし。
- **guide依存**: なし。

## FP1: 構造・セマンティクス選定

- **列挙**: 縦並び/横並び/カラム/メディア枠/幅制御/オーバーレイ/全体リンクなどの構造、要素、heading level、landmark。
- **照合・verdict**: 標準Primitiveで組める→✅。カラム系など迷う→🔁。`@lism-css/ui`で済む→✅または🔁。
- **決め方**: Layout Primitive→Trait→Atomic→UIコンポーネントの順。div+Property Classで押し切らない。
- **route先**: `primitive-class.md`、`primitives/l--*.md`、`trait-class.md`、`components-core.md`、`components-ui.md`、`antipatterns.md#レイアウト選択ミス`。
- **OK・避ける罠**: OK=`<Columns cols={3}>`、`<Frame ar="16/9">`。罠=`<div -d:grid gtc=...>`、手組みメディア枠、最外殻Wrapper。
- **事前に潰す失敗**: div-soup、固定Grid、Frame未使用、Wrapper誤用。
- **guide依存**: 目的別実装ガイド。

## FP2: reuse・コンポーネント境界

- **列挙**: 同じ部品が3箇所以上になりそうか、値差分・slot構造があるか。
- **照合・verdict**: 3+反復見込みかつ同じ意味のUI部品として安定→🆕component化。1〜2回・局所・一時的重複→✅。Props設計が必要→⏸。
- **決め方**: CSSの`c--`新設でなくReact/Astroコンポーネント抽出を優先。`className`/`style`/`data-*`/ARIA/handler透過を最初から設計する。
- **route先**: `components-core.md`、`components-ui.md`、`css-rules.md#component-classc--`、`property-class.md`。
- **OK・避ける罠**: OK=反復するTagをTagコンポーネント化。罠=Property Class束をコピペ展開。
- **事前に潰す失敗**: 後から3箇所重複に気づいて作り直し。
- **guide依存**: Authoring Plan例。

## FP3: 命名設計

- **列挙**: 新設する`c--`/`z--`/`p--`名とBlock/Element/Modifier構造。
- **照合・verdict**: prefix後camelCaseで規約に合う→✅。サイト領域→🆕`z--`。ページ固有→🆕`p--`。公開API・CMS・外部JS・E2E依存→⏸。
- **決め方**: `naming.md`に従う。再利用UIでない領域は`z--`、ページ固有は`p--`。
- **route先**: `naming.md`、`css-rules.md#component-classc--`、`css-rules.md#独自プレフィックス`、`antipatterns.md#クラス名の命名ミスkebab-case`。
- **OK・避ける罠**: OK=`c--featureCard`、`c--featureCard_body`。罠=`c--feature-card__body`、サイトヘッダを`c--`にする。
- **事前に潰す失敗**: kebab-case命名、何でも`c--`、ゾーニングを`c--`にする。
- **guide依存**: `antipatterns.md`と`css-rules.md`。

## FP4: 状態・バリエーション設計

- **列挙**: active/open/disabled/currentなどの状態、solid/outlineなどの見た目違い。
- **照合・verdict**: 状態→🆕`data-*`/ARIA。見た目違い→🆕`c--name--variant`。正規Traitが当たる→✅。
- **決め方**: 状態は属性セレクタ、バリエーションはBEM Modifier。`is--`を状態/バリエーションに流用しない。
- **route先**: `trait-class.md`、`trait-class/is--*.md`、`antipatterns.md#is---の誤用状態バリエーション`、`css-rules.md#component-classc--`。
- **OK・避ける罠**: OK=`data-is-active`+`[data-is-active]`、`c--tag--solid`。罠=`is--active`、`is--solid`。
- **事前に潰す失敗**: `is--`誤用、状態とスタイルの混在、JS toggle対象の不一致。
- **guide依存**: `antipatterns.md`。

## FP5: 値・トークン照合

- **列挙**: spacing/color/fz/radius/shadow/size/lh/ltsなど、使う予定の値をすべて列挙。
- **照合・verdict**: `tokens.md`に完全一致→✅。typo・既存規約上明確な置換→🔁。近似丸め・任意色・ブランド色・忠実度判断→⏸。1px罫線・transform微調整・@media閾値→⬜。
- **決め方**: token値を流用。⏸は候補token+差分表を出して確認まで書かない。
- **route先**: `tokens.md`、`property-class.md`、`antipatterns.md#token-typo存在しない値`、`antipatterns.md#px--固定値の直書き`。
- **OK・避ける罠**: OK=`-fz:xs -p:10 -bgc:base-2 -bdrs:10`。罠=`padding:13px`、`bgc="secondary"`。
- **事前に潰す失敗**: px直書き、token typo、存在しない値、`--keycolor`誤用。
- **guide依存**: `tokens.md`とデザインデータ取り込みフロー。

## FP6: レスポンシブ方針

- **列挙**: 各値のbase値、切替BP（sm/md/lg）、container queryかmedia queryか、container運用なら祖先`isContainer`の有無、固定Grid化していないか。
- **照合・verdict**: base値あり・標準BP・必要な祖先あり→✅。base抜け・xs誤用→🔁。`$is_container_query:0`等でmedia query運用が確認できる場合は`isContainer`必須にしない→✅。固定列をレスポンシブ化するなど挙動変更→⏸。
- **決め方**: base値を必ず置く。標準BPへ寄せる。冗長配列は圧縮する。
- **route先**: `responsive.md`、`trait-class/is--container.md`、`property-class.md`、`primitive-class.md#カラムレイアウト-primitive-の使い分けガイド`。
- **OK・避ける罠**: OK=`p={{ base: '20', md: '30' }}`+祖先`isContainer`。罠=`gtc="repeat(3,1fr)"`固定、base抜け、container祖先なし。
- **事前に潰す失敗**: レスポンシブ抜け、固定Grid、container query運用時の祖先なし。
- **guide依存**: `responsive.md`。

## FP7: CSS境界の分解

- **列挙**: CSSへ書く予定の各宣言を「Property Class/Propsへ移す宣言」と「CSSにしか書けない宣言」に分ける。
- **照合・verdict**: 単一要素向け宣言束→✅マークアップへ。擬似クラス・擬似要素・状態切替・子孫セレクタ→✅CSSへ残す。
- **決め方**: `-{prop}:{value}`またはLism Propsへ移す。`.c--*`はCSSが空でも意味クラスとして残す。
- **route先**: `property-class.md`、`css-rules.md#component-classc--`、`antipatterns.md#property-class-で書けるのに-css-で書く`。
- **OK・避ける罠**: OK=`<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">`。罠=単一要素の宣言を全部`.c--tag{}`に書く。
- **事前に潰す失敗**: CSS肥大化、空化のついでに意味クラスを消す。
- **guide依存**: `property-class.md`と`tokens.md`。

## FP8: 既定値の確認

- **列挙**: 使うPrimitiveが既に持つ既定CSSを確認し、同値をProps/Property Classで重ねていないか。
- **照合・verdict**: 既定と同値→足さない。既定と違う意図的上書き→✅。guide未整備のPrimitive既定→guide TODOへ回す。
- **決め方**: `primitives/l--*.md`の「既定の挙動」を見る。念のための`ai="center"`/`ov="hidden"`/直下img`w/h/object-fit`を足さない。
- **route先**: `primitives/l--cluster.md`、`primitives/l--frame.md`、`primitive-class.md`、`components-core.md`。
- **OK・避ける罠**: OK=`<Cluster g="15">`、`<Frame ar="16/9"><img /></Frame>`。罠=`<Cluster fxw="wrap" ai="center">`、Frame直下imgに`-w:100%`や`object-fit`。
- **事前に潰す失敗**: 既定値の重複指定。
- **guide依存**: 各`primitives/l--*.md`の既定CSS概要。
