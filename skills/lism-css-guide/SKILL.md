---
name: lism-css-guide
description: "Lism CSS の設計・実装に関するガイド。CSSの編集・追加、UIコンポーネントやレイアウトの実装・編集時に参照。c--*, l--*, a--*, is--*, has--*, set--*, u--* -prop:value 形式のクラス・トークン(CSS変数)・命名規則・Layer規則・レスポンシブ対応について調べる時にも参照。"
---

# Lism CSS Best Practices

このスキルは、「Lism CSS」によるCSS設計理論の全体像と、実装時のベストプラクティスに関するガイドを提供します。

調和と統一感を生み出すデザイントークン設計、`@layer`で管理されるプリミティブ設計、CSS変数を活かした柔軟でレスポンシブなユーティリティ設計が特徴です。

> **バージョン情報:** このガイドは `lism-css@0.16.0` / `@lism-css/ui@0.16.0` 時点の情報に基づいています。プロジェクトで使用中のバージョンを確認し、このガイドのバージョンと異なる場合はユーザーに通知してください。

公式ドキュメント: https://lism-css.com/docs/overview.md


## インストール

### CDNでCSSファイルのみ読み込む場合

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css@0.16.0/dist/css/main.css" rel="stylesheet" />
```

### npm パッケージ

- `lism-css` — コアパッケージ。Lism CSS本体となるCSSファイル、レイアウトプリミティブ、デザイントークン、Property Class、React/Astroコンポーネントを提供。
- `@lism-css/ui` — `lism-css` を使って構築された UI コンポーネントライブラリ。Accordion, Modal, Tabs, Button, Badge, Callout 等を React/Astro で提供。

### CSS 読み込み

```js
import 'lism-css/main.css';
```

### コンポーネント読み込み例

```jsx
// React
import { Flex, Stack, Grid, Columns } from 'lism-css/react';
import { Accordion, Tabs, Button } from '@lism-css/ui/react';

