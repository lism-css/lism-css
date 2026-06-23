# 例: div手組み → Primitive化

[`checklist.md`](../references/checklist.md) Pass 2の実例です。`<div>`＋素のCSSで組まれた構造を、同じ挙動のままLism Primitiveへ置換します。`c--*`の意味クラスは残します。

import例（Reactの場合）:

```jsx
import { Columns, Stack, Frame, Layer, Center, Heading, Text, WithSide } from 'lism-css/react';
// Astroなら from 'lism-css/astro'
```

---

## 例1: カードグリッド（Grid直書き → Columns + Stack + Frame）

### Before

```jsx
<div
  className="c--features"
  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}
>
  {items.map((item) => (
    <div
      key={item.id}
      className="c--features_card"
      style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
    >
      <div className="c--features_media" style={{ overflow: 'hidden', aspectRatio: '16 / 9' }}>
        <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <h3 className="c--features_title">{item.title}</h3>
      <p className="c--features_text">{item.text}</p>
    </div>
  ))}
</div>
```

### After

```jsx
<Columns className="c--features" cols={3} g="20">
  {items.map((item) => (
    <Stack key={item.id} className="c--features_card" g="15">
      <Frame className="c--features_media" ar="16/9">
        <img src={item.img} alt="" />
      </Frame>
      <Heading level="3" className="c--features_title">{item.title}</Heading>
      <Text className="c--features_text">{item.text}</Text>
    </Stack>
  ))}
</Columns>
```

### 変換の対応

| Before | After | 由来 |
|---|---|---|
| `display:grid; grid-template-columns:repeat(3,1fr)` | `<Columns cols={3}>` | Pass 2 |
| `display:flex; flex-direction:column; gap:15px` | `<Stack g="15">` | Pass 2 |
| `overflow:hidden; aspect-ratio:16/9`の枠 | `<Frame ar="16/9">` | Pass 2 |
| img の`width:100%; height:100%; object-fit:cover` | 削除（`Frame`直下メディアの既定） | Pass 9 |
| `<h3>` / `<p>` | `<Heading level="3">` / `<Text>` | Pass 2 |
| `gap:20px` | `g="20"` | Pass 5 |

### 退行注意

- **`cols={3}`は固定3列のまま**。元が固定3列なら挙動同等（✅）。`cols={[1,2,3]}`へのレスポンシブ化は挙動変更なので別提案として⏸（Pass 8）。
- `Frame`化で直下`img`以外の子があると、その子にもfit既定が当たる。直下にメディア以外を置く構造では注意（Pass 9の退行注意）。
- `level="3"`は文字列。`level={3}`にしない（[`antipatterns.md#prop-型ミス`](../../lism-css-guide/antipatterns.md#prop-型ミス)）。

---

## 例2: メディア＋テキストのオーバーレイ（absolute手組み → Frame + Layer）

### Before

```jsx
<div
  className="c--hero"
  style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16 / 9', color: '#fff' }}
>
  <img src={hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  <div className="c--hero_overlay" style={{ position: 'absolute', inset: 0, background: 'rgb(0 0 0 / 40%)' }} />
  <div
    className="c--hero_body"
    style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', gap: '15px' }}
  >
    <h2>{title}</h2>
    <p>{lead}</p>
  </div>
</div>
```

### After

```jsx
<Frame className="c--hero" ar="16/9" pos="relative" c="#fff">
  <img src={hero} alt="" />
  <Layer className="c--hero_overlay" bgc="rgb(0 0 0 / 40%)" />
  <Layer className="c--hero_body">
    <Center min-h="100%" g="15">
      <Heading level="2">{title}</Heading>
      <Text>{lead}</Text>
    </Center>
  </Layer>
</Frame>
```

### 変換の対応

- `position:relative; overflow:hidden; aspect-ratio` の枠 → `<Frame ar="16/9" pos="relative">`（`overflow:hidden`は`Frame`既定なので`ov`は足さない）。
- `position:absolute; inset:0` の重ね要素 → `<Layer>`（`is--layer`が`position:absolute; inset:0`を担う）。
- `place-items:center` の中央寄せ → `<Center>`。
- img の`width/height/object-fit` → 削除（`Frame`既定）。

### 退行注意

- 重ね順（overlay → body）はDOM順で決まる。`Layer`の並びをBeforeと同じにする。
- `rgb(0 0 0 / 40%)`のような任意色はtokenではない。Beforeの値をそのまま渡し、勝手に丸めない（Pass 5）。

---

## 例3: サイドバー（固定Grid＋media query → WithSide）⏸

横並び／縦並びの切替を伴う2カラムは`WithSide`が候補だが、**切替の発火条件が変わる**ため⏸で確認する。

### Before

```css
.c--layout { display: grid; grid-template-columns: 1fr 16rem; gap: 40px; }
@media (max-width: 768px) {
  .c--layout { grid-template-columns: 1fr; }
}
```

```jsx
<div className="c--layout">
  <div className="c--layout_main">{main}</div>
  <aside className="c--layout_side">{side}</aside>
</div>
```

### After（提案・要sign-off）

```jsx
<WithSide className="c--layout" sideW="16rem" g="40">
  <div className="c--layout_main">{main}</div>
  <aside className="c--layout_side is--side">{side}</aside>
</WithSide>
```

### なぜ⏸か

- Beforeは**ビューポート768px**で縦並びへ切り替わる（media query）。`WithSide`は**メインがmainWを維持できなくなった時**（コンテンツ幅基準）に切り替わる。**切替トリガが別物**なので、見た目が近くても挙動は変わる。
- 採用するなら、`mainW`をデザインの折返し幅に合わせて指定し、ビジュアルQAで確認する。コンテナクエリ基準でよいかをユーザーに確認してから適用する。
- サイド側の子に`is--side`（コンポーネントなら`isSide`）が必要（[`primitives/l--withSide.md`](../../lism-css-guide/primitives/l--withSide.md)）。

> ブレイクポイントでの明示切替を維持したい場合は`<Grid>`の`gtc`配列指定を使う（[`primitives/l--withSide.md`](../../lism-css-guide/primitives/l--withSide.md)の「`l--grid`との使い分け」）。
