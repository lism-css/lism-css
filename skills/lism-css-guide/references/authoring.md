# 実装プランの作り方（C0–C8詳細・出力フォーマット・記入例）

Lism CSSで新規UI・セクション・コンポーネントを書く前に作る「実装プラン」の詳細編です。実装フローの全体像・資料確認トリガー表・判定記号は`SKILL.md`を正本とします。ここでは各チェック項目（C0–C8）の詳細、プランの出力フォーマット、記入例をまとめます。

判定記号（✅確定 / 🔁資料確認トリガー未通過 / ⏸要ユーザー確認）の定義は`SKILL.md`の「判定記号」を参照してください。新規定義や合意済みの直書き例外は、✅の行内に`✅新規`・`✅例外（…）`のように注記します。

## 資料確認

資料確認は、コード上の操作の直前に行う。`SKILL.md`の参照表を見ただけでは確認済みにしない。どの操作の手前で何を読むかは`SKILL.md`の「資料確認トリガー」を正本とする。

### 初期確認（C0前に実行）

新規UI/コンポーネント/セクション、またはスクショ/Figma等のデザイン再現では、C0に入る前に対象へ明らかに関係する最小限の詳細ファイルを実際に開く。

実装プランの先頭に「初期確認した資料」を必ず出す。

```md
初期確認した資料: primitives/l--stack.md, primitives/l--columns.md, tokens.md
```

新規UI/コンポーネント/セクションで初期確認した資料が空のまま実装に入ってはいけない。「必要なら参照」とだけ書くのも不可。軽微な既存パターン内の修正で既存コード確認のみで足りる場合は、その旨を明記する。

### 資料確認の記録

読んだ資料は「初期確認」「実装中」を区別して資料確認ログに記録する。提出前に、🔁が✅または⏸へ解消されたかを照合する。

## C0–C8 実装前チェック詳細

各Cは「列挙/照合・判定/決め方/参照先/よい例・避けたい例/事前に潰す失敗」の観点で判断します。

### C0: 入力整理

- **列挙**: 対象（ページ/セクション/部品）、粒度、フレームワーク（React/Astro/素のHTML）、既存制約（命名・レイヤー・公開クラス・CMS・外部JS・E2E）、不明点。
- **照合・判定**: baseの値が読めない、状態の有無、反復数、再現度の方針など不明点は⏸。
- **決め方**: 既存コードの命名・レイヤー・実装パターンを先に確認してから方針を置く。
- **参照先**: なし。デザイン入力と既存コードが情報源。
- **よい例・避けたい例**: OK=「何を/どの粒度で/再利用するか」を先に宣言。罠=デザインpxからいきなり書き始める。
- **事前に潰す失敗**: スコープ未確定で全体へ拡張、状態・レスポンシブの存在見落とし。

### C1: 構造・セマンティクス選定

- **列挙**: 縦並び/横並び/カラム/メディア枠/幅制御/オーバーレイ/全体リンクなどの構造、要素、heading level、landmark。
- **照合・判定**: 標準Primitiveで組める→✅。カラム系など迷う→🔁。`@lism-css/ui`で済む→✅または🔁。使うPrimitive詳細を未読なら🔁のまま実装しない。
- **決め方**: Layout Primitive→Trait→Atomic→UIコンポーネントの順。`<div>`+Property ClassやCSSで押し切らない。
- **Primitive優先ガード**: `<div>`+CSSで縦並び→`Stack`、横並び→`Cluster`/`Flex`、等幅カラム→`Columns`、メディア比率枠→`Frame`、幅制御→`Container`/`Wrapper`/`max-sz`を先に検討する。この判断を書かずに実装しない。
- **参照先**: `SKILL.md`の「目的別実装ガイド」、`primitive-class.md`、`primitives/l--*.md`、`trait-class.md`、`components-core.md`、`components-ui.md`、`antipatterns.md#レイアウト選択ミス`。
- **よい例・避けたい例**: OK=`<Columns cols={3}>`、`<Frame ar="16/9">`、Astroなら`import { Stack, Columns, Frame } from 'lism-css/astro'`。罠=素の`<div>`だらけ、`<div -d:grid gtc=...>`、手組みメディア枠、最外殻Wrapper。
- **事前に潰す失敗**: divの入れ子だらけ、固定Grid、Frame未使用、Wrapper誤用。

