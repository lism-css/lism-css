# is--wrapper / `<Wrapper>`

直下のコンテンツ幅を一括制御するクラス。`max-width` とセンタリングを担い、記事・セクションのコンテンツ幅の統一に使います。

## 基本情報

- クラス名: `is--wrapper`
- コンポーネント: `<Wrapper>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/trait/_wrapper.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/is--wrapper/

## 使い方

`<Wrapper>` は `<Lism isWrapper>` のエイリアスです。`isWrapper` Prop は他のコンポーネントにも使用できます（例: `<Flow isWrapper>`）。

| 指定 | 出力 |
|------|------|
| `isWrapper` | `.is--wrapper` |
| `isWrapper="s"` | `.is--wrapper .-contentSize:s` |
| `isWrapper="l"` | `.is--wrapper .-contentSize:l` |
| `isWrapper="20rem"`（任意値） | `.is--wrapper` + `style="--contentSize: 20rem"` |

## 専用Props

| Prop | 説明 |
|------|------|
| `contentSize` | コンテンツサイズ。`s` / `l` / トークン / 任意値 |

```jsx
// 下記の ① と ② は同じ結果
<Flow isWrapper="s" isContainer>...</Flow>
<Wrapper contentSize="s" layout="flow" isContainer>...</Wrapper>
```

## Usage

### `layout` との組み合わせ

```jsx
<Wrapper layout="flow" p="20">
  <p>Content</p>
  <p>Content</p>
</Wrapper>
```

```html
<div class="l--flow is--wrapper -p:20">
  <p>Content</p>
  <p>Content</p>
</div>
```

### `contentSize` 指定

```jsx
<Wrapper contentSize="s" layout="flow" p="20">
  <p>Content</p>
  <p>Content</p>
</Wrapper>
```

```html
<div class="l--flow is--wrapper -contentSize:s -p:20">
  <p>Content</p>
  <p>Content</p>
</div>
```

### 任意値のコンテンツ幅

```jsx
<Lism isWrapper="20rem" p="20">
  <div>Contents...</div>
</Lism>
```

```html
<div class="is--wrapper -p:20" style="--contentSize: 20rem">
  <div>Contents...</div>
</div>
```

## 関連プリミティブ

- [is--container](./is--container.md) — コンテナクエリ基準（`isContainer` と併用可）
- [l--flow](./l--flow.md) — 記事フローレイアウト（`layout="flow"` で結合）
- [l--box](./l--box.md) — 汎用ボックス
