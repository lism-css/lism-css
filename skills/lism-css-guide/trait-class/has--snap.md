# has--snap

`scroll-snap-*` 系のプロパティを CSS 変数経由でセットする Trait クラス。横スクロールカルーセルなどで子要素のスナップ位置を制御したい時に使う。

## 基本情報

- クラス名: `has--snap`
- Lism props: `hasSnap`（`<Lism hasSnap>` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/has/_snap.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/trait-class/#has--snap

## SCSS 定義

```scss
.has--snap {
  --snapType: both mandatory;
  --snapAlign: start;
  --snapStop: normal;
  scroll-snap-type: var(--snapType);

  & > * {
    scroll-snap-align: var(--snapAlign);
    scroll-snap-stop: var(--snapStop);
  }
}
```

自身に `scroll-snap-type` を、**直下の子要素**に `scroll-snap-align` / `scroll-snap-stop` を適用する構造。

## CSS 変数

| 変数 | 役割 | デフォルト |
|------|------|-----------|
| `--snapType` | `scroll-snap-type` | `both mandatory` |
| `--snapAlign` | 子要素の `scroll-snap-align` | `start` |
| `--snapStop` | 子要素の `scroll-snap-stop` | `normal` |

## Usage

`ov="auto"`（または `overflow: auto`）と一緒に使い、スクロールコンテナとして成立させる必要がある。

```html
<div class="has--snap -ov:auto -ar:16/9 -bd">
  <div class="l--frame -ar:16/9 -p:15"><img src="..." /></div>
  <div class="l--frame -ar:16/9 -p:15"><img src="..." /></div>
  <div class="l--frame -ar:16/9 -p:15"><img src="..." /></div>
</div>
```
```jsx
<Box hasSnap ov="auto" ar="16/9" bd>
  <Frame ar="16/9" p="15"><img src="..." /></Frame>
  <Frame ar="16/9" p="15"><img src="..." /></Frame>
  <Frame ar="16/9" p="15"><img src="..." /></Frame>
</Box>
```

### スナップ方向を水平だけに限定する例

```html
<div class="has--snap -ov:auto" style="--snapType: x mandatory">...</div>
```
```jsx
<Box hasSnap ov="auto" style={{ '--snapType': 'x mandatory' }}>...</Box>
```

## 関連

- `-ov:*` プロパティクラス — スクロールコンテナ化に必須
