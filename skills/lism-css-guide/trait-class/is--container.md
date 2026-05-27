# is--container / `<Container>`

`container-type` を宣言してコンテナクエリを有効にするクラス。レスポンシブ Property Class（`p={['10', '30']}` のような配列指定）を使うとき、基準要素として必要になります。

## 基本情報

- クラス名: `is--container`
- コンポーネント: `<Container>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/is/_container.scss
- 公式ドキュメント: https://lism-css.com/docs/trait-class/is--container.md

## 使い方

`<Container>` は `<Lism isContainer>` のエイリアスです。`isContainer` Prop は他のコンポーネントにも使用できます（例: `<Flow isContainer>`）。

| Prop | 出力 |
|------|------|
| `isContainer` | `is--container` |

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

## `--sz--bleed` の提供

最外側の `is--container` は直下の子要素に `--sz--bleed: 100cqi` をセットします。`-max-sz:bleed` はこの値を参照しており、最外側の `is--container` 基準の幅まで広がります（ネストされた `is--container` は `--sz--bleed` を再上書きしないため、内側の子要素は外側の値を inherit で参照します）。

`has--gutter` と併用した場合は `calc(100cqi + var(--gutter) * 2)` に自動調整され、gutter 分を含めた端〜端の幅になります。

`@property --sz--bleed` の `initial-value` は `100svi` のため、`is--container` が祖先に存在しない場合はビューポート幅まで広がる fallback として動作します。

## 関連プリミティブ

- [is--wrapper](./is--wrapper.md) — コンテンツ幅ラッパー（`isContainer` と併用可）
- [l--flow](../primitives/l--flow.md) — 記事コンテンツ向けフローレイアウト
- [l--box](../primitives/l--box.md) — 汎用ボックス
