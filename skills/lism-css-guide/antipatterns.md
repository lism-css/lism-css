# アンチパターン辞書

AI が Lism CSS のコードを生成する際に間違いやすい記法と、その正しい書き方をカタログ化したもの。コードを書く前に該当カテゴリを確認すること。

## TOC

- [Token typo（存在しない値）](#token-typo存在しない値)
- [px / 固定値の直書き](#px--固定値の直書き)
- [Property Class で書けるのに CSS で書く](#property-class-で書けるのに-css-で書く)
- [`is--` の誤用（状態・バリエーション）](#is---の誤用状態バリエーション)
- [`--keycolor` の誤用](#--keycolor-の誤用)
- [Prop 型ミス](#prop-型ミス)
- [レイアウト選択ミス](#レイアウト選択ミス)
- [レスポンシブ抜け](#レスポンシブ抜け)

---

## Token typo（存在しない値）

Lism CSS側が用意しているトークン値と異なるものを書かないように注意する。  
正確な一覧は [tokens.md](./tokens.md) を参照すること。

ただし、ユーザーが独自に追加定義することは可能。あくまでデフォルトで用意されていないもので間違えやすいものを紹介しておく。

### カラー

| NG | OK | 理由 |
|---|---|---|
| `bgc="primary"` | `bgc="brand"` | セマンティックカラーに `primary`/`secondary` は無い。ブランド色は `brand`/`accent` |
| `bgc="secondary"` | `bgc="base-2"` | サブ背景色は `base-2`（`base-3` がユーザーによって追加定義されている可能性もある） |
| `c="muted"` | `c="text-2"` | 補助テキスト色は `text-2` |
| `c="danger"` | `c="red"` | パレットカラーから選ぶ（`red` / `orange` 等） |

- セマンティックカラー: `base` / `base-2` / `text` / `text-2` / `divider` / `link` / `brand` / `accent`
- パレットカラー: `red` / `blue` / `green` / `yellow` / `purple` / `orange` / `pink` / `gray` / `white` / `black`

### スペース（`p` / `m` / `g` 等）

スペーストークンに**中間値は存在しない**（`5/10/15/20/30/40/50/60/70/80` のみ）。`8/12/14/25/35/45/65/75` 等を書きそうになったら、必ず最寄りトークンに丸めるか、ユーザーに方針確認すること（→ [SKILL.md のデザイン取り込みフロー](./SKILL.md#デザインデータ取り込み時のフロー)）。

| NG | OK | 理由 |
|---|---|---|
| `p="8"` | `p="10"` | スペーストークンは`5/10/15/20/30/40/50/60/70/80`。tailwindのような4の倍数ではない |
| `g="6"` | `g="5"` | 同上 |
| `m="25"`, `m="35"` | `m="20"` or `m="30"` | 中間値は存在しない |
| `m="100"` | `m="80"` | 上限は `80`（ユーザーが追加定義している可能性はある） |

### フォントサイズ（`fz`）

| NG | OK | 理由 |
|---|---|---|
| `fz="14"` | `fz="s"` | `fz` は文字列キー（数値は不可） |
| `fz="large"`, `fz="md"`  | `fz="l"` | 略号は `2xs` / `xs` / `s` / `m` / `l` / `xl` / `2xl` … |


### 角丸 / 影

| NG | OK | 理由 |
|---|---|---|
| `bdrs="sm"`, `bdrs="round"` | `bdrs="20"`, `bdrs="99"` | 角丸トークンは `10` / `20` / `30` / `40` / `99` / `inner` |
| `bxsh="xs"`, `bxsh="sm"` | `bxsh="10"`, `bxsh="20"` | shadowトークンは `10` / `20` / `30` / `40` / `50` |

### プリセット外の値を Lism Props に渡している

Lism Props では、props.ts で事前定義されたものが `-{prop}:{value}` クラスとして出力される。それ以外の値はそのまま出力されてCSSとして無効になる。

```JSX
// NG: 事前定義されたトークン値に合致しないため、-lts:xl は出力されない
<Text lts="xl">...</Text>
```

独自にProperty Classを拡張したりトークン値を増やしたりする場合は、 [property-class.md の `:value` 記法](./property-class.md)を活用するか、[`lism.config.js`による拡張](./customize.md)が必要。

---

## px / 固定値の直書き

デザインデータ由来の px / rem / em をそのまま書くと、Lism CSS のスケール統一が崩れる。**書く前に [SKILL.md のデザインデータ取り込み時のフロー](./SKILL.md#デザインデータ取り込み時のフロー) に従い、ユーザーに「A: そのまま採用 / B: 最寄りトークンに丸める / C: トークン基準値を上書きする」を確認すること**。確認なしに固定値を採用しない。

### スペース・サイズ

| NG | OK | 理由 |
|---|---|---|
| `padding: 3px 10px` | `padding: var(--s5) var(--s10)` または Props で `py="5" px="10"` | `3px` はトークン外。最寄りは `--s5`(4px) |
| `min-width: 28px; height: 28px` | `min-w` / `h` をトークン値に丸める、または基準値を上書き | `28px` はトークン外 |
| `gap: var(--s5); padding: var(--s10) var(--s15)` を CSS で直書き | `<Lism g="5" py="10" px="15">` | Property Class / Props で書ける |

### 角丸・ボーダー

| NG | OK | 理由 |
|---|---|---|
| `border-radius: 2px` | `border-radius: var(--bdrs--10)`（4px） | 角丸トークンの最小は `--bdrs--10`（4px）。`2px` はトークン外 |
| `border-radius: 6px` | `--bdrs--10`（4px）か `--bdrs--20`（8px）に丸める | 6px はトークン外 |

### タイポグラフィ

| NG | OK | 理由 |
|---|---|---|
| `font-size: 13px` を直書き | `font-size: var(--fz--xs)` または Props で `fz="xs"` | フォントサイズは調和数列スケール。固定値は避ける |
| `letter-spacing: 0.02 / 0.12 / 0.14 / 0.18 / 0.2 / 0.24em` を散在 | `--lts--s/-l` を使う、または独自の `--lts--*` を `global.css` で追加 | デフォルトの `lts` トークンは `s/l` のみ。多種混在はデザイントークンとして不健全 |

### 直書きしてよい例外

- 1px / -1px の罫線・視覚補正（border / margin の打ち消し）
- transform / vertical-align 等の微調整値（数 px 単位）
- `media query` / `@container` の閾値など、ブラウザ仕様上 px 必須の値

---

## Property Class で書けるのに CSS で書く

`c--*` を定義したくなったら、まず宣言ごとに Property Class へ落とせるか確認する。落とせる宣言を CSS に書くと、CSS が肥大化し、Property Class の利点（差分上書きの容易さ・読みやすさ）が失われる。

| NG（CSS 直書き） | OK（Property Class） |
|---|---|
| `.c--tag { font-size: var(--fz--xs); padding: var(--s10); background: var(--base-2); border-radius: var(--bdrs--10); }` | `<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">` |
| `.c--eyebrow { font-size: var(--fz--2xs); color: var(--text-2); text-transform: uppercase; }` | `<span class="c--eyebrow -fz:2xs -c:text-2 -tt:uppercase">` |


CSS に残すのは、基本的には　`::before` / `> li` などの「Primitive / Trait / Property Class で書けないセレクタ」を伴う宣言。単一要素への装飾束は呼び出し側マークアップに移す。

なお、**CSS が空になっても `c--*` クラス名はマークアップに残して構わない**（むしろ推奨）。コンポーネントとしての役割をソースから読み取りやすくする目的で、意味づけ用に付けたままにする。


---

## `is--` の誤用（状態・バリエーション）

Lism CSS の `is--` プレフィックスは「**〜である**」という**役割・存在の宣言**を表す trait 用（`is--container` / `is--wrapper` / `is--layer` / `is--boxLink` / `is--coverLink` / `is--skipFlow` / `is--side` 等）。ユーザーが独自に `is--*` を追加することは可能だが、**その要素の役割（trait）を宣言するもの**であることが条件で、**状態管理やスタイルバリエーション目的に流用しない**（`is--active` / `is--current` / `is--solid` などは誤用）。

→ 詳細: [trait-class.md](./trait-class.md#is-trait役割宣言)

`is--` と紛れがちな 2 つの用途は、Lism では別の手段で表現する：

### 1. 状態管理 → `data-*` 属性を使う

オン/オフが切り替わる状態（active / current / disabled / open / selected 等）は、`is--*` クラスを増やさず HTML の `data-*` 属性で表現する。CSS は属性セレクタで書く。

| NG | OK |
|---|---|
| `<a class="c--catTab is--active">` + `.c--catTab.is--active { ... }` | `<a class="c--catTab" data-is-active>` + `.c--catTab[data-is-active] { ... }` |
| `<li class="c--pager_num is--current">` + `.c--pager_num.is--current { ... }` | `<li class="c--pager_num" aria-current="page">` + `.c--pager_num[aria-current] { ... }` |
| `<a class="c--pager_nav is--disabled">` + `.c--pager_nav.is--disabled { ... }` | `<a class="c--pager_nav" data-is-disabled>` + `.c--pager_nav[data-is-disabled] { ... }` |

理由：

- `is--*` は「役割宣言」用の trait であり、状態を表すクラスを `is--*` として増やすと意味体系（trait か state か）が混在して読みにくくなる
- `data-*` は HTML 標準の状態表現で、JS からの切替（`element.dataset.isActive = ''` / `delete element.dataset.isActive`）も自然
- ARIA 属性で意味が表せる場合（`aria-current` / `aria-disabled` / `aria-selected` 等）は ARIA を優先し、その属性自体を CSS セレクタにする

### 2. スタイルバリエーション → BEM Modifier `c--{name}--{variant}`

「同じコンポーネントの見た目違い」は、Lism CSS 公式の BEM Modifier 記法で表現する（→ [css-rules.md の Component Class](./css-rules.md#component-classc--)）。

| NG | OK |
|---|---|
| `<span class="c--tag is--solid">` + `.c--tag.is--solid { ... }` | `<span class="c--tag c--tag--solid">` + `.c--tag.c--tag--solid { ... }` |
| `<button class="c--button is--outline">` | `<button class="c--button c--button--outline">` |

なお、「色だけ違う」程度ならマークアップ側で `-bgc:* -c:*` を差し替えるだけで済むことも多い。

---

## `--keycolor` の誤用

`--keycolor` は要素単位で「軸となる色」を切り替えるための**ローカル変数**。サイト全体のブランドカラーやリンクカラーには使わない。

### `:root` でのグローバル上書き

| NG | OK | 理由 |
|---|---|---|
| `:root { --keycolor: #c8553d; }` | `:root { --brand: #c8553d; }`（または `--accent` / `--link`） | サイト共通の色は `--brand` / `--accent` / `--link` などのセマンティックカラーで定義する |

### アクセントカラーとしての `keycolor` 参照

| NG | OK | 理由 |
|---|---|---|
| `<Link c="keycolor">` | `<Link c="brand">` または `<Link c="link">` | リンク・hover などの恒常的なアクセントは `brand` / `link` を使う |
| `hov={{ c: 'keycolor' }}` | `hov={{ c: 'brand' }}` | 同上 |
| `border-inline-start: 3px solid var(--keycolor)`（CSS 直書き） | `border-inline-start: 3px solid var(--brand)` | 同上 |

### `--keycolor` を使うべき場面

「**そのボックス／コンポーネント自身の軸色**」を切り替えたい時のみ：

```html
<!-- u--cbox や c--callout など、ボックス全体の色味を局所的に切り替える -->
<div class="u--cbox" style="--keycolor: var(--red)">
  <p class="-c" style="--c: var(--keycolor)">danger 用カラーリング</p>
</div>
```

```jsx
<Lism class="u--cbox" keycolor="var(--red)">
  <Text c="keycolor">...</Text>
</Lism>
```

詳細: [tokens.md のキーカラー変数セクション](./tokens.md#キーカラー変数-keycolor)

---

## px / 固定値の直書き

デザインデータ由来の px / rem / em をそのまま書くと、Lism CSS のスケール統一が崩れる。**書く前に [SKILL.md のデザインデータ取り込み時のフロー](./SKILL.md#デザインデータ取り込み時のフロー) に従い、ユーザーに「A: そのまま採用 / B: 最寄りトークンに丸める / C: トークン基準値を上書きする」を確認すること**。確認なしに固定値を採用しない。

### スペース・サイズ

| NG | OK | 理由 |
|---|---|---|
| `padding: 3px 10px` | `padding: var(--s5) var(--s10)` または Props で `py="5" px="10"` | `3px` はトークン外。最寄りは `--s5`(4px) |
| `min-width: 28px; height: 28px` | `min-w` / `h` をトークン値に丸める、または基準値を上書き | `28px` はトークン外 |
| `gap: var(--s5); padding: var(--s10) var(--s15)` を CSS で直書き | `<Lism g="5" py="10" px="15">` | Property Class / Props で書ける |

### 角丸・ボーダー

| NG | OK | 理由 |
|---|---|---|
| `border-radius: 2px` | `border-radius: var(--bdrs--10)`（4px） | 角丸トークンの最小は `--bdrs--10`（4px）。`2px` はトークン外 |
| `border-radius: 6px` | `--bdrs--10`（4px）か `--bdrs--20`（8px）に丸める | 6px はトークン外 |

### タイポグラフィ

| NG | OK | 理由 |
|---|---|---|
| `font-size: 13px` を直書き | `font-size: var(--fz--xs)` または Props で `fz="xs"` | フォントサイズは調和数列スケール。固定値は避ける |
| `letter-spacing: 0.02 / 0.12 / 0.14 / 0.18 / 0.2 / 0.24em` を散在 | `--lts--s/-l` を使う、または独自の `--lts--*` を `global.css` で追加 | デフォルトの `lts` トークンは `s/l` のみ。多種混在はデザイントークンとして不健全 |

### 直書きしてよい例外

- 1px / -1px の罫線・視覚補正（border / margin の打ち消し）
- transform / vertical-align 等の微調整値（数 px 単位）
- `media query` / `@container` の閾値など、ブラウザ仕様上 px 必須の値

---

## Property Class で書けるのに CSS で書く

`c--*` を定義したくなったら、まず宣言ごとに Property Class へ落とせるか確認する。落とせる宣言を CSS に書くと、CSS が肥大化し、Property Class の利点（差分上書きの容易さ・読みやすさ）が失われる。

| NG（CSS 直書き） | OK（Property Class） |
|---|---|
| `.c--tag { font-size: var(--fz--xs); padding: var(--s10); background: var(--base-2); border-radius: var(--bdrs--10); }` | `<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">` |
| `.c--eyebrow { font-size: var(--fz--2xs); color: var(--text-2); text-transform: uppercase; }` | `<span class="c--eyebrow -fz:2xs -c:text-2 -tt:uppercase">` |


CSS に残すのは、基本的には　`::before` / `> li` などの「Primitive / Trait / Property Class で書けないセレクタ」を伴う宣言。単一要素への装飾束は呼び出し側マークアップに移す。

なお、**CSS が空になっても `c--*` クラス名はマークアップに残して構わない**（むしろ推奨）。コンポーネントとしての役割をソースから読み取りやすくする目的で、意味づけ用に付けたままにする。


---

## `is--` の誤用（状態・バリエーション）

Lism CSS の `is--` プレフィックスは「**〜である**」という**役割・存在の宣言**を表す trait 用（`is--container` / `is--wrapper` / `is--layer` / `is--boxLink` / `is--coverLink` / `is--skipFlow` / `is--side` 等）。ユーザーが独自に `is--*` を追加することは可能だが、**その要素の役割（trait）を宣言するもの**であることが条件で、**状態管理やスタイルバリエーション目的に流用しない**（`is--active` / `is--current` / `is--solid` などは誤用）。

→ 詳細: [trait-class.md](./trait-class.md#is-trait役割宣言)

`is--` と紛れがちな 2 つの用途は、Lism では別の手段で表現する：

### 1. 状態管理 → `data-*` 属性を使う

オン/オフが切り替わる状態（active / current / disabled / open / selected 等）は、`is--*` クラスを増やさず HTML の `data-*` 属性で表現する。CSS は属性セレクタで書く。

| NG | OK |
|---|---|
| `<a class="c--catTab is--active">` + `.c--catTab.is--active { ... }` | `<a class="c--catTab" data-is-active>` + `.c--catTab[data-is-active] { ... }` |
| `<li class="c--pager_num is--current">` + `.c--pager_num.is--current { ... }` | `<li class="c--pager_num" aria-current="page">` + `.c--pager_num[aria-current] { ... }` |
| `<a class="c--pager_nav is--disabled">` + `.c--pager_nav.is--disabled { ... }` | `<a class="c--pager_nav" data-is-disabled>` + `.c--pager_nav[data-is-disabled] { ... }` |

理由：

- `is--*` は「役割宣言」用の trait であり、状態を表すクラスを `is--*` として増やすと意味体系（trait か state か）が混在して読みにくくなる
- `data-*` は HTML 標準の状態表現で、JS からの切替（`element.dataset.isActive = ''` / `delete element.dataset.isActive`）も自然
- ARIA 属性で意味が表せる場合（`aria-current` / `aria-disabled` / `aria-selected` 等）は ARIA を優先し、その属性自体を CSS セレクタにする

### 2. スタイルバリエーション → BEM Modifier `c--{name}--{variant}`

「同じコンポーネントの見た目違い」は、Lism CSS 公式の BEM Modifier 記法で表現する（→ [css-rules.md の Component Class](./css-rules.md#component-classc--)）。

| NG | OK |
|---|---|
| `<span class="c--tag is--solid">` + `.c--tag.is--solid { ... }` | `<span class="c--tag c--tag--solid">` + `.c--tag.c--tag--solid { ... }` |
| `<button class="c--button is--outline">` | `<button class="c--button c--button--outline">` |

なお、Modifier であってもまずは [Property Class で表現できないか](#property-class-で書けるのに-css-で書く) を検討すること。「色だけ違う」程度ならマークアップ側で `-bgc:* -c:*` を差し替えるだけで済むことも多い。

---

## `--keycolor` の誤用

`--keycolor` は要素単位で「軸となる色」を切り替えるための**ローカル変数**。サイト全体のブランドカラーやリンクカラーには使わない。

### `:root` でのグローバル上書き

| NG | OK | 理由 |
|---|---|---|
| `:root { --keycolor: #c8553d; }` | `:root { --brand: #c8553d; }`（または `--accent` / `--link`） | サイト共通の色は `--brand` / `--accent` / `--link` などのセマンティックカラーで定義する |

### アクセントカラーとしての `keycolor` 参照

| NG | OK | 理由 |
|---|---|---|
| `<Link c="keycolor">` | `<Link c="brand">` または `<Link c="link">` | リンク・hover などの恒常的なアクセントは `brand` / `link` を使う |
| `hov={{ c: 'keycolor' }}` | `hov={{ c: 'brand' }}` | 同上 |
| `border-inline-start: 3px solid var(--keycolor)`（CSS 直書き） | `border-inline-start: 3px solid var(--brand)` | 同上 |

### `--keycolor` を使うべき場面

「**そのボックス／コンポーネント自身の軸色**」を切り替えたい時のみ：

```html
<!-- u--cbox や c--callout など、ボックス全体の色味を局所的に切り替える -->
<div class="u--cbox" style="--keycolor: var(--red)">
  <p class="-c" style="--c: var(--keycolor)">danger 用カラーリング</p>
</div>
```

```jsx
<Lism class="u--cbox" keycolor="var(--red)">
  <Text c="keycolor">...</Text>
</Lism>
```

詳細: [tokens.md のキーカラー変数セクション](./tokens.md#キーカラー変数-keycolor)

---

## Prop 型ミス

### Heading の `level` は文字列

| NG | OK | 理由 |
|---|---|---|
| `<Heading level={3}>` | `<Heading level="3">` | `level` は `'1'` 〜 `'6'` の文字列 union 型 |

### レスポンシブ値は配列 or オブジェクト

| NG | OK | 理由 |
|---|---|---|
| `<Columns cols="1,2,3">` | `<Columns cols={[1, 2, 3]}>` | レスポンシブは配列 |
| `<Box p="20 30 40">` | `<Box p={[20, 30, 40]}>` | 同上 |

---

## レイアウト選択ミス

詳細な選択基準は [primitive-class.md](./primitive-class.md#カラムレイアウト-primitive-の使い分けガイド) の使い分けガイドを参照。

### Grid 直書き vs Columns

| NG | OK | 理由 |
|---|---|---|
| `<Grid gtc="repeat(3, 1fr)">` | `<Columns cols={3}>` | 等幅 N 列は Columns で宣言的に書く |
| `<Grid gtc={['1fr', '1fr 1fr', '1fr 1fr 1fr']}>` | `<Columns cols={[1, 2, 3]}>` | BP 切替も Columns のほうが簡潔 |

### コンテンツ幅のハードコード

| NG | OK | 理由 |
|---|---|---|
| `style={{ maxWidth: '1200px' }}` | `<Box max-sz="l">` | ヘッダーやセクションなど、コンテンツサイズにはトークン値（`xs` / `s` / `m` / `l` / `xl` / `container`）をできるだけ活用する |

### サイドバー型レイアウト

| NG | OK | 理由 |
|---|---|---|
| `<Grid gtc="1fr 240px">` で固定 | `<WithSide sideW="240px">` | コンテンツ幅で自動切替したいなら WithSide |
| `<Flex>` で 2 カラム強制横並び | `<WithSide>` | 縦並びへの切替が必要なら WithSide |

---

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

| NG | OK | 理由 |
|---|---|---|
| `<div class="-p_sm" style="--p_sm: var(--s30)">` | `<div class="-p:20 -p_sm" style="--p_sm: var(--s30)">` | BP 未満では値が空になるため、ベースクラス `-{prop}:{value}` も必要 |

### ブレイクポイントの誤用

Lism CSS の標準出力で有効な BP は `sm: 480px` / `md: 800px` まで。`lg` 以降を使う場合は SCSS 設定で出力範囲を拡張する必要がある。`xs` は BP キーとして存在しない。

| NG | OK | 理由 |
|---|---|---|
| `<Box p={{ xs: 10, sm: 20 }}>` | `<Box p={{ base: 10, sm: 20 }}>` | デフォルトは `base`（`xs` キーは無い） |
| `cols={[1, 2, 3, 4]}` | `cols={[1, 2, 3]}` | 標準出力では `[base, sm, md]` までが有効。`lg` 以降は SCSS 設定が必要 |
