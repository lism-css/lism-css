# l--frame / `<Frame>`

直下のメディア要素（`img`, `video`, `iframe`）を自身のサイズにフィットさせて表示するクラス。アスペクト比固定のメディア枠を簡単に作れます。

## 基本情報

- クラス名: `l--frame`
- コンポーネント: `<Frame>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_frame.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--frame/

## 専用Props

| Prop | 説明 |
|------|------|
| `ar` | フレームのアスペクト比を指定（`16/9` など）。`ar` 自体はどのコンポーネントにも指定できる汎用 CSS Prop |

## Usage

### アスペクト比の指定

```jsx
<Frame ar="16/9">
  <img src="/img/a-1.jpg" alt="" width="960" height="640" />
</Frame>
```

```html
<div class="l--frame -ar:16/9">
  <img src="/img/a-1.jpg" alt="" width="960" height="640" />
</div>
```

### `figure` / `figcaption` の使用

`as="figure"` を指定してセマンティックな `<figure>` 要素として出力できます。

```jsx
<Frame as="figure" ar="16/9" pos="relative">
  <img src="/img/a-1.jpg" alt="" width="960" height="640" />
  <Flex as="figcaption" pos="absolute" b="0" w="100%" jc="center" p="10" c="white" bgc="rgb(0 0 0 / 40%)">
    Caption text
  </Flex>
</Frame>
```

### `iframe` / `video` の使用

`iframe`（YouTube 埋め込みなど）や `video` も同様に `l--frame` 直下に配置すれば自動的にフィットします。

```jsx
<Frame ar="16/9">
  <iframe src="https://www.youtube.com/embed/xxx" allowfullscreen />
</Frame>
```

### Layer 系を活用したオーバーレイ

`<Layer>` と組み合わせると、メディア上にテキストやオーバーレイを重ねられます。

```jsx
<Frame ar="3/2" pos="relative" c="#fff">
  <img src="/img/a-1.jpg" alt="" width="960" height="640" />
  <Layer bgc="rgb(0 0 0 / 40%)" />
  <Layer p="30">
    <Center min-h="100%" g="15">
      <h2>Heading</h2>
      <Text>オーバーレイ内のテキスト...</Text>
    </Center>
  </Layer>
</Frame>
```

### レスポンシブな `ar`

`ar` はブレイクポイント別に配列で指定できます。

```jsx
<Frame ar={['1/1', '3/2', '16/9']} pos="relative">
  <img src="/img/a-1.jpg" alt="" width="960" height="640" />
</Frame>
```

```html
<div class="l--frame -ar:1/1 -ar_sm -ar_md" style="--ar_sm: 3/2; --ar_md: 16/9">
  <img src="/img/a-1.jpg" alt="" />
</div>
```

## 関連プリミティブ

- [is--layer](./is--layer.md) — `l--frame` 内のオーバーレイ配置に使用
- [l--center](./l--center.md) — フレーム内でテキストを中央配置する時に組み合わせる
- [a--icon](./a--icon.md) — アイコン画像の表示（`src` 指定）