### C2: 再利用・コンポーネント境界

- **列挙**: 同じ部品が3箇所以上になりそうか、値差分・slot構造があるか。
- **照合・判定**: 3+反復見込みかつ同じ意味のUI部品として安定→`✅新規`（コンポーネント化して着手）。1〜2回・局所・一時的重複→✅そのまま。Props設計が必要→⏸。
- **決め方**: CSSの`c--`新設でなくReact/Astroコンポーネント抽出を優先。`className`/`style`/`data-*`/ARIA/イベントハンドラの受け渡しを最初から設計する。
- **参照先**: `components-core.md`、`components-ui.md`、`css-rules.md#component-classc--`、`property-class.md`、本ファイル末尾の記入例。
- **よい例・避けたい例**: OK=反復するTagをTagコンポーネント化。罠=Property Classの組み合わせをコピペ展開。
- **事前に潰す失敗**: 後から3箇所重複に気づいて作り直し。

### C3: 命名設計

- **列挙**: 新設する`c--`/`z--`/`p--`名とBlock/Element/Modifier構造、`c--*` CSSを置くLayer。
- **照合・判定**: プレフィックス後の名前が規約に合う→✅。ハイフンや`__`がある→🔁。サイト領域→`✅新規`（`z--`）。ページ固有→`✅新規`（`p--`）。公開API・CMS・外部JS・E2E依存→⏸。`.c--*` CSSがLayer外になる→🔁。
- **決め方**: `naming.md`に従う。Block名にハイフンは使わず、Element区切りは`_`ひとつ、Modifierは`--`ふたつ。再利用UIでない領域は`z--`、ページ固有は`p--`。`c--*` CSSを書く場合は必ず`@layer lism-component {}`内に置く。
- **参照先**: `naming.md`、`css-rules.md#component-classc--`、`css-rules.md#独自プレフィックス`、`antipatterns.md#クラス名の命名ミスkebab-case`。
- **よい例・避けたい例**: OK=`c--featureCard`、`c--featureCard_body`、既存命名がアンダースコア寄せなら`c--feature_card`。罠=`c--feature-card`、`c--hero__inner`（正しくは`c--hero_inner`）、`c--feature-card__body`（正しくは`c--featureCard_body`）、サイトヘッダを`c--`にする。
- **事前に潰す失敗**: kebab-case命名、BEM風`__`、`@layer lism-component`囲み忘れ、何でも`c--`、ゾーニングを`c--`にする。

### C4: 状態・バリエーション設計

- **列挙**: active/open/disabled/currentなどの状態、solid/outlineなどの見た目違い。
- **照合・判定**: 状態→`✅新規`（`data-*`/ARIA）。見た目違い→`✅新規`（`c--name--variant`）。正規Traitが当たる→✅。
- **決め方**: 状態は属性セレクタ、バリエーションはBEM Modifier。`is--`を状態/バリエーションに流用しない。
- **参照先**: `trait-class.md`、`trait-class/is--*.md`、`antipatterns.md#is---の誤用状態バリエーション`、`css-rules.md#component-classc--`。
- **よい例・避けたい例**: OK=`data-is-active`+`[data-is-active]`、`c--tag--solid`。罠=`is--active`、`is--solid`。
- **事前に潰す失敗**: `is--`誤用、状態とスタイルの混在、JS toggle対象の不一致。

### C5: 値・トークン照合