// Astro
import { Flex, Stack, Grid, Columns } from 'lism-css/astro';
import { Accordion, Tabs, Button } from '@lism-css/ui/astro';
```


## 実装ルール

### コードを書く前に必ず参照

レイアウト選択ミスや典型的な記法ミスを避けるため、コード生成の前に以下を確認すること：

- **どの Primitive を使うか迷ったら** → [primitive-class.md の「カラムレイアウト Primitive の使い分けガイド」](./primitive-class.md#カラムレイアウト-primitive-の使い分けガイド) — 比較表と用途別の選び方で判断材料を提供
- **コードを書く前のチェック** → [antipatterns.md](./antipatterns.md) — Token typo / px 直書き / Prop 型ミス / レイアウト選択ミス / レスポンシブ抜けの NG → OK カタログ

### プリフライト・プリミティブ選定（必須）

実装対象の UI 構造を見て、**まずどのプリミティブ／コンポーネントを使うかを決めること**。ここを飛ばすと `<div>` + Property Class でゴリ押すコードになり、レイアウトの一貫性が失われる。

検討順：

1. **レイアウトプリミティブ** — `Stack` / `Flex` / `Cluster` / `Grid` / `Columns` / `WithSide` / `Center` / `Frame` / `Flow` / `TileGrid` / `AutoColumns` / `SwitchColumns` / `Box` のいずれかで構造を組めないか？
2. **Trait クラス** — `Container`(`is--container`) / `Wrapper`(`is--wrapper`) / `Layer`(`is--layer`) / `BoxLink`(`is--boxLink`) で表現すべき役割が無いか？
3. **Atomic プリミティブ** — `Icon` / `Divider` / `Spacer` / `Decorator` で置き換えられる装飾要素が無いか？
4. **UI コンポーネント** — `@lism-css/ui` の `Accordion` / `Modal` / `Tabs` / `Button` / `Badge` / `Callout` 等で済む UI が無いか？

判断に迷う場合：

- カラム系の使い分け → [primitive-class.md の使い分けガイド](./primitive-class.md#カラムレイアウト-primitive-の使い分けガイド)
- 典型的な選択ミス → [antipatterns.md のレイアウト選択ミス](./antipatterns.md#レイアウト選択ミス)

### プリフライト・トークン照合（必須）

コードを書き始める前に、**これから使う予定の数値・キー名・カラー名をすべて列挙し、[tokens.md](./tokens.md) の値リストと照合すること**。照合が済むまでコードを書かない。

頻出ミス（spacing 中間値・角丸/影の数値外し・fz の他FW混入・存在しないカラー名・`--keycolor` 誤用 など）の NG → OK 例は [antipatterns.md](./antipatterns.md) を参照。

照合中に「該当トークンが無い／揺れる」値が見つかった場合は、そのまま実装に進まず [デザインデータ取り込み時のフロー](#デザインデータ取り込み時のフロー) に従ってユーザー確認すること。

### プリフライト・c-- 定義時の分解（必須）

`c--*` を新規に定義する／既存に追記する前に、書こうとしている各 CSS 宣言を以下の 2 グループに分解する：

1. **Property Class / Props で書ける宣言** — マークアップ側に `-{prop}:{value}` または Lism Props として移す。CSS に書かない。
2. **CSS でしか書けない宣言** — 擬似クラス・擬似要素・状態切替・子孫セレクタなど。これらは `.c--*` の CSS に残す。

**CSS が 1 行も残らなくても、`c--*` クラス名はマークアップに付けたまま残してよい。**
むしろコンポーネントとしての意味づけがソースから読み取れるので、空の `c--*` クラスは付けておくことを推奨する（CSS ファイル側にセレクタを書く必要は無い）。

例：

NG（全部 CSS に書く）

```css
.c--tag {
  font-size: var(--fz--xs);
  padding: var(--s10);
  background-color: var(--base-2);
  border-radius: var(--bdrs--10);
}
```

OK（Property Class でマークアップに移し、`c--tag` は意味づけとして残す）

```html
<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">React</span>
```

`.c--tag` の CSS には、`:hover` 等の擬似クラスや、Modifier（`.c--tag--solid`）・状態切替（`[data-is-active]` 等）の宣言が出てきた時にだけ書く。そういう宣言が無ければ CSS は空のままで OK（クラス名はマークアップに残す）。

> **注意**: `is--*` は「〜である（役割・存在の宣言）」を表す trait 用プレフィックス。ユーザー定義の `is--*` を追加することは可能だが、**状態管理（`is--active` 等）やスタイルバリエーション（`is--solid` 等）への流用は誤用**。状態は `data-*` 属性、バリエーションは BEM Modifier（`c--{name}--{variant}`）で表現する。詳細: [antipatterns.md の `is--` の誤用](./antipatterns.md#is---の誤用状態バリエーション)

詳細な NG → OK 例は [antipatterns.md の「Property Class で書けるのに CSS で書く」](./antipatterns.md#property-class-で書けるのに-css-で書く) を参照。

### 基本方針: できる限りLism CSSの用意しているクラス・CSS変数・コンポーネントを使って書く

プリフライトでプリミティブとトークンを決めたら、細部を以下のチェックリストで検討する：

- Lism の用意している `set--`系クラス、`u--`系クラスは使えないか？
- Property Class (`-{prop}:{value}` or `<Lism prop="value">`))を使ってスタイリングできるか？
- 値をレスポンシブに切り替える時は Lism の Property Class (`-{prop}_{bp}` or `<Lism prop={[...]}>`)を使って実装できるか？
- カラー・余白・フォントサイズ・タイポグラフィ・行間（ハーフレディング）・サイズ・角丸・シャドウなどはトークン値を流用できないか？
- その他、Lismが用意するCSS変数を活用できないか？

### ネイティブCSS で書くかどうか

`c--*` クラスを定義する際、Primitive Class / Trait Class / Property Class / Lism Props で書ける宣言は CSS に直接書かない。

CSS（`@layer lism-component` 等）に書くのは、以下のいずれかに該当する宣言のみ：

- 擬似クラス・擬似要素（`:focus`, `::before`, `::after`, `:nth-child` 等）
- 状態切替（data属性で管理する`[data-is-active]`等）で複数プロパティを切り替える場合
- 自分でクラスを付けられない子孫要素のスタイル（MDX/markdown レンダリング配下の `h2` / `p` / `blockquote` 等）
- その他、Lism の既存クラスで表現できないスタイル。（計算式・特殊なスタイル、アニメーションなど。）


### コンポーネント化のルール（CSS ではなくマークアップで束ねる）

同じ Property Class の組み合わせが 3 箇所以上で繰り返されるなら、**まず Astro/React コンポーネントとして切り出して Props で共通化** することを検討する。CSS の `c--*` を新設して中にスタイルを書くのはそれができない場合の手段とする。

- コンポーネントはできる限り `<Lism>` 系コアコンポーネントやレイアウトプリミティブ（`Stack`, `Flex`, `Columns` 等）をベースに構築する。
- カスタムコンポーネントクラスは `c--{name}` の命名規則に従う（CSS が空でも意味づけとして付ける）。


### 間違いやすい例

| NG | OK | 理由 |
|----|-----|------|
| `<Heading level={3}>` | `<Heading level="3">` | `level` は文字列型（`'1'`〜`'6'`） |
| `hov="shadow"` | `hov="-bxsh"` | Lism の省略名は `bxsh`（box-shadow） |
| `bgc="secondary"` | `bgc="base-2"` | カラートークンの間違い |
| `p="8"`, `g="6"` | `p="20"`, `g="10"` | スペーストークンの間違い |

その他の典型的な NG パターンは [antipatterns.md](./antipatterns.md) にカタログ化されているので、コード生成前に確認すること。

#### NG: レスポンシブの考慮漏れ・Gridの直書き

渡されたPCサイズのデザインだけをみて、カラムレイアウトを`<Grid gtc="repeat(3, 1fr)>`のように固定してしまわないようにすること。
特に指示がなければ、レスポンシブを意識して実装する。`<Columns>`（`l--columns`）を使ってブレイクポイントで切り替えるか、`l--withSide`や`l--autoColumns`で自動レスポンシブを採用することを検討する。

