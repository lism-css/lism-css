# コンポーネントシステム

Lism CSS は React / Astro 向けのコンポーネントを提供しています。すべてのコンポーネントは `lism-css` パッケージに含まれており、インポートパスのみ異なります。

```jsx
// React
import { Lism, Box, Flex, Stack, Grid, Text, Media } from 'lism-css/react';

// Astro
import { Lism, Box, Flex, Stack, Grid, Text, Media } from 'lism-css/astro';
```


## コアコンポーネント: `<Lism>`

`Lism` はすべてのコンポーネントの基盤です。Lism Props を受け取り、CSS クラスとインラインスタイルに変換して HTML を出力します。

```jsx
<Lism p="20" fz="l" c="brand">コンテンツ</Lism>
// → <div class="-p:20 -fz:l -c:brand">コンテンツ</div>
```

### 共通 Props

すべての Lism コンポーネントで使えるプロップスです。

| Prop | 説明 | 例 |
|------|------|-----|
| `as` | レンダリングする HTML 要素または外部コンポーネントを指定（デフォルト: `'div'`） | `as="section"`, `as={Image}` |
| `lismClass` | コンポーネントの主要クラス名を指定。出力順序が高めになる | `lismClass='c--myComponent'` |
| `variant` | `lismClass` に対するバリエーションクラスを出力 | `variant='secondary'` |
| `layout` | レイアウトモジュールを指定し `l--{layout}` クラスを出力 | `layout='flow'` |
| `exProps` | Lism Props処理をスキップして外部コンポーネントに直接渡す属性のオブジェクト | `exProps={{ size: '1em' }}` |
| `style` | インラインスタイル（React: camelCase、CSS変数: `--` プレフィックス） | `style={{ '--my-var': '10px' }}` |

```jsx
// as で HTML 要素を指定
<Lism as="section" p="30">...</Lism>
// → <section class="-p:30">...</section>

// as で外部コンポーネントを指定（Next.js Image の例）
<Media as={Image} src="..." bxsh="20" bdrs="20" />

// lismClass でコンポーネントクラスを付与
<Lism lismClass='c--myComponent' p='10'>...</Lism>
// → <div class="c--myComponent -p:10">...</div>

// variant でバリエーション
<Lism lismClass='c--myComponent' variant='secondary'>...</Lism>
// → <div class="c--myComponent c--myComponent--secondary">...</div>

// exProps で外部コンポーネント用プロパティを明示的に分離
<Icon as={Hoge} exProps={{ size: '1em' }} p="10" fz="l">...</Icon>
// → p, fz は Lism が処理、size は Hoge に直接渡される
```


## Lism Props

`<Lism>` で受け取れる Lism CSS 専用プロパティを **Lism Props** と呼びます。主に **CSS Props** と **State Props** の2種類があります。


### CSS Props

主要な CSS プロパティに対して省略記法（Shorthand）で指定できます。値に応じて **Prop Class**（`-{prop}:{value}`）やインラインスタイルに変換されます。

#### 値の変換パターン

指定した値によって、出力が以下のように変わります。

| 状況 | 出力 | 例 |
|------|------|-----|
| トークン値・プリセット値 | `.-{prop}:{value}` クラスのみ | `fz='l'` → `class="-fz:l"` |
| `true` または `"-"` | `.-{prop}` クラスのみ（変数なし） | `bd` / `bd='-'` → `class="-bd"` |
| `:` で始まる値 | 強制的にユーティリティクラス化 | `p=':hoge'` → `class="-p:hoge"` |
| BP対応プロパティのカスタム値 | `.-{prop}` クラス + `--{prop}` CSS変数 | `fz='20px'` → `class="-fz" style="--fz:20px"` |
| CSS変数のみのプロパティ | `style` に `--{prop}` 変数のみ | `bdw='2px'` → `style="--bdw:2px"` |
| 単純なインライン出力 | `style` 属性に直接出力 | `o='0.75'` → `style="opacity:0.75"` |

```jsx
// トークン値 → クラスのみ
<Lism fz='l' p='20'>...</Lism>
// → <div class="-fz:l -p:20">...</div>

// カラートークン（クラス化されていない場合）→ クラス + CSS変数
<Lism c='red'>...</Lism>
// → <div class="-c" style="--c:var(--red)">...</div>

// カスタム値 → クラス + CSS変数
<Lism fz='20px'>...</Lism>
// → <div class="-fz" style="--fz:20px">...</div>

// border 系（CSS変数のみ出力される特殊パターン）
<Lism bd bdc="#000" bdw="2px">...</Lism>
// → <div class="-bd" style="--bdc:#000;--bdw:2px">...</div>

// `-` でクラスだけ出力（変数は親から継承したい場合などに使う）
<Lism p='-' bdrs>...</Lism>
// → <div class="-p -bdrs">...</div>

// `:` で強制ユーティリティクラス化
<Lism p=':hoge'>...</Lism>
// → <div class="-p:hoge">...</div>
```


