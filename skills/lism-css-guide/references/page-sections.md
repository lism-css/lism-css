# ページ定番セクションの構成例

ヒーロー・サイトヘッダー・フッターなど、ページの定番セクションを`Group`/`Wrapper`/`Stack`＋Propsで組む時の出発点です。ここにある構成をベースにし、実際の値は値・トークン照合（C5）を通してから確定します。

共通の考え方:

- セクションの外殻は`Group`（`as="header"`/`as="section"`/`as="footer"`）で意味付けし、サイト領域には`z--*`、ページ固有の領域には`p--*`を付ける（[`css-rules.md`](../css-rules.md#独自プレフィックス)）。
- 「全幅の背景＋中央寄せの本文幅」は、外殻`Group`（背景色・縦padding）＋`hasGutter`（サイト共通の左右余白）＋内側`Wrapper`（コンテンツ幅）の組み合わせで作る。`max-width`をpxで直書きしない。
- 縦の並びは`Stack`、横並びは`Cluster`に任せ、余白はすべて`g`/`py`などのトークンPropsで表す。
- セクションの高さをデザインpxで固定しない。高さは余白（`py`）とコンテンツが決める。

## サイトヘッダー

ロゴ＋ナビの横並び。折り返しは`Cluster`、両端寄せは`jc="between"`。

```jsx
import { Group, Wrapper, Cluster, Link } from 'lism-css/astro';

<Group as="header" className="z--header" bgc="base" py="20" hasGutter>
  <Wrapper contentSize="xl">
    <Cluster jc="between" g="20">
      <Link href="/" fw="bold" fz="l">Site Name</Link>
      <Cluster as="nav" g="30" fz="s">
        <Link href="/about">About</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </Cluster>
    </Cluster>
  </Wrapper>
</Group>
```

- ボタン型のCTAを置くなら`@lism-css/ui`の`Button`を使う（[`components-ui.md`](../components-ui.md)）。素の`<button>`を整えるなら`set--plain`。
- 追従ヘッダーにする場合だけ`pos="sticky" t="0" z="99"`を足す。

## ヒーローセクション

全幅背景＋中央寄せテキスト＋CTA。

```jsx
import { Group, Wrapper, Stack, Cluster, Heading, Text } from 'lism-css/astro';

<Group as="section" className="p--frontHero" bgc="base-2" py={['60', null, '80']} hasGutter isContainer>
  <Wrapper contentSize="l">
    <Stack g="30" ai="center" ta="center">
      <Heading level="1" fz={['3xl', null, '5xl']}>キャッチコピー</Heading>
      <Text fz={['m', null, 'l']} c="text-2">サブコピー</Text>
      <Cluster g="20" jc="center">{/* CTA: @lism-css/ui の Button */}</Cluster>
    </Stack>
  </Wrapper>
</Group>
```

- 背景に画像やレイヤーを敷く場合は`Layer`を検討する（[`../trait-class/is--layer.md`](../trait-class/is--layer.md)）。

## フッター

リンク集の段組み＋コピーライト。列数固定なら`Columns`、最小幅ベースの自動段組みなら`AutoColumns`。

```jsx
import { Group, Wrapper, Stack, AutoColumns, Text, Divider } from 'lism-css/astro';

<Group as="footer" className="z--footer" bgc="text" c="base" py="60" hasGutter isContainer>
  <Wrapper contentSize="xl">
    <Stack g="40">
      <AutoColumns cols="12rem" g="40">
        <Stack g="15" fz="s">{/* リンク列 */}</Stack>
        <Stack g="15" fz="s">{/* リンク列 */}</Stack>
        <Stack g="15" fz="s">{/* リンク列 */}</Stack>
      </AutoColumns>
      <Divider />
      <Text fz="xs" ta="center">© 2026 Site Name</Text>
    </Stack>
  </Wrapper>
</Group>
```

## 汎用コンテンツセクション

見出し＋カード一覧などのくり返し型。

```jsx
import { Group, Wrapper, Stack, Heading, Columns } from 'lism-css/astro';

<Group as="section" className="p--frontFeatures" py="70" hasGutter isContainer>
  <Wrapper contentSize="l">
    <Stack g="40">
      <Heading level="2" fz="2xl" ta="center">Features</Heading>
      <Columns cols={[1, null, 3]} g="30">{/* カード */}</Columns>
    </Stack>
  </Wrapper>
</Group>
```

## 使う前の確認

- 使うPrimitive/Traitの詳細ファイル（`primitives/l--*.md`・`trait-class/*.md`）を、`SKILL.md`の資料確認トリガーに従って読む。
- レスポンシブ値（配列・オブジェクト指定）を使う場合は、祖先の`isContainer`または`@media`運用の確認が必要（[`responsive.md`](../responsive.md)）。
- ここに書いた値はすべて例。実際のデザイン値は`tokens.md`との照合（C5）とトークン差分表を通す。
