# Pass1–10の確認内容

このファイルは、`lism-css-refactor`で使うPass1–10の詳しい定義です。各Passで何を見つけるか、どう判定するか、迷った時にどのファイルを見るかをここにまとめます。

この手順では、ただ「チェックしたか」を確認するのではなく、**コード上に実際にあるclass・Props・CSS宣言・styleなどを1行ずつ洗い出し**ます。見つけたものを[`output-format.md`](./output-format.md)の洗い出し表に入れ、各Passで判定を付けます。

順番にも意味があります。先に構造（Pass2）を決めないと、どの要素に値を持たせるか、どこに状態を持たせるか、どの名前を付けるかが決まりません。そのため、Pass1から順に確認してください。

判定記号は次の4つです: **✅触らない / 🔧修正する / ⏸ユーザー確認 / ⬜意図的に残す**。参照先は`../../lism-css-guide/`配下のファイルです。

---

## Pass1: 対象コードの洗い出し

- **見るもの**: 対象範囲内のclass/className・Lism Props・CSS宣言・style属性・@media/@container・重複しているclass束。
- **判定**: 原則ここでは確定しない。対象外だけ✅、意図的にスコープ外とするものだけ⬜、残りはPass2以降で判定する。
- **直し方**: 修正しない。洗い出し表の行を作るだけ。
- **参照先**: なし（[`output-format.md`](./output-format.md)の洗い出し表を使う）。
- **NG→OK**: NG=`.c--card{ padding }`だけ拾い、`p={[20,30]}`や`is--active`を漏らす。OK=class/Props/CSS/値/重複/レスポンシブ指定を別行で列挙する。
- **注意**: ここで漏らすと後続Passでは見つけられない。特にstyle属性・配列Props・CSS変数・JSのclass切替を落としやすい。
- **guideで確認すること**: なし。

---

## Pass2: 構造の確認

