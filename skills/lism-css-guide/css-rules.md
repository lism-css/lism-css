# CSS 設計ルール

## TOC

- [CSS Layer 構造](#css-layer-構造)
- [プレフィックスとクラス分類](#プレフィックスとクラス分類)
- [Component Class（`c--`）](#component-classc--)
- [カスタムCSS を追加する場合](#カスタムcss-を追加する場合)
- [CSS の配置場所](#css-の配置場所)

[詳細](https://lism-css.com/docs/css-methodology/)

> **命名規則の詳細**: CSS変数名・クラス名・Property Class の `{prop}` / `{value}` の省略ルールについては [naming.md](./naming.md) を参照してください。

---

## CSS Layer 構造

Lism CSS は CSS Layers による詳細度管理を採用しています。
カスタムCSSを追加する場合は、この順序を意識してください。

```
Settings（トークン定義）
  → @layer lism-base（Reset CSS・トークン・.set--クラス）
      → @layer reset（リセットCSS）
  → @layer lism-trait（.is-- / .has-- Trait Class）
  → @layer lism-primitive
      → @layer layout（.l-- Layout Primitive）
      → @layer atomic（.a-- Atomic Primitive）
  → @layer lism-component（.c-- Component Class — BEM 構造を持つ UI 部品）
  → @layer lism-custom（ユーザーカスタマイズ用）
  → @layer lism-utility（.u-- ユーティリティクラス）
  → Property Class（レイヤー外 — 最も詳細度が高い）
```


## クラス分類とプレフィックス

[詳細](https://lism-css.com/docs/naming/)

Lism CSSで定義されるクラスは、その役割とレイヤーの所属が決まっており、その分類によってプレフィックスが定められています。

| 分類 | 役割 | プレフィックス | 例 |
|---|---|---|---|
| Set Class | ベーススタイル上書き・変数提供 | `set--` | `.set--plain`, `.set--revert`, `.set--var:hov`, `.set--var:bxsh` |
| Layout Primitive | レイアウトの構成単位となる Primitive | `l--` | `.l--grid`, `.l--flex`, `.l--stack` |
| Atomic Primitive | レイアウトの最小単位となる Primitive | `a--` | `.a--icon`, `.a--divider` |
| Component Class | BEM 構造を持つ UI 部品 | `c--` | `.c--button`, `.c--accordion` |
| `is--` Trait | 要素に役割（〜である）を宣言 | `is--` | `.is--container`, `.is--wrapper`, `.is--layer`, `.is--boxLink` |
| `has--` Trait | 要素に機能（〜を持つ）を付与 | `has--` | `.has--transition`, `.has--gutter`, `.has--snap`, `.has--mask` |
| Utility Class | 用途が明確な装飾系ユーティリティ | `u--` | `.u--cbox`, `.u--trim`, `.u--divide`, `.u--cells` |
| Property Class | 単一プロパティの制御 | `-` | `.-fz:l`, `.-p:20`, `.-d:none` |

**併用ルール:**
- `.l--` と `.c--` は併用OK（例: `<div class="l--flex c--nav">`）
- 同カテゴリ内の Primitive 併用は不可（例: `.l--flex` と `.l--grid`、`.a--icon` と `.a--divider` は同要素に付けない）
- `.l--` × `.a--` は非推奨（役割的に同居しない想定）
- `.is--` / `.has--` 同士は併用OK（Trait は複数併用できる）
- `.is--` / `.has--` × `.l--` / `.a--` も併用OK
- `c--` の Block 同士の併用（`.c--xxx.c--yyy`）は基本 NG。ただし以下は許容:
  - Block と自身の Modifier: `.c--button.c--button--outline`
  - Block と他 Block の Element: `.c--xxx.c--yyy_elem`
- 子要素: `.c--card_header`, `.c--card_body`（`c--` のみ Element を持つ。`_` 一つ区切り）

**`is--` と `has--` の判定軸:**

|  | `is--` | `has--` |
|---|---|---|
| 意味 | 〜である（役割・存在の宣言） | 〜を持つ（機能の付与） |
| CSS 変数 | 必須ではない | 必須（カスタマイズポイントを提供） |

**記述順序:**
class 属性にクラスを直接記述する場合は、以下の順序で並べてください。

```
[customClass] [c--] [a--] [l--] [set--] [is--] [has--] [u--] [-]
```

| # | 区分 | 例 |
|---|---|---|
| 1 | 独自クラス（`customClass`） | `z--header`, `hoge` |
| 2 | Component（`c--`） | `c--box`, `c--box--primary` |
| 3 | Atomic Primitive（`a--`） | `a--icon`, `a--divider` |
| 4 | Layout Primitive（`l--`） | `l--flex`, `l--columns` |
| 5 | Set Class（`set--`） | `set--var:hov`, `set--var:bxsh` |
| 6 | Trait Class 役割宣言（`is--`） | `is--wrapper`, `is--layer` |
| 7 | Trait Class 機能付与（`has--`） | `has--transition`, `has--gutter` |
| 8 | Utility Class（`u--`） | `u--cbox`, `u--trim` |
| 9 | Property Class（`-`） | `-p:20`, `-bgc:base-2`, `-hov:-c` |

```html
<!-- OK -->
<div class="c--nav l--flex -p:20 -g:20">...</div>

<!-- NG: Property Class が先 になっている -->
<div class="-p:20 -g:20 l--flex c--nav">...</div>
```

なお、`class` 属性内の並び順は CSS の適用結果（詳細度・カスケード順）には影響しません。この順序はあくまで可読性と一貫性のための整理です。


## Component Class（`c--`）

`c--` プレフィックスで定義する **Component クラス** は、Primitive を組み合わせて作られた具体的な UI 部品です。`@layer lism-component` に配置され、コアの `lism-css` には含まれず、`@lism-css/ui` パッケージやユーザー定義として提供されます。

`c--` クラスは BEM 構造（Block / Modifier / Element）を持つことができ、それぞれ次の形式で定義します。

| 分類 | 形式 | 例 |
|---|---|---|
| Block | `.c--{name}` | `.c--button`, `.c--card` |
| Modifier | `.c--{name}--{modifier}` | `.c--button--outline` |
| Element | `.c--{name}_{element}` | `.c--card_header`, `.c--card_body` |

- Modifier は Block と併記して使用: `.c--button.c--button--outline`
- Element は `_`（アンダースコア）一つ区切り
- Block 同士の併用（`.c--xxx.c--yyy`）は基本 NG。ただし次は許容される:
  - Block と自身の Modifier: `.c--xxx.c--xxx--variant`
  - Block と他 Block の Element: `.c--xxx.c--yyy_elem`
- `a--` / `l--` には `variant` の BEM 展開は適用されない**

`c--` を使った独自コンポーネントを使う場合でも、他の Primitive クラス（`.l--`, `.is--`）や Property Class（`-{prop}:{value}`）との組み合わせを前提とした設計にすることで CSS の記述量を削減できます。`c--` クラスにスタイルが全くなく、HTML 側での可視性を高める名前付けのためだけに利用しても構いません。


### 作成例

`l--stack` と併用する前提でのカスタムクラス例:

```css
@layer lism-component {
  .c--myCard {
    gap: var(--s20);
    padding: var(--s30);
    border-radius: var(--bdrs--20);
    box-shadow: var(--bxsh--20);
    border: 1px solid currentColor;
    /* ... */
  }
}
```

```html
<div class="c--myCard l--stack">
  ...
</div>
```

素の HTML サイトではこのように `c--` クラスに CSS を書いてスタイリングしても問題ありませんが、React などでコンポーネントを作成できる場合は、特別な理由がない限り Property Class を活用してください。

```jsx
export default function MyCard(props) {
  return <Stack lismClass="c--myCard" g="20" p="30" bdrs="20" bxsh="20" bd {...props} />;
}
```

```css
@layer lism-component {
  .c--myCard {
    /* 複雑なスタイルがあれば css で書く */
  }
}
```


## カスタムCSS を追加する場合

独自のスタイルを追加する場合は、対象に合った Lism の CSS Layer 内に記述してください。

```css
/* カスタムコンポーネント → lism-component に追加 */
@layer lism-component {
  .c--my-card {
    border: 1px solid var(--brand);
    border-radius: var(--bdrs--20);
    padding: var(--s30);
  }
}

/* ベーススタイルの拡張 → lism-base に追加 */
@layer lism-base {
  .set--my-theme {
    --brand: #c00;
  }
}
```

カスタムCSS内でも、できる限り Lism のCSS変数（トークン）を使ってください。

```css
/* NG */
.c--my-card { padding: 24px; border-radius: 8px; }

/* OK */
.c--my-card { padding: var(--s30); border-radius: var(--bdrs--20); }
```

ただし、明確にその数値に意図がある場合は、生のCSS値を使用しても構いません。

**レイヤー外に書く場合:**
`@layer` の外（レイヤーなし）でカスタムCSSを書くのは、**Property Class（`-{prop}:{value}`）を拡張する場合のみ**としてください。それ以外のカスタムスタイルは必ずいずれかの `@layer` 内に記述します。

```css
/* OK: Property Class の拡張はレイヤー外 */
.-myProp\:myValue { ... }

/* NG: コンポーネントやユーティリティをレイヤー外に書かない */
.c--my-card { ... }
```


## CSS の配置場所

### グローバル CSS（サイト全体）

Lism のトークン変数のカスタマイズやベーススタイルの上書きは、サイト全体で読み込むグローバル CSS ファイルに記述します。（lism-cssの`main.css`ファイルよりあとで読み込むこと）。

```css
/* global.css などで適切な @layer で定義すること */
@layer lism-base {
  :root {
    --brand: #c00;
    --link-c: #0066cc;
    --fw--bold: 700;
  }
}
```

### コンポーネント CSS

コンポーネント固有のスタイルは、そのコンポーネントを定義しているファイルに紐づけます。

- `.jsx` / `.tsx` ファイル: CSS ファイルを `import` する
- `.astro` ファイル: `import` するか、コンポーネントファイル内の `<style>` タグに記述

```css
/* コンポーネント用CSS は lism-component 内に定義する */
@layer lism-component {
  .c--yourComponent {
    ...
  }
}
```
