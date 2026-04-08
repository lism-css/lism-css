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

[詳細](https://lism-css.com/docs/state/)

要素に構造的な振る舞い（状態）を付与するクラスです。他のモジュールクラスと自由に組み合わせられます。

| クラス | 用途 | 備考 |
|--------|------|------|
| `is--container` | コンテナクエリの基準要素にする（`container-type: inline-size`） | Lism のレスポンシブ機能の前提。判定基準にしたいラッパーに付与する |
| `is--wrapper` | 直下の子要素のコンテンツ幅を制限する | `-contentSize:s` / `-contentSize:l` でプリセットサイズ指定可能。デフォルト: `--sz--m` |
| `is--layer` | `position: absolute; inset: 0` の絶対配置レイヤー | `overflow: hidden` も適用される |
| `is--linkBox` | ボックス全体をクリッカブルなリンク領域にする | `position: relative; isolation: isolate` を適用 |
| `is--vertical` | 縦書きモード（`writing-mode: var(--vertical-mode)`） | `is--vertical@sm`, `is--vertical@md` でブレークポイント指定可能 |
| `is--skipFlow` | `l--flow` 内で次の兄弟要素のフロー余白をリセット | `is--skipFlow + *` で `--flow: 0px` |
| `is--side` | `l--sideMain` 内でサイド要素を示す | `l--sideMain` と組み合わせて使用 |

### コンポーネントでの対応

| JSX Prop | HTML クラス |
|----------|-----------|
| `isContainer` | `is--container` |
| `isWrapper` / `isWrapper='s'` | `is--wrapper` / `is--wrapper -contentSize:s` |
| `isLayer` | `is--layer` |
| `isLinkBox` | `is--linkBox` |
| `isVertical` | `is--vertical` |

```jsx
// Layout 優先の書き方（推奨）
<Stack isLayer>背景レイヤー</Stack>
// → <div class="l--stack is--layer">...</div>

<Flex isWrapper="l">コンテンツ</Flex>
// → <div class="l--flex is--wrapper -contentSize:l">...</div>
```


## Layout Module（`l--`）

レイアウト構造を定義するメインのモジュール群です。Lism コンポーネントでは `layout` prop が内部で固定されており、対応するクラスが自動出力されます。

| クラス | コンポーネント | CSS display | 用途 |
|--------|-------------|-------------|------|
| `l--box` | `<Box>` | — | 汎用ボックス |
| `l--flex` | `<Flex>` | `flex` | Flexbox（横方向）。子要素に `min-width: 0` |
| `l--stack` | `<Stack>` | `flex` | 縦積み（`flex-direction: column`） |
| `l--cluster` | `<Cluster>` | `flex` | 折り返し Flex（`flex-wrap: wrap; align-items: center`） |
| `l--grid` | `<Grid>` | `grid` | CSS Grid。`--gtc`, `--gtr`, `--gta` 変数で制御 |
| `l--center` | `<Center>` | `grid` | 中央配置（`place-content: center; place-items: center`） |
| `l--flow` | `<Flow>` | `flow-root` | フローコンテンツ。子要素間に `margin-block-start: var(--flow)` |
| `l--frame` | `<Frame>` | — | アスペクト比フレーム。直下メディアに `object-fit: cover` |
| `l--columns` | `<Columns>` | `grid` | 固定カラム数（`grid-template-columns: repeat(var(--cols), minmax(0, 1fr))`） |
| `l--fluidCols` | `<FluidCols>` | `grid` | 流動カラム（`auto-fit` / `auto-fill`）。`--cols` で最小幅指定 |
| `l--switchCols` | `<SwitchCols>` | `flex` | ブレークポイントでカラム切り替え。`--breakSize` で制御 |
| `l--sideMain` | `<SideMain>` | `flex` | サイド＋メインの2カラム。`--sideW`, `--mainW` で制御 |

### レイアウト固有の Props

```jsx
<Grid gtc="1fr 1fr" gtr="auto">...</Grid>
<Columns cols={3}>...</Columns>              // --cols: 3
<FluidCols autoFill>...</FluidCols>           // --autoMode: auto-fill
<SwitchCols breakSize="480px">...</SwitchCols>  // --breakSize: 480px
<SideMain sideW="200px" mainW="1fr">...</SideMain>
<Flow flow="30">...</Flow>                    // --flow: var(--s30)
```


## Atomic Module（`a--`）

レイアウトの最小単位となる単機能モジュールです。

| クラス | コンポーネント | 用途 |
|--------|-------------|------|
| `a--icon` | `<Icon>` | SVG アイコン。`flex-shrink: 0`, デフォルトサイズ `1em` |
| `a--media` | `<Media>` | 画像・動画（`img`, `video`, `iframe`, `picture`） |
| `a--divider` | `<Divider>` | 区切り線。`--bdc`, `--bds`, `--bdw` 変数でカスタマイズ |
| `a--spacer` | `<Spacer>` | 空白要素（`min-height: 1px; min-width: 1px`） |
| `a--decorator` | `<Decorator>` | 装飾用要素 |

```jsx
<Icon as={LucideArrowRight} fz="xl" />
<Media as="img" src="/image.jpg" alt="説明" ar="16/9" />
<Divider />
<Spacer h="40" />
```


## Component（`c--`）

[詳細](https://lism-css.com/docs/components/)

より具体的な役割を持つコンポーネントのクラスです。他のクラスとの組み合わせを前提とした設計になっています。

### ユーザー定義コンポーネント

独自のコンポーネントを作成する場合は `c--{name}` の命名規則に従います。

```css
@layer lism-modules {
  .c--my-card {
    border: 1px solid var(--brand);
    border-radius: var(--bdrs--20);
    padding: var(--s30);
  }
  .c--my-card_header { ... }  /* 子要素 */
  .c--my-card_body { ... }
}
```

- バリエーション: `.c--button.c--button--outline`
- 子要素: `.c--card_header`, `.c--card_body`

### `@lism-css/ui` で提供されるコンポーネント

`@lism-css/ui` パッケージでは、以下の `c--` クラスを持つ UI コンポーネントが利用できます。

| クラス | コンポーネント | 用途 |
|--------|-------------|------|
| `c--button` | `<Button>` | ボタン（`c--button--outline` バリエーションあり） |
| `c--badge` | `<Badge>` | ラベル・バッジ（`c--badge--outline` バリエーションあり） |
| `c--avatar` | `<Avatar>` | ユーザーアイコン |
| `c--accordion` | `<Accordion>` | 折りたたみパネル（`_item`, `_panel`, `_button`, `_content`, `_icon` 子要素あり） |
| `c--tabs` | `<Tabs>` | タブ切り替え UI（`_list`, `_tab`, `_panel` 子要素あり） |
| `c--modal` | `<Modal>` | モーダルダイアログ（`_inner` 子要素あり） |
| `c--details` | `<Details>` | details/summary（`_summary`, `_icon`, `_body` 子要素あり） |
| `c--alert` | `<Alert>` | 警告・通知ボックス |
| `c--callout` | `<Callout>` | 注釈・補足（`_head`, `_icon`, `_title`, `_body` 子要素あり） |
| `c--chat` | `<Chat>` | チャット風 UI（`_avatar`, `_name`, `_body`, `_content`, `_deco` 子要素あり） |
| `c--navMenu` | `<NavMenu>` | ナビゲーションメニュー（`_item`, `_link`, `_nest` 子要素あり） |
| `c--shapeDivider` | `<ShapeDivider>` | 図形区切り線（`_inner`, `_svg` 子要素あり） |
