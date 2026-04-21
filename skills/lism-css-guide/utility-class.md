# ユーティリティクラス（`u--`）

`u--` プレフィックスを持つユーティリティクラスは、用途が明確なスタイルセットをまとめて適用するクラスです。  
`@layer lism-utility` に属します。

> **Property Class との違い:**  
> Property Class（`-{prop}:{value}`）は個別の CSS プロパティを 1 対 1 で制御するクラスです。  
> ユーティリティクラス（`u--{name}`）は複数のプロパティや子要素への効果をまとめて提供するもので、まったく別の仕組みです。

Lism コンポーネントでの `util` prop による指定方法は [components-core.md](./components-core.md#共通-props) を参照してください。

## TOC

- [コアに含まれるユーティリティ一覧](#コアに含まれるユーティリティ一覧)
- [使用例](#使用例)
- [Opt-in ユーティリティ](#opt-in-ユーティリティ)
- [ユーザー定義のユーティリティクラス](#ユーザー定義のユーティリティクラス)

[詳細](https://lism-css.com/docs/utility-class/)

---

## コアに含まれるユーティリティ一覧

以下は `lism-css` コアの CSS に組み込まれているユーティリティクラスです。

| クラス | 用途 | ソースファイル |
|--------|------|---------------|
| `u--trim` | ハーフレディングのネガティブマージンでテキスト上下の余白を詰める | [`_trimHL.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/utility/_trimHL.scss) |
| `u--trimAll` | 直下の子要素（`:empty`, `figure`, `picture`, `video`, `button`, `textarea`, `table` を除く）にハーフレディングトリムを一括適用する除外方式のクラス | [`_trimHL.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/utility/_trimHL.scss) |
| `u--cbox` | `--keycolor` を使い `color-mix()` で `--c` / `--bgc` / `--bdc` を自動生成する色付きボックス | [`_cbox.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/utility/_cbox.scss) |
| `u--divide` | Grid / Flex の子要素**間**にのみ `box-shadow` で区切り線を表示する | [`_divide.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/utility/_divide.scss) |
| `u--cells` | Grid / Flex の各子要素を `box-shadow` で枠囲みし、table セル風に表示する | [`_divide.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/utility/_divide.scss) |
| `u--srOnly` | スクリーンリーダー専用（視覚的に非表示）。`clip-path: inset(50%)` で実装 | [`_hidden.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/utility/_hidden.scss) |
| `u--clipText` | テキストで背景をクリッピング（`background-clip: text`） | [`_clipText.scss`](https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/utility/_clipText.scss) |


## 使用例

```html
<!-- u--cbox: キーカラーで色付きボックス -->
<div class="u--cbox -bd -p:20" style="--keycolor: var(--blue)">...</div>

<!-- u--trim: テキスト余白の詰め -->
<p class="u--trim">テキスト...</p>

<!-- u--divide: グリッド子要素間の区切り線 -->
<div class="l--grid u--divide" style="--gtc: 1fr 1fr">
  <div>A</div>
  <div>B</div>
</div>
```

```jsx
// JSX での使用（className で指定）
<Lism className="u--cbox" keycolor="red" bd p="20">...</Lism>
<Text className="u--trim">テキスト...</Text>
<Grid className="u--divide" gtc="1fr 1fr">...</Grid>
```


## Opt-in ユーティリティ

コアには含まれないが、ドキュメントで紹介されている追加ユーティリティの例:

- `u--inlineCenter`: 絵文字やインラインアイコンをテキスト中央に揃える

これらは必要に応じて自分で CSS を追加して使用します。


## ユーザー定義のユーティリティクラス

`u--{name}` の命名規則に従えば、独自のユーティリティクラスを自由に定義できます。  
定義は `@layer lism-utility` の中で行ってください。

```css
@layer lism-utility {
  .u--myUtil {
    /* カスタムスタイル */
  }
}
```
