# @lism-css/ui CHANGELOG

## Unreleased

### BREAKING CHANGES

- lism-css 側で `lismClass` / `variant` が撤去されたことに合わせて、`@lism-css/ui` 配下のコンポーネントも `className` 一本で BEM ルートクラス・modifier を組み立てる形に変更しました。
  - 以前: `<Chat variant="think" />` → 内部で `lismClass="c--chat"` + `variant` を Lism に渡して `c--chat c--chat--think` を出力。
  - 以後: `<Chat variant="think" />` → 内部で `buildModifierClass('c--chat', { variant })` を `className` に合成して出力。ユーザー側の API は変わりません。
- Button / Badge / Tabs.Root / Chat は引き続き `variant` prop を受け付けますが、内部実装は `buildModifierClass` に置き換わっています。
- Accordion / Details / Modal / Alert / Callout / NavMenu / ShapeDivider の `getProps` が受け取る `lismClass` プロパティは廃止し、`className` に統一しました。外側から `lismClass` を渡していた場合は `className` へ置き換えてください。

- `NavMenu.Link`（Astro・React）のデフォルト要素を `span` から `a` に変更しました。`href` を渡さずに使用していた場合、レンダリングされる HTML タグが変わります。`as="span"` を明示して以前の挙動を維持できます。

### ADDED

- `helper/buildModifierClass`: BEM ルートクラスに対して modifier クラスを展開する純粋関数を追加しました。
  ```ts
  buildModifierClass('c--chat', { variant: 'speak' })
  // → 'c--chat c--chat--speak'
  ```
