# アンチパターン辞書（構造・レイアウト・レスポンシブ編）

[antipatterns.md](./antipatterns.md)の続編。値・スタイル宣言系のNG→OKはそちらを参照。

## TOC

- [レイアウト選択ミス](#レイアウト選択ミス)
- [Astro/React Primitive を使わず素の HTML で組む](#astroreact-primitive-を使わず素の-html-で組む)
- [ボタン装飾を reset から自作する](#ボタン装飾を-reset-から自作する)
- [`Frame` 未使用のメディア枠手組み](#frame-未使用のメディア枠手組み)
- [全面リンクの手組み（`BoxLink` 未使用）](#全面リンクの手組みboxlink-未使用)
- [primitive 既定値の重複指定](#primitive-既定値の重複指定)
- [サイト最外殻を `Wrapper` に使う](#サイト最外殻を-wrapper-に使う)
- [標準 HTML 属性を `exProps` に入れる](#標準-html-属性を-exprops-に入れる)
- [レスポンシブ抜け](#レスポンシブ抜け)
- [レスポンシブ配列の冗長指定](#レスポンシブ配列の冗長指定)
- [`is--` の誤用（状態・バリエーション）](#is---の誤用状態バリエーション)
- [カスタムクラスを全て `c--` にしてしまう](#カスタムクラスを全て-c---にしてしまう)
- [クラス名の命名ミス](#クラス名の命名ミス)

---

## レイアウト選択ミス

詳細な選択基準は [primitive-class.md](./primitive-class.md#カラムレイアウト-primitive-の使い分けガイド) の使い分けガイドを参照。

### Grid 直書き vs Columns

| NG                                               | OK                           | 理由                               |
| ------------------------------------------------ | ---------------------------- | ---------------------------------- |
| `<Grid gtc="repeat(3, 1fr)">`                    | `<Columns cols={3}>`         | 等幅 N 列は Columns で宣言的に書く |
| `<Grid gtc={['1fr', '1fr 1fr', '1fr 1fr 1fr']}>` | `<Columns cols={[1, 2, 3]}>` | BP 切替も Columns のほうが簡潔     |

### コンテンツ幅のハードコード

| NG                               | OK                 | 理由                                                                                                                    |
| -------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `style={{ maxWidth: '1200px' }}` | `<Box max-sz="l">` | ヘッダーやセクションなど、コンテンツサイズにはトークン値（`xs` / `s` / `m` / `l` / `xl` / `bleed`）をできるだけ活用する |

### サイドバー型レイアウト

| NG                              | OK                         | 理由                                      |
| ------------------------------- | -------------------------- | ----------------------------------------- |
| `<Grid gtc="1fr 240px">` で固定 | `<WithSide sideW="240px">` | コンテンツ幅で自動切替したいなら WithSide |
| `<Flex>` で 2 カラム強制横並び  | `<WithSide>`               | 縦並びへの切替が必要なら WithSide         |

## Astro/React Primitive を使わず素の HTML で組む

Astro/Reactで実装しているのに、`lism-css/astro`や`lism-css/react`のPrimitiveをimportせず、素の`<div>`とCSSだけで構造を作るのは避ける。

| NG                                      | OK                                   | 理由                    |
| --------------------------------------- | ------------------------------------ | ----------------------- |
| `<div class="c--features">`+CSSで縦並び | `<Stack class="c--features" g="40">` | 縦並びは`Stack`に任せる |

カラムの選択ミスは[レイアウト選択ミス](#レイアウト選択ミス)、メディア枠は[`Frame` 未使用のメディア枠手組み](#frame-未使用のメディア枠手組み)を参照。

実装前チェックC1では、採用Primitiveと、その詳細ファイルで確認した内容を実装プランに書く。

## ボタン装飾を reset から自作する

`<button>`を整える時は、`@lism-css/ui`の`Button`で足りるかを先に確認し、素の`<button>`にはreset済みの`set--plain`を使う。`appearance`/`border`/`background`等のリセットを独自CSSで書き直さない。

| NG                                                                  | OK                                       | 理由                                             |
| ------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `.c--btn { appearance: none; border: none; background: none; ... }` | `<button class="set--plain c--btn ...">` | ブラウザデフォルトのリセットは`set--plain`が持つ |

## `Frame` 未使用のメディア枠手組み

画像・動画・iframeの枠は`Frame`が既定で`overflow:hidden`と直下メディアのfitを持つ。アスペクト比つきのメディア枠を`Lism`/`div`で手組みしない。

| NG                                                                       | OK                                             | 理由                                        |
| ------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------- |
| `<Lism ov="hidden" ar="16/9"><img /></Lism>`                             | `<Frame ar="16/9"><img /></Frame>`             | メディア枠は`Frame`で宣言する               |
| `<div class="-ov:hidden -ar:16/9"><img class="-w:100% -h:100%" /></div>` | `<div class="l--frame -ar:16/9"><img /></div>` | 直下`img/video/iframe`のfitは`l--frame`既定 |

`object-fit:contain`や`object-position`など既定と違う意図がある場合だけ、差分として追加する。

## 全面リンクの手組み（`BoxLink` 未使用）

カード等のボックス全体をリンク化する時は`BoxLink`/`is--boxLink`に任せる。absolute配置の擬似要素やオーバーレイ`<a>`で全面リンクを手組みしない。

| NG                                                    | OK                                | 理由                                                                           |
| ----------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| `.c--card a::after { position: absolute; inset: 0; }` | `<BoxLink href="...">…</BoxLink>` | クリック領域・重なり順・タグ切替（`href`有無で`a`/`div`）は`is--boxLink`が担う |

内部に別のリンクやボタンを重ねる場合は`trait-class/is--boxLink.md`と公式ドキュメントを確認する。

## primitive 既定値の重複指定

Primitiveが既に持つCSSと同じ値を、Lism Props/Property Classで重ねない。既定の挙動は各`primitives/l--*.md`の「既定の挙動」を確認する。

| NG                                                                                  | OK                       | 理由                                                                                    |
| ----------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| `<Cluster fxw="wrap" ai="center" g="15">`                                           | `<Cluster g="15">`       | `Cluster`は`flex-wrap:wrap`/`align-items:center`を既定で持つ。gapは既定ではないので残す |
| `<Frame ov="hidden" ar="16/9">`                                                     | `<Frame ar="16/9">`      | `Frame`は`overflow:hidden`を既定で持つ                                                  |
| `<Frame><img className="-w:100% -h:100%" style={{ objectFit: 'cover' }} /></Frame>` | `<Frame><img /></Frame>` | 直下メディアの`width/height/object-fit:cover`は既定                                     |

プロジェクトCSSでPrimitive既定を上書きしている場合や、既定と違う意図的上書きの場合は例外として残す。

## サイト最外殻を `Wrapper` に使う

`Wrapper`/`is--wrapper`は幅制限したい直下領域に使う。サイト全体の最外殻やbody直下のゾーニングには使わない。最外殻は`z--*`などの領域名で扱い、幅制限が必要な内側だけ`Wrapper`にする。

| NG                                                  | OK                                                               | 理由                                  |
| --------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------- |
| `<Wrapper className="c--site">...全体...</Wrapper>` | `<div className="z--site"><Wrapper>...本文幅...</Wrapper></div>` | 最外殻と幅制限の責務を分ける          |
| `<main className="is--wrapper">`をページ全体に付与  | `<main className="z--main"><Wrapper>...</Wrapper></main>`        | ゾーニングは`z--*`、幅制限は`Wrapper` |

`Wrapper`直下の子要素には幅に関する既定が当たるため、最外殻に置くと予期しない幅制御を生むことがある。

## 標準 HTML 属性を `exProps` に入れる

`width`/`height`/`loading`/`decoding`/`alt`/`aria-*`/`data-*`などの標準属性は、`exProps`に包まずそのまま渡す。`exProps`は標準Propsで表現しにくい拡張用途に限定する。

| NG                                                                 | OK                                                  | 理由                    |
| ------------------------------------------------------------------ | --------------------------------------------------- | ----------------------- |
| `<Media exProps={{ width: 960, height: 640, loading: 'lazy' }} />` | `<Media width={960} height={640} loading="lazy" />` | 標準HTML属性は直接渡す  |
| `<Lism exProps={{ 'aria-label': '閉じる' }} />`                    | `<Lism aria-label="閉じる" />`                      | ARIA/data属性も直接渡す |

コンポーネント側の型が直接属性を受けない場合は、型定義や透過設計を先に確認する。

## レスポンシブ抜け

### `is--container` 祖先なしで BP 値を使用

レスポンシブ値（配列・オブジェクト・`-{prop}_{bp}` クラス）は、デフォルト設定（SCSS 側 `$is_container_query: 1`）では `@container` クエリで発火するため、祖先要素のいずれかに `is--container`（コンポーネントなら `isContainer` prop）が必須。

※ プロジェクトの SCSS 設定で `$is_container_query: 0` にして `@media` クエリ運用に切り替えている場合は、`is--container` 祖先は不要。

```jsx
// NG: container 祖先がないので sm/md 値が発火しない
<div>
  <Box p={[20, 30, 40]}>...</Box>
</div>

// OK: 祖先に isContainer
<Stack isContainer>
  <Box p={[20, 30, 40]}>...</Box>
</Stack>
```

### BP 専用クラスをベース値なしで使う

BP 専用クラス（`-{prop}_{bp}`）やコンポーネントの BP キー（`{ sm: ... }` 等）だけを指定すると、BP 未満では値が空になり意図しないレイアウト崩れを起こす。必ずベース値とセットで指定する。

```jsx
// NG: sm 未満で p が未指定になる
<Box p={{ sm: 30 }}>...</Box>

// OK: ベース値（base / 配列の先頭）を必ず添える
<Box p={{ base: 20, sm: 30 }}>...</Box>
<Box p={[20, 30]}>...</Box>
```

生 HTML / クラス指定で書く場合も同様：

| NG                                               | OK                                                     | 理由                                                               |
| ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------ |
| `<div class="-p_sm" style="--p_sm: var(--s30)">` | `<div class="-p:20 -p_sm" style="--p_sm: var(--s30)">` | BP 未満では値が空になるため、ベースクラス `-{prop}:{value}` も必要 |

### ブレイクポイントの誤用

Lism CSS の標準出力で有効な BP は `sm: 480px` / `md: 800px` / `lg: 1120px`。`xs` は BP キーとして存在しない。

| NG                             | OK                               | 理由                                                                      |
| ------------------------------ | -------------------------------- | ------------------------------------------------------------------------- |
| `<Box p={{ xs: 10, sm: 20 }}>` | `<Box p={{ base: 10, sm: 20 }}>` | デフォルトは `base`（`xs` キーは無い）                                    |
| `cols={[1, 2, 3, 4, 5]}`       | `cols={[1, 2, 3, 4]}`            | 標準出力では `[base, sm, md, lg]` までが有効。`xl` 以降は SCSS 設定が必要 |

## レスポンシブ配列の冗長指定

配列Propsでは、前のBPと同じ値を繰り返さない。値を変えないBPは`null`でスキップし、全BPで同じ値なら単一値にする。

| NG                                  | OK                              | 理由                                 |
| ----------------------------------- | ------------------------------- | ------------------------------------ |
| `fxd={['column', 'column', 'row']}` | `fxd={['column', null, 'row']}` | `sm`で変化しない値はスキップできる   |
| `p={['20', '20', '20']}`            | `p="20"`                        | 全BP同値なら単一値でよい             |
| `cols={[1, 1, 3]}`                  | `cols={[1, null, 3]}`           | 重複BPを省略して意図を読みやすくする |

ただし、既存コードの型・生成仕様で`null`スキップが使えない箇所では、既存パターンを優先する。レスポンシブ差分を単一値化して消さないこと。

## `is--` の誤用（状態・バリエーション）

Lism CSS の `is--` プレフィックスは「**〜である**」という**役割・存在の宣言**を表す trait 用（`is--container` / `is--wrapper` / `is--layer` / `is--boxLink` / `is--coverLink` / `is--skipFlow` / `is--side` 等）。ユーザーが独自に `is--*` を追加することは可能だが、**その要素の役割（trait）を宣言するもの**であることが条件で、**状態管理やスタイルバリエーション目的に流用しない**（`is--active` / `is--current` / `is--solid` などは誤用）。

→ 詳細: [trait-class.md](./trait-class.md#is---trait役割宣言)

`is--` と紛れがちな 2 つの用途は、Lism では別の手段で表現する：

### 1. 状態管理 → `data-*` 属性を使う

オン/オフが切り替わる状態（active / current / disabled / open / selected 等）は、`is--*` クラスを増やさず HTML の `data-*` 属性で表現する。CSS は属性セレクタで書く。

| NG                                                                             | OK                                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `<a class="c--catTab is--active">` + `.c--catTab.is--active { ... }`           | `<a class="c--catTab" data-is-active>` + `.c--catTab[data-is-active] { ... }`           |
| `<li class="c--pager_num is--current">` + `.c--pager_num.is--current { ... }`  | `<li class="c--pager_num" aria-current="page">` + `.c--pager_num[aria-current] { ... }` |
| `<a class="c--pager_nav is--disabled">` + `.c--pager_nav.is--disabled { ... }` | `<a class="c--pager_nav" data-is-disabled>` + `.c--pager_nav[data-is-disabled] { ... }` |

理由：

- `is--*` は「役割宣言」用の trait であり、状態を表すクラスを `is--*` として増やすと意味体系（trait か state か）が混在して読みにくくなる
- `data-*` は HTML 標準の状態表現で、JS からの切替（`element.dataset.isActive = ''` / `delete element.dataset.isActive`）も自然
- ARIA 属性で意味が表せる場合（`aria-current` / `aria-disabled` / `aria-selected` 等）は ARIA を優先し、その属性自体を CSS セレクタにする

### 2. スタイルバリエーション → BEM Modifier `c--{name}--{variant}`

「同じコンポーネントの見た目違い」は、Lism CSS 公式の BEM Modifier 記法で表現する（→ [css-rules.md の Component Class](./css-rules.md#component-classc--)）。

| NG                                                              | OK                                                                      |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `<span class="c--tag is--solid">` + `.c--tag.is--solid { ... }` | `<span class="c--tag c--tag--solid">` + `.c--tag.c--tag--solid { ... }` |
| `<button class="c--button is--outline">`                        | `<button class="c--button c--button--outline">`                         |

なお、Modifier であってもまずは [Property Class で表現できないか](./antipatterns.md#property-class-で書けるのに-css-で書く) を検討すること。「色だけ違う」程度ならマークアップ側で `-bgc:* -c:*` を差し替えるだけで済むことも多い。

## カスタムクラスを全て `c--` にしてしまう

`c--` は「**コンポーネント**（再利用可能な UI 部品）」を表すプレフィックス。**カスタムクラスを必ず `c--` で命名する必要はない**。サイトの大まかな領域（header / sidebar / main / footer 等）やページ固有のスタイルなど、再利用が前提でないクラスは、独自プレフィックス（`z--` / `p--` 等）やプレフィックスなしの命名も選択肢として検討すること。

→ 使い分け表と配置レイヤー: [css-rules.md の独自プレフィックス](./css-rules.md#独自プレフィックス)

`c--header` のような命名も間違いとまでは言えないが、「カスタムクラス＝必ず `c--`」ではないことに注意する。

## クラス名の命名ミス

Lism CSS では、プレフィックス（`c--` / `is--` / `has--` / `u--` / `set--` 等）に続く名称は **camelCase** で書くのが規約。kebab-case で書くと、BEM の Modifier 区切り（`--`）と視覚的に紛れて読みにくくなる。

→ 詳細: [naming.md](./naming.md#クラスの命名規則)

| NG                                         | OK                                       | 理由                                                       |
| ------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| `c--my-card`                               | `c--myCard`                              | プレフィックス後の名称は camelCase                         |
| `c--my-card--primary`                      | `c--myCard--primary`                     | Modifier 区切り `--` と単語区切り `-` が混在して読みにくい |
| `c--card_my-elem`                          | `c--card_myElem`                         | Element 名（`_` 後）も camelCase                           |
| `is--side-bar` / `has--gutter-x`           | `is--sideBar` / `has--gutterX`           | `is--` / `has--` / `u--` 等にも同じ規則が適用される        |
| `c--hero__inner` / `c--featureCard__title` | `c--hero_inner` / `c--featureCard_title` | Element 区切りは `_` ひとつ。BEM 風の `__` は使わない      |

```jsx
// NG: kebab-case
<Stack className="c--feature-card" />
<div className="c--user-profile c--user-profile--compact" />

// OK: camelCase
<Stack className="c--featureCard" />
<div className="c--userProfile c--userProfile--compact" />
```

Modifierだけは`--`ふたつを使う: `c--featureCard--featured`。

