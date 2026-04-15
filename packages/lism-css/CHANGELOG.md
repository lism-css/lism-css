# lism-css CHANGELOG

## Unreleased

### BREAKING CHANGES

- `<Lism>` / `getLismProps` から `lismClass` と `variant` を完全撤去し、`className` 一本に集約しました。
  - 以前: `<Lism lismClass="c--box" variant="primary" />`
  - 以後: `<Lism className="c--box c--box--primary" />`
- BEM の modifier 展開が必要な場合は `@lism-css/ui` の `buildModifierClass` ヘルパーを使って UI コンポーネント側で組み立てます。
- クラスの出力順が `[className] [lismClass] [primitiveClass] [uClasses]` から `[className] [primitiveClass] [uClasses]` に変わりました。`className` に `c--*` を書いた場合の最終位置は従来と同じ（先頭）です。
- `LismPropsBase` / `LayoutProps` / `AtomicProps` の `lismClass?` と `LismPropsBase.variant?` を削除しました。型エラーが出た場合は `className` に置き換えてください。