また、Lism CSSではコンテナクエリを採用しているため、レスポンシブの値切り替えには先祖要素で `isContainer`(`is--container`クラス) が必要なことに注意。

#### NG: コンテンツ幅のハードコーディング

ページ全体のデザインデータを渡された時、サイト幅やセクションエリアのサイズをpxでハードコーディングする前に、`--sz--`トークンを活用できないかをまずは考えてください。
`<Lism as="section" max-sz="m"`>(`-max-sz:m`クラス) などの指定でコンテンツ幅を管理することができます。

### デザインデータ取り込み時のフロー

Figma 等のデザインデータから値を読み取って実装する場合、px / rem / em の固定値が含まれることが多い。**実装に着手する前に**以下の手順でユーザーに方針を確認すること。確認せずに px 直書きで進めない。

#### 手順

1. **px / rem / em で書かれた値を抽出**（spacing / radius / size / fz / lh / lts / shadow など）
2. **対応するトークン候補と差分を表で提示**

   | デザイン値 | 最寄りトークン | 差分 |
   |---|---|---|
   | `padding: 12px` | `--s15`（≒12px） | 一致 |
   | `padding: 3px` | `--s5`（≒4px） | +1px |
   | `border-radius: 6px` | `--bdrs--10`（4px）／`--bdrs--20`（8px） | ±2px |
   | `font-size: 13px` | `--fz--xs`（mol/(mol+2)） | スケール基準でズレる |

3. **ユーザーに方針を確認**（候補は以下の3択）

   - **A. デザイン値を優先して px / rem / em で直書きする**
     - 一貫性より忠実度を優先するケース。デザイントークンの恩恵は失う。
   - **B. 最寄りトークンに丸める（推奨）**
     - 一貫性・スケーラビリティを優先。微差は許容する。
   - **C. トークン全体の基準値を上書きする**
     - デザインのスケールに合わせて、`--s-unit` / `--fz-mol` などの基準変数や、 `--s10`, `--fz--xl` , `--bdrs--10` などの**具体的な各トークン変数を `global.css` で再定義**することで、トークン全体をデザインデータに揃える。
     - 既存トークンの上書きで吸収できない場合に限り、`--s25` 等のカスタムトークンを追加する。

4. 確認結果に従って実装する。

#### 確認不要な例外

- 1px / -1px の罫線・視覚補正（border / margin の打ち消し）
- transform / vertical-align 等の微調整値（数 px 単位）
- ブラウザ仕様上 px 必須の値（`media query`、`@container` の `min-width` 等）


## 詳細リファレンス

このスキルには以下の詳細ファイルが含まれます。必要に応じて参照してください。

- [tokens.md](./tokens.md) — Lismで利用できるデザイントークンとCSS変数。（余白・フォントサイズ・タイポグラフィ・角丸・影・カラー・不透明度）
- [css-rules.md](./css-rules.md) — CSS設計の概要。（Layer構造・クラスの分類・プレフィックスのつけ方・Component クラス（`c--`）・カスタムCSSの追加ルール）
- [naming.md](./naming.md) — 命名規則の詳細。（CSS変数名・クラス名・Property Class の `{prop}` / `{value}` の省略ルール）
- [base-styles.md](./base-styles.md) — HTML要素のベーススタイリング。（Reset CSSやHTML要素の基本スタイルをカスタマイズできるCSS変数）
- [set-class.md](./set-class.md) — ベーススタイル・変数セットに使用する`set--` クラスの一覧と用途。
- [primitive-class.md](./primitive-class.md) — レイアウトを組み立てる Primitive クラス（`l--`/`a--`）の一覧と用途。カラムレイアウト系の使い分けガイドも含む。
- [antipatterns.md](./antipatterns.md) — AI が生成しがちな NG パターンと OK 対応。Token typo / px 直書き / `--keycolor` 誤用 / Prop 型ミス / レイアウト選択ミス / レスポンシブ抜け。
- [trait-class.md](./trait-class.md) — 要素に役割・機能を宣言する Trait クラス（`is--`/`has--`）の一覧と用途。
- [utility-class.md](./utility-class.md) — 具体的な用途・装飾・機能を持つユーティリティクラス（`u--` クラス）の一覧と用途。
- [property-class.md](./property-class.md) — 単一のCSSプロパティに対応するProperty Class（`-{prop}:{value}`形式のクラス）の一覧・記法。
- [prop-responsive.md](./prop-responsive.md) — レスポンシブ対応（ブレークポイント・コンテナクエリ）の書き方・仕様。
- [components-core.md](./components-core.md) — `lism-css`パッケージに含まれるコアコンポーネントの一覧と用途。（React, Astroで使える`<Lism>`・Lism Props・getLismProps ）
- [components-ui.md](./components-ui.md) — `@lism-css/ui`パッケージに含まれるUIコンポーネント（Accordion・Modal・Tabs・Button 等）の Props・構造とCLIコマンドによるインストール方法。
- [customize.md](./customize.md) — SCSS変数の上書きによる、lism-cssのコアCSSの挙動カスタマイズ方法・`lism.config.js` によるコアコンポーネント挙動のカスタマイズ方法。

