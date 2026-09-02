基準日: 2026-09-02・f908f141

# Tooltip（#560）と Popover（#565）を `@lism-css/ui` に追加する

状態: Review required

対象Issue: [#560 Tooltip](https://github.com/lism-css/lism-css/issues/560) / [#565 Popover](https://github.com/lism-css/lism-css/issues/565)。2つを1つのPR（`dev`から切ったブランチ、ターゲット`dev`）で実装する。

## 概要 / ゴール

- `b--tooltip`（ホバー/フォーカスで出る補足テキスト）と`b--popover`（クリックで開くインタラクティブなパネル）をReact / Astro両対応で追加する。
- 位置決めはCSS Anchor Positioning。非対応ブラウザにはCSSだけでフォールバックし、JSによる位置計算は持たない。
- Tooltipは「Escで閉じる」だけの極小JS、PopoverはクライアントJSゼロ（ネイティブPopover API）。
- 完了時: 2コンポーネントがパッケージに収録され、docs（ja/en）・skill・MCP索引・README・カタログ（Storybook）が追随している。

## 背景・前提（コードで裏取り済み）

Issue本文の前提のうち、実コードと違っていた点・Issueに書かれていない追随箇所を先に列挙する。

- **コンパウンドAPIの形**: 既存は`Modal = { Root, Inner, Body, CloseBtn, OpenBtn }`のようなオブジェクトを`export { Modal }`し、`<Modal.Root>`で使う（`react/index.ts`・`astro/index.ts`）。Issueの`<Tooltip><TooltipTrigger>`形式ではなく`<Tooltip.Root><Tooltip.Trigger>`形式にする。
- **ID配線の前例**: Astroは`Accordion/astro/Item.astro`が`Astro.slots.render('default')`→`__LISM_ACC_ID__`を`escapeHtmlAttr`で置換→`set:html`。Reactは`Accordion/react/Item.tsx`が`useId()`をContext（`react/context.ts`）で子へ配る。両方そのまま流用する。
- **クライアントJSの前例**: `Modal/setModal.ts`（`setEvent(target)`＋全件登録の`setModal()`）、`Modal/script.ts`（`DOMContentLoaded`で`setModal()`）、Astroは`Modal.astro`内`<script>`で`setModal()`、Reactは`useEffect`。
- **`vite.config.js`の`entries`は手動**: `scripts/modal`等はここに列挙されている。Tooltipの`script.ts`は`'scripts/tooltip'`を**手で追加**しないとビルドされない（Issue未記載）。
- **自動生成されるもの**: `registry-index.json`と`package.json`の`exports`は`pnpm build`（lism-ui）で再生成されcommit対象。`generate-exports.ts`は`astro/index.ts`と`react/index.ts`の両方があるディレクトリだけを対象にする。
- **docsの置き場所**: `apps/docs/src/content/ja/ui/Tooltip.mdx`のように**`ui/`直下**（Issueの`ui/tooltip.mdx`・`ui/Popover.mdx`は場所が曖昧）。サイドバーは`src/config/sidebar.ts`が`ui/`直下を自動取得するので編集不要。`ui/components/`はCSSレスの実装例用で対象外。
- **Storybook**: `apps/catalog/.storybook/main.js`が`packages/lism-ui/src/components/**/*.stories.tsx`をglobで拾う。`Modal.stories.tsx`に倣って各コンポーネント直下に置けば登録不要。
- **README**: ルート`README.md`・`packages/lism-ui/README.md`・`README.ja.md`にコンポーネント一覧表があり、追記が必要（Issue未記載）。
- **lint**: stylelintは`anchor-name`/`anchor-scope`/`position-area`/`position-try-fallbacks`/`@starting-style`/`:popover-open`/`@supports not (...)`を通す（stdinで実行確認済み）。`eslint-plugin-react@7.37.5`の`no-unknown-property`は`popover`/`popoverTarget`/`popoverTargetAction`を既知属性として持つ。
- **`set="plain"`**: `.set--plain`（`@layer lism-base`）が`width: auto; margin: 0; padding: 0; border: none; background: none`等を当てる。`lism-block`レイヤーはその上位なので、`b--`側の宣言が勝つ。
- **レイヤー順**: `lism-base, lism-block, lism-trait, lism-primitive, lism-component, lism-custom, lism-utility`。`b--`のベーススタイルは利用者のLism props（`bg`・`p`・`bdrs`等）に常に負ける設計なので、色・余白の上書き用CSS変数を大量に用意する必要はない。
- **OddBirdポリフィルの制約**（README確認済み）: `CSS.supports`と`@supports`はポリフィルされず、**`@supports`ブロック内のCSSはポリフィル処理を受けない**。`anchor-scope`・`position-area`（制約あり）・基本的な`position-try-fallbacks`は対応。popover（トップレイヤー）対応あり。`justify-self: anchor-center`は**非対応**。動的追加ノードは非対応。
- **ブラウザ対応**（caniuse・MDN確認済み）: Anchor PositioningはChrome/Edge 125、Safari 26、Firefox 147、グローバル84%。`anchor-scope`と`position-area`はBaseline 2026年1月。MDNは`position-area`でpopoverを配置する際に`margin: 0; inset: auto;`でUA既定を解除するよう明記している。`position-area`の構文例に`inline-start`（＝`inline-start span-all`）と`top span-x-start`が載っており、論理キーワードは物理キーワードと同じ扱い。
- **Base UIの命名**（公式docs確認済み）: Tooltip / Popoverとも`side`は`top | bottom | left | right | inline-start | inline-end`（既定はTooltip=`top`、Popover=`bottom`）、`align`は`start | center | end`（既定`center`）、中身は`Popup`、Popoverの閉じるボタンは`Close`。

## 共通方針（両コンポーネントに適用）

### 1. Anchor配置とフォールバックのゲート戦略

Issue #565の懸念どおり、`@supports`でanchor配置側を囲うとポリフィルが効かない。そこで**ゲートを逆にする**。

- anchor配置のルールは**ゲートなし**で書く（非対応ブラウザでは未知プロパティだけが個別に無視される。ポリフィルはこのルールを読める）。
- フォールバックのルールを`@supports not (...)`で囲み、さらに`:root:not([data-anchor-polyfill])`で「ポリフィル未使用」に限定する。
- `@supports`の条件は使用プロパティを全部andで束ねる: `not ((anchor-name: --a) and (anchor-scope: all) and (position-area: inline-start span-block-end) and (position-try-fallbacks: flip-block))`。`position-area`の判定値には論理キーワードを含め、`inline-*`側だけ壊れる状態を作らない。これにより`anchor-scope`未対応のChrome 125〜130は自動的にフォールバック側に落ちる（Issueが「受容」としていた複数設置時のアンカー解決ずれは発生しない）。
- **制約（コードコメントで残す）**: anchor配置側に既知プロパティ（`position`・`inset`・`margin`・`translate`等）を書くときは、フォールバック側で必ず同じプロパティを上書きする。フォールバックはanchor配置より後に置き、`:root:not(...)`で上がる詳細度をそのまま使う（`:where`で揃えて後置でもよい。実装時にどちらかへ統一）。

```css
@layer lism-block {
  /* ① 全ブラウザで読ませる。anchor配置。 */
  .b--tooltip_popup {
    position: fixed;
    position-anchor: --tooltip;
    position-area: top;
    position-try-fallbacks: flip-block;
  }
  /* ② anchor非対応 かつ ポリフィル未使用 のときだけ */
  @supports not ((anchor-name: --a) and (anchor-scope: all) and (position-area: inline-start span-block-end) and (position-try-fallbacks: flip-block)) {
    :root:not([data-anchor-polyfill]) .b--tooltip_popup {
      position: absolute;
      /* 方向別の inset */
    }
  }
}
```

### 2. ポリフィル対応は「opt-in属性」で行う

- ポリフィル利用者は`<html data-anchor-polyfill>`を付ける（属性名は両コンポーネント共通）。これでフォールバックが外れ、anchor配置ルールをポリフィルが処理する。
- docsには「OddBirdポリフィルを読み込み、`html`に`data-anchor-polyfill`を付ける」手順と、「ポリフィルは動的追加ノードに効かないため、React SPAで後からマウントする場合は適用されない」注記を書く。
- **実機検証で動かなかった場合の決定ルール**: 追加実装で追いかけず、docsのポリフィル案内と`:root:not([data-anchor-polyfill])`のセレクタを削る（フォールバックは`@supports not`だけで成立する）。

### 3. anchor名は`anchor-scope`で静的CSSに閉じる

- ルート: `anchor-scope: --tooltip` / `--popover`。トリガー: `anchor-name`。ポップアップ: `position-anchor`。全部`_style.css`に書き、inline styleでは出さない。
- Popoverのポップアップはトップレイヤーに乗るが、`anchor-scope`はDOMツリー基準なので問題ない（MDN記載。実機で要確認）。

### 4. 方向のprop名と値はBase UIに揃える

- **`side`**: `top | bottom | left | right | inline-start | inline-end`。Tooltipの既定`top`、Popoverの既定`bottom`。`left`/`right`は物理方向、`inline-start`/`inline-end`は書字方向（`dir="rtl"`）に追従する論理方向。
- **`align`**（Popoverのみ）: `start | center | end`、既定`center`。`side`が`top`/`bottom`のとき`start`/`end`は書字方向に追従する（`span-x-*`と`justify-self: start/end`で実現）。`side`が横方向のときは縦方向の揃えになり、`start`=上・`end`=下（`align-self`で実現）。下記の対応表。
- DOMには`data-side` / `data-align`として出す（コンポーネント接頭辞は付けない。`.b--popover_popup[data-side]`のようにクラスでスコープされるため衝突しない）。
- Issue #560の`data-pos`は採用しない。

`side`×`align`→`position-area`の対応表（Popover。Tooltipは`center`列のみ使う）:

| side | center | start | end |
| --- | --- | --- | --- |
| `top` | `top` | `top span-x-end`＋`justify-self: start` | `top span-x-start`＋`justify-self: end` |
| `bottom` | `bottom` | `bottom span-x-end`＋`justify-self: start` | `bottom span-x-start`＋`justify-self: end` |
| `left` | `left` | `left span-bottom`＋`align-self: start` | `left span-top`＋`align-self: end` |
| `right` | `right` | `right span-bottom`＋`align-self: start` | `right span-top`＋`align-self: end` |
| `inline-start` | `inline-start` | `inline-start span-block-end`＋`align-self: start` | `inline-start span-block-start`＋`align-self: end` |
| `inline-end` | `inline-end` | `inline-end span-block-end`＋`align-self: start` | `inline-end span-block-start`＋`align-self: end` |

- `center`列は単一キーワード（＝`span-all`）。直交軸は`anchor-center`の既定挙動でviewport内に自動シフトする。`anchor-center`はポリフィル非対応なので明示しない。
- `start`/`end`は`normal`の既定揃えに頼らず`justify-self`/`align-self`を明示する。
- `position-try-fallbacks`: `top`/`bottom`は`flip-block`、`left`/`right`/`inline-*`は`flip-inline`。Popoverの`start`/`end`は両軸のflipまで並べ、主軸を先に書く（`top`/`bottom`: `flip-block, flip-inline, flip-block flip-inline`。横方向のside: `flip-inline, flip-block, flip-inline flip-block`）。
- オフセットはアンカー側のmargin: `top`→`margin-bottom`、`bottom`→`margin-top`、`left`→`margin-right`、`right`→`margin-left`、`inline-start`→`margin-inline-end`、`inline-end`→`margin-inline-start`。flipはmarginと`justify-self`/`align-self`も反転するので片側だけ書けばよい。

### 5. パーツ命名

- Tooltip: `Tooltip.Root` / `Tooltip.Trigger` / `Tooltip.Popup`
- Popover: `Popover.Root` / `Popover.Trigger` / `Popover.Popup` / `Popover.Close`
- ポップアップ側を`Content`にしない理由: 「常に見えている側のコンテンツ」と「出てくる側のコンテンツ」のどちらか分からない。Base UIと同じ`Popup`にする。
- 閉じるボタンはBase UIと同じ`Close`。実装は`Modal.CloseBtn`（`x`アイコン＋`srText`）を流用するが、名前は`Modal`に合わせない（`Modal`の`OpenBtn`/`CloseBtn`は対の命名で、`Trigger`と組む`Popover`では`Close`が自然）。
- クラス名: `b--tooltip` / `b--tooltip_trigger` / `b--tooltip_popup`、`b--popover` / `b--popover_trigger` / `b--popover_popup` / `b--popover_close`。

### 6. ID配線

- Root prop `tooltipId` / `popoverId`（省略時は自動生成）。Accordionの`accID`・Modalの`modalId`と同じ流儀。
- Astro: Rootで`Astro.slots.render('default')`→`__LISM_TOOLTIP_ID__` / `__LISM_POPOVER_ID__`を`escapeHtmlAttr(id)`で関数置換→`set:html`。プレースホルダーがなければ通常の`<slot />`（Accordion Itemと同じ二分岐）。子側の既定値はプレースホルダー文字列。
- React: Rootで`useId()`→`context.ts`（`'use client'`）で配布。子は`ctx?.id || 自身のprop || プレースホルダー`。
- 子で明示上書きしたい場合: Popupは標準の`id`、Trigger/Closeは`tooltipId` / `popoverId`。

### 7. スタイルの上書き手段

- 色・余白・角丸・影はLism props（`bg`・`c`・`p`・`bdrs`・`shadow`等）で上書きできるので、CSS変数フックはLism propsで表現できないものだけにする: `--tooltip-offset`・`--tooltip-delay`・`--tooltip-delay-out`・`--tooltip-duration`、`--popover-offset`・`--popover-duration`。
- 既定色は既存トークン（`--base`・`--text`系）で組む。Tooltipは反転配色（濃い背景に明るい文字）、Popoverは`Modal.Inner`と同じ`background-color: var(--base)`。トークン名は実装時に`skills/lism-css-guide/tokens.md`で確認する。
- 余白は`--s10`・`--s15`等の既存spacingトークンを使う（Accordionと同じ）。

## Tooltip 実装

### 出力HTML

```html
<span class="b--tooltip">
  <button type="button" class="b--tooltip_trigger set--plain" aria-describedby="tt-xxxx">保存</button>
  <span class="b--tooltip_popup" role="tooltip" id="tt-xxxx" data-side="top">ショートカット: ⌘S</span>
</span>
```

- `aria-describedby`は非表示要素でも解決されるので、JSなし・フォーカスだけで内容を取得できる。
- Escで閉じた状態はルートに`data-dismissed`を付けて表す。

### CSS（`Tooltip/_style.css`、`@layer lism-block`）

- ルート: `position: relative; display: inline-block; anchor-scope: --tooltip;`
- トリガー: `anchor-name: --tooltip;`（表示スタイルは`set="plain"`任せ）
- ポップアップ（anchor配置・ゲートなし）: `position: fixed; position-anchor: --tooltip; position-area: top; position-try-fallbacks: flip-block; z-index; width: max-content; max-width: min(20rem, 90vw); padding; border-radius; 配色; font-size`。`data-side`ごとに共通方針4の`center`列の`position-area`・`position-try-fallbacks`・オフセットmarginを切り替える。
- ポップアップ（フォールバック・ゲートあり）: `position: absolute`＋方向別inset。
  - `top`: `bottom: 100%; left: 50%; translate: -50% 0`
  - `bottom`: `top: 100%; left: 50%; translate: -50% 0`
  - `left`: `right: 100%; top: 50%; translate: 0 -50%`
  - `right`: `left: 100%; top: 50%; translate: 0 -50%`
  - `inline-start`: `inset-inline-end: 100%; top: 50%; translate: 0 -50%`
  - `inline-end`: `inset-inline-start: 100%; top: 50%; translate: 0 -50%`
- 表示制御（CSSのみ）:
  - 非表示既定: `visibility: hidden; opacity: 0; pointer-events: none; transition: opacity var(--tooltip-duration, .15s), visibility var(--tooltip-duration, .15s); transition-delay: var(--tooltip-delay-out, .15s)`（退場猶予＝トリガー→ポップアップへポインタを渡す橋渡し）
  - 表示: `.b--tooltip:hover > .b--tooltip_popup`と`.b--tooltip_trigger:focus-visible ~ .b--tooltip_popup`で`visibility: visible; opacity: 1; pointer-events: auto; transition-delay: var(--tooltip-delay, .4s)`（入場ディレイ）。`:has()`は使わない（隣接/一般兄弟結合子で足りる）。
  - Esc後: `.b--tooltip[data-dismissed] > .b--tooltip_popup`で強制非表示（`transition: none`）。表示ルールより詳細度が下がらないよう`:where`で調整する。
- `@media (prefers-reduced-motion: reduce)`: `--tooltip-duration: 0s`（ディレイは残す）。
- `@media (scripting: none)`: 何もしない（Esc以外はJSなしで動く）。

### JS（`Tooltip/setTooltip.ts`・`script.ts`）

Issueの「ルートごとにkeydown」ではなく、**documentに1回だけ登録する**方式にする。ホバー中はフォーカスがbodyにあり、ルート要素のkeydownでは拾えないため。

- `setTooltip()`: モジュール内フラグで二重登録を防ぎ、解除関数を返す（テスト用）。登録するのは3つ。
  - `document` `keydown`（`Escape`）: すべての`.b--tooltip`に`data-dismissed`を付ける。
  - `document` `pointerenter`（capture）: `e.target`が`.b--tooltip`なら`data-dismissed`を外す。
  - `document` `focusin`: `e.target.closest('.b--tooltip')`の`data-dismissed`を外す。
- 「全ルートに付ける」で足りる理由: 付いたままのルートは次にポインタが入る/フォーカスが入る瞬間に外れるので、見た目上は「Escで消えて、いったん離れて戻ると再表示」になる。`:hover`のJS判定（jsdomで再現不可）を避けられる。
- `script.ts`: `DOMContentLoaded`で`setTooltip()`（Modalと同一）。`vite.config.js`の`entries`に`'scripts/tooltip'`を追加。
- Astro: `Root.astro`内`<script>`で`setTooltip()`。React: `Root.tsx`の`useEffect`で`setTooltip()`（`'use client'`、refは不要）。

### コンポーネント

```
components/Tooltip/
├── react/  Root.tsx / Trigger.tsx / Popup.tsx / context.ts / index.ts / Root.test.tsx
├── astro/  Root.astro / Trigger.astro / Popup.astro / index.ts
├── _style.css
├── setTooltip.ts / setTooltip.test.ts
├── script.ts
└── Tooltip.stories.tsx
```

| パーツ | 既定`as` | 固有props | 出力 |
| --- | --- | --- | --- |
| `Root` | `span` | `tooltipId`, `delay`（→`--tooltip-delay`をinline style。Modalの`duration`と同じ） | `class="b--tooltip"` |
| `Trigger` | `button` | `tooltipId` | `type="button"` `set="plain"` `aria-describedby` |
| `Popup` | `span` | `id`, `side`（既定`top`）, `offset`（→`--tooltip-offset`） | `role="tooltip"` `data-side` |

- `Trigger`を`as="span"`等の非フォーカス要素にした場合はキーボードで出せなくなる。docsで「フォーカス可能要素にする（`tabindex="0"`）」を案内する。

### テスト

- `setTooltip.test.ts`（vitest + jsdom）: Escで全ルートに`data-dismissed`が付く / `pointerenter`で該当ルートだけ外れる / `focusin`で外れる / 二重呼び出しでリスナーが増えない / 解除関数で外れる。
- `react/Root.test.tsx`（`Tabs/react/Root.test.tsx`の`createRoot`+`act`方式）: Triggerの`aria-describedby`とPopupの`id`が一致する / `tooltipId`明示が反映される / `side`が`data-side`に出る。

## Popover 実装

### 出力HTML

```html
<div class="b--popover">
  <button type="button" class="b--popover_trigger set--plain" popovertarget="pop-xxxx">開く</button>
  <div class="b--popover_popup" id="pop-xxxx" popover="auto" data-side="bottom" data-align="center">
    コンテンツ
    <button type="button" class="b--popover_close set--plain" popovertarget="pop-xxxx" popovertargetaction="hide">…</button>
  </div>
</div>
```

- 開閉・light dismiss・Esc・フォーカス復帰・Tab順・`aria-expanded`はすべてネイティブ。`role`は既定で付けない。
- React側の属性名は`popover` / `popoverTarget` / `popoverTargetAction`（React 19の正式prop）。React 18ではdev時に未知prop警告が出るがDOMには出力される（受容）。Astro側は小文字。

### CSS（`Popover/_style.css`、`@layer lism-block`）

- ルート: `display: inline-block; anchor-scope: --popover;`。トリガー: `anchor-name: --popover;`
- ポップアップ（anchor配置・ゲートなし）:
  - `position-anchor: --popover; inset: auto; margin: 0;`（UA既定の`inset: 0; margin: auto`を解除。MDNの案内どおり）
  - `data-side`×`data-align`ごとに共通方針4の対応表どおり`position-area`・`justify-self`/`align-self`・`position-try-fallbacks`・オフセットmarginを切り替える。
  - 見た目: `border: none; padding: var(--s15); background-color: var(--base); color: inherit; border-radius; box-shadow; overflow: auto`。**`set="plain"`は使わない**（`width: auto`がフォールバック時に`inset: 0`と組み合わさって全幅化するため）。
- ポップアップ（フォールバック・ゲートあり）: `inset: 0; margin: auto; max-width: calc(100vw - 2rem)`でUA既定の中央配置に戻し、カードとして整える。`::backdrop`に薄い半透明を当てて意図したデザインに見せる（任意。実装時に判断）。
- 開閉アニメーション: `opacity`の`transition`＋`display` / `overlay`を`allow-discrete`、`:popover-open`で`opacity: 1`、`@starting-style { opacity: 0 }`。`prefers-reduced-motion`で`--popover-duration: 0s`。

### コンポーネント

```
components/Popover/
├── react/  Root.tsx / Trigger.tsx / Popup.tsx / Close.tsx / context.ts / index.ts / Root.test.tsx
├── astro/  Root.astro / Trigger.astro / Popup.astro / Close.astro / index.ts
├── _style.css
└── Popover.stories.tsx
```

`script.ts`・`set*.ts`は作らない。

| パーツ | 既定`as` | 固有props | 出力 |
| --- | --- | --- | --- |
| `Root` | `div` | `popoverId` | `class="b--popover"` |
| `Trigger` | `button` | `popoverId` | `type="button"` `set="plain"` `popovertarget` |
| `Popup` | `div` | `id`, `side`（既定`bottom`）, `align`（既定`center`）, `offset`（→`--popover-offset`）, `type`（`auto \| manual`、既定`auto`→`popover`属性値） | `popover` `data-side` `data-align` |
| `Close` | `button` | `popoverId`, `icon`, `srText`（`Modal.CloseBtn`と同じ。slotがあればそれを表示） | `type="button"` `set="plain"` `popovertarget` `popovertargetaction="hide"` |

- `Trigger`/`Close`を`button`以外にすると`popovertarget`が効かない。docsで明記する。

### テスト

- `react/Root.test.tsx`: Triggerの`popovertarget`・Popupの`id`・Closeの`popovertarget`が一致する / `popoverId`明示が反映される / `popover="auto"`既定と`type="manual"` / `side`・`align`の既定と`data-*`出力。
- CSS挙動（配置・flip・フォールバック）は自動テストしない。「完了条件」の実機確認で担保する。

## 追随ファイル一覧（PR内で全部やる）

| 場所 | 作業 |
| --- | --- |
| `packages/lism-ui/src/style.scss` | `@use`を2行追加（収録漏れ注意） |
| `packages/lism-ui/src/components/react.ts` / `astro.ts` | export追加 |
| `packages/lism-ui/vite.config.js` | `entries`に`'scripts/tooltip'`追加 |
| `packages/lism-ui/registry-index.json` / `package.json`の`exports` | `pnpm build`で再生成してcommit |
| `apps/docs/src/content/ja/ui/Tooltip.mdx` / `Popover.mdx` | 新規。構成は`Modal.mdx`に倣う: Overview（`Preview`）→`:::note`で仕様上の注意→Styles（`SrcCode`）→How to use（`ImportPackage`。Tooltipは`script="tooltip.js"`、Popoverは`css`のみ）→Props（`PropBadge`で対象パーツを示す）→Examples |
| `apps/docs/src/content/en/ui/Tooltip.mdx` / `Popover.mdx` | ja確定後に`lism-docs-translator`で作成 |
| `skills/lism-css-guide/components-ui.md` | `## Tooltip` / `## Popover`節（ソースリンク・構造・Prop表・最小例）。`SKILL.md`のTOCにも追加 |
| `packages/mcp/src/data/docs-index.json` | `/mcp-update`で2エントリ追加（`meta.ts`更新と`pnpm --filter @lism-css/mcp test`まで） |
| `README.md`・`packages/lism-ui/README.md`・`README.ja.md` | コンポーネント一覧表に2行追加 |

docsに書く利用ガイダンス（Issueより）:

- Tooltip: 中にリンク・ボタンを置かない（それはPopover）。重要な情報をツールチップだけに入れない（タッチでは確実に見えない）。トリガーはフォーカス可能要素にする。
- Popover: 重要な操作・情報をポップオーバーだけに置かない。フォームを含む用途では`role="dialog"`＋`aria-label`を付ける例を載せる。
- 共通: `side`の`left`/`right`は物理方向、`inline-start`/`inline-end`と`align`は書字方向に追従すること。非対応ブラウザでの見え方（Tooltipは反転しない・クリップされ得る、Popoverは画面中央カード）と、ポリフィル導入手順（`data-anchor-polyfill`）・動的ノード非対応の注記。

## 作業手順

1. `dev`から`feat/tooltip-popover`を切る。
2. Tooltip: `_style.css`→Astro/Reactコンポーネント→`setTooltip.ts`＋`script.ts`＋`vite.config.js`→テスト→stories。
3. Popover: `_style.css`→Astro/Reactコンポーネント→テスト→stories。
4. 収録: `style.scss`・`react.ts`・`astro.ts`。`pnpm --filter @lism-css/ui build`で`registry-index.json`と`exports`を再生成。`dist/style.css`で`@supports not`ブロックがanchor配置ルールの後ろにあり、`@starting-style`が残っていることを確認（cssnano経由）。
5. docs（ja）を書き、`nr dev:docs`で表示確認。ここで実機確認（下記「完了条件」）を行い、ディレイ既定値・オフセット・配色を調整する。実機確認はユーザーが行う（エージェントは指示があった場合のみ）。
6. ポリフィル検証の結果で「共通方針2」の決定ルールを適用する。
7. docs（en）・skill・MCP・READMEを更新。`format:mdx`を使う場合は対象2ファイル以外の差分を戻す。
8. `nr lint` / `nr typecheck` / `nr test` / `nr build`を通し、PR本文に`Closes #560` `Closes #565`を書いて`dev`へ出す。

## 設計判断の根拠

採用:

- **ゲート反転（`@supports not`をフォールバック側に）**: `@supports`で囲ったanchor配置はポリフィルに無視される（README明記）。反転すれば標準記法のままポリフィルが読める。副作用として「anchor側の既知プロパティは必ずフォールバックで上書きする」制約が生まれるが、コメントで固定する。
- **ポリフィルはopt-in属性**: ポリフィルは`CSS.supports`を書き換えないため、CSSだけでは「非対応だがポリフィルあり」を判別できない。利用者がスクリプトを足す時点で属性1つ追加する負担は小さい。
- **Tooltipの`:hover`/`focus-visible`判定をCSSに寄せ、JSは「Escで全ルートに印を付ける」だけ**: JSで`:hover`を問い合わせる方式はjsdomでテストできず、ルート個別のリスナー管理（React unmount時のcleanup）も要る。document 1回登録なら状態を持たない。
- **単一キーワードの`position-area`（span-all）**: 単一列（`bottom center`）だとポップアップがアンカー幅の列からはみ出しても横にシフトしない。span-allなら`anchor-center`既定でviewport内に収まる。
- **`side`に`inline-start`/`inline-end`を含め、`align`の`start`/`end`を`span-x-*`で書字方向に追従させる**: Base UIと同じ値域になり、RTLでも位置決めCSSを書き分けずに済む。フォールバックも論理inset（`inset-inline-*`）で書けるので追加コストが小さい。
- **Popoverのポップアップに`set="plain"`を使わない**: `width: auto`がUAの`inset: 0`と組み合わさると全幅になり、フォールバックの中央カードが壊れる。
- **`side`/`align`と`Trigger`/`Popup`/`Close`**: Base UIと同じ語彙で、2コンポーネント間で揃う。`Close`の実装は`Modal.CloseBtn`を流用するが、名前まではModalに合わせない。

却下:

- **`popover`属性でTooltipを作る**（Issue #560）: hoverで開く手段がなく常時JS必須。非対応ブラウザではUA既定（画面中央）で壊れる。
- **JSによる位置計算フォールバック**: Floating UIの再発明。非対応時はCSSフォールバックで表示自体は正常。
- **矢印（しっぽ）**: flip適用をCSSで検知できず向きを切り替えられない。両方とも見送り。
- **Tooltipの`label` propショートカット**（`<Tooltip.Root label="...">`でPopupを自動出力）: RootでPopupを自動生成するとAstro側のプレースホルダー置換と二重管理になる。既存コンポーネントにも同種のショートカットはない。後から非破壊で足せる。2026-09-02にユーザー確認済み。
- **ポップアップ側を`Content`と呼ぶ**（初版プラン）: 「常に見えている側」か「出てくる側」か分からない。Base UIの`Popup`に変更。2026-09-02にユーザー確認済み。
- **閉じるボタンを`CloseBtn`と呼ぶ**（初版プラン）: `Modal`の`OpenBtn`/`CloseBtn`は対の命名であり、`Trigger`と組む`Popover`で片方だけ`Btn`を付ける理由がない。Base UIの`Close`に変更。2026-09-02にユーザー確認済み。
- **このPRで`Modal.OpenBtn`/`CloseBtn`も`Open`/`Close`系に改名する**: 公開済みパッケージの破壊的変更で、docs・skill・MCP・registryの追随も別途要る。別Issueで扱う。
- **`interestfor`属性**: Chrome/Edge 142のみ。マークアップは互換に保つ（`button`トリガー＋`role="tooltip"`）。
- **`data-pos`（Tooltip）と`data-side`（Popover）の使い分け**: 同じ概念に別名を付けない。
- **縦書き対応・`position-visibility`など**: 対象外（下記）。RTLは`inline-*`と`align`で対応する（`left`/`right`は物理方向のまま）。

## 未決事項・要確認・事前準備

ユーザー確認済み（2026-09-02）:

- 共通方針4〜6の命名（`side`/`align`と値域、`side`に`inline-start`/`inline-end`を含めること、`Root`/`Trigger`/`Popup`/`Close`、`tooltipId`/`popoverId`）。
- Tooltipの`label`ショートカットは入れない。Modalの`OpenBtn`/`CloseBtn`改名はこのPRでやらない。
- ポリフィルopt-in属性名`data-anchor-polyfill`。
- Tooltipのディレイ既定値（入場`0.4s`・退場猶予`0.15s`）は実機で目視調整する前提の初期値。

実装中に実機で確認すること（未確認事項）:

- Popoverのポップアップ（トップレイヤー）に`anchor-scope`が効くこと。効かない場合はPopoverだけ`anchor-name`をコンポーネントごとの固定名にせず、実装時に代替案（`position-anchor`を`popovertarget`の暗黙アンカーに任せる等）を検討する。
- 共通方針4の対応表どおりに揃うこと。特に`bottom span-x-end`＋`justify-self: start`が「トリガーの先頭側揃え」になり、`dir="rtl"`で左右が入れ替わること。`flip-inline`で`justify-self`も反転すること。
- `inline-start`/`inline-end`・`span-x-*`・`span-block-*`の論理キーワードがSafari 26・Firefox 147で通ること（MDNの構文には載っているが実機は未確認）。
- 非対応ブラウザでの確認手段: Firefox ESR 140（Anchor Positioning未搭載）を使う。Chromeの`--disable-blink-features=CSSAnchorPositioning`でも代替できる可能性があるが、現行Chromeで有効かは未確認。
- ポリフィル併用（非対応ブラウザ＋OddBird＋`data-anchor-polyfill`）でTooltip/Popoverが追従すること。特にPopoverの`inset: auto; margin: 0`とポリフィルのラッパー方式の相性、および論理キーワード（`inline-start`・`span-x-*`）をポリフィルが解釈するか（READMEに記載なし）。
- `@starting-style`・`transition-behavior: allow-discrete`・`position-area`等がSass（`@use`の素通し）とcssnanoで壊れないこと。
- `popovertarget`ボタンの`aria-expanded`自動公開（Chrome/Safari/Firefoxのアクセシビリティツリーで確認）。

事前準備:

- なし（依存追加は不要。ポリフィルは検証時にCDNの`<script type="module">`で読み込む）。

## 対象外・受容済みリスク

- 縦書き（`writing-mode: vertical-*`）での配置。`inline-*`と`align`は横書きのLTR/RTLだけを想定する。
- `position-visibility`（アンカーが画面外に出た時に隠す）。
- 2文字イニシャル等、他Issueの内容。
- `Modal.OpenBtn`/`CloseBtn`の改名（別Issue）。
- Chrome 125〜130はフォールバック表示（anchor配置なし）。自動更新でほぼ残存しないため受容。
- Tooltipの`:focus-visible`表示は隣接/一般兄弟結合子で実現するため、Popupは同じRoot直下に置く前提。
- React 18でのdev時の`popoverTarget`未知prop警告。
- ポリフィルは動的追加ノードに効かない（OddBirdの仕様。docsで注記）。

## 完了条件 / テスト方針

- `nr lint` / `nr typecheck`（`astro check`含む）/ `nr test` / `nr build`が通る。
- 実機（Chrome・Safari 26・Firefox 147以上）: 各`side`（Popoverは`align`も）で意図した位置に出る。`dir="rtl"`のページで`inline-start`/`inline-end`と`align`の`start`/`end`が左右反転する。viewport端で反転する。スクロールに追従する。同一ページに複数設置しても互いのアンカーを取り違えない。Tooltip: ホバー→ディレイ後表示、ポップアップへポインタ移動しても消えない、Escで消えて離れて戻ると再表示、Tabフォーカスで表示。Popover: 外側クリック/Escで閉じる、閉じた時にトリガーへフォーカスが戻る、`aria-expanded`が切り替わる。
- 実機（Firefox ESR 140）: Tooltipは絶対配置で表示され機能する（`inline-*`も論理insetで正しい側に出る）。Popoverは中央カードで開閉・dismissが動く。
- ポリフィル併用でanchor追従する。動かなければ「共通方針2」の決定ルールで案内を削る。
- `prefers-reduced-motion`でアニメーションが止まる。
- docs ja/enが表示され、サイドバーに2ページが載る。MCPの`docs-index.test.ts`が通る。
