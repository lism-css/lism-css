# is--vertical

要素に縦書きモード（`writing-mode`）を適用するモジュールクラス。対応するコンポーネントエイリアスはありません（直接クラス指定で使用）。

## 基本情報

- クラス名: `is--vertical`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/modules/state/_vertical.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/modules/is--vertical/

## クラスバリエーション

縦書き用の値はトークン（`--vertical-mode`）で管理されており、`lang` 属性に合わせて `vertical-rl` / `vertical-lr` を上書きできます。

| クラス名 | 説明 |
|---------|------|
| `is--vertical` | 常に縦書きモードにする |
| `is--vertical@sm` | `sm` サイズ以上で縦書きにする |
| `is--vertical@md` | `md` サイズ以上で縦書きにする |

**注意**: `is--vertical@sm`, `is--vertical@md` を使う場合は、**`set--bp` クラスを併用する必要があります**。

## Usage

### 常に縦書き

```html
<div class="is--vertical">
  <p>縦書きテキスト...</p>
</div>
```

### `sm` 以上で縦書きにする

```jsx
<Flow set="gutter" py="20" w="100%" h="20em" className="is--vertical@sm set--bp">
  <p>本文テキスト...</p>
  <p>本文テキスト...</p>
</Flow>
```

```html
<div class="is--vertical@sm set--bp l--flow set--gutter -py:20 -w:100% -h" style="--h: 20em">
  <p>本文テキスト...</p>
  <p>本文テキスト...</p>
</div>
```

## 関連モジュール

- [l--flow](./l--flow.md) — 縦書きコンテンツと組み合わせる記事フロー
- [is--wrapper](./is--wrapper.md) — コンテンツ幅の制限