これら各ファイルの冒頭にはTOC（目次）があり、セクションごとの詳細URL・ソースURLがまとめて記載されています。

### クラス単位の詳細リファレンス


**Layout Primitives**

- `l--box` / `<Box>`: [primitives/l--box.md](./primitives/l--box.md)
- `l--flex` / `<Flex>`: [primitives/l--flex.md](./primitives/l--flex.md)
- `l--stack` / `<Stack>`: [primitives/l--stack.md](./primitives/l--stack.md)
- `l--cluster` / `<Cluster>`: [primitives/l--cluster.md](./primitives/l--cluster.md)
- `l--grid` / `<Grid>`: [primitives/l--grid.md](./primitives/l--grid.md)
- `l--flow` / `<Flow>`: [primitives/l--flow.md](./primitives/l--flow.md)
- `l--center` / `<Center>`: [primitives/l--center.md](./primitives/l--center.md)
- `l--frame` / `<Frame>`: [primitives/l--frame.md](./primitives/l--frame.md)
- `l--columns` / `<Columns>`: [primitives/l--columns.md](./primitives/l--columns.md)
- `l--tileGrid` / `<TileGrid>`: [primitives/l--tileGrid.md](./primitives/l--tileGrid.md)
- `l--autoColumns` / `<AutoColumns>`: [primitives/l--autoColumns.md](./primitives/l--autoColumns.md)
- `l--switchColumns` / `<SwitchColumns>`: [primitives/l--switchColumns.md](./primitives/l--switchColumns.md)
- `l--withSide` / `<WithSide>`: [primitives/l--withSide.md](./primitives/l--withSide.md)

**Trait Class (is--)**

- `is--container` / `<Container>`: [trait-class/is--container.md](./trait-class/is--container.md)
- `is--wrapper` / `<Wrapper>`: [trait-class/is--wrapper.md](./trait-class/is--wrapper.md)
- `is--layer` / `<Layer>`: [trait-class/is--layer.md](./trait-class/is--layer.md)
- `is--boxLink` / `<BoxLink>`: [trait-class/is--boxLink.md](./trait-class/is--boxLink.md)

**Trait Class (has--)**

- `has--transition` (`hasTransition` prop): [trait-class/has--transition.md](./trait-class/has--transition.md)
- `has--gutter` (`hasGutter` prop): [trait-class/has--gutter.md](./trait-class/has--gutter.md)
- `has--snap` (`hasSnap` prop): [trait-class/has--snap.md](./trait-class/has--snap.md)
- `has--mask` (`hasMask` prop): [trait-class/has--mask.md](./trait-class/has--mask.md)

**Atomic Primitives**

- `a--icon` / `<Icon>`: [primitives/a--icon.md](./primitives/a--icon.md)
- `a--divider` / `<Divider>`: [primitives/a--divider.md](./primitives/a--divider.md)
- `a--spacer` / `<Spacer>`: [primitives/a--spacer.md](./primitives/a--spacer.md)
- `a--decorator` / `<Decorator>`: [primitives/a--decorator.md](./primitives/a--decorator.md)

**Property Class（特殊仕様）**

- `-bd` / `-bd-{side}` 系: [property-class/bd.md](./property-class/bd.md)
- `-hov:*` 系: [property-class/hov.md](./property-class/hov.md)
- `-max-sz:full` / `-max-sz:container`: [property-class/max-sz.md](./property-class/max-sz.md)


## このスキルファイル自身のアップデート方法

`skills add lism-css/lism-css` を再実行してください。
更新があるか確認したい場合は、[GitHub リポジトリ](https://github.com/lism-css/lism-css/tree/main/skills/lism-css-guide) を直接チェックしてください。
