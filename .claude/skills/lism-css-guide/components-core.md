# コンポーネントシステム

Lism CSS（`lism-css`パッケージ）は React / Astro 向けのコンポーネントを提供しています。

```jsx
// React でのimport
import { Lism, Box, Flex, Stack, Grid, Text, Media } from 'lism-css/react';

// Astro でのimport
import { Lism, Box, Flex, Stack, Grid, Text, Media } from 'lism-css/astro';
```

## TOC

- [コアコンポーネント: `<Lism>`](#コアコンポーネント-lism)
- [Lism Props](#lism-props)
- [セマンティックコンポーネント](#セマンティックコンポーネント)
- [Atomic Modules](#atomic-modules)
- [State Modules](#state-modules)
- [Layout Modules](#layout-modules)
- [Layout 優先の原則](#layout-優先の原則-layout-isstate-vs-state-layout)
- [`getLismProps()`](#getlismprops--外部コンポーネントとの連携)

[詳細](https://lism-css.com/docs/components/)

---

## コアコンポーネント: `<Lism>`

`Lism` はすべてのコンポーネントの基盤です。Lism Props を受け取り、CSS クラスとインラインスタイルに変換して HTML を出力します。

```jsx
<Lism p="20" fz="l" c="brand">コンテンツ</Lism>
```
↓ 出力
```html
<div class="-p:20 -fz:l -c:brand">コンテンツ</div>
```


## Lism Props

ソース: [props.ts](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/config/defaults/props.ts)

`<Lism>` で受け取れる Lism CSS 専用プロパティを **Lism Props** と呼びます。


### 共通 Props

すべての Lism コンポーネントで使えるpropsです。

| Prop | 説明 | 例 |
|------|------|-----|
| `as` | レンダリングする HTML 要素または外部コンポーネントを指定（デフォルト: `"div"`） | `as="section"`, `as={Image}` |
| `lismClass` | コンポーネントの主要クラス名を指定。（`c--{lismClass}`） | `lismClass="c--myComponent"` |
| `variant` | `lismClass` に対するバリエーションクラスを指定。（`c--{lismClass}--{variant}`） | `variant="secondary"` |
| `layout` | レイアウトモジュール（`l--{layout}`）を指定。 | `layout="flow"` |
| `set` | セットクラス（`set--{value}`）を指定。スペース区切りで複数指定可 | `set="gutter"`, `set="transition plain"` |
| `exProps` | Lism Propsの処理をスキップして外部コンポーネントに直接渡すpropsオブジェクト | `exProps={{ size: '1em' }}` |

```jsx
// as で HTML 要素を指定
<Lism as="section" p="30">...</Lism>
// → <section class="-p:30">...</section>

// as で外部コンポーネントを指定
<Media as={Image} src="..." p="20" bd />
// → Image コンポーネントに { className: '-p:20 -bd' } が渡される

// lismClass でコンポーネントクラスを付与
<Lism lismClass="c--myComponent" p="10">...</Lism>
// → <div class="c--myComponent -p:10">...</div>

// variant でバリエーション
<Lism lismClass="c--myComponent" variant="secondary">...</Lism>
// → <div class="c--myComponent c--myComponent--secondary">...</div>

// exProps で外部コンポーネント用プロパティを明示的に分離
<Icon as={HogeIcon} exProps={{ size: "1em" }} p="10" fz="l">...</Icon>
// → p, fz は Lism が処理、size は HogeIcon に直接渡される

// set でセットモジュールを付与（layout と同じ要領）
<Box set="shadow" p="30">...</Box>
// → <div class="l--box set--shadow -p:30">...</div>

// set を複数指定
<Stack set="shadow hov" p="30">...</Stack>
// → <div class="l--stack set--shadow set--hov -p:30">...</div>
```


### CSS Props

主要な CSS プロパティに対して省略記法（Shorthand）で指定できます。値に応じて **Property Class**（`-{prop}:{value}`）やインラインスタイルに変換されます。

各プロパティで受け付けるトークン値・プリセット値の詳細は [property-class.md](./property-class.md) を参照。
もしくは、[定義ファイルの`props.ts`](https://github.com/lism-css/lism-css/blob/main/packages/lism-css/config/defaults/props.ts) を読んでください。

`prop={value}`で指定した値(`value`)によって、基本的な出力は以下のように分類されます。

| 値 | 出力形式 | 例 |
|------|------|-----|
| トークン値・プリセット値 | `-{prop}:{value}` クラスのみ | `fz='l'` → `class="-fz:l"` |
| `true` または `"-"` | `-{prop}` クラスのみ（変数なし） | `bd` / `bd='-'` → `class="-bd"` |
| `:` で始まる値 | 強制的にユーティリティクラス化 | `p=':hoge'` → `class="-p:hoge"` |
| その他の値（レスポンシブ対応プロパティ） | `-{prop}` + `--{prop}` | `fz='20px'` → `class="-fz"` + `style="--fz:20px"` |
| その他の値（レスポンシブ非対応プロパティ） | `style` 属性に直接出力 | `o='0.7'` → `style="opacity:0.7"` |
| その他の値（変数プロパティ） | `--{prop}` | `bdw='2px'` → `style="--bdw:2px"` (`border-width`としては出力されない) |
| レスポンシブ指定値 | 上記いずれかのベース出力 + `-{prop}_{bp}` + `--{prop}_{bp}` | `p={[10,20]}` → `class="-p:10 -p_sm"` + `style="--p_sm:var(--s20)"`|

補足:
- **レスポンシブ対応プロパティ**かどうかは、 `props.ts`で`bp: 1`がセットされているかどうかで分かります。
- **変数プロパティ**とは、`bds`, `bdc`, `bdw`, `keycolor`, `cols`, `rows`といった一部のプロパティ（`props.ts`で`isVar`がセットされているもの）のこと。これらはCSSプロパティがそのままstyle属性に出力されることはなく、常にCSS 変数（`--{prop}`）が使用されます。



```jsx
// トークン値 → クラスのみ
<Lism fz='l' p='20'>...</Lism>
// 出力 → <div class="-fz:l -p:20">...</div>

// カラートークン（クラス化されていない場合）→ クラス + CSS変数
<Lism c='red'>...</Lism>
// 出力 → <div class="-c" style="--c:var(--red)">...</div>

// CSS変数のみ出力される特殊パターン
<Lism bd bdc="#000" bdw="2px">...</Lism>
// 出力 → <div class="-bd" style="--bdc:#000;--bdw:2px">...</div>

// `-` でクラスだけ出力（変数は親から継承したい場合などに使う）
<Lism p='-' bdrs>...</Lism>
// 出力 → <div class="-p -bdrs">...</div>

// `:` で強制ユーティリティクラス化
<Lism p=':hoge'>...</Lism>
// 出力 → <div class="-p:hoge">...</div>

// カスタム値（BP対応プロパティ） → クラス + CSS変数
<Lism fz='20px'>...</Lism>
// 出力 → <div class="-fz" style="--fz:20px">...</div>

// カスタム値（BP非対応プロパティ）→ style属性にプロパティ直書き
<Lism o='0.7'>...</Lism>
// 出力 → <div style="opacity:0.7">...</div>
```


#### レスポンシブ指定

レスポンシブ対応プロパティは、配列またはオブジェクトでブレイクポイント（`sm`,`md`）ごとの値を指定できます。（`lg`は要カスタマイズ）


```jsx
// 配列（base → sm → md の順）
<Lism p={['20', '30', '40']}>...</Lism>
// <div class="-p:20 -p_sm -p_md" style="--p_sm:var(--s30);--p_md:var(--s40)">...</div>

// 途中のBPをスキップ（smを飛ばしてmd のみ指定）
<Lism p={['20', null, '40']}>...</Lism>
// → <div class="-p_md" style="--p_md:var(--s40)">...</div>
```

デフォルトで**コンテナクエリ**を採用しているため、先祖にコンテナ要素（`is--container`が出力される`<Container>`または`isContainer`の指定）が必要です。


### State Props

State Modules クラス（`is--*`）を出力するためのプロパティ群です。

| Prop | 出力クラス |
|------|-----------|
| `isWrapper` | `is--wrapper` |
| `isWrapper="{s\|l}"` | `is--wrapper` + `-contentSize:{s\|l}` |
| `isWrapper="{value}"` | `is--wrapper` + `-contentSize` + `--contentSize:{value}` |
| `isLayer` | `is--layer` |
| `isLinkBox` | `is--linkBox` |
| `isContainer` | `is--container` |
| `isSide` | `is--side` |
| `isSkipFlow` | `is--skipFlow` |
| `isVertical` | `is--vertical` |

```jsx
// State Props の使用例
<Stack isLayer>背景レイヤー</Stack>
// → <div class="l--stack is--layer">...</div>

<Flex isWrapper="l">コンテンツ</Flex>
// → <div class="l--flex is--wrapper -contentSize:l">...</div>
```


## セマンティックコンポーネント

`Lism` の `as` エイリアスとして機能するコンポーネント群です。layout クラスは付与されず、HTML のセマンティクスを表現するために使います。

| コンポーネント | デフォルト要素 | 許容タグ |
|-------------|-------------|---------|
| `<Text>` | `<p>` | `p`, `div`, `blockquote`, `address`, `figcaption`, `pre` |
| `<Heading>` | `<h2>` | `h1`〜`h6`（`level` prop で指定） |
| `<Inline>` | `<span>` | `span`, `em`, `strong`, `small`, `code`, `time`, `i`, `b`, `mark`, `abbr`, `cite`, `kbd` |
| `<Group>` | `<div>` | `div`, `section`, `article`, `figure`, `nav`, `aside`, `header`, `footer`, `main`, `fieldset`, `hgroup` |
| `<List>` | `<ul>` | `ul`, `ol`, `dl` |
| `<Link>` | `<a>`（固定） | — |
| `<Media>` | `<img>` | `img`, `video`, `iframe`, `picture` |

```jsx
<Heading level="3" fz="xl">見出し</Heading>
// → <h3 class="-fz:xl">見出し</h3>

<Text as="blockquote" p="30">引用文</Text>
// → <blockquote class="-p:30">引用文</blockquote>

<Group as="section" p="40">
  <Text>本文</Text>
</Group>
```

## Atomic Modules

| コンポーネント | 出力クラス | 用途 |
|-------------|-----------|------|
| `<Icon>` | `a--icon` | SVG アイコン・アイコンフォント |
| `<Spacer>` | `a--spacer` | 空白要素 |
| `<Divider>` | `a--divider` | 区切り線 |
| `<Decorator>` | `a--decorator` | 装飾要素（SCSS定義なし、クラス名のみ出力） |


### `<Icon>`コンポーネント

Iconコンポーネントの仕様は特殊なので解説します。

1. `as`と`exProps`を活用して外部ライブラリのアイコンコンポーネントなどを表示できます。

```jsx
// weight を明示的に CatIcon に渡す
<Icon as={CatIcon} exProps={{ weight: 'fill' }} c="blue" />

// Lism で "weight" は処理されず最終的に CatIcon に渡るので、結果は同じ
<Icon as={CatIcon} weight="fill" c="blue"/>
```

2. `icon="文字列"`を指定すると、`lism-css`に内包される[プリセットアイコン](https://lism-css.com/en/docs/modules/a--icon/#using-preset-icons)を利用できます（一致するアイコンがあれば）。

```jsx
<Icon icon='menu' />
```

3. `icon` prop には、`icon={{as:IconName, exProps1, exProps2, ...}}` の形式で、`as`と`exProps`を一括で渡すことができます。

```jsx
// LucidIconを使った例
<Icon icon={{as: Home, strokeWidth: 1, size: 64}} />
```

これにより、iconを指定することのできるカスタムコンポーネントを作る時に、1つのpropでiconデータの受け渡しができるようになっています。


4. `viewBox`の指定があれば`svg`要素としてで出力されるので、`<path>`などを直接書くことができます。
```jsx
<Icon viewBox="0 0 256 256" label="Icon name" size="1em">
  <path d="..."></path>
</Icon>
```

## State Modules

`<Lism isXxx>`のエイリアスコンポーネントです。

| コンポーネント | 内部処理 | 出力クラス | 
|-------------|------------|-----------|
| `<Container>` | `isContainer` | `is--container` |
| `<Wrapper>` | `isWrapper` | `is--wrapper` | 
| `<Layer>` | `isLayer` | `is--layer` |
| `<LinkBox>` | `isLinkBox` | `is--linkBox` |


### `LinkBox` の特殊処理

LinkBoxのみ、ただのエイリアスではなく特殊な処理がされており、`href`を指定すると内部で`as="a"`となり、`LinkBox`が`<a>`タグで出力されます。（デフォルトは`div`)


## Layout Modules

内部で `layout` prop が固定されており、対応する `l--{layout}` クラスが自動で出力されます。

| コンポーネント | 出力クラス |
|-------------|-----------|
| `<Box>` | `l--box` |
| `<Flex>` | `l--flex` |
| `<Stack>` | `l--stack` |
| `<Cluster>` | `l--cluster` |
| `<Grid>` | `l--grid` |
| `<Flow>` | `l--flow` |
| `<Center>` | `l--center` |
| `<Frame>` | `l--frame` |
| `<Columns>` | `l--columns` |
| `<TileGrid>` | `l--tileGrid` |
| `<FluidCols>` | `l--fluidCols` |
| `<SwitchCols>` | `l--switchCols` |
| `<SideMain>` | `l--sideMain` |

また、一部のレイアウトコンポーネントには専用の props があります。

```jsx
// TileGrid: 均等タイルグリッド
<TileGrid cols="3" rows="2">...</TileGrid>

// SwitchCols: レイアウトの切り替えポイントとなるサイズ
<SwitchCols breakSize="480px">...</SwitchCols>

// SideMain: サイド幅とメイン幅
<SideMain sideW="200px" mainW="40rem">...</SideMain>

// FluidCols: カラム維持サイズ と auto-fill モード
<FluidCols cols="20rem" autoFill>...</FluidCols>

// Flow: 子要素間の余白
<Flow flow="30">...</Flow>
```

## Layout 優先の原則: `<Layout isState>` vs `<State layout="...">`

レイアウトとステートの両方の性質を持つ場合、以下の2つの書き方で同じ出力が得られます。

```jsx
// 方法A: レイアウトコンポーネント + is-- prop（推奨）
<Stack isLayer>...</Stack>
// → <div class="l--stack is--layer">...</div>

// 方法B: Lism で layout を指定
<Lism layout="stack" isLayer>...</Lism>
// → <div class="l--stack is--layer">...</div>
```

**`<Layout isState>` の形式で書いてください（Layout 優先）。** レイアウトコンポーネントを軸にして、ステートを付加する書き方がコードの意図を明確にします。

```jsx
// OK: Layout 優先
<Stack isLayer>背景レイヤー</Stack>
<Flex isWrapper="l">コンテンツ</Flex>
<Grid isContainer>グリッド</Grid>

// NG: State 優先（避ける）
<Layer layout="stack">背景レイヤー</Layer>
<Wrapper layout="flex">コンテンツ</Wrapper>
```


## `getLismProps()` — 外部コンポーネントとの連携

なんらかの理由で`as`に外部コンポーネントを渡せない場合、`getLismProps()` を使うことでも `<Lism>`が処理できるプロパティ群を `className` と `style` に変換することができます。

```jsx
import getLismProps from 'lism-css/lib/getLismProps';

function MyComponent({ children }) {
  // Lism Props を getLismProps() で 変換
  const lismProps = getLismProps({ p: '20', fz: 'l', c: 'red' });
  // → { className: '-p:20 -fz:l -c', style: {'--c': 'var(--red)'} }

  return <div {...lismProps}>{children}</div>;
}
```
