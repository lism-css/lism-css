# l--center / `<Center>`

要素を上下左右中央揃えで配置するクラス。高さの有無で水平中央のみ / 上下左右中央を自動的に切り替えます。

## 基本情報

- クラス名: `l--center`
- コンポーネント: `<Center>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_center.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--center/

## 動作の仕組み

- 高さを持たない場合: コンテンツを**水平方向のみ**中央揃え（内在的な中央寄せ。長いテキストは左寄せのまま）
- 高さ・アスペクト比（`h`, `min-h`, `ar` など）が設定されている場合: **垂直方向も中央揃え**

## Usage

### 水平方向に中央配置

```jsx
<Center bd p="30">
  <Text fz="l">TEXT</Text>
</Center>
```

```html
<div class="l--center -bd -p:30">
  <p class="-fz:l">TEXT</p>
</div>
```

### 上下左右中央に配置する

`ar` や高さを指定すると、垂直方向に対しても中央揃えになります。

```jsx
<Center g="10" ar="3/2" bd>
  <Text fz="l">TEXT</Text>
  <Text fz="s">Lorem ipsum dolor sit amet.</Text>
</Center>
```

```html
<div class="l--center -bd -g:10 -ar:3/2">
  <p class="-fz:l">TEXT</p>
  <p class="-fz:s">Lorem ipsum dolor sit amet.</p>
</div>
```

## 関連プリミティブ

- [l--frame](./l--frame.md) — アスペクト比付きメディアフレーム（`<Center>` と組み合わせられる）
- [l--stack](./l--stack.md) — `ai="center"` で水平中央の内在的な中央寄せが可能
- [l--grid](./l--grid.md) — `ga="1/1"` で重ね配置のオーバーレイ
