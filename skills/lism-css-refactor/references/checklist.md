# 順序パス（Pass 1–10）

既存Lism CSSコードの監査チェックリストです。チェックリスト（「〜したか？」）ではなく、**コード上の実体を1行ずつ棚卸し**し、各パスでInventory表（[`output-format.md`](./output-format.md)）の1列を埋めます。黙って落とす項目をゼロにするのが狙いです。

順序に意味があります。先に構造（Pass 2）を決めないと、何に値を載せ・どこに状態を持たせ・何を命名するかが定まらず、個別監査が無駄になります。

verdictはrefactor系を使います: **✅触らない / 🔧修正対象 / ⏸要ユーザー判断 / ⬜意図的に残す**。route先のパスはguide（`../../lism-css-guide/`）配下のファイルです。

---

## Pass 1: 棚卸し

- **検出**: 対象範囲内のclass/className・Lism Props・CSS宣言・style属性・@media/@container・重複クラス束をすべて列挙する。
- **判定**: 原則verdictを確定しない。対象外だけ✅、意図的スコープ外だけ⬜、残りはPass 2以降へ送る。
- **直し方**: 修正しない。Inventory表の行を作るだけ。
- **route先**: なし（[`output-format.md`](./output-format.md)のInventory表への入口）。
- **NG→OK**: NG=`.c--card{ padding }`だけ拾い`p={[20,30]}`や`is--active`を漏らす。OK=class/Props/CSS/値/重複/レスポンシブを別行で列挙。
- **退行注意**: 棚卸し漏れは後続パスで検出不能。特にstyle属性・配列Props・CSS変数・JSのclass切替を落としやすい。
- **guide依存**: 不要。

---

## Pass 2: 構造パス

