# Primitive クラス

Lism CSS では、レイアウトを組み立てる小さな積み木として **Primitive クラス**（`l--` / `a--`）を提供します。
これらは `@layer lism-primitive` に属します（サブレイヤーは `layout` / `atomic`）。


## TOC

- [プレフィックス一覧](#プレフィックス一覧)
- [Layout Primitive（`l--`）](#layout-primitivel--)
- [Atomic Primitive（`a--`）](#atomic-primitivea--)

[詳細](https://lism-css.com/docs/primitives/)

---

## プレフィックス一覧

| プレフィックス | 種類 | サブレイヤー | 役割 |
|--------------|------|------------|------|
| `l--` | Layout Primitive | `lism-primitive.layout` | レイアウトの構成単位となる Primitive |
| `a--` | Atomic Primitive | `lism-primitive.atomic` | レイアウトの最小単位（アイコン・区切り線等） |

併用ルールは [css-rules.md](./css-rules.md#プレフィックスとクラス分類) を参照してください。


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
| `l--autoColumns` | ブレイクポイントに依存せず、自動段組のできる流動カラムレイアウト。`--cols: 16em`のようにして最小維持幅を指定できる。 |
| `l--withSide` | 画像とコンテンツ、メインエリアとサイドバーなどの「"Side" + "Main"」に分かれ、横並びと縦並びが切り替わるレイアウト。"Main"が`--mainW`で指定したサイズ以上の横幅を維持できる範囲内で横並びを維持し、下回る場合は縦並びへ自動で切り替わる。横並びの間の"Side"の横幅は`--sideW`で指定する。 |
| `l--switchColumns` | 任意のサイズで一括カラム切り替えができるカラムレイアウト。`--breakSize` で制御 |

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