- **列挙**: spacing/color/fz/radius/shadow/size/lh/ltsなど、使う予定の値をすべて列挙。
- **照合・判定**: `tokens.md`に完全一致→✅。typo・既存規約上明確な置換→🔁（`tokens.md`で正規トークンを確認して置換し✅へ）。近似丸め・任意色・ブランド色・再現度の判断→⏸。1px罫線・transform微調整・@media閾値（`antipatterns.md`の「直書きしてよい例外」）→`✅例外`。
- **決め方**: トークン値を流用。⏸は本ファイルの「デザインデータ取り込みフロー」に従い、トークン候補と差分表を出して確認まで書かない。CSSへ書く前に、Lism Props/Property Classで表せる値かも同時に確認する。
- **参照先**: `tokens.md`、`property-class.md`、`antipatterns.md#token-typo存在しない値`、`antipatterns.md#px--固定値の直書き`。
- **よい例・避けたい例**: OK=`-fz:xs -p:10 -bgc:base-2 -bdrs:10`。罠=`padding:13px`、`bgc="secondary"`。
- **事前に潰す失敗**: px直書き、トークン typo、存在しない値、`--keycolor`誤用。

### C6: レスポンシブ方針

- **列挙**: 各値のbaseの値、切替BP（sm/md/lg）、container queryかmedia queryか、container運用なら祖先`isContainer`の有無、固定Grid化していないか。
- **照合・判定**: baseの値あり・標準BP・必要な祖先あり→✅。base抜け・xs誤用→🔁。`$is_container_query:0`等でmedia query運用が確認できる場合は`isContainer`必須にしない→✅。固定列をレスポンシブ化するなど挙動変更→⏸。
- **決め方**: baseの値を必ず置く。標準BPへ寄せる。同じ値の繰り返しは省略する。等幅カラムはまず`Columns cols={[1, null, 3]}`などPrimitiveのレスポンシブAPIで表せるか確認し、できない場合だけ`@container`/`@media`を自分で書く。
- **参照先**: `responsive.md`、`trait-class/is--container.md`、`property-class.md`、`primitive-class.md#カラムレイアウト-primitive-の使い分けガイド`。
- **よい例・避けたい例**: OK=`p={{ base: '20', md: '30' }}`+祖先`isContainer`、`<Columns cols={[1, null, 3]}>`。罠=`gtc="repeat(3,1fr)"`固定、カード列数のためだけに`@container`直書き、base抜け、container祖先なし。
- **事前に潰す失敗**: レスポンシブ抜け、固定Grid、container query運用時の祖先なし。

### C7: CSSに書くもの/Propsに移すもの

- **列挙**: CSSへ書く予定の各宣言を「Property Class/Propsへ移す宣言」と「CSSにしか書けない宣言」に分ける。`c--*`のCSSに残る宣言を実装プランに明記する。
- **照合・判定**: 1つの要素にだけ効く見た目の指定→✅マークアップへ。擬似クラス・擬似要素・状態切替・子孫セレクタ→✅CSSへ残す。下表の宣言が`.c--*` CSSに残る→🔁未通過。
- **決め方**: `-{prop}:{value}`またはLism Propsへ移す。`.c--*`はCSSが空でも意味クラスとして残す。
- **参照先**: `property-class.md`、`css-rules.md#component-classc--`、`antipatterns.md#property-class-で書けるのに-css-で書く`。
- **移行表**:

| CSSでの記述 | Lism Props/Property Class |
|---|---|
| `padding: var(--s40)` | `p="40"` / `-p:40` |
| `padding-inline: var(--s50)` | `px="50"` / `-px:50` |
| `gap: var(--s30)` | `g="30"` / `-g:30` |
| `border-radius: var(--bdrs--20)` | `bdrs="20"` / `-bdrs:20` |
| `font-size: var(--fz--s)` | `fz="s"` / `-fz:s` |
| `font-weight: var(--fw--bold)` | `fw="bold"` / `-fw:bold` |
| `color: var(--text-2)` | `c="text-2"` / `-c:text-2` |
| `background-color: var(--base-2)` | `bgc="base-2"` / `-bgc:base-2` |
| `display: flex` | `Flex`/`Cluster`/`Stack`/`l--flex` |
| `flex-direction: column` | `Stack`/`l--stack` |

