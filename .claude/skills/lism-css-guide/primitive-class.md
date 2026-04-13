# Primitive クラス

Lism CSS では、レイアウトを組み立てる小さな積み木として **Primitive クラス**（`is--` / `l--` / `a--`）を提供します。これらはすべて `@layer lism-primitives` に属します（サブレイヤーは `trait` / `layout` / `atomic`）。

具体的な UI 部品は **Component クラス**（`c--`）として `@layer lism-components` に配置されますが、コアの `lism-css` には含まれず、`@lism-css/ui` パッケージやユーザー定義として提供されます。

## TOC

- [プレフィックス一覧](#プレフィックス一覧)
- [Trait Primitive（`is--`）](#trait-primitiveis--)
- [Layout Primitive（`l--`）](#layout-primitivel--)
- [Atomic Primitive（`a--`）](#atomic-primitivea--)
- [Component（`c--`）](#componentc--)

[詳細](https://lism-css.com/docs/primitives/)

---

## プレフィックス一覧

| プレフィックス | 種類 | サブレイヤー | 役割 |
|--------------|------|------------|------|
| `is--` | Trait Primitive | `lism-primitives.trait` | 要素に静的な構造的特性を付与する汎用クラス |
| `l--` | Layout Primitive | `lism-primitives.layout` | レイアウトの構成単位となる Primitive |
| `a--` | Atomic Primitive | `lism-primitives.atomic` | レイアウトの最小単位（アイコン・区切り線等） |
| `c--` | Component | `lism-components` | BEM 構造を持つ具体的な UI 部品 |

**併用ルール:**
- `is--` は他のすべての Primitive / Component と併用可能（複数の `is--` 同士もOK）
- `l--` と `c--` は併用可能（例: `class="l--flex c--nav"`）
- 同カテゴリ内の併用は不可（例: `l--flex` と `l--grid` は同要素に付けない）
- `c--` のみ Modifier との併記が可能（`.c--button.c--button--outline`）


## Trait Primitive（`is--`）

[詳細](https://lism-css.com/docs/primitives/#trait-primitives)

要素に**静的な構造的特性 (trait)** を付与するクラスです。他の Primitive / Component と自由に組み合わせられます。

| クラス | 用途 |
|--------|------|
| `is--container` | コンテナクエリの基準要素を定義する（`container-type: inline-size`を付与する）。Lism のレスポンシブ機能の判定基準となるラッパーに付与する |
| `is--wrapper` | 直下の子要素のコンテンツ幅を一括で制限する。`-contentSize:s` / `-contentSize:l` で事前定義したプリセットサイズを指定可能（デフォルト: `--sz--m`）。セクション・ヘッダー・フッター・記事コンテンツなどで、共通したコンテンツ幅を使用する |
| `is--layer` | 親要素全体に被さる絶対配置レイヤー（`position: absolute; inset: 0;`）。背景画像・カラーオーバーレイ・フィルターレイヤー・コンテンツ等を重ねて表示する |
| `is--boxLink` | ボックス全体をクリッカブルなリンク領域にする。自身を`a`タグにして利用するか、もしくは自身を`div`にして内部の`a`タグに`is--coverLink`を付与して使う |
| `is--coverLink` | 親要素全体に被さるクリック領域を持つリンク（`::before` を `inset: 0` で広げる）。`is--boxLink` と併用する |
| `is--vertical` | 縦書きモードを定義する（`writing-mode: var(--vertical-mode)`） |
| `is--skipFlow` | `l--flow` 直下で使用し、次の兄弟要素のフロー余白をゼロにする。`l--flow`の中にあるが`position:absolute`にしたい要素などに使用する |
| `is--side` | `l--sideMain` 直下で使用し、サイド側の要素であることを示す |

Lism コンポーネントでは `isContainer`, `isLayer` 等の Props として利用できます。


## Layout Primitive（`l--`）

レイアウト構造を定義するメインの Primitive 群です。

| クラス | 用途 |
|--------|-------------|
| `l--box` | 汎用ボックス |
| `l--flex` | 横方向の基本的なFlexboxレイアウト |
| `l--stack` | 縦方向の縦積みFlexboxレイアウト（`flex-direction: column`）。 |
| `l--cluster` | タグの表示UIなど、複数要素を水平に並べて配置し、数が多ければ折り返すようなレイアウト。（`flex-wrap: wrap; align-items: center`） |
| `l--grid` | 基本的なGridレイアウト。 |
| `l--center` | 要素を縦横中央に配置するレイアウト（`place-content: center; place-items: center`） |
| `l--flow` | 記事コンテンツなどのフローレイアウト。子要素間の余白を `margin-block-start` で管理する。 |
| `l--frame` | アスペクト比や高さが固定されたメディア要素を配置する。直下のメディア要素に `object-fit: cover` を付与する。 |
| `l--columns` | `repeat`と`minmax(0, 1fr))`を使ったカラムレイアウト。レスポンシブ対応の`--cols`用のProperty Classでカラム数の切り替え可能。 |
| `l--tileGrid` | `--cols`だけではなく`--rows`も組み合わせた均等タイルグリッド（`grid-template: repeat(var(--rows,1), minmax(0, 1fr)) / repeat(var(--cols,1), minmax(0, 1fr))`） |
| `l--fluidCols` | ブレイクポイントに依存せず、自動段組のできる流動カラムレイアウト。`--cols: 16em`のようにして最小維持幅を指定できる。 |
| `l--sideMain` | 画像とコンテンツ、メインエリアとサイドバーなどの「"Side" + "Main"」に分かれ、横並びと縦並びが切り替わるレイアウト。"Main"が`--mainW`で指定したサイズ以上の横幅を維持できる範囲内で横並びを維持し、下回る場合は縦並びへ自動で切り替わる。横並びの間の"Side"の横幅は`--sideW`で指定する。 |
| `l--switchCols` | 任意のサイズで一括カラム切り替えができるカラムレイアウト。`--breakSize` で制御 |

それぞれ対応するLismコンポーネント（`<Flex>`, `<Stack>`, `<Cluster>` 等）があります。


## Atomic Primitive（`a--`）

レイアウト構成物の最小単位となる Primitive です。

| クラス | 用途 |
|--------|------|
| `a--icon` | SVG アイコン。`flex-shrink: 0`, デフォルトサイズ `1em` |
| `a--divider` | 区切り線。`--bdc`, `--bds`, `--bdw` 変数でカスタマイズ |
| `a--spacer` | 空白要素（`min-height: 1px; min-width: 1px`） |
| `a--decorator` | 装飾用要素（SCSS定義なし、クラス名のみ出力） |

それぞれ対応するコンポーネント（`<Icon>`, `<Divider>`, `<Spacer>`, `<Decorator>`）があります。


## Component（`c--`）

`c--` プレフィックスで定義する **Component クラス** は、Primitive を組み合わせて作られた具体的な UI 部品です。`@layer lism-components` に配置され、コアの `lism-css` には含まれず、`@lism-css/ui` パッケージやユーザー定義として提供されます。

`c--` クラスは BEM 構造（Block / Modifier / Element）を持つことができ、それぞれ次の形式で定義します。

| 分類 | 形式 | 例 |
|---|---|---|
| Block | `.c--{name}` | `.c--button`, `.c--card` |
| Modifier | `.c--{name}--{modifier}` | `.c--button--outline` |
| Element | `.c--{name}_{element}` | `.c--card_header`, `.c--card_body` |

- Modifier は Block と併記して使用: `.c--button.c--button--outline`
- Element は `_`（アンダースコア）一つ区切り
- Block 同士の併用（`.c--xxx.c--yyy`）は基本 NG。ただし次は許容される:
  - Block と自身の Modifier: `.c--xxx.c--xxx--variant`
  - Block と他 Block の Element: `.c--xxx.c--yyy_elem`

`c--`を使った独自コンポーネントを使う場合でも、他の Primitive クラス（`.l--`, `is--`）や Property Class（`-{prop}:{value}`）との組み合わせを前提とした設計にすることでCSSの記述量を削減できます。`c--`クラスにスタイルが全くなく、HTML側での可視性を高める名前付けのためだけに利用しても構いません。

### 作成例

`l--stack` と併用する前提でのカスタムクラス例

```css
@layer lism-components {
  .c--myCard {
    gap: var(--s20);
    padding: var(--s30);
    border-radius: var(--bdrs--20);
    box-shadow: var(--bxsh--20);
    border: 1px solid currentColor;
    /* ... */
  }
}
```

```html
<div class="c--myCard l--stack">
  ...
</div>
```

素のHTMLサイトではこのように`c--`クラスにCSSを書いてスタイリングしても大丈夫ですが、Reactなどでコンポーネントを作成できる場合は、特別な理由がない限りProperty Classを活用してください。

```jsx
export default function MyCard(props) {
  return <Stack lismClass="c--myCard" g="20" p="30" bdrs="20" bxsh="20" bd {...props} />;
}
```
```css
@layer lism-components {
  .c--myCard {
    /* 複雑なスタイルあれば css で書く */
  }
}
```
