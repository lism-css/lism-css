# モジュールクラス

Lism CSS では、クラス名のプレフィックスによってモジュールの種類と CSS Layer の所属が決まります。  
すべてのモジュールクラスは `@layer lism-modules` に属します（`set--` を除く）。

## TOC

- [プレフィックス一覧](#プレフィックス一覧)
- [State Module（`is--`）](#state-moduleis--)
- [Layout Module（`l--`）](#layout-modulel--)
- [Atomic Module（`a--`）](#atomic-modulea--)
- [Component（`c--`）](#componentc--)

[詳細](https://lism-css.com/docs/module-class/)

---

## プレフィックス一覧

| プレフィックス | 種類 | 役割 |
|--------------|------|------|
| `is--` | State Module | 複数のモジュールに付け外しできる汎用的な状態クラス |
| `l--` | Layout Module | レイアウトの構成単位となるモジュール |
| `a--` | Atomic Module | レイアウトの最小単位（アイコン・区切り線等） |
| `c--` | Component | 具体的な役割を持つコンポーネント |

**併用ルール:**
- `is--` は他のすべてのモジュールと併用可能
- `l--` と `c--` は併用可能（例: `class="l--flex c--nav"`）
- 同カテゴリ内の併用は不可（例: `l--flex` と `l--grid` は同要素に付けない）


## State Module（`is--`）

[詳細](https://lism-css.com/docs/module-class/#state-module)

要素にレイアウトとしての振る舞いを状態として付与するクラスです。他のモジュールクラスと自由に組み合わせられます。

| クラス | 用途 |
|--------|------|
| `is--container` | コンテナクエリの基準要素を定義する（`container-type: inline-size`を付与する）。Lism のレスポンシブ機能の判定基準となるラッパーに付与する |
| `is--wrapper` | 直下の子要素のコンテンツ幅を一括で制限する。`-contentSize:s` / `-contentSize:l` で事前定義したプリセットサイズを指定可能（デフォルト: `--sz--m`）。セクション・ヘッダー・フッター・記事コンテンツなどで、共通したコンテンツ幅を使用する |
| `is--layer` | 親要素全体に被さる絶対配置レイヤー（`position: absolute; inset: 0;`）。背景画像・カラーオーバーレイ・フィルターレイヤー・コンテンツ等を重ねて表示する |
| `is--linkBox` | ボックス全体をクリッカブルなリンク領域にする。自身を`a`タグにして利用するか、もしくは自身を`div`にして内部の`a`タグに`u--expandedLink`を付与して使う |
| `is--vertical` | 縦書きモードを定義する（`writing-mode: var(--vertical-mode)`） |
| `is--skipFlow` | `l--flow` 直下で使用し、次の兄弟要素のフロー余白をゼロにする。`l--flow`の中にあるが`position:absolute`にしたい要素などに使用する |
| `is--side` | `l--sideMain` 直下で使用し、サイド側の要素であることを示す |

Lism コンポーネントでは `isContainer`, `isLayer` 等の State Props として利用できます。


## Layout Module（`l--`）

レイアウト構造を定義するメインのモジュール群です。

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
| [`l--columns`](https://lism-css.com/docs/modules/l--columns/) | `repeat`と`minmax(0, 1fr))`を使ったカラムレイアウト。レスポンシブ対応の`--cols`用のProperty Classでカラム数の切り替え可能。 |
| [`l--tileGrid`](https://lism-css.com/docs/modules/l--tilegrid/) | `--cols`だけではなく`--rows`も組み合わせた均等タイルグリッド（`grid-template: repeat(var(--rows,1), minmax(0, 1fr)) / repeat(var(--cols,1), minmax(0, 1fr))`） |
| [`l--fluidCols`](https://lism-css.com/docs/modules/l--sidemain/) | ブレイクポイントに依存せず、自動段組のできる流動カラムレイアウト。`--cols: 16em`のようにして最小維持幅を指定できる。 |
| [`l--sideMain`](https://lism-css.com/docs/modules/l--sidemain/) | 画像とコンテンツ、メインエリアとサイドバーなどの「"Side" + "Main"」に分かれ、横並びと縦並びが切り替わるレイアウト。"Main"が`--mainW`で指定したサイズ以上の横幅を維持できる範囲内で横並びを維持し、下回る場合は縦並びへ自動で切り替わる。横並びの間の"Side"の横幅は`--sideW`で指定する。 |
| `l--switchCols` | 任意のサイズで一括カラム切り替えができるカラムレイアウト。`--breakSize` で制御 |

それぞれ対応するLismコンポーネント（`<Flex>`, `<Stack>`, `<Cluster>` 等）があります。


## Atomic Module（`a--`）

レイアウト構成物の最小単位となるモジュールです。

| クラス | 用途 |
|--------|------|
| `a--icon` | SVG アイコン。`flex-shrink: 0`, デフォルトサイズ `1em` |
| `a--divider` | 区切り線。`--bdc`, `--bds`, `--bdw` 変数でカスタマイズ |
| `a--spacer` | 空白要素（`min-height: 1px; min-width: 1px`） |
| `a--decorator` | 装飾用要素（SCSS定義なし、クラス名のみ出力） |

それぞれ対応するコンポーネント（`<Icon>`, `<Divider>`, `<Spacer>`, `<Decorator>`）があります。


## Custom Module（`c--`）: ユーザー定義コンポーネント

より具体的な役割を持つ独自のカスタムモジュール（コンポーネント）を作成する場合は `c--{name}` の命名規則に従います。

`c--`を使った独自コンポーネントを使う場合でも、他の基本的なモジュールクラス（`.l--`, `is--`）やProperty Class（`-{prop}:{value}`）との組み合わせを前提とした設計にすることでCSSの記述量を削減できます。`c--`クラスにスタイルが全くなく、HTML側での可視性を高める名前付けのためだけに利用しても構いません。

- バリエーション作成時のクラス例: `.c--button.c--button--outline`
- 子要素のクラス例: `.c--card_header`, `.c--card_body`

### 作成例

`l--stack` と併用する前提でのカスタムクラス例

```css
@layer lism-modules {
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
@layer lism-modules {
  .c--myCard {
    /* 複雑なスタイルあれば css で書く */
  }
}
```