- **見るもの**: `<div>`/`<section>`に`display:flex/grid`・`-d:flex/grid`・`gtc`・`fxd`・`fxw`・`ai`・`jc`が集まっている箇所。メディア枠・幅制御・オーバーレイ・全体リンクを手組みしている箇所。
- **判定**: Stack/Flex/Cluster/Grid/Columns/Frame/WithSide/Wrapper/Container/Layer/BoxLinkで同じ見た目・挙動にできる→🔧。すでに適切なPrimitive/Trait→✅。DOM順・セマンティクス・JS依存・レスポンシブ挙動が変わる→⏸。独自レイアウト意図が明確→⬜。
- **直し方**: 手組み構造をPrimitive/Traitへ置き換え、余白・色はLism Props/Property Classへ寄せる。複雑なGrid配置を無理にColumnsへ潰さない。
- **参照先**: [`primitive-class.md`](../../lism-css-guide/primitive-class.md)、[`trait-class.md`](../../lism-css-guide/trait-class.md)、[`components-core.md`](../../lism-css-guide/components-core.md)、[`antipatterns-layout.md#レイアウト選択ミス`](../../lism-css-guide/antipatterns-layout.md#レイアウト選択ミス)、[`antipatterns-layout.md#frame-未使用のメディア枠手組み`](../../lism-css-guide/antipatterns-layout.md#frame-未使用のメディア枠手組み)、[`antipatterns-layout.md#サイト最外殻を-wrapper-に使う`](../../lism-css-guide/antipatterns-layout.md#サイト最外殻を-wrapper-に使う)。実例は[`../examples/markup.md`](../examples/markup.md)。
- **NG→OK**: NG=`<div className="c--cards -d:grid -g:20" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>` → OK=`<Columns className="c--cards" cols={3} g="20">`。NG=`<div className="c--media -ov:hidden -ar:16/9"><img /></div>` → OK=`<Frame className="c--media" ar="16/9"><img /></Frame>`。
- **注意**: Grid→Columnsで複雑なトラック/エリア指定を失わない。Wrapper追加で直下子要素の幅が変わらないか見る。Frame化で直下メディア以外の子に既定スタイルが当たらないか見る。
- **guideで確認すること**: 「メディア枠→Frame／幅制御→Wrapper・Container／全体リンク→BoxLink／等幅列→Columns」の方針。

---

## Pass3: 重複の確認

- **見るもの**: 同じProperty Class束・Lism Props束・`c--*`構造・CSS宣言束が3箇所以上ある箇所。
- **判定**: 同じ意味のUI部品として抽出できる→🔧。2箇所以下・一時的な局所重複→✅。値差分やslot構造をProps化する必要がある→⏸。説明用にあえて展開しているコード→⬜。
- **直し方**: CSSへ逃がさず、React/Astroコンポーネントとして抽出する。`<Lism>`/`<Inline>`/`<Box>`/`<Stack>`等をベースにし、`className="c--*"`は意味名として残す。
- **参照先**: [`components-core.md`](../../lism-css-guide/components-core.md)、[`components-ui.md`](../../lism-css-guide/components-ui.md)、[`css-rules.md#component-classc--`](../../lism-css-guide/css-rules.md#component-classc--)、[`property-class.md`](../../lism-css-guide/property-class.md)。実例は[`../examples/component-extraction.md`](../examples/component-extraction.md)。
- **NG→OK**: NG=`<span className="c--tag -fz:xs -px:10 -py:5 -bgc:base-2 -bdrs:10">`が3回以上 → OK=`function Tag({ children }) { return <Inline className="c--tag" fz="xs" px="10" py="5" bgc="base-2" bdrs="10">{children}</Inline> }`。
- **注意**: `className`/`style`/`data-*`/ARIA/event handlerを渡し忘れない。レスポンシブPropsを単一値に潰さない。抽出でHTML要素が変わる場合は確認する。
- **guideで確認すること**: 「同Property Class束3箇所以上→コンポーネント抽出」の方針。

---

## Pass4: Property Class化の確認

- **見るもの**: `.c--*`のCSSブロックにある、単一要素向けの宣言束。例: font-size・padding・color・background・border-radiusなど。擬似クラスや子孫セレクタを伴わないものを中心に見る。
- **判定**: Property Class/Propsで書ける→🔧。擬似クラス・擬似要素・状態切替・子孫セレクタ付き→✅（CSSに残す）。同じ束が3箇所以上→🔧（Pass3とも連携）。
- **直し方**: `-{prop}:{value}`または`<Lism prop="value">`へ移す。`.c--*`のCSSが空になっても、**class名はマークアップに残す**。
- **参照先**: [`property-class.md`](../../lism-css-guide/property-class.md)、[`tokens.md`](../../lism-css-guide/tokens.md)、[`antipatterns.md#property-class-で書けるのに-css-で書く`](../../lism-css-guide/antipatterns.md#property-class-で書けるのに-css-で書く)。実例は[`../examples/css.md`](../examples/css.md)。
- **NG→OK**: NG=`.c--tag{ font-size:var(--fz--xs); padding:var(--s10); background:var(--base-2); border-radius:var(--bdrs--10) }`＋`<span class="c--tag">` → OK=`.c--tag{}`（空・名前は残す）＋`<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">`。
- **注意**: @container/@media内の同プロパティを移し忘れない。レスポンシブ値を単一値に潰さない。CSSを空にした勢いでclass名を消さない。`!important`や詳細度依存で見た目が変わらないか見る。
- **guideで確認すること**: `property-class.md`の省略名一覧、`tokens.md`の値リスト。

---

## Pass5: tokenの確認

- **見るもの**: px/rem/em直書き、`p="8"`/`fz="14"`/`bgc="secondary"`など存在しない値、`--keycolor`のグローバル利用、任意色/任意サイズのstyle属性。
- **判定**: `tokens.md`にある値で書けている→✅。guideで明確に置換できるtypo→🔧。px丸め・任意色推測・デザイン値置換→⏸。1px罫線・transform微調整・@media閾値などの例外→⬜。
- **直し方**: 明確なtypoは正しいtokenへ置き換える。固定値は近い候補と差分を出し、ユーザー確認後にProps/Property Class/token CSS変数へ移す。
- **参照先**: [`tokens.md`](../../lism-css-guide/tokens.md)、[`property-class.md`](../../lism-css-guide/property-class.md)、[`antipatterns.md#token-typo存在しない値`](../../lism-css-guide/antipatterns.md#token-typo存在しない値)、[`antipatterns.md#px--固定値の直書き`](../../lism-css-guide/antipatterns.md#px--固定値の直書き)、[`antipatterns.md#--keycolor-の誤用`](../../lism-css-guide/antipatterns.md#--keycolor-の誤用)。
- **NG→OK**: typo（🔧）: `bgc="secondary" c="muted"` → `bgc="base-2" c="text-2"`。丸め（⏸）: `padding:24px; border-radius:8px` → `p="30"`/`bdrs="20"`候補を提示し、確認後に適用（`p="8"`も丸めなので⏸）。
- **注意**: プロジェクト側で`--s-unit`やtokenを上書きしているとpx換算が変わる。`--keycolor`は局所的な色軸であり、ブランド色の代替として使わない。
- **guideで確認すること**: `tokens.md`の離散値と例外。デザイン値取り込みフローはguide側に置く。

---

## Pass6: 状態・バリエーションの確認

- **見るもの**: `is--active`/`is--current`/`is--disabled`/`is--open`/`is--solid`/`is--outline`など、guide掲載外の`is--*`が状態や見た目違いに使われている箇所。
- **判定**: 正規Trait（`is--container`/`is--wrapper`/`is--layer`/`is--boxLink`/`is--coverLink`/`is--skipFlow`/`is--side`、`has--transition`等）→✅。状態管理→🔧（`data-*`またはARIAへ）。見た目違い→🔧（`c--name--variant`へ）。独自Traitとして妥当だがguide外→⬜または⏸。
- **直し方**: 状態は属性セレクタへ、見た目違いはModifierへ移す。CSSセレクタとJSの切り替え対象も同時に更新する。
- **参照先**: [`antipatterns-layout.md#is---の誤用状態バリエーション`](../../lism-css-guide/antipatterns-layout.md#is---の誤用状態バリエーション)、[`trait-class.md`](../../lism-css-guide/trait-class.md)、[`trait-class/is--container.md`](../../lism-css-guide/trait-class/is--container.md)、[`css-rules.md#component-classc--`](../../lism-css-guide/css-rules.md#component-classc--)。
- **NG→OK**: NG=`<a className="c--catTab is--active">`＋`.c--catTab.is--active{}` → OK=`<a className="c--catTab" data-is-active>`＋`.c--catTab[data-is-active]{}`。NG=`<span className="c--tag is--solid">` → OK=`<span className="c--tag c--tag--solid">`。
- **注意**: JSの`classList.toggle('is--active')`・テスト・CSSセレクタを直し忘れると状態表示が壊れる。`aria-current`などが使える箇所は意味も確認する。
- **guideで確認すること**: 正規Trait一覧と、状態/variant/独自Traitの境界例。

---

## Pass7: 命名の確認

- **見るもの**: `c--feature-card`・`c--my-card--primary`・`c--card__body`・`has--gutter-x`、サイト領域を表す`c--header`/`c--sidebar`など。
- **判定**: prefix後がcamelCaseで、`c--block`/`c--block--modifier`/`c--block_element`に合う→✅。参照先をすべて更新できる内部class→🔧。公開API・CMS・外部JS・E2Eセレクタ依存→⏸。既存運用上あえて残す非Lism命名→⬜。
- **直し方**: class名・CSSセレクタ・JS参照・テスト参照を同時にrenameする。ゾーニングは`z--*`、ページ固有は`p--*`へ寄せる。
- **参照先**: [`naming.md`](../../lism-css-guide/naming.md)、[`css-rules.md#独自プレフィックス`](../../lism-css-guide/css-rules.md#独自プレフィックス)、[`css-rules.md#z--p--c--の使い分け`](../../lism-css-guide/css-rules.md#z--p--c--の使い分け)、[`antipatterns-layout.md#クラス名の命名ミス`](../../lism-css-guide/antipatterns-layout.md#クラス名の命名ミス)、[`antipatterns-layout.md#カスタムクラスを全て-c---にしてしまう`](../../lism-css-guide/antipatterns-layout.md#カスタムクラスを全て-c---にしてしまう)。
- **NG→OK**: NG=`.c--feature-card .c--feature-card__body{}` → OK=`.c--featureCard .c--featureCard_body{}`。NG=`.c--site-header{}` → OK=`.z--header{}`（再利用UIでない場合）。
- **注意**: CSSだけrenameしてJS/テスト/HTML生成側を漏らさない。`c--block.c--otherBlock`のようなBlock併用を見逃さない。
- **guideで確認すること**: `z--`/`p--`の使い分け例と、公開classを⏸にする判断基準。

---

## Pass8: レスポンシブの確認

- **見るもの**: 配列/オブジェクトProps、`-{prop}_{bp}`、`--{prop}_{bp}`、`xs`/`xl`キー、固定`gtc="repeat(3,1fr)"`、レスポンシブ値の祖先に`is--container`がない箇所。
- **判定**: base値あり・sm/md/lg・祖先isContainerあり→✅。base抜け・xs誤用など明確なミス→🔧。isContainer追加位置や固定Gridのレスポンシブ化で挙動が変わる→⏸。SCSS設定でmedia query運用が確認済み（`$is_container_query:0`等）→⬜。
- **直し方**: base値を補い、標準BPへ直し、必要な祖先へisContainerを追加する。固定3列→`Columns cols={3}`は同等だが、`cols={[1,2,3]}`化は挙動変更なので⏸で確認する。
- **参照先**: [`responsive.md`](../../lism-css-guide/responsive.md)、[`antipatterns-layout.md#レスポンシブ抜け`](../../lism-css-guide/antipatterns-layout.md#レスポンシブ抜け)、[`antipatterns-layout.md#レスポンシブ配列の冗長指定`](../../lism-css-guide/antipatterns-layout.md#レスポンシブ配列の冗長指定)、[`trait-class/is--container.md`](../../lism-css-guide/trait-class/is--container.md)、[`primitive-class.md#カラムレイアウト-primitive-の使い分けガイド`](../../lism-css-guide/primitive-class.md#カラムレイアウト-primitive-の使い分けガイド)。
- **NG→OK**: NG=`<Box p={{ sm: '30' }}>` → OK=`<Box p={{ base: '20', sm: '30' }}>`（base値が既存見た目から確定できる場合）。NG=`<div className="-p_sm" style={{ '--p_sm': 'var(--s30)' }}>` → OK=`<div className="-p:20 -p_sm" style={{ '--p_sm': 'var(--s30)' }}>`。
- **注意**: isContainerを置く位置でコンテナ幅・発火タイミングが変わる。重複配列を単一値に潰すと、breakpointごとの差分を消してしまう。
- **guideで確認すること**: 冗長配列の圧縮ルール、`$is_container_query:0`時の扱い、container配置方針。

---

## Pass9: 既定値重複の確認

- **見るもの**: Primitiveが元々持つ挙動と同じProps/Property Classを重ねている箇所。例: `<Cluster fxw="wrap" ai="center">`・`<Frame ov="hidden">`・Frame直下メディアへの`-w:100% -h:100%`/`object-fit:cover`。
- **判定**: guideに既定値として明記されていて同じ値を重ねている→🔧。既定値と違う意図的な上書き→✅または⬜。guide未整備のPrimitive既定値→guide TODOへ回す。詳細度が必要な上書き→⬜。
- **直し方**: 重複しているProps/Property Classだけ削除し、Primitive自体と意味classは残す。Clusterの`g`は既定値ではないので消さない。
- **参照先**: [`primitive-class.md`](../../lism-css-guide/primitive-class.md)、[`primitives/l--cluster.md`](../../lism-css-guide/primitives/l--cluster.md)、[`primitives/l--frame.md`](../../lism-css-guide/primitives/l--frame.md)、[`antipatterns-layout.md#primitive-既定値の重複指定`](../../lism-css-guide/antipatterns-layout.md#primitive-既定値の重複指定)。
- **NG→OK**: NG=`<Cluster fxw="wrap" ai="center" g="15">` → OK=`<Cluster g="15">`。NG=`<Frame ar="16/9" ov="hidden"><img className="-w:100% -h:100%" style={{ objectFit: 'cover' }} /></Frame>` → OK=`<Frame ar="16/9"><img /></Frame>`。
- **注意**: プロジェクトCSSでPrimitive既定値を上書きしていると、削除で見た目が変わる。直下メディア以外・`object-fit:contain`・`object-position`指定は消さない。
- **guideで確認すること**: 各`primitives/l--*.md`の既定CSS概要。特にl--frameのoverflow:hiddenと直下メディアfit、l--clusterのflex-wrap/align-items/gapなし。

---

## Pass10: 提示前の見直し

- **見るもの**: ユーザーに提示する前の修正案と、洗い出し表の判定。
- **判定**: [`common-mistakes.md`](./common-mistakes.md)の全項目と下記「判定の再審査」がOK→✅。自分の修正で元の動きを壊した→🔧。px丸めや挙動変更など、ユーザー確認が必要なものが残る→⏸。合意済みの例外→⬜。
- **直し方**: 修正案を他人のPRとして読み直し、壊した箇所だけを直す。新規実装時の一般的なアンチパターンはguide側を見る。このファイルでは、リファクタで起こしやすい「元の動きを壊す変更」だけを見る。
- **参照先**: [`common-mistakes.md`](./common-mistakes.md)。
- **NG→OK**: NG=CSSを空にした勢いで`className="c--tag"`も削除 → OK=CSS宣言だけ移し、意味classは残す。NG=`is--active`→`data-is-active`に変えたがCSS/JSセレクタ未更新 → OK=markup/CSS/JS/testsを同時更新。
- **注意**: [`common-mistakes.md`](./common-mistakes.md)の全項目を確認する。
- **guideで確認すること**: 不要。提示前の見直し項目はこのスキル側で持つ。

### 判定の再審査

壊していないかの確認とは別に、洗い出し表の判定自体を見直します。判定段階で誤って✅・⬜にした行は修正案のdiffに現れない（差分ゼロ＝合格になってしまう）ため、diffの見直しだけでは検出できません。

- 洗い出し表の✅・⬜行を、該当Passの判定基準に再照合する。根拠列が空・推測のみの行は照合し直し、事実で根拠を書けない⬜は⏸へ戻す（`SKILL.md`「判定記号」の⬜の条件を参照）。
- 洗い出し表の網羅性を確認する。対象範囲のclass/className・style属性・@media/@containerを機械的に再検索（grep等）し、表に無い実体が見つかったらPass1へ戻る。
- Pass2–9を省略していないか確認する。該当する実体が1つも無かったPassは、見直し表に「該当なし」と記録する（無言で飛ばさない）。