#### CSS Props 一覧

| カテゴリ | Shorthand | CSS Property | BP |
|---------|-----------|-------------|-----|
| **Typography** | `fz` | font-size | ✔ |
| | `fw` | font-weight | - |
| | `ff` | font-family | - |
| | `fs` | font-style | - |
| | `lh` | line-height | - |
| | `lts` | letter-spacing | - |
| | `ta` | text-align | - |
| | `td` | text-decoration | - |
| **Colors** | `c` | color | - |
| | `bgc` | background-color | - |
| | `bdc` | --bdc（CSS変数のみ） | - |
| **Padding** | `p` | padding | ✔ |
| | `px` | padding-inline | ✔ |
| | `py` | padding-block | ✔ |
| | `px-s`,`px-e` | padding-inline-start/end | ✔ |
| | `py-s`,`py-e` | padding-block-start/end | ✔ |
| | `pl`,`pr`,`pt`,`pb` | padding-left/right/top/bottom | ✔ |
| **Margin** | `m` | margin | ✔ |
| | `mx` | margin-inline | ✔ |
| | `my` | margin-block | ✔ |
| | `mx-s`,`mx-e` | margin-inline-start/end | ✔ |
| | `my-s`,`my-e` | margin-block-start/end | ✔ |
| | `ml`,`mr`,`mt`,`mb` | margin-left/right/top/bottom | ✔ |
| **Size** | `w` | width | ✔ |
| | `h` | height | ✔ |
| | `max-w`,`min-w` | max/min-width | ✔ |
| | `max-h`,`min-h` | max/min-height | ✔ |
| | `sz` | inline-size | - |
| | `max-sz` | max-inline-size | - |
| **Display** | `d` | display | ✔ |
| | `v` | visibility | - |
| | `o` | opacity | - |
| | `ov` | overflow | - |
| | `ar` | aspect-ratio | ✔ |
| **Position** | `pos` | position | - |
| | `t`,`l`,`r`,`b` | top/left/right/bottom | - |
| | `z` | z-index | - |
| | `i` | inset | - |
| **Gap** | `g` | gap | ✔ |
| | `cg` | column-gap | ✔ |
| | `rg` | row-gap | ✔ |
| **Flex** | `fxw` | flex-wrap | ✔ |
| | `fxd` | flex-direction | ✔ |
| | `fx` | flex | ✔ |
| | `fxsh` | flex-shrink | - |
| | `fxg` | flex-grow | - |
| | `fxb` | flex-basis | ✔ |
| **Grid** | `gt` | grid-template | ✔ |
| | `gta` | grid-template-areas | ✔ |
| | `gtc` | grid-template-columns | ✔ |
| | `gtr` | grid-template-rows | ✔ |
| | `gaf` | grid-auto-flow | ✔ |
| | `ga` | grid-area | ✔ |
| | `gc` | grid-column | ✔ |
| | `gr` | grid-row | ✔ |
| **Places** | `ai` | align-items | ✔ |
| | `ac` | align-content | ✔ |
| | `ji` | justify-items | ✔ |
| | `jc` | justify-content | ✔ |
| | `aslf` | align-self | - |
| | `jslf` | justify-self | - |
| | `order` | order | - |
| **Shadow/Radius** | `bxsh` | box-shadow | ✔ |
| | `bdrs` | border-radius | ✔ |
| **Border** | `bd` | border | - |
| | `bdc` | --bdc | - |
| | `bds` | --bds | - |
| | `bdw` | --bdw | ✔ |
| | `bd-t`,`bd-r`,`bd-b`,`bd-l` | border-top/right/bottom/left | - |
| | `bd-x`,`bd-y` | border-inline/block | - |
| **Background** | `bg` | background | ✔ |
| | `bgc` | background-color | - |
| | `bgi` | background-image | - |
| | `bgr` | background-repeat | - |
| | `bgp` | background-position | - |
| | `bgsz` | background-size | - |
| **Other** | `float` | float | - |
| | `isolation` | isolation | - |
| | `ovwrap` | overflow-wrap | - |
| | `whspace` | white-space | - |

**BP** = ブレイクポイント対応（配列・オブジェクトでレスポンシブ指定可能）

各プロパティで受け付けるトークン値・プリセット値の詳細は [prop-class.md](./prop-class.md) を参照。


#### レスポンシブ指定

