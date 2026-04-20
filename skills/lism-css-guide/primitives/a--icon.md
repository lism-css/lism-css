# a--icon / `<Icon>`

アイコン要素を表示するためのクラス。`flex-shrink: 0`、デフォルトサイズ `1em`。

## 基本情報

- クラス名: `a--icon`
- コンポーネント: `<Icon>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/primitives/atomic/_icon.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/primitives/a--icon/

## 出力されるHTML構造

`<Icon>` は `label` の有無でアクセシビリティ属性を自動切り替えします。

```html
<!-- label なし -->
<svg class="a--icon" aria-hidden="true">...</svg>

<!-- label あり -->
<svg class="a--icon" aria-label="..." role="img">...</svg>
```

## 専用Props

| Prop | 説明 |
|------|------|
| `icon` | アイコンを指定。文字列（プリセット名）・オブジェクト（`{as, ...exProps}`）のどちらでも可 |
| `size` | プリセットアイコン使用時の `width` / `height`（通常は `fz` で指定するほうが推奨） |
| `label` | `aria-label` として出力。指定があれば `role="img"`、なければ `aria-hidden="true"` |

## Usage

`<Icon>` には**4つの使い方**があります。

### 1. 外部パッケージのアイコンを使う（`as` + `exProps`）

`react-icons`, `@phosphor-icons/react`, `lucide-react` などのサードパーティアイコンコンポーネントを `as` で渡すと、Lism が未処理の props は自動的にそのコンポーネントに転送されます。外部コンポーネント専用の props を明示的に分離したい場合は `exProps` を使います。

```jsx
import { SmileyIcon } from '@phosphor-icons/react';
import { Icon } from 'lism-css/react';

// 基本形
<Icon as={SmileyIcon} fz="2rem" />

// exProps で外部 props を明示的に分離
<Icon as={SmileyIcon} exProps={{ weight: 'fill', size: '3em' }} c="blue" />

// 上と同じ結果（Lism が "weight" を処理しないため最終的に SmileyIcon に渡る）
<Icon as={SmileyIcon} weight="fill" c="blue" />
```

### 2. `as` と `exProps` を `icon` prop に一括指定

`icon={{as: Component, ...exProps}}` の形式で、`as` と `exProps` を1つのオブジェクトとしてまとめて渡せます。アイコンを選択制にする親コンポーネントを作るときに便利です。

```jsx
import { Home } from 'lucide-react';

<Icon icon={{ as: Home, strokeWidth: 1, size: 64 }} />

// 同じ結果（分割形式）
<Icon as={Home} exProps={{ strokeWidth: 1, size: 64 }} />
```

### 3. プリセットアイコンを使う

`lism-css` パッケージ内に [Phosphor Icons](https://phosphoricons.com/) ベースのプリセットアイコンが同梱されています。`icon="アイコン名"` の文字列で呼び出せます。

```jsx
<Icon icon="menu" />
<Icon icon="lightbulb" fz="2xl" c="blue" />
<Icon icon="warning" size="40px" />
```

プリセット一覧のエクスポート元:

```jsx
import { phIcons, logoIcons } from 'lism-css/react/atomic/Icon/presets';
```

### 4. SVG の `path` を直接記述する

`viewBox` を指定すると `<svg>` 要素として出力されるため、子要素に `<path>` 等をそのまま書けます。

```jsx
<Icon viewBox="0 0 256 256" label="Smiley icon" fz="4xl" c="blue">
  <path d="M128,24A104,104,0,1,0,232,128..." />
</Icon>
```

### 5. `src` で画像をアイコンとして使う

`src` を指定すると `<img>` として出力されます（厳密には4パターンに加えて画像指定も可能）。

```jsx
<Icon fz="4xl" src="/img/avatar01.jpg" alt="avatar" />
```

## 関連プリミティブ

- [a--divider](./a--divider.md) — 区切り線
- [a--spacer](./a--spacer.md) — 空白要素
- [a--decorator](./a--decorator.md) — 装飾用要素