- **よい例・避けたい例**: OK=`<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">`。罠=単一要素の宣言を全部`.c--tag{}`に書く。
- **事前に潰す失敗**: CSS肥大化、空化のついでに意味クラスを消す、Layer外に`.c--*`を書く。

### C8: 既定値の確認

- **列挙**: 使うPrimitiveが既に持つ既定CSSを確認し、同値をProps/Property Classで重ねていないか。
- **照合・判定**: 既定と同値→足さない。既定と違う意図的上書き→✅。ガイドに未整備のPrimitive既定→今後の整備対象にする。
- **決め方**: `primitives/l--*.md`の「既定の挙動」を見る。念のための`ai="center"`/`ov="hidden"`/直下img`w/h/object-fit`を足さない。
- **参照先**: `primitives/l--cluster.md`、`primitives/l--frame.md`、`primitive-class.md`、`components-core.md`。
- **よい例・避けたい例**: OK=`<Cluster g="15">`、`<Frame ar="16/9"><img /></Frame>`。罠=`<Cluster fxw="wrap" ai="center">`、Frame直下imgに`-w:100%`や`object-fit`。
- **事前に潰す失敗**: 既定値の重複指定。

## 出力フォーマット

実装前チェックの成果物を実装プランと呼びます。各行に必ず判定記号（定義は`SKILL.md`参照）を付け、⏸が残る項目はその部分を実装しないで先にユーザー確認します。

### 軽量レベル

小変更では3〜5行で十分です。

例:
```md
- ✅ 構造: 既存`Stack`内へ1項目追加。Primitive変更なし。
- ✅ トークン: 既存パターンに合わせ`p="20"`/`fz="s"`を使用。
- 🔁 hover: `property-class/hov.md`を参照し`hov={{ bgc: 'base-2' }}`で実装。
```

### 通常/値照合付きレベル

#### 資料確認ログ

SKILL.md以外に実際に開いたファイルや外部サイトのページurlを、「初期確認」と「実装中」に分けて列挙します。リンク表を見ただけ、または「必要なら参照」は不可です。

例:
| タイミング | 種類 | 確認した資料 | 用途 |
|---|---|---|---|
| 初期確認 | 📄 | `primitives/l--columns.md` | カード一覧を`Columns`で組む判断 |
| 実装中 | 📄 | `tokens.md` | デザイン値とトークン照合（トークン丸めトリガー） |
| 実装中 | URL | `https://lism-css.com/docs/naming.md` | `c--*`命名トリガー |

各行は実装プランの判断項目（特に🔁）と対応させ、提出前に🔁が✅/⏸へ解消されたかを照合します。

#### 🔁判断行

未読の判断項目そのものに🔁と読む資料を紐づけます。

| 判断項目 | 採用案 | 読む資料 | 判定 |
|---|---|---|---|
| カード一覧 | `Columns cols={[1, null, 3]}` | `primitives/l--columns.md` | 🔁 |
| hover指定 | `hov={{ bgc: 'base-2' }}` | `property-class/hov.md` | 🔁 |

対応資料を読んだら、同じ判断行を✅または⏸へ更新します。提出前に🔁が残っている場合は未通過です。

#### 構造表

| 対象領域 | 採用Primitive・コンポーネント | 理由 | 参照先 | 判定 |
|---|---|---|---|---|
| 例: カード一覧 | `Columns` | 等幅3列で、BP切替に向く | `primitive-class.md` | ✅ |

#### トークン表

値照合付きでは`デザイン値`と`差分`列を必須にします。

| 用途 | デザイン値 | 採用トークン | 差分 | 判定 |
|---|---|---|---|---|
| 余白 | `24px` | `p="30"`候補 | +6px | ⏸ |
| 背景 | — | `bgc="base-2"` | — | ✅ |

