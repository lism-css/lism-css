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
| `as` | レンダリングする HTML 要素を指定（デフォルト: `'div'`） | `as="section"` |
| `exProps` | 外部コンポーネントに渡す追加属性のオブジェクト | `exProps={{ 'data-id': '1' }}` |
| `style` | インラインスタイル（React: camelCase、CSS変数: `--` プレフィックス） | `style={{ '--my-var': '10px' }}` |
| `children` | 子要素 | — |

その他、`p`, `m`, `fz`, `c`, `bgc` 等の Lism Props がすべて利用可能です（[prop-class.md](./prop-class.md) 参照）。

```jsx
// as で HTML 要素を指定
<Lism as="section" p="30">...</Lism>
// → <section class="-p:30">...</section>

// as で外部コンポーネントを指定
<Lism as={MyComponent} p="20">...</Lism>
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

`as` に外部コンポーネントを渡しても Props が正しく処理されない場合、`getLismProps()` を使って className と style を手動で取得できます。

```jsx
import getLismProps from 'lism-css/lib/getLismProps';

function MyComponent({ children }) {
  // Lism Props を className + style に変換
  const lismProps = getLismProps({ p: '20', fz: 'l', c: 'brand' });
  // → { className: '-p:20 -fz:l -c:brand', style: {} }

  return <div {...lismProps}>{children}</div>;
}
```

外部の UI ライブラリやカスタムコンポーネントに Lism のスタイルシステムを適用したい場合に有効です。

```jsx
import getLismProps from 'lism-css/lib/getLismProps';
import { motion } from 'framer-motion';

function AnimatedBox({ children, ...lismPropsInput }) {
  const { className, style, ...rest } = getLismProps(lismPropsInput);
  return (
    <motion.div className={className} style={style} {...rest}>
      {children}
    </motion.div>
  );
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
