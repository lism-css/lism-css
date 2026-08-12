# CSS 設計ルール

## TOC

- [CSS Layer 構造](#css-layer-構造)
- [クラス分類とプレフィックス](#クラス分類とプレフィックス)
- [Block Class（`b--`）](#block-classb--)
- [Component Class（`c--`）](#component-classc--)
- [カスタムCSS を追加する場合](#カスタムcss-を追加する場合)
- [独自プレフィックス](#独自プレフィックス)
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
  → @layer lism-custom（ユーザーの独自CSS — c-- / z-- / プレフィックスなし）
  → @layer lism-utility（u-- ユーティリティクラス）
  → Property Class（レイヤー外 — 最も詳細度が高い）
```

ユーザーが独自クラスのCSSを置くレイヤーは2つです。`b--` のベーススタイルは `@layer lism-block`、それ以外（`c--` / `z--` / プレフィックスなしのクラス）は `@layer lism-custom` に置きます。トークンやベーススタイルの上書きは `@layer lism-base` に置きます。

## クラス分類とプレフィックス

[詳細](https://lism-css.com/docs/naming.md)

Lism CSSで定義されるクラスは、その役割とレイヤーの所属が決まっており、その分類によってプレフィックスが定められています。

| 分類 | 役割 | プレフィックス | 例 |
| --- | --- | --- | --- |
| Set Class | ベーススタイル上書き・変数提供 | `set--` | `set--plain`, `set--revert`, `set--hov`, `set--bxsh` |
| Layout Primitive | レイアウトの構成単位となる Primitive | `l--` | `l--grid`, `l--flex`, `l--stack` |
| Atomic Primitive | レイアウトの最小単位となる Primitive | `a--` | `a--icon`, `a--divider` |
| Block Class | ベーススタイルを CSS 側で管理する基礎部品 | `b--` | `b--btn`, `b--badge`, `b--card` |
| Component Class | BEM 構造を持つ UI 部品 | `c--` | `c--featureCard`, `c--nav` |
| `is--` Trait | 要素に役割（〜である）を宣言 | `is--` | `is--container`, `is--wrapper`, `is--layer`, `is--boxLink` |
| `has--` Trait | 要素に機能（〜を持つ）を付与 | `has--` | `has--transition`, `has--gutter`, `has--snap`, `has--mask` |
| Utility Class | 用途が明確な装飾系ユーティリティ | `u--` | `u--cbox`, `u--trim`, `u--divide`, `u--enclose` |
| Property Class | 単一プロパティの制御 | `-` | `-fz:l`, `-p:20`, `-d:none` |

**併用ルール:**

- `l--` と `c--` は併用OK（例: `<div class="l--flex c--nav">`）
- 同カテゴリ内の Primitive 併用は不可（例: `l--flex` と `l--grid`、`a--icon` と `a--divider` は同要素に付けない）
- `l--` × `a--` は非推奨（役割的に同居しない想定）
- `is--` / `has--` 同士は併用OK（Trait は複数併用できる）
- `is--` / `has--` × `l--` / `a--` も併用OK
- `b--` / `c--` 同士の併用ルールとBEM構造は[Block Class（`b--`）](#block-classb--)・[Component Class（`c--`）](#component-classc--)を参照
- `b--` × `l--` / `is--` / `has--` も併用OK。ただし `b--` の方がレイヤーが強く、衝突する宣言は効かない（上書きは Property Class で行う）

**`is--` と `has--` の判定軸:**

|  | `is--` | `has--` |
| --- | --- | --- |
| 意味 | 〜である（役割・存在の宣言） | 〜を持つ（機能の付与） |
| CSS 変数 | 必須ではない | 必須（カスタマイズポイントを提供） |

**記述順序:**
class 属性にクラスを直接記述する場合は、以下の順序で並べてください。

```
[customClass] [b--] [c--] [a--] [l--] [set--] [is--] [has--] [u--] [-]
```

| # | 区分 | 例 |
| --- | --- | --- |
| 1 | 独自クラス（`customClass`） | `z--header`, `frontHero` |
| 2 | Block（`b--`） | `b--btn`, `b--btn--outline` |
| 3 | Component（`c--`） | `c--box`, `c--box--primary` |
| 4 | Atomic Primitive（`a--`） | `a--icon`, `a--divider` |
| 5 | Layout Primitive（`l--`） | `l--flex`, `l--columns` |
| 6 | Set Class（`set--`） | `set--hov`, `set--bxsh` |
| 7 | Trait Class 役割宣言（`is--`） | `is--wrapper`, `is--layer` |
| 8 | Trait Class 機能付与（`has--`） | `has--transition`, `has--gutter` |
| 9 | Utility Class（`u--`） | `u--cbox`, `u--trim` |
| 10 | Property Class（`-`） | `-p:20`, `-bgc:base-2`, `-hov:-c` |

```html
<!-- OK -->
<div class="c--nav l--flex -p:20 -g:20">...</div>

<!-- NG: Property Class が先 になっている -->
<div class="-p:20 -g:20 l--flex c--nav">...</div>
```

なお、`class` 属性内の並び順は CSS の適用結果（詳細度・カスケード順）には影響しません。この順序はあくまで可読性と一貫性のための整理です。

## Block Class（`b--`）

`b--` プレフィックスで定義する **Block クラス** は、サイト内で繰り返し使う基礎部品（ボタン・バッジ・カード級）です。「ベーススタイルは CSS 側にある」という契約を持ち、CSS は `@layer lism-block` に配置します。コアの `lism-css` には含まれず、プロジェクト側で定義します。

次の3条件を**すべて**満たす場合に `b--` を使います。満たさない場合は、繰り返し使うが Property Class 中心で組む・マーカー用途なら `c--`、1ページ・1箇所限定ならプレフィックスなしにします（→ [独自プレフィックス](#独自プレフィックス)）。

1. サイト内の複数ページ・複数箇所で繰り返し使う共通部品である
2. クラス1つでベーススタイルがほぼ定まる状態にしたい部品である（スタイル修正を CSS ファイル側だけで完結させたい）
3. 粒度がボタン・バッジ・カード級の自己完結した部品である（ページセクション全体やサイト骨格は対象外）

BEM 構造（Block / Modifier / Element）は `c--` と同じ記法です（Block=`b--{name}`、Modifier=`b--{name}--{modifier}`、Element=`b--{name}_{element}`）。Block 同士の併用ルールも `c--` と同じです。

```css
@layer lism-block {
  .b--btn { padding: var(--s10) var(--s20); border-radius: var(--bdrs--20); background-color: var(--brand); }
  .b--btn.b--btn--outline { background-color: transparent; }
}
```

- `b--` でも Property Class は使えます。Property Class はレイヤー外で `b--` より必ず強いため、例外的な調整やブレイクポイント切り替え（`-p_sm` 等）にはむしろ Property Class を使ってください
- `l--` や `is--` / `has--` は `b--` より弱いレイヤーです。`b--` の宣言と衝突するものは効かないため、レイアウトのバリエーションは Modifier を CSS 側に定義するか Property Class で上書きします

## Component Class（`c--`）

`c--` プレフィックスで定義する **Component クラス** は、Primitive を組み合わせて作られた具体的な UI 部品です。コアの `lism-css` には含まれず、ユーザーが自由に定義できるクラスです。他の Primitive クラス（`l--`, `is--`）や Property Class（`-{prop}:{value}`）との組み合わせを前提に設計し、CSS を書く場合だけ `@layer lism-custom` に配置します。スタイルが全くなく、HTML 側での可視性を高める名前付け（マーカー）のためだけに使っても構いません。

`c--` クラスは BEM 構造（Block / Modifier / Element）を持つことができ、それぞれ次の形式で定義します。

| 分類 | 形式 | 例 |
| --- | --- | --- |
| Block | `c--{name}` | `c--button`, `c--card` |
| Modifier | `c--{name}--{modifier}` | `c--button--outline` |
| Element | `c--{name}_{element}` | `c--card_header`, `c--card_body` |

- Modifier は Block と併記して使用: `.c--button.c--button--outline`
- Element は `_`（アンダースコア）一つ区切り
- Block 同士の併用（`.c--xxx.c--yyy`）は基本 NG。ただし次は許容される:
  - Block と自身の Modifier: `.c--xxx.c--xxx--modifier`
  - Block と他 Block の Element: `.c--xxx.c--yyy_elem`
- BEM の Modifier / Element 構造を持つのは `c--` と `b--` のみ。`a--` / `l--` には適用しない

### 作成例

`c--*`は意味名として残し、レイアウトと単一プロパティ値はPrimitive/Property Classへ寄せます。CSSへ残すのは、擬似要素・子孫セレクタ・状態セレクタなど、Props/Property Classで表現できないものだけです。

```html
<!-- HTMLで書く場合も、意味名 + Primitive + Property Class を優先 -->
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

CSSが空になる場合は、CSSファイル側に`.c--myCard {}`を書かず、マークアップ上の意味名として`c--myCard`だけ残して構いません。

## カスタムCSS を追加する場合

独自のスタイルを追加する場合は、対象に合った Lism の CSS Layer 内に記述してください。

```css
/* ユーザーの独自CSS（c-- / z-- / プレフィックスなし） → lism-custom に追加 */
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

カスタムCSS内でも、できる限り Lism のCSS変数（トークン）を使ってください。ただし、`padding`/`border-radius`/`font-size`/`color`などProperty Class/Propsへ移せる宣言は、CSSに書く前にマークアップ側へ移します（NG→OK例は[antipatterns.md](./antipatterns.md#property-class-で書けるのに-css-で書く)を参照）。

明確にその数値に意図があり、トークン化・丸め・Property Class化ができない場合だけ、生のCSS値を例外として使用できます。その場合は実装プランに理由を残します。

**レイヤー外に書く場合:**
`@layer` の外（レイヤーなし）でカスタムCSSを書くのは、**Property Class（`-{prop}:{value}`）を拡張する場合のみ**としてください。それ以外のカスタムスタイルは必ずいずれかの `@layer` 内に記述します。

```css
/* Property Class の拡張のみレイヤー外に書ける */
.-myProp\:myValue { ... }
```

## 独自プレフィックス

Lism CSS が提供するクラス（`set--` / `is--` / `has--` / `l--` / `a--` / `u--` / Property Class）以外の、ユーザーが自分で定義するクラスは次の4分類で命名します。判断は上から順に「CSS 管理する共通基礎部品か→`b--` / サイト骨格か→`z--` / コンポーネント的なものか→`c--` / それ以外のページ固有・ローカルか→プレフィックスなし」の決定木で決めます。

| 分類 | 命名 | 例 | スタイルの書き方 |
| --- | --- | --- | --- |
| サイト共通で繰り返し使う基礎部品（ボタン・バッジ・カード級） | `b--{name}` | `b--btn`, `b--badge` | ベーススタイルを `@layer lism-block` で管理。例外的な調整・BP切り替えは Property Class で上書き（→ [Block Class（`b--`）](#block-classb--)） |
| サイト骨格のゾーニング | `z--{zoneName}` | `z--header`, `z--main`, `z--footer`, `z--sidebar` | `@layer lism-custom` |
| コンポーネント的なもの全般 | `c--{name}` | `c--featureCard` | Property Class 中心。CSS が空のままマーカー（意味名）として使うのも可。粒度は不問。CSS を書く場合は `@layer lism-custom` |
| 上記以外のページ固有・ローカル要素 | プレフィックスなしの自由命名 | `.frontHero`, `.postBody` | 名前付けだけでも CSS を書いてもよい。CSS を書く場合は `@layer lism-custom` |

「契約」を持つのは `b--` と `z--` だけです。`b--` は「ベーススタイルが CSS 側にある」こと、`z--` は「サイト骨格である」ことを名前が保証します。`c--` とプレフィックスなしは契約のない自由地帯で、どちらを選んでも運用は壊れないため、両者の使い分けは厳密に定めません。迷ったら `c--` で始め、CSS 管理へ切り替えたくなった時点で `b--` へリネーム昇格します。

```css
@layer lism-custom {
  .z--header { /* ... */ }
  .frontHero { /* ... */ }
}
```

**残す規律:**

- プレフィックスなしのクラスは一般名詞単体（`.hero`, `.card`）を避け、ページslug等を含む camelCase（`.frontHero`）にする。外部CSSとの衝突回避と自己スコープのため
- プレフィックスなしのクラスの CSS も `@layer lism-custom` に置く（レイヤー外に書くと Property Class での上書き保証が壊れる）
- ページ固有の要素が複数ページで使われ始めたら `c--`（CSS 管理を前提にするなら `b--`）へ昇格する。`c--` から `b--` へのリネームは JS フックや E2E セレクタに波及しうるため、意図的なリファクタとして行う

### `b--`/`z--`/`c--`/プレフィックスなしの使い分け

`c--header`や`c--sidebar`のような命名は、UI部品として再利用する意図がある場合だけ使います。サイト骨格の領域名なら`z--header`、1ページ・1箇所限定の領域ならプレフィックスなし、ベーススタイルをCSS管理したい共通部品なら`b--`を優先してください。「カスタムクラス＝必ず`c--`」ではありません。

外部JS・CMS・E2Eが参照するclassは既存名を維持します。公開API、CMS出力、外部JS、E2Eセレクタ、ドキュメントで案内済みのclass名を変える場合は、内部参照を全更新できる場合でも⏸としてユーザー確認します。CSSだけrenameしてJS/テスト/HTML生成側を漏らさないでください。

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
/* コンポーネント用CSS は lism-custom 内に定義する（b-- のベーススタイルだけ lism-block） */
@layer lism-custom {
  .c--yourComponent {
    ...
  }
}
```
