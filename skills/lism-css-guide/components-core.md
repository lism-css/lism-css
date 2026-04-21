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
- [Atomic Primitives](#atomic-primitives)
- [Trait Components](#trait-components)
- [Layout Primitives](#layout-primitives)
- [`getLismProps()`](#getlismprops--外部コンポーネントとの連携)

[詳細](https://lism-css.com/docs/core-components/lism-props/)

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

ソース: [props.ts](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/config/defaults/props.ts)

`<Lism>`系コンポーネントで受け取れる Lism CSS 専用プロパティを **Lism Props** と呼びます。


### 共通 Props

すべての Lism コンポーネントで使えるpropsです。

| Prop | 説明 | 例 |
|------|------|-----|
| `as` | レンダリングする HTML 要素または外部コンポーネントを指定（デフォルト: `"div"`） | `as="section"`, `as={Image}` |
| `lismClass` | コンポーネント基底となる `c--*` クラスを指定。`variant` による BEM 展開の対象 | `lismClass="c--myComponent"` |
| `variant` | `lismClass` 先頭クラスに対する BEM Modifier を付与（`c--` 専用。`a--` / `l--` には展開されない） | `variant="secondary"` |
| `layout` | レイアウトプリミティブ（`l--{layout}`）を指定 | `layout="flow"` |
| `atomic` | アトミックプリミティブ（`a--{atomic}`）を指定。`'divider'` / `'spacer'` / `'decorator'` が利用可能（`'icon'` は内部用） | `atomic="divider"` |
| `set` | セットクラス（`set--{value}`）を指定。スペース区切りで複数指定可。値の先頭に `-` を付けると除外 | `set="plain"`, `set="var:hov var:bxsh"`, `set="-plain"` |
| `util` | ユーティリティクラス（`u--{value}`）を指定。`set` と同様に複数指定・`-` prefix 除外が可能 | `util="cbox"`, `util="cbox trim"`, `util="-trim"` |
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

// set でセットクラスを付与（layout と同じ要領）
<Box set="var:bxsh" p="30">...</Box>
// → <div class="l--box set--var:bxsh -p:30">...</div>

// set を複数指定（スペース区切り）
<Stack set="var:bxsh var:hov" p="30">...</Stack>
// → <div class="l--stack set--var:bxsh set--var:hov -p:30">...</div>

// `-` prefix で除外（コンポーネント内部で適用済みの set を打ち消す用途）
<AccordionButton set="-plain">...</AccordionButton>

// util でユーティリティクラス（u--）を付与
<Box util="cbox" keycolor="red" p="20">...</Box>
// → <div class="l--box u--cbox -p:20" style="--keycolor: var(--red)">...</div>

// util を複数指定・除外も set と同じ記法
<Lism util="cbox trim">...</Lism>
<Lism util="cbox -trim">...</Lism>
```


### CSS Props

主要な CSS プロパティに対して省略記法（Shorthand）で指定できます。値に応じて **Property Class**（`-{prop}:{value}`）やインラインスタイルに変換されます。

各プロパティで受け付けるトークン値・プリセット値の詳細は [property-class.md](./property-class.md) を参照。
もしくは、[定義ファイルの`props.ts`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/config/defaults/props.ts) を読んでください。

`prop={value}`で指定した値(`value`)によって、基本的な出力は以下のように分類されます。

| 値 | 出力形式 | 例 |
|------|------|-----|
| トークン値・プリセット値 | `-{prop}:{value}` クラスのみ | `fz='l'` → `class="-fz:l"` |
| `true` | `-{prop}` クラスのみ（変数なし） | `bd` / `bd={true}` → `class="-bd"` |
| `:` で始まる値 | 強制的にクラス化 | `p=':hoge'` → `class="-p:hoge"` |
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

// `true` でクラスだけ出力（変数は親から継承したい場合などに使う）
<Lism p bdrs>...</Lism>
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


### Trait Props

Trait クラス（`is--*` / `has--*`）を出力するためのプロパティ群です。

| Prop | 出力クラス |
|------|-----------|
| `isWrapper` | `is--wrapper` |
| `isWrapper="{s\|l}"` | `is--wrapper` + `-contentSize:{s\|l}` |
| `isWrapper="{value}"` | `is--wrapper` + `-contentSize` + `--contentSize:{value}` |
| `isLayer` | `is--layer` |
| `isBoxLink` | `is--boxLink` |
| `isCoverLink` | `is--coverLink` |
| `isContainer` | `is--container` |
| `isSide` | `is--side` |
| `isSkipFlow` | `is--skipFlow` |
| `hasTransition` | `has--transition` |
| `hasGutter` | `has--gutter` |
| `hasSnap` | `has--snap` |
| `hasMask` | `has--mask` |

```jsx
// Trait Props の使用例
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

## Atomic Primitives

| コンポーネント | 出力クラス | 用途 |
|-------------|-----------|------|
| `<Icon>` | `a--icon` | SVG アイコン・アイコンフォント |
| `<Spacer>` | `a--spacer` | 空白要素 |
| `<Divider>` | `a--divider` | 区切り線 |
| `<Decorator>` | `a--decorator` | 装飾要素（SCSS定義なし、クラス名のみ出力） |


各プリミティブの詳細は SKILL.md の「プリミティブ単位の詳細リファレンス」、または `primitives/` 配下の各ファイルを参照。


## Trait Components

`<Lism isXxx>`のエイリアスコンポーネントです。`is--*` クラスを出力します。

| コンポーネント | 内部処理 | 出力クラス |
|-------------|------------|-----------|
| `<Container>` | `isContainer` | `is--container` |
| `<Wrapper>` | `isWrapper` | `is--wrapper` |
| `<Layer>` | `isLayer` | `is--layer` |
| `<BoxLink>` | `isBoxLink` | `is--boxLink` |

各 Trait クラスの詳細は SKILL.md の「プリミティブ単位の詳細リファレンス」、または `trait-class/` 配下の各ファイルを参照。`has--*` については [trait-class.md](./trait-class.md) を参照。


## Layout Primitives

内部で `layout` prop が固定されており、対応する `l--{layout}` クラスが自動で出力されます。各コンポーネントの専用 Props（`cols`, `rows`, `breakSize`, `sideW`/`mainW`, `flow` など）は、それぞれの詳細ファイルを参照してください。

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
| `<AutoColumns>` | `l--autoColumns` |
| `<SwitchColumns>` | `l--switchColumns` |
| `<WithSide>` | `l--withSide` |

各プリミティブの詳細は SKILL.md の「プリミティブ単位の詳細リファレンス」、または `primitives/` 配下の各ファイルを参照。

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
