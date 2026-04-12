# is--container / `<Container>`

`container-type` を宣言してコンテナクエリを有効にするモジュールクラス。レスポンシブ Property Class（`p={['10', '30']}` のような配列指定）を使うとき、基準要素として必要になります。

## 基本情報

- クラス名: `is--container`
- コンポーネント: `<Container>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/modules/state/_container.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/modules/is--container/

## 使い方

`<Container>` は `<Lism isContainer>` のエイリアスです。`isContainer` Prop は**どのコンポーネントからでも呼び出せる**ため、既存のレイアウトモジュールに後付けでコンテナ宣言を追加できます。

| Prop | 出力 |
|------|------|
| `isContainer` | `.is--container` |

## Usage

### 使用例

```jsx
<Container isWrapper="s" p="20">
  <Box bd p={['10', '30']}>
    このBOXは、padding が切り替わります
  </Box>
</Container>
```

```html
<div class="is--container is--wrapper -contentSize:s -p:20">
  <div class="l--box -bd -p:10 -p_sm" style="--p_sm: var(--s30)">
    このBOXは、padding が切り替わります
  </div>
</div>
```

子要素側は `p={['10', '30']}` のようなブレイクポイント配列指定にすることで、親の `is--container` を基準としたコンテナクエリで値が切り替わります。

## 関連モジュール

- [is--wrapper](./is--wrapper.md) — コンテンツ幅ラッパー（`isContainer` と併用可）
- [l--flow](./l--flow.md) — 記事コンテンツ向けフローレイアウト
- [l--box](./l--box.md) — 汎用ボックス
