# is--wrapper / `<Wrapper>`

直下のコンテンツ幅を一括制御するクラス。`max-width` とセンタリングを担い、記事・セクションのコンテンツ幅の統一に使います。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/trait-class/is--wrapper.md

## 使い方

`<Wrapper>` は `<Lism isWrapper>` のエイリアスです。`isWrapper` Prop は他のコンポーネントにも使用できます（例: `<Flow isWrapper>`）。

| 指定 | 出力 |
|------|------|
| `isWrapper` | `is--wrapper` |
| `isWrapper="s"` | `is--wrapper -contentSize:s` |
| `isWrapper="m"` | `is--wrapper -contentSize:m` |
| `isWrapper="l"` | `is--wrapper -contentSize:l` |
| `isWrapper="xl"` | `is--wrapper -contentSize:xl` |
| `isWrapper="20rem"`（任意値） | `is--wrapper` + `style="--contentSize: 20rem"` |

## 専用Props

| Prop | 説明 |
|------|------|
| `contentSize` | コンテンツサイズ。`s` / `m` / `l` / `xl` / トークン / 任意値 |

```jsx
// 下記の ① と ② は同じ結果
<Flow isWrapper="s" isContainer>...</Flow>
<Wrapper contentSize="s" layout="flow" isContainer>...</Wrapper>
```

## 直下の子要素の挙動

`is--wrapper` 直下の子要素には次のスタイルが当たる：

```scss
.is--wrapper {
  --contentSize: var(--sz--m, 100%);
  > * {
    inline-size: 100%;
    max-inline-size: min(100%, var(--contentSize));
    margin-inline: auto;
  }
}
```

- `--contentSize` の初期値は `var(--sz--m, 100%)`（`m` 相当）。`-contentSize:s` / `-contentSize:m` / `-contentSize:l` / `-contentSize:xl` のプリセットクラスは `contentSize` Prop の auto-generated 出力から props 層へ自動生成される
- `inline-size: 100%` により、自然幅が `--contentSize` 未満の要素（短い段落、`<table>` など）も常に親幅まで広げてから `max-inline-size` で制限される。これにより `l--stack` などの flex 縦並び配下でも横幅が揃い、ガタつきが起きない
- `<table>` を直下に置くと内容依存の自然幅にはならず、常に wrapper 幅まで広がる。テーブルの自然幅を保ちたい場合は `is--wrapper` を直接の親にしないように、間に別の要素を挟む

## 関連プリミティブ

- [is--container](./is--container.md) — コンテナクエリ基準（`isContainer` と併用可）
- [l--flow](../primitives/l--flow.md) — 記事フローレイアウト（`layout="flow"` で結合）
- [l--box](../primitives/l--box.md) — 汎用ボックス