BP対応プロパティは、配列またはオブジェクトでブレイクポイントごとの値を指定できます。

| BP | デフォルト値 |
|----|------------|
| `sm` | `width >= 480px` |
| `md` | `width >= 800px` |
| (`lg`) | `width >= 1120px`（要SCSSカスタマイズ） |

デフォルトで**コンテナクエリ**を採用しており、先祖に`.is--container`（コンテナ要素）が必要です。

```jsx
// 配列（base → sm → md の順）
<Lism p={['20', '30', '5rem']}>...</Lism>

// オブジェクトで直接指定
<Lism p={{ base: '20', sm: '30', md: '5rem' }}>...</Lism>

// ↓ どちらも同じ出力
// <div class="-p:20 -p_sm -p_md" style="--p_sm:var(--s30);--p_md:5rem">...</div>

// BPをスキップ（md のみ指定）
<Lism p={[null, null, '40']}>...</Lism>
<Lism p={{ md: '40' }}>...</Lism>
// → <div class="-p_md" style="--p_md:var(--s40)">...</div>
```


### State Props

State Modules クラス（`.is--*` / `.set--*`）を出力するためのプロパティ群です。

| Prop | 出力クラス | 用途 |
|------|-----------|------|
| `isWrapper(='{s\|l}')` | `.is--wrapper` + `.-contentSize:{s\|l}` | コンテンツ幅制限 |
| `isLayer` | `.is--layer` | 絶対配置レイヤー（inset:0） |
| `isLinkBox` | `.is--linkBox` | ボックス全体リンク化 |
| `isContainer` | `.is--container` | コンテナクエリ対象 |
| `isSide` | `.is--side` | サイド要素 |
| `isSkipFlow` | `.is--skipFlow` | Flow 余白をスキップ |
| `isVertical` | `.is--vertical` | 縦書き方向 |
| `setGutter` | `.set--gutter` | 左右ガター余白 |
| `setShadow` | `.set--shadow` | シャドウ付与 |
| `setHov` | `.set--hov` | ホバー効果 |
| `setTransition` | `.set--transition` | トランジション |
| `setPlain` | `.set--plain` | プレーン状態 |

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
| `<FluidCols>` | `fluidCols` | `l--fluidCols` | auto-fill/auto-fit グリッド |
| `<SwitchCols>` | `switchCols` | `l--switchCols` | レスポンシブカラム切り替え |
| `<SideMain>` | `sideMain` | `l--sideMain` | サイド＋メインの2カラム |

### レイアウト固有の Props

一部のレイアウトコンポーネントには専用の props があります。

```jsx
// Grid: template 系 props
<Grid gtc="1fr 1fr" gtr="auto">...</Grid>

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
| `<Decorator>` | `a--decorator` | 装飾要素 |

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


## UI コンポーネント（`@lism-css/ui`）

`@lism-css/ui` パッケージには、Lism CSS の上に構築されたインタラクティブな UI コンポーネントが含まれます。

```jsx
// React
import { Accordion, Tabs, Modal, Button } from '@lism-css/ui/react';

// Astro
import { Accordion, Tabs, Modal, Button } from '@lism-css/ui/astro';
```

### 利用可能なコンポーネント

| コンポーネント | 用途 |
|-------------|------|
| `Accordion` | 折りたたみパネル |
| `Alert` | 警告・通知ボックス |
| `Avatar` | ユーザーアイコン |
| `Badge` | ラベル・バッジ |
| `Button` | ボタン |
| `Callout` | 注釈・補足ボックス |
| `Chat` | チャット風 UI |
| `Details` | 詳細表示（details/summary） |
| `Modal` | モーダルダイアログ |
| `NavMenu` | ナビゲーションメニュー |
| `Tabs` | タブ切り替え UI |
| `ShapeDivider` | 図形区切り線 |
| `DummyText` | ダミーテキスト（開発用） |
| `DummyImage` | ダミー画像（開発用） |


### CLI でプロジェクトにコピーして使う

`@lism-css/ui` の UI コンポーネントは、CLI コマンドで自分のプロジェクトにソースコードをコピーして使うこともできます。コピーしたファイルは自由にカスタマイズ可能です。

```bash
# 初期設定（framework、出力先ディレクトリを対話的に設定）
npx lism-ui init

# コンポーネントを追加
npx lism-ui add Button Modal
npx lism-ui add -a          # 全コンポーネントを追加

# 利用可能なコンポーネント一覧を表示
npx lism-ui list
```

`init` で生成される `lism-ui.json`:

```json
{
  "framework": "react",
  "componentsDir": "src/components/ui",
  "helperDir": "src/components/ui/_helper"
}
```

詳細: https://lism-css.com/docs/components/
