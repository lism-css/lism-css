# コンポーネントシステム

Lism CSS（`lism-css`パッケージ）は React / Astro 向けのコンポーネントを提供しています。

```jsx
// React
import { Lism, Box, Flex, Stack, Grid, Text, Media } from 'lism-css/react';

// Astro
import { Lism, Box, Flex, Stack, Grid, Text, Media } from 'lism-css/astro';
```

## TOC

- [コアコンポーネント: `<Lism>`](#コアコンポーネント-lism)
- [Lism Props](#lism-props)
- [セマンティックコンポーネント](#セマンティックコンポーネント)
- [レイアウトコンポーネント（Layout Modules）](#レイアウトコンポーネントlayout-modules)
- [ステートコンポーネント（State Modules）](#ステートコンポーネントstate-modules)
- [アトミックコンポーネント（Atomic Modules）](#アトミックコンポーネントatomic-modules)
- [Layout 優先の原則](#layout-優先の原則-layout-isstate-vs-state-layout)
- [`getLismProps()`](#getlismprops--外部コンポーネントとの連携)

[詳細](https://lism-css.com/docs/components/)

---

## コアコンポーネント: `<Lism>`

`Lism` はすべてのコンポーネントの基盤です。Lism Props を受け取り、CSS クラスとインラインスタイルに変換して HTML を出力します。

```jsx
<Lism p="20" fz="l" c="brand">コンテンツ</Lism>
// → <div class="-p:20 -fz:l -c:brand">コンテンツ</div>
```


## Lism Props

ソース: [props.ts](https://github.com/lism-css/lism-css/blob/dev/packages/lism-css/config/defaults/props.ts)

`<Lism>` で受け取れる Lism CSS 専用プロパティを **Lism Props** と呼びます。


### 共通 Props

すべての Lism コンポーネントで使えるプロップスです。

| Prop | 説明 | 例 |
|------|------|-----|
| `as` | レンダリングする HTML 要素または外部コンポーネントを指定（デフォルト: `'div'`） | `as="section"`, `as={Image}` |
| `lismClass` | コンポーネントの主要クラス名を指定。出力順序が高めになる | `lismClass='c--myComponent'` |
| `variant` | `lismClass` に対するバリエーションクラスを出力 | `variant='secondary'` |
| `layout` | レイアウトモジュールを指定し `l--{layout}` クラスを出力 | `layout='flow'` |
| `exProps` | Lism Props処理をスキップして外部コンポーネントに直接渡す属性のオブジェクト | `exProps={{ size: '1em' }}` |

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
```


### CSS Props

主要な CSS プロパティに対して省略記法（Shorthand）で指定できます。値に応じて **Property Class**（`-{prop}:{value}`）やインラインスタイルに変換されます。

各プロパティで受け付けるトークン値・プリセット値の詳細は [property-class.md](./property-class.md) を参照。
もしくは、[定義ファイルの`props.ts`](https://github.com/lism-css/lism-css/blob/dev/packages/lism-css/config/defaults/props.ts) を読んでください。

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

State Modules クラス（`is--*` / `set--*`）を出力するためのプロパティ群です。

| Prop | 出力クラス | 用途 |
|------|-----------|------|
| `isWrapper(='{s\|l}')` | `is--wrapper` + `-contentSize:{s\|l}` | コンテンツ幅制限 |
| `isLayer` | `is--layer` | 絶対配置レイヤー（inset:0） |
| `isLinkBox` | `is--linkBox` | ボックス全体リンク化 |
| `isContainer` | `is--container` | コンテナクエリ対象 |
| `isSide` | `is--side` | サイド要素 |
| `isSkipFlow` | `is--skipFlow` | Flow 余白をスキップ |
| `isVertical` | `is--vertical` | 縦書き方向 |
| `set="gutter"` | `set--gutter` | 左右ガター余白 |
| `set="shadow"` | `set--shadow` | シャドウ付与 |
| `set="hov"` | `set--hov` | ホバー効果 |
| `set="transition"` | `set--transition` | トランジション |
| `set="plain"` | `set--plain` | プレーン状態 |

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

### `<HTML>` コンポーネント

任意の HTML タグを直接レンダリングするためのコンポーネント。セマンティックコンポーネントがカバーしない要素に使います。


## レイアウトコンポーネント（Layout Modules）

レイアウト構造を定義するメインのコンポーネント群です。内部で `layout` prop が固定されており、対応する `l--{layout}` クラスが自動で出力されます。

| コンポーネント | layout | 出力クラス | 用途 |
|-------------|--------|-----------|------|
| `<Box>` | `box` | `l--box` | 汎用ボックス |
| `<Flex>` | `flex` | `l--flex` | Flexbox（横方向） |
| `<Stack>` | `stack` | `l--stack` | 縦積み（flex-direction: column） |
| `<Cluster>` | `cluster` | `l--cluster` | 折り返し Flex（flex-wrap） |
| `<Grid>` | `grid` | `l--grid` | CSS Grid |
| `<Flow>` | `flow` | `l--flow` | フローコンテンツ（子要素間に余白） |
| `<Center>` | `center` | `l--center` | 中央配置 |
| `<Frame>` | `frame` | `l--frame` | アスペクト比フレーム |
| `<Columns>` | `columns` | `l--columns` | CSS columns |
| `<TileGrid>` | `tileGrid` | `l--tileGrid` | 均等タイルグリッド（cols x rows） |
| `<FluidCols>` | `fluidCols` | `l--fluidCols` | auto-fill/auto-fit グリッド |
| `<SwitchCols>` | `switchCols` | `l--switchCols` | レスポンシブカラム切り替え |
| `<SideMain>` | `sideMain` | `l--sideMain` | サイド＋メインの2カラム |

### レイアウト固有の Props

一部のレイアウトコンポーネントには専用の props があります。

```jsx
// Grid: template 系 props
<Grid gtc="1fr 1fr" gtr="auto">...</Grid>

// TileGrid: 均等タイルグリッド
<TileGrid cols="3" rows="2" g="20">...</TileGrid>

// SwitchCols: 切り替えブレークポイント
<SwitchCols breakSize="480px">...</SwitchCols>

// SideMain: サイド幅とメイン幅
<SideMain sideW="200px" mainW="1fr">...</SideMain>

// FluidCols: auto-fill モード
<FluidCols autoFill>...</FluidCols>

// Flow: 子要素間の余白
<Flow flow="30">...</Flow>
```


## ステートコンポーネント（State Modules）

要素に構造的な振る舞い（状態）を付与するコンポーネント群です。内部で `is--` クラスを出力します。

| コンポーネント | 内部の state | 出力クラス | 用途 |
|-------------|------------|-----------|------|
| `<Container>` | `isContainer` + `isWrapper` | `is--container is--wrapper` | コンテナクエリ対象 + 幅制限 |
| `<Wrapper>` | `isWrapper` | `is--wrapper` | コンテンツ幅制限 |
| `<Layer>` | `isLayer` | `is--layer` | 絶対配置レイヤー（inset: 0） |
| `<LinkBox>` | `isLinkBox` | `is--linkBox` | ボックス全体リンク化 |

```jsx
<Container size="l">...</Container>
// → <div class="is--container is--wrapper -contentSize:l">...</div>

<Wrapper contentSize="s">...</Wrapper>
// → <div class="is--wrapper -contentSize:s">...</div>
```


## アトミックコンポーネント（Atomic Modules）

特定の役割を持つ単機能コンポーネントです。

| コンポーネント | 出力クラス | 用途 |
|-------------|-----------|------|
| `<Icon>` | `a--icon` | SVG アイコン・アイコンフォント |
| `<Spacer>` | `a--spacer` | 空白要素 |
| `<Divider>` | `a--divider` | 区切り線 |
| `<Decorator>` | `a--decorator` | 装飾要素（SCSS定義なし、クラス名のみ出力） |

```jsx
<Icon as={LucideArrowRight} fz="xl" />
<Media as="img" src="/image.jpg" alt="説明" ar="16/9" />
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