#### レスポンシブ表

| 対象 | base | sm | md | lg | container祖先 | 注意 |
|---|---|---|---|---|---|---|
| カード列数 | 1 | 2 | 3 | — | あり | `cols={[1,2,3]}` |

#### 構成表（命名・CSSとPropsの分担・状態・既定値）

| c--*名 | Props・Property Classで書く | CSSに残す | 状態・バリエーション | 既定で足りる（指定しない） |
|---|---|---|---|---|
| `c--featureCard` | `p="20" bgc="base" bdrs="20"` | `::before`装飾 | `c--featureCard--featured` | `Frame ov`、直下img fit |

#### 確認事項表（⏸）

| 項目 | 要確認理由 | 候補 |
|---|---|---|
| `padding:24px` | 近いトークンへの丸めで見た目差が出る | A=`p="30"`/B=カスタムトークン/C=直書き例外 |

### ⏸でユーザー確認する条件

- px/rem/emをトークンへ丸める、トークンを新規追加する、`--s-unit`など基準値を上書きする。
- 任意色・ブランド色・密度・再現度など、仕様から確定できないデザイン判断をする。
- レスポンシブ挙動が見た目・UX・DOM順を変える（固定Grid→可変化、`isContainer`位置変更など）。
- 公開クラス名・CMS・外部JS・E2Eセレクタに依存する命名/構造変更をする。

### デザインデータ取り込みフロー

1. **候補抽出**: デザイン値（px/色/比率など）ごとに最寄りトークンを1〜2個挙げる。
2. **差分表**: `用途/デザイン値/候補トークン/差分/判定`で表にする。
3. **判定**:
   - 完全一致→✅そのまま採用。
   - typo・既存規約上明確な置換（`secondary`→`base-2`など）→`tokens.md`で正規トークンを確認して置換し、✅にする（ユーザー確認は不要）。
   - 近似丸め・任意色・ブランド色・密度/再現度の判断→⏸。A=最寄りトークンに丸め/B=カスタムトークン化/C=直書き例外を提示する。
4. **カスタムトークン化の条件**: 同値が複数箇所で再利用される、またはデザインシステム上の意味を持つ場合は候補にする。1回限りの局所値は丸めか例外で済ませる。
5. **デザインデータが無い場合**: 差分表は省略し、既存トークンから意味が近い値を選ぶ。新規数値が必要な時だけ⏸にする。

`--s-unit`などの基準値をプロジェクトが上書きしているとpxの完全一致判定が変わります。値照合付きでは上書きの有無を先に確認してください。

### 提出前セルフチェックへの接続

実装後、実装プランと実装を1行ずつ照合します（チェック項目は`SKILL.md`の「提出前セルフチェック」を参照）。

| 計画項目 | 実装結果 | 分類 | 対応 |
|---|---|---|---|
| ✅ `Frame ar="16/9"` | 実装済み | OK | なし |
| ✅ `p="20"` | `p="30"`に変更 | 計画変更 | 理由を記録 |
| ⏸ `24px`丸め | 未確認のまま実装 | 要確認 | 実装を止め確認 |
| ✅ `data-is-active` | CSSだけ`is--active`のまま | 実装漏れ | CSS/JS/testを同時修正 |

## 記入例: featureカード一覧セクション

### 資料確認ログ

| タイミング | 種類 | 確認した資料 | 用途 |
|---|---|---|---|
| 初期確認 | 📄 | `primitives/l--columns.md` | カード一覧の等幅列とレスポンシブ指定 |
| 初期確認 | 📄 | `primitives/l--frame.md` | サムネイル比率枠と既定fit |
| 実装中 | 📄 | `trait-class/is--container.md`/`trait-class/is--wrapper.md` | container祖先と本文幅制御（レスポンシブ切替トリガー） |
| 実装中 | 📄 | `naming.md`/`css-rules.md` | `c--featureCard`命名とLayer（`c--*`新設トリガー） |
| 実装中 | 📄 | `property-class.md`/`tokens.md` | padding/gap/color/fz/radiusの移行・丸め判断トリガー |