- **検出**: `<div>`/`<section>`に`display:flex/grid`・`-d:flex/grid`・`gtc`・`fxd`・`fxw`・`ai`・`jc`が集まる箇所、またはメディア枠/幅制御/オーバーレイ/全体リンクを手組みしている箇所。
- **判定**: Stack/Flex/Cluster/Grid/Columns/Frame/WithSide/Wrapper/Container/Layer/BoxLinkで同じ挙動にできる→🔧。既に適切なPrimitive/Trait→✅。DOM順・セマンティクス・JS依存・レスポンシブ挙動が変わる→⏸。独自レイアウト意図が明確→⬜。
- **直し方**: 手組み構造をPrimitive/Traitへ置換し、余白・色はLism Props/Property Classへ寄せる。複雑なGrid配置を無理にColumnsへ潰さない。
- **route先**: [`primitive-class.md`](../../lism-css-guide/primitive-class.md)、[`trait-class.md`](../../lism-css-guide/trait-class.md)、[`components-core.md`](../../lism-css-guide/components-core.md)、[`antipatterns.md#レイアウト選択ミス`](../../lism-css-guide/antipatterns.md#レイアウト選択ミス)、[`antipatterns.md#frame-未使用のメディア枠手組み`](../../lism-css-guide/antipatterns.md#frame-未使用のメディア枠手組み)、[`antipatterns.md#サイト最外殻を-wrapper-に使う`](../../lism-css-guide/antipatterns.md#サイト最外殻を-wrapper-に使う)。実例は[`../examples/markup.md`](../examples/markup.md)。
- **NG→OK**: NG=`<div className="c--cards -d:grid -g:20" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>` → OK=`<Columns className="c--cards" cols={3} g="20">`。NG=`<div className="c--media -ov:hidden -ar:16/9"><img /></div>` → OK=`<Frame className="c--media" ar="16/9"><img /></Frame>`。
- **退行注意**: Grid→Columnsで複雑なトラック/エリア指定を失う、Wrapper追加で直下子要素幅が変わる、Frame化で直下メディア以外の子に既定が当たる。
- **guide依存**: 目的別実装ガイドの「メディア枠→Frame／幅制御→Wrapper・Container／全体リンク→BoxLink／等幅列→Columns」。

---

## Pass 3: 重複パス

- **検出**: 同じProperty Class束・Lism Props束・`c--*`構造・CSS宣言束が3箇所以上。
- **判定**: 同じ意味のUI部品として抽出できる→🔧。2箇所以下・一時的な局所重複→✅。値差分やslot構造をProps化する必要→⏸。意図的に展開した例示コード→⬜。
- **直し方**: CSSへ逃がさずReact/Astroコンポーネントとして抽出する。`<Lism>`/`<Inline>`/`<Box>`/`<Stack>`等をベースにし、`className="c--*"`は意味名として残す。
- **route先**: [`components-core.md`](../../lism-css-guide/components-core.md)、[`components-ui.md`](../../lism-css-guide/components-ui.md)、[`css-rules.md#component-classc--`](../../lism-css-guide/css-rules.md#component-classc--)、[`property-class.md`](../../lism-css-guide/property-class.md)。実例は[`../examples/component-extraction.md`](../examples/component-extraction.md)。
- **NG→OK**: NG=`<span className="c--tag -fz:xs -px:10 -py:5 -bgc:base-2 -bdrs:10">`が3回以上 → OK=`function Tag({ children }) { return <Inline className="c--tag" fz="xs" px="10" py="5" bgc="base-2" bdrs="10">{children}</Inline> }`。
- **退行注意**: `className`/`style`/`data-*`/ARIA/event handlerの透過漏れ、レスポンシブPropsを単一値に潰す、抽出でHTML要素が変わる。
- **guide依存**: 「同Property Class束3箇所以上→コンポーネント抽出」の方針。

---

## Pass 4: Property Class抽出パス

- **検出**: `.c--*`のCSSブロックに、擬似クラス/子孫セレクタを伴わない単一要素向けの宣言束（font-size・padding・color・background・border-radius等）。
- **判定**: Property Class/Propsで書ける→🔧マークアップへ。擬似クラス・擬似要素・状態切替・子孫セレクタ付き→✅CSSに残す。同束3箇所以上→🔧（Pass 3連携）。
- **直し方**: `-{prop}:{value}`または`<Lism prop="value">`へ移す。`.c--*`のCSSは空でよいが**クラス名はマークアップに残す**。
- **route先**: [`property-class.md`](../../lism-css-guide/property-class.md)、[`tokens.md`](../../lism-css-guide/tokens.md)、[`antipatterns.md#property-class-で書けるのに-css-で書く`](../../lism-css-guide/antipatterns.md#property-class-で書けるのに-css-で書く)。実例は[`../examples/css.md`](../examples/css.md)。
- **NG→OK**: NG=`.c--tag{ font-size:var(--fz--xs); padding:var(--s10); background:var(--base-2); border-radius:var(--bdrs--10) }`＋`<span class="c--tag">` → OK=`.c--tag{}`（空・名前は残す）＋`<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">`。
- **退行注意**: @container/@media内の同プロパティ移し忘れ・単一値化、空化でクラス名を削除、`!important`・詳細度依存の挙動変化。
- **guide依存**: `property-class.md`の省略名一覧・`tokens.md`の値リストが正確であること。

---

## Pass 5: トークン監査パス

- **検出**: px/rem/em直書き、`p="8"`/`fz="14"`/`bgc="secondary"`など存在しない値、`--keycolor`のグローバル利用、任意色/任意サイズのstyle属性。
- **判定**: `tokens.md`にある値で既に書けている→✅。guideに明確な置換があるtypo→🔧（自動置換）。px丸め・任意色推測・デザイン値置換→⏸。1px罫線・transform微調整・@media閾値などの例外→⬜。
- **直し方**: 既知typoは正規トークンへ置換する。固定値は最寄り候補と差分を出し、ユーザー確認後にProps/Property Class/token CSS変数へ移す。
- **route先**: [`tokens.md`](../../lism-css-guide/tokens.md)、[`property-class.md`](../../lism-css-guide/property-class.md)、[`antipatterns.md#token-typo存在しない値`](../../lism-css-guide/antipatterns.md#token-typo存在しない値)、[`antipatterns.md#px--固定値の直書き`](../../lism-css-guide/antipatterns.md#px--固定値の直書き)、[`antipatterns.md#--keycolor-の誤用`](../../lism-css-guide/antipatterns.md#--keycolor-の誤用)。
- **NG→OK**: typo（🔧）: `bgc="secondary" c="muted"` → `bgc="base-2" c="text-2"`。丸め（⏸）: `padding:24px; border-radius:8px` → `p="30"`/`bdrs="20"`候補を提示し確認後に適用（`p="8"`も丸めなので⏸）。
- **退行注意**: プロジェクトで`--s-unit`/トークンを上書きしているとpx一致が崩れる。`--keycolor`は局所軸色でありブランド色代替にしない。
- **guide依存**: `tokens.md`の離散値と例外。デザイン値取り込みフローはguideのAuthoring側に維持。

---

## Pass 6: trait/状態/バリエーションパス

- **検出**: `is--active`/`is--current`/`is--disabled`/`is--open`/`is--solid`/`is--outline`など、guide掲載外の`is--*`が状態や見た目違いに使われている箇所。
- **判定**: 正規Trait（`is--container`/`is--wrapper`/`is--layer`/`is--boxLink`/`is--coverLink`/`is--skipFlow`/`is--side`、`has--transition`等）→✅。状態管理→🔧で`data-*`またはARIA。見た目違い→🔧で`c--name--variant`。独自Traitが役割宣言として妥当だがguide外→⬜または⏸。
- **直し方**: 状態は属性セレクタへ、バリエーションはBEM Modifierへ。CSSセレクタとJSのtoggle対象も同時に更新する。
- **route先**: [`antipatterns.md#is---の誤用状態バリエーション`](../../lism-css-guide/antipatterns.md#is---の誤用状態バリエーション)、[`trait-class.md`](../../lism-css-guide/trait-class.md)、[`trait-class/is--container.md`](../../lism-css-guide/trait-class/is--container.md)、[`css-rules.md#component-classc--`](../../lism-css-guide/css-rules.md#component-classc--)。
- **NG→OK**: NG=`<a className="c--catTab is--active">`＋`.c--catTab.is--active{}` → OK=`<a className="c--catTab" data-is-active>`＋`.c--catTab[data-is-active]{}`。NG=`<span className="c--tag is--solid">` → OK=`<span className="c--tag c--tag--solid">`。
- **退行注意**: JSの`classList.toggle('is--active')`・テスト・CSSセレクタを直し忘れると状態表示が壊れる。`aria-current`等が使える箇所は意味も確認する。
- **guide依存**: 正規Trait一覧と、状態/variant/独自Traitの境界例。

---

## Pass 7: 命名パス

- **検出**: `c--feature-card`・`c--my-card--primary`・`c--card__body`・`has--gutter-x`、サイト領域を表す`c--header`/`c--sidebar`など。
- **判定**: prefix後がcamelCaseで`c--block`/`c--block--modifier`/`c--block_element`に合う→✅。参照を全更新できる内部クラス→🔧。公開API・CMS・外部JS・E2Eセレクタ依存→⏸。既存運用上あえて残す非Lism命名→⬜。
- **直し方**: クラス名・CSSセレクタ・JS参照・テスト参照を同時にrenameする。ゾーニングは`z--*`、ページ固有は`p--*`へ。
- **route先**: [`naming.md`](../../lism-css-guide/naming.md)、[`css-rules.md#独自プレフィックス`](../../lism-css-guide/css-rules.md#独自プレフィックス)、[`css-rules.md#z--p--c--の使い分け`](../../lism-css-guide/css-rules.md#z--p--c--の使い分け)、[`antipatterns.md#クラス名の命名ミスkebab-case`](../../lism-css-guide/antipatterns.md#クラス名の命名ミスkebab-case)、[`antipatterns.md#カスタムクラスを全て-c---にしてしまう`](../../lism-css-guide/antipatterns.md#カスタムクラスを全て-c---にしてしまう)。
- **NG→OK**: NG=`.c--feature-card .c--feature-card__body{}` → OK=`.c--featureCard .c--featureCard_body{}`。NG=`.c--site-header{}` → OK=`.z--header{}`（再利用UIでない場合）。
- **退行注意**: CSSだけrenameしてJS/テスト/HTML生成側を漏らす。`c--block.c--otherBlock`のようなBlock併用を見逃す。
- **guide依存**: `z--`/`p--`の使い分け例と、公開クラスを⏸にする判断基準。

---

## Pass 8: レスポンシブパス

- **検出**: 配列/オブジェクトProps、`-{prop}_{bp}`、`--{prop}_{bp}`、`xs`/`xl`キー、固定`gtc="repeat(3,1fr)"`、レスポンシブ値の祖先に`is--container`がない箇所。
- **判定**: base値あり・sm/md/lg・祖先isContainerあり→✅。base抜け・xs誤用など明確なミス→🔧。isContainer追加位置や固定Gridのレスポンシブ化で挙動が変わる→⏸。SCSS設定でmedia query運用が確認済み（`$is_container_query:0`等）→⬜。
- **直し方**: base値を補い、標準BPへ直し、必要な祖先へisContainerを追加する。固定3列→`Columns cols={3}`は同等だが、`cols={[1,2,3]}`化は挙動変更なので⏸で確認。
- **route先**: [`responsive.md`](../../lism-css-guide/responsive.md)、[`antipatterns.md#レスポンシブ抜け`](../../lism-css-guide/antipatterns.md#レスポンシブ抜け)、[`antipatterns.md#レスポンシブ配列の冗長指定`](../../lism-css-guide/antipatterns.md#レスポンシブ配列の冗長指定)、[`trait-class/is--container.md`](../../lism-css-guide/trait-class/is--container.md)、[`primitive-class.md#カラムレイアウト-primitive-の使い分けガイド`](../../lism-css-guide/primitive-class.md#カラムレイアウト-primitive-の使い分けガイド)。
- **NG→OK**: NG=`<Box p={{ sm: '30' }}>` → OK=`<Box p={{ base: '20', sm: '30' }}>`（base値が既存見た目から確定できる場合）。NG=`<div className="-p_sm" style={{ '--p_sm': 'var(--s30)' }}>` → OK=`<div className="-p:20 -p_sm" style={{ '--p_sm': 'var(--s30)' }}>`。
- **退行注意**: isContainerを置く位置でコンテナ幅・発火タイミングが変わる。重複配列を単一値に潰すとBP差分を消す。
- **guide依存**: 冗長配列の圧縮ルール・`$is_container_query:0`時の扱い・container配置方針。

---

## Pass 9: 既定値重複パス

- **検出**: Primitiveが既に持つ挙動と同じProps/Property Classを重ねている箇所。例: `<Cluster fxw="wrap" ai="center">`・`<Frame ov="hidden">`・Frame直下メディアへの`-w:100% -h:100%`/`object-fit:cover`。
- **判定**: guideに既定値として明記済みで同値の重複→🔧。既定値と違う意図的上書き→✅または⬜。guide未整備のPrimitive既定値→（⏸でなく）guide TODOへ回す。Property Classの詳細度が必要な上書き→⬜。
- **直し方**: 重複Props/Property Classだけ削除し、Primitive自体と意味クラスは残す。Clusterの`g`は既定ではないので消さない。
- **route先**: [`primitive-class.md`](../../lism-css-guide/primitive-class.md)、[`primitives/l--cluster.md`](../../lism-css-guide/primitives/l--cluster.md)、[`primitives/l--frame.md`](../../lism-css-guide/primitives/l--frame.md)、[`antipatterns.md#primitive-既定値の重複指定`](../../lism-css-guide/antipatterns.md#primitive-既定値の重複指定)。
- **NG→OK**: NG=`<Cluster fxw="wrap" ai="center" g="15">` → OK=`<Cluster g="15">`。NG=`<Frame ar="16/9" ov="hidden"><img className="-w:100% -h:100%" style={{ objectFit: 'cover' }} /></Frame>` → OK=`<Frame ar="16/9"><img /></Frame>`。
- **退行注意**: プロジェクトCSSでPrimitive既定を上書きしていると削除で見た目が変わる。直下メディア以外・`object-fit:contain`・`object-position`指定は消さない。
- **guide依存**: 各`primitives/l--*.md`の既定CSS概要（特にl--frameのoverflow:hiddenと直下メディアfit、l--clusterのflex-wrap/align-items/gapなし）。

---

## Pass 10: Self-reviewゲート

- **検出**: 修正案のdraftを作った直後（**ユーザー提示の前**・ワークフローstep 5）。
- **判定**: [`common-mistakes.md`](./common-mistakes.md)全項目OK→✅。自分の修正で退行を作った→🔧。px丸めや挙動変更が残る→⏸。合意済み例外→⬜。
- **直し方**: 修正案を他人のPRとして再点検し、退行だけ直す。authoring系（guideのantipatterns）はrouteするだけでcommon-mistakesに再掲しない。
- **route先**: [`common-mistakes.md`](./common-mistakes.md)。
- **NG→OK**: NG=CSSを空にした勢いで`className="c--tag"`も削除 → OK=CSS宣言だけ移し意味クラスは残す。NG=`is--active`→`data-is-active`に変えたがCSS/JSセレクタ未更新 → OK=markup/CSS/JS/testsを同時更新。
- **退行注意**: [`common-mistakes.md`](./common-mistakes.md)の全項目。
- **guide依存**: 不要（退行知識はrefactor側のcommon-mistakes.mdに持つ）。
