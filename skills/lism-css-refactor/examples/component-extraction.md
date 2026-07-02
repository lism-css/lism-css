# 例: 重複3箇所以上 → コンポーネント抽出

[`checklist.md`](../references/checklist.md) Pass3の実例です。同じProperty Class束・`c--*`構造が3箇所以上で安定して現れる時、CSSへ逃がさず**React/Astroコンポーネントとして抽出**します。`className="c--*"`は意味名として残します。

### 抽出するかの判断

| 状況 | 判定 |
| --- | --- |
| 3箇所以上 かつ 同じ意味のUI部品として安定 | 🔧 抽出 |
| 2箇所以下・一時的な局所重複・意図的な例示 | ✅ そのまま |
| 値差分・slot構造があり、Props設計が必要 | ⏸（Props設計を先に確認） |

---

## 例1: タグ（Property Class束の抽出＋透過）

### Before

```jsx
<div className="c--tags">
  <span className="c--tag -fz:xs -px:10 -py:5 -bgc:base-2 -bdrs:10">React</span>
  <span className="c--tag -fz:xs -px:10 -py:5 -bgc:base-2 -bdrs:10">Astro</span>
  <span className="c--tag -fz:xs -px:10 -py:5 -bgc:base-2 -bdrs:10">CSS</span>
</div>
```

### After（React）

```jsx
import { Inline } from 'lism-css/react';

export function Tag({ children, className, ...props }) {
  return (
    <Inline
      className={['c--tag', className].filter(Boolean).join(' ')}
      fz="xs"
      px="10"
      py="5"
      bgc="base-2"
      bdrs="10"
      {...props}
    >
      {children}
    </Inline>
  );
}
```

```jsx
<div className="c--tags">
  <Tag>React</Tag>
  <Tag>Astro</Tag>
  <Tag data-id="css">CSS</Tag>
</div>
```

### 透過（最重要の壊しやすいポイント）

- `className`/`style`/`data-*`/ARIA/event handlerを`{...props}`で透過する。抽出前に`<span>`が受けられた属性を、抽出後も同じように受けられるようにする。
- `<Inline>`はセマンティックコンポーネント（既定`<span>`）。要素を変えたくない場合は要素も合わせる（[`components-core.md`](../../lism-css-guide/components-core.md)）。
- **Astro版**は`.astro`ファイルで`<slot />`を使い、`from 'lism-css/astro'`をimport、`Astro.props`を透過する。`class`の受け渡しは[`components-core.md`](../../lism-css-guide/components-core.md)で確認する。

---

## 例2: カード（slot/値差分があるProps設計）

[`markup.md`](./markup.md) 例1のカードを部品化する。値差分（title/text/img）があるので、Propsを設計してから抽出する。

### Before（同じ構造のカードが3件以上）

```jsx
<Stack className="c--features_card" g="15">
  <Frame className="c--features_media" ar="16/9"><img src="/a.jpg" alt="" /></Frame>
  <Heading level="3" className="c--features_title">高速</Heading>
  <Text className="c--features_text">軽量なCSS設計。</Text>
</Stack>
<Stack className="c--features_card" g="15">
  <Frame className="c--features_media" ar="16/9"><img src="/b.jpg" alt="" /></Frame>
  <Heading level="3" className="c--features_title">型安全</Heading>
  <Text className="c--features_text">Props経由で型補完。</Text>
</Stack>
{/* …同じ構造がもう1件以上… */}
```

### After

```jsx
import { Columns, Stack, Frame, Heading, Text } from 'lism-css/react';

function FeatureCard({ item }) {
  return (
    <Stack className="c--features_card" g="15">
      <Frame className="c--features_media" ar="16/9">
        <img src={item.img} alt={item.alt ?? ''} />
      </Frame>
      <Heading level="3" className="c--features_title">{item.title}</Heading>
      <Text className="c--features_text">{item.text}</Text>
    </Stack>
  );
}

export function Features({ items }) {
  return (
    <Columns className="c--features" cols={3} g="20">
      {items.map((item) => (
        <FeatureCard key={item.id} item={item} />
      ))}
    </Columns>
  );
}
```

### 壊さないための注意

- **レスポンシブPropsを単一値に潰さない**。元のカードが`p={['20','30']}`のような配列Propsを持っていたら、抽出後のコンポーネントもその配列を受けて出力する（[`common-mistakes.md`](../references/common-mistakes.md)）。
- 値差分はProps（`item`）へ。`c--features_card`等の意味クラスは残す。
- 抽出でHTML要素が変わらないようにする（`<Stack>`=`<div>`基盤。元が`<article>`なら`as="article"`を付ける）。
- 3箇所未満に減らした結果、抽出が過剰になるなら✅で据え置く判断もある（不要な差分を出さない）。
