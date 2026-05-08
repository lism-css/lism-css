# is--bleed

要素を**直近の `is--container` 幅まで広げて中央配置**する役割宣言クラス。`is--wrapper` の内側にあっても、wrapper の制約を越えて container 基準の幅まで広がる。

旧 `-max-sz:container`（v0.17.0 で廃止）の置き換え。

> 注意: `bleed` は印刷用語で「裁ち落とし」を意味するが、ここでの基準は **viewport ではなく container**。`is--container` ごとに `--sz--container` が更新されるため、直近の container を基準に幅が決まる。viewport 端まで広げたい場合は、`is--container` を持つ最も外側のラッパーで使う。

## 基本情報

- クラス名: `is--bleed`
- Lism props: `isBleed`（`<Lism isBleed>` 等）
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/is/_bleed.scss
- 公式ドキュメント: https://lism-css.com/docs/trait-class/is--bleed.md

## CSS

```scss
.is--bleed {
  inline-size: auto;
  max-inline-size: var(--sz--container, 100cqi);
  margin-inline: calc(50% - var(--sz--container) / 2);
}
```

`margin-inline` で中央配置されるので、`is--wrapper` の内側にあっても container 基準の幅に広げつつ中央に揃う。`inline-size: auto` は、親が `is--wrapper` の場合に当たる `inline-size: 100%` を打ち消すためのリセット。

## 使い方

`isBleed` Prop は他のコンポーネントにも使用できます（例: `<Box isBleed>`）。

| Prop | 出力 |
|------|------|
| `isBleed` | `is--bleed` |

## Usage

### container 基準のサイズ

```jsx
<Container>
  <Wrapper contentSize="s">
    <p>狭めのコンテンツ</p>
    <Lism isBleed>container 基準まで広がる要素</Lism>
  </Wrapper>
</Container>
```

```html
<div class="is--container">
  <div class="is--wrapper -contentSize:s">
    <p>狭めのコンテンツ</p>
    <div class="is--bleed">
      container 基準まで広がる要素
    </div>
  </div>
</div>
```

フルブリードレイアウトなど、`is--wrapper` の制約を超えてコンテンツを広げたい時に活用できる。

## 関連

- [is--container](./is--container.md) — `is--bleed` の基準となるコンテナ
- [is--fullwide](./is--fullwide.md) — 親要素のサイズいっぱいに広げる
- [is--wrapper](./is--wrapper.md) — コンテンツ幅の制限
