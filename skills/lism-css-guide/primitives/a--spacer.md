# a--spacer / `<Spacer>`

要素間のスペースを確保するクラス。`<Spacer>` は `<Lism atomic="spacer" aria-hidden="true" />` のエイリアスとして用意されています。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/a--spacer.md

## 専用Props

`<Spacer>`では **`w` / `h` に対してSPACEトークンの値**が使えます（他のコンポーネントではSIZEトークンが優先されるため、スペースサイズを直感的に指定できる特殊対応）。

## 関連プリミティブ

- [a--divider](./a--divider.md) — 区切り線
- [a--decorator](./a--decorator.md) — 装飾用空要素
- [l--stack](./l--stack.md) — `gap` で余白を管理する縦積み
