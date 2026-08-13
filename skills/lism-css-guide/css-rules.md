# CSS 設計ルール

## TOC

- [CSS Layer 構造](#css-layer-構造)
- [クラス分類とプレフィックス](#クラス分類とプレフィックス)
- [独自クラスの選び方（2分類）](#独自クラスの選び方2分類)
  - [Block Class（`b--`）](#block-classb--)
  - [Custom Class（`c--`）](#custom-classc--)
- [カスタムCSS を追加する場合](#カスタムcss-を追加する場合)
- [CSS の配置場所](#css-の配置場所)

[詳細](https://lism-css.com/docs/css-methodology.md)

> **命名規則の詳細**: CSS変数名・クラス名・Property Class の `{prop}` / `{value}` の省略ルールについては [naming.md](./naming.md) を参照してください。

---

## CSS Layer 構造

Lism CSS は CSS Layers による詳細度管理を採用しています。
カスタムCSSを追加する場合は、この順序を意識してください。

```
Settings（トークン定義）
  → @layer lism-base（Reset CSS・トークン・set-- クラス）
      → @layer reset（リセットCSS）
  → @layer lism-trait（is-- / has-- Trait Class）
  → @layer lism-primitive
      → @layer layout（l-- Layout Primitive）
      → @layer atomic（a-- Atomic Primitive）
  → @layer lism-block（b-- Block Class — CSS でベーススタイルを管理する基礎部品）
  → @layer lism-custom（ユーザーの独自CSS — c--）
  → @layer lism-utility（u-- ユーティリティクラス）
  → Property Class（レイヤー外 — 最も詳細度が高い）
```

ユーザーが定義する独自クラス・上書きスタイルは、役割に合わせて適切なレイヤーに配置します。
例えば、トークンやベーススタイルの上書きは `@layer lism-base`、`b--` のベーススタイルは `@layer lism-block`、それ以外の独自クラス（`c--`）は `@layer lism-custom` に置きます。

## クラス分類とプレフィックス

[詳細](https://lism-css.com/docs/naming.md)

Lism CSSで定義されるクラスは、その役割とレイヤーの所属が決まっており、その分類によってプレフィックスが定められています。

| 分類 | 役割 | プレフィックス | 例 |
| --- | --- | --- | --- |
| Set Class | ベーススタイル上書き・変数提供 | `set--` | `set--plain`, `set--revert`, `set--hov`, `set--bxsh` |
| Layout Primitive | レイアウトの構成単位となる Primitive | `l--` | `l--grid`, `l--flex`, `l--stack` |
| Atomic Primitive | レイアウトの最小単位となる Primitive | `a--` | `a--icon`, `a--divider` |
| Block Class | ベーススタイルを CSS 側で管理する基礎部品 | `b--` | `b--btn`, `b--badge`, `b--card` |
| Custom Class | Lism 本体に含まれない、ユーザーが自由に定義するカスタムクラス | `c--` | `c--featureList`, `c--header` |
| `is--` Trait | 要素に役割（〜である）を宣言 | `is--` | `is--container`, `is--wrapper`, `is--layer`, `is--boxLink` |
| `has--` Trait | 要素に機能（〜を持つ）を付与 | `has--` | `has--transition`, `has--gutter`, `has--snap`, `has--mask` |
| Utility Class | 用途が明確な装飾系ユーティリティ | `u--` | `u--cbox`, `u--trim`, `u--divide`, `u--enclose` |
| Property Class | 単一プロパティの制御 | `-` | `-fz:l`, `-p:20`, `-d:none` |

**併用ルール:**

- Primitive の併用は禁止（`l--`同士、`a--`同士、`l--`+`a--` はNG）
- Trait の併用は可 (`is--`同士 / `has--`同士、 `is--` + `has--` はOK)
- Trait + Primitive の併用は可 (`is--`/`has--` + `l--`/`a--` はOK)
- `b--` + `b--` は禁止
- `c--` + `c--` は禁止
- `b--` + `c--` は禁止


**`is--` と `has--` の判定軸:**

|  | `is--` | `has--` |
| --- | --- | --- |
| 意味 | 〜である（役割・存在の宣言） | 〜を持つ（機能の付与） |
| CSS 変数 | 必須ではない | 必須（カスタマイズポイントを提供） |

**記述順序:**
class 属性にクラスを直接記述する場合は、以下の順序で並べてください。

```
[規約対象外クラス] [c--] [b--] [a--] [l--] [set--] [is--] [has--] [u--] [-]
```

| # | 区分 |
| --- | --- | 
| 1 | Lismの規約対象外のクラス（外部ライブラリ・JSフック等） |
| 2 | Custom（`c--`） |
| 3 | Block（`b--`） |
| 4 | Atomic Primitive（`a--`） |
| 5 | Layout Primitive（`l--`） |
| 6 | Set Class（`set--`） |
| 7 | Trait Class 役割宣言（`is--`） |
| 8 | Trait Class 機能付与（`has--`） |
| 9 | Utility Class（`u--`） |
| 10 | Property Class（`-{prop}:{value}`） |

```html
<!-- OK -->
<div class="c--nav l--flex -p:20 -g:20">...</div>

<!-- NG: Property Class が先 になっている -->
<div class="-p:20 -g:20 l--flex c--nav">...</div>
```

なお、`class` 属性内の並び順は CSS の適用結果（詳細度・カスケード順）には影響しません。この順序はあくまで可読性と一貫性のための整理です。

## 独自クラスの選び方（2分類）

Lism CSS が提供するクラス（`set--` / `is--` / `has--` / `l--` / `a--` / `u--` / Property Class）以外の、ユーザーが自分で定義するクラスは次の2分類で命名します。

| 分類 | 命名 | 例 | スタイルの書き方 |
| --- | --- | --- | --- |
| サイト共通で繰り返し使う基礎部品（ボタン・バッジ・カード級） | `b--{name}` | `b--btn`, `b--badge` | ベーススタイルを `@layer lism-block` で管理。例外的な調整・BP切り替えは Property Class等を活用 |
| それ以外のカスタムクラス全般（コンポーネント・サイトの領域・ページ固有要素など粒度不問） | `c--{name}` | `c--featureList`, `c--header` | Lismクラス（Trait, Primitive, Property Class など）を中心に組む。何のパーツかを示す名前付けとしてだけ使うのも可。CSS を書く場合は `@layer lism-custom` で管理。 |

- `b--` にできるのは [Block Class（`b--`）](#block-classb--)の3条件をすべて満たす部品だけで、それ以外は `c--` にします。
- 迷ったら `c--` で始め、3条件を満たす部品としてベーススタイルを CSS 側で管理したくなった時点で `b--` へリネームして昇格します。
- 名前は camelCase で付けます。（例: `c--landingHero`）

BEM 構造（本体クラス / Modifier / Element）を持つのは `b--` と `c--` のみです。`a--` / `l--` には適用しません。

| 分類 | 形式 | 例 |
| --- | --- | --- |
| 本体クラス | `b--{name}` / `c--{name}` | `b--btn`, `c--pricing` |
| Modifier | `b--{name}--{modifier}` / `c--{name}--{modifier}` | `b--btn--outline`, `c--pricing--featured` |
| Element | `b--{name}_{element}` / `c--{name}_{element}` | `b--card_header`, `c--pricing_body` |

- Modifier は本体クラスと併記して使用: `.b--btn.b--btn--outline` / `.c--pricing.c--pricing--featured`
- Element は `_`（アンダースコア）一つ区切り
- 同じプレフィックスの本体クラス同士の併用（`.b--xxx.b--yyy` / `.c--xxx.c--yyy`）は基本 NG。ただし次は許容される:
  - 本体クラスと自身の Modifier: `.c--xxx.c--xxx--modifier`
  - 本体クラスと他の本体クラスの Element: `.c--xxx.c--yyy_elem`

### Block Class（`b--`）

`b--` プレフィックスで定義する **Block Class** は、サイト内で繰り返し使う基礎部品（ボタン・バッジ・カード級）で、ベーススタイルを CSS 側（`@layer lism-block`）で管理します。コアの `lism-css` は専用レイヤーを用意するだけで、`b--` クラス自体は提供しません。

次の3条件を**すべて**満たす場合に `b--` を使います。満たさない場合は `c--` にします。

1. サイト内の複数ページ・複数箇所で繰り返し使う共通部品である
2. クラスを1つ付けるだけでベーススタイルがほぼ決まるようにしたい部品である
3. 粒度がボタン・バッジ・カード級の自己完結した部品である

例: 
```css
@layer lism-block {
  .b--btn {
    --bgc: transparent;
    --bdc: transparent;
    padding: var(--s10) var(--s20);
    border-radius: var(--bdrs--20);
    border: solid 1px var(--bdc);
    background-color: var(--bgc);
  }
  .b--btn.b--btn--fill { --bgc: var(--brand); }
  .b--btn.b--btn--outline { --bdc: currentColor; }
}
```

- `b--` と他クラスの併用は禁止ではありません。例外的な調整やブレイクポイント切り替え（`-p_sm` 等）には、`b--` より必ず強い Property Class が便利です。
- `b--` はレイアウトスタイルもCSS側で持てますが、`l--`系クラスとの併用を前提にして組むことも可能です。ただし、レイヤー順序の優劣があるため、レイアウトのバリエーションは Modifierで定義するか Property Class で上書きするのが安全です。

### Custom Class（`c--`）

`c--` プレフィックスで定義する **Custom Class** は、ユーザーが自由に定義できるカスタムクラスです（名前は `lism-custom` レイヤーと対応）。コンポーネント・サイトの領域（ヘッダーやサイドバーなど）・ページ固有の要素など、粒度を問わず使えます。

他のLismクラス（Trait, Primitive, Property Class等）との組み合わせを前提に設計し、CSSへ残すのは、擬似要素・子孫セレクタ・状態セレクタなど、Props/Property Classで表現できないものだけです。（明確な意図があればCSSに一般的なスタイルを書くことも可）

スタイルが全くなく、何のパーツかを示す名前付けのためだけに使っても構いません。

```html
<!-- HTMLで書く場合も、何のパーツかを示す名前 + Primitive + Property Class を優先 -->
<div class="c--myCard l--stack -g:20 -p:30 -bdrs:20 -bxsh:20 -bd">...</div>
```

```jsx
// React/AstroコンポーネントではPropsを優先
export default function MyCard(props) {
  return <Stack className="c--myCard" g="20" p="30" bdrs="20" bxsh="20" bd {...props} />;
}
```

```css
@layer lism-custom {
  .c--myCard::before {
    /* 擬似要素など、Props/Property Classで表せないものだけを書く */
  }
}
```

CSSが空になる場合は、CSSファイル側に`.c--myCard {}`を書かず、何のパーツかを示す名前として`c--myCard`だけ残して構いません。

## カスタムCSS を追加する場合

独自のスタイルを追加する場合は、対象に合った Lism の CSS Layer 内に記述してください。

```css
/* ユーザーの独自CSS（c--） → lism-custom に追加 */
@layer lism-custom {
  .c--myCard[data-is-active]::before { border-color: var(--brand); }
}

/* b-- 基礎部品のベーススタイル → lism-block に追加 */
@layer lism-block { .b--badge { padding: var(--s5) var(--s10); } }

/* ベーススタイルの拡張 → lism-base に追加 */
@layer lism-base {
  .set--myTheme { --brand: #c00; }
}
```

カスタムCSS内でも、できる限り Lism のCSS変数（トークン）を使ってください。また、`c--` のクラスでは、`padding`/`border-radius`/`font-size`/`color`などProperty Class/Propsへ移せる宣言を、CSSに書く前にマークアップ側へ移します（NG→OK例は[antipatterns.md](./antipatterns.md#property-class-で書けるのに-css-で書く)を参照）。ただし`b--`のベーススタイルは対象外で、トークンを使って`@layer lism-block`で管理します。

明確にその数値に意図があり、トークン化・丸め・Property Class化ができない場合だけ、生のCSS値を例外として使用できます。その場合は実装プランに理由を残します。

**レイヤー外に書く場合:**
`@layer` の外（レイヤーなし）でカスタムCSSを書くのは、**Property Class（`-{prop}:{value}`）を拡張する場合のみ**としてください。それ以外のカスタムスタイルは必ずいずれかの `@layer` 内に記述します。

```css
/* Property Class の拡張のみレイヤー外に書ける */
.-myProp\:myValue { ... }
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
/* 独自クラスの CSS は lism-custom 内に定義する（b-- のベーススタイルだけ lism-block） */
@layer lism-custom {
  .c--yourComponent {
    ...
  }
}
```
