# レスポンシブ対応

Lism CSS はコンテナクエリをデフォルトで採用しています。  
ブレークポイント: `sm: 480px`, `md: 800px`（`lg: 1120px` はカスタマイズにより利用可能）

## TOC

- [HTML / Property Class での指定](#html--property-class-での指定)
- [Lism コンポーネントでの指定](#lism-コンポーネントでの指定)

[詳細](https://lism-css.com/docs/responsive/)

---

## HTML / Property Class での指定

ブレークポイント用のクラス `-{prop}_{bp}` と CSS変数 `--{prop}_{bp}` を組み合わせます。

```html
<!-- sm 以上で p:30, md 以上で p:40 に切り替え -->
<div class="-p:20 -p_sm -p_md" style="--p_sm: var(--s30); --p_md: var(--s40)">
  ...
</div>

<!-- sm 以上で fz を l に切り替え -->
<div class="-fz:s -fz_sm" style="--fz_sm: var(--fz--l)">
  ...
</div>
```

**仕組み:**
1. `-p_sm` クラスは `@container (min-width: 480px)` 内で `padding: var(--p_sm)` を適用
2. `--p_sm` 変数で切り替え先の値を指定
3. `overwriteBaseVar` 対応の Prop はベース変数（`--p`）も上書きされる

## Lism コンポーネントでの指定

配列形式またはオブジェクト形式でレスポンシブ値を指定します。

```jsx
// 配列形式: [デフォルト, sm, md]
<Box p={[20, 30, 40]} fz={['s', 'm', 'l']} />

// オブジェクト形式
<Box p={{ base: '20', sm: '30', md: '40' }} />
```

出力される HTML:

```html
<div class="l--box -p:20 -p_sm -p_md -fz:s -fz_sm -fz_md"
     style="--p_sm: var(--s30); --p_md: var(--s40); --fz_sm: var(--fz--m); --fz_md: var(--fz--l)">
</div>
```
