# l--flow / `<Flow>`

子要素間の余白を `margin-block-start` で管理するフローレイアウト。**記事コンテンツなどテキスト主体のフローレイアウト**に最適。

## 基本情報

- クラス名: `l--flow`
- コンポーネント: `<Flow>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/layout/_flow.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/l--flow/

## 余白の仕組み

`l--flow` 直下の子要素は、`--flow` 変数と `margin-block-start` で間隔が管理されます。見出しタグ（`h1`〜`h6`）のみ余白が大きくなり、`calc(var(--flow) * 2 + 0.5em)` で計算されます。

| クラス | 余白量 |
|--------|-------|
| `.l--flow` | `--flow--base`（`--s30`） |
| `.l--flow.-flow:s` | `--flow--s`（`--s20`） |
| `.l--flow.-flow:` | `--flow` を直接指定した値 |

## 専用Props

| Prop | 説明 |
|------|------|
| `flow` | `--flow` の値を指定。`s` / `l` などのトークン値を渡すと `.-flow:{value}` クラスが付与、任意値を渡すと `.-flow:` + `style="--flow:..."` が出力される |

## Usage

### 基本的な使い方

```jsx
<Flow>
  <p>本文1...</p>
  <p>本文2...</p>
  <h2>Heading 2</h2>
  <p>本文3...</p>
  <ul>
    <li>リスト項目1</li>
    <li>リスト項目2</li>
  </ul>
</Flow>
```

```html
<div class="l--flow">
  <p>本文1...</p>
  <p>本文2...</p>
  <h2>Heading 2</h2>
  <p>本文3...</p>
  <ul>...</ul>
</div>
```

### 余白量をトークンで変える（`flow="s"`）

```jsx
<Flow flow="s">
  <p>本文...</p>
  <h2>Heading</h2>
  <p>本文...</p>
</Flow>
```

```html
<div class="l--flow -flow:s">
  <p>本文...</p>
  <h2>Heading</h2>
  <p>本文...</p>
</div>
```

### 任意の値を指定する

トークン値以外を `flow` に渡すと、`-flow:` クラスと `--flow` CSS変数で出力されます。

```jsx
<Flow flow="10px">
  <p>本文...</p>
  <p>本文...</p>
</Flow>
```

```html
<div class="l--flow -flow:" style="--flow:10px">
  <p>本文...</p>
  <p>本文...</p>
</div>
```

## `is--skipFlow`

`l--flow` 直下で使用し、**次の兄弟要素との余白を打ち消す**トレイトクラス。フローコンテンツの先頭に `position: absolute` な要素を配置したい場合などに使用します。

```html
<div class="l--flow">
  <div class="is--skipFlow">スキップ対象</div>
  <p>本文1（上の要素との余白が打ち消される）</p>
  <p>本文2</p>
</div>
```

`is--skipFlow` は `l--flow` 専用のトレイトクラスで、独立したドキュメントは持ちません。

## 入れ子時の注意点

`l--flow` の直下で `l--flow` をネストして `--flow` をカスタム値で直接指定すると、**その子側の `l--flow` 自身の `margin-block-start` にも影響**が出ます。直下にネストせず、別要素で一度ラップすれば回避できます。

```jsx
// NG: 直下ネストで --flow を上書きすると親子両方に影響
<Flow>
  <p>親コンテンツ</p>
  <Flow flow="5px">  {/* この Flow 自体の上マージンも 5px になる */}
    <p>子コンテンツ</p>
  </Flow>
</Flow>

// OK: 間に1段ラップを挟む
<Flow>
  <p>親コンテンツ</p>
  <div>
    <Flow flow="5px">
      <p>子コンテンツ</p>
    </Flow>
  </div>
</Flow>
```

またネストされた `l--flow` は、`--flow` が未定義の場合 `--flow--base` ではなく**親の値を継承**することにも注意してください。

## 関連プリミティブ

- [l--stack](./l--stack.md) — `gap` で余白を管理する縦積み（こちらは Flexbox）
- [is--wrapper](../trait-class/is--wrapper.md) — 記事コンテンツ幅の制限用ラッパー（`l--flow` とセットで使うことが多い）