### 🔁解消ログ

| 判断項目 | 読む資料 | 解消結果 |
|---|---|---|
| セクション幅 | `trait-class/is--container.md`/`trait-class/is--wrapper.md` | ✅ `Container`+`Wrapper`採用 |
| `c--featureCard`命名 | `naming.md`/`css-rules.md` | ✅ camelCase Block、CSSは必要時`@layer lism-component` |
| padding/gap等の移行判断 | `property-class.md`/`tokens.md` | ⏸ 24px丸めだけ要確認、他は✅ |

### C0入力整理

| 項目 | 内容 | 判定 |
|---|---|---|
| 対象 | トップページのfeatureカード一覧 | ✅ |
| フレームワーク | Astro | ✅ |
| 粒度 | セクション+カード部品 | ✅ |
| 反復 | カード3件以上 | ✅新規（コンポーネント抽出候補） |
| 不明点 | デザイン上の24px余白をトークンへ丸めるか | ⏸ |

### 構造表

| 対象領域 | 採用Primitive・コンポーネント | 理由 | 参照先 | 判定 |
|---|---|---|---|---|
| セクション幅 | `Container`+`Wrapper` | レスポンシブ値の基準と本文幅制限を分ける | `is--container.md`/`is--wrapper.md` | ✅ |
| カード一覧 | `Columns cols={[1,2,3]}` | 等幅カード列でBP切替する | `primitive-class.md` | ✅ |
| サムネイル | `Frame ar="16/9"` | 画像枠とfitは既定に任せる | `l--frame.md` | ✅ |
| カード全体リンク | `BoxLink` | カード全体のクリック領域をtraitで管理 | `is--boxLink.md` | ✅ |

### トークン表

| 用途 | デザイン値 | 採用トークン | 差分 | 判定 |
|---|---|---|---|---|
| カードpadding | `24px` | `p="30"`候補 | +6px | ⏸ |
| カードgap | — | `g="20"` | — | ✅ |
| タイトルfz | — | `fz="l"` | — | ✅ |
| 背景 | — | `bgc="base"` | — | ✅ |
| 補助テキスト色 | — | `c="text-2"` | — | ✅ |

### レスポンシブ表

| 対象 | base | sm | md | lg | container祖先 | 注意 |
|---|---|---|---|---|---|---|
| カード列数 | 1 | 2 | 3 | — | セクションに`isContainer` | `cols={[1,2,3]}` |
| セクション余白 | 40 | — | 60 | — | セクションに`isContainer` | base必須 |

### 構成表

| c--*名 | Props・Property Classで書く | CSSに残す | 状態・バリエーション | 既定で足りる（指定しない） |
|---|---|---|---|---|
| `c--featureCard` | `p`, `bgc`, `bdrs`, `bxsh` | なし | featured時は`c--featureCard--featured` | `Frame ov`、直下imgの`w/h/object-fit` |
| `c--featureCard_title` | `fz="l"` | なし | — | — |

### 確認事項

| 項目 | 要確認理由 | 候補 |
|---|---|---|
| カードpadding | 24pxはspacingトークンに完全一致しない | A=`p="30"`へ丸め/B=`--s24`追加/C=24px直書き例外 |

### 実装後セルフチェック例

| 計画項目 | 実装結果 | 分類 | 対応 |
|---|---|---|---|
| `Frame ar="16/9"` | `Frame`使用済み | OK | なし |
| 直下img fitは既定 | imgに`-w:100%`を付けていた | 実装漏れ | 重複指定を削除 |
| `data-*`状態 | 状態なし | OK | なし |
| padding丸め | ユーザー確認後`p="30"` | 計画変更なし | なし |
| 🔁の解消 | 命名・レスポンシブ・移行判断の🔁を実装前に資料確認し✅化 | OK | 未解消の🔁なし |
