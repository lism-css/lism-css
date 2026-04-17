# Primitive クラス

Lism CSS では、レイアウトを組み立てる小さな積み木として **Primitive クラス**（`is--` / `l--` / `a--`）を提供します。これらはすべて `@layer lism-primitive` に属します（サブレイヤーは `trait` / `layout` / `atomic`）。


## TOC

- [プレフィックス一覧](#プレフィックス一覧)
- [Trait Primitive（`is--`）](#trait-primitiveis--)
- [Layout Primitive（`l--`）](#layout-primitivel--)
- [Atomic Primitive（`a--`）](#atomic-primitivea--)

[詳細](https://lism-css.com/docs/primitives/)

---

## プレフィックス一覧

| プレフィックス | 種類 | サブレイヤー | 役割 |
|--------------|------|------------|------|
| `is--` | Trait Primitive | `lism-primitive.trait` | 要素に静的な構造的特性を付与する汎用クラス |
| `l--` | Layout Primitive | `lism-primitive.layout` | レイアウトの構成単位となる Primitive |
| `a--` | Atomic Primitive | `lism-primitive.atomic` | レイアウトの最小単位（アイコン・区切り線等） |

**併用ルール:**
- `is--` は他のすべての Primitive と併用可能（複数の `is--` 同士もOK）
- 同カテゴリ内の併用は不可（例: `l--flex` と `l--grid` は同要素に付けない）
- `a--` / `l--` には `variant` の BEM 展開は適用されない（BEM Modifier は `c--` 専用）


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
| `is--skipFlow` | `l--flow` 直下で使用し、次の兄弟要素のフロー余白をゼロにする。`l--flow`の中にあるが`position:absolute`にしたい要素などに使用する |
| `is--side` | `l--sideMain` 直下で使用し、サイド側の要素であることを示す |

Lism コンポーネントでは `isContainer`, `isLayer` 等の Props として利用できます。（例: `<Lism isContainer>`)


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
