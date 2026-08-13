# KvEditor — 仕組みの解説

トップページ KV の「ライブコードエディター + AI デモパネル」の実装ドキュメント。コードレビュー用に、設計判断の理由も含めて記載する。

## 概要

トップページの KV（キービジュアル）を、Lism を実際に触れるライブデモにした実装。1 つのエディターウィンドウに HTML / JSX の 2 表記を切り替えられるコードエディターと、AI アシスタント風のデモパネルを備え、**ヒーローエリア自体がエディターの描画結果**になっている。エディターを編集するとヒーローがその場で変わり、AI パネルの再生ボタンを押すと「AI に依頼 → コードが書き換わる → ヒーローが変わる」という Lism の体験を全 3 ステップ連続で自動デモする。

実装は次の原則に集約される。詳細は後続の各セクションで解説する。

1. **単一モデル・単方向データフロー** — アプリの状態は HTML 文字列 1 本（`state.html`）。HTML タブ・JSX タブ・ヒーロー・シナリオ再生はすべてこのモデルへの入力またはモデルから導出されるビューであり、どこから変更しても「モデル更新 → 派生ビュー再描画」の一方向で流れる。状態の二重管理が生む同期バグを構造的に排除する。
2. **ビューは変換で導出する** — JSX タブは独立した状態ではなく、モデルからの双方向変換（`convert.ts`）で導出する。変換できない入力（編集途中の不正な JSX）の間はモデルを last-good に保ち、表示だけを追従させる。
3. **SSR ファースト** — 初期表示（ヒーロー・ハイライト済みコード）はビルド時に生成し、JS はあとから段階的に機能を足す。shiki 本体（最大の依存）はアイドル時の遅延ロードで、初期表示のパフォーマンスに影響させない。
4. **演出も本物の編集** — AI デモは動画やスクリーンキャプチャではなく、シナリオデータ（`scenario.ts`）を再生エンジン（`player.ts`）が本物のエディター API に流し込んで動かす。だからユーザーはいつでも再生に割り込んで、続きを自分で編集できる。
5. **フットプリント最小** — 素の `<script>` + data 属性。プロジェクト方針で `SearchModal.astro` 等の既存パターンに準拠。追加依存は `apps/docs` のみで、公開パッケージには一切変更がない。

## コンセプトと全体像

**ヒーローエリアはエディターの描画結果そのもの**。エディターの HTML を編集するとヒーローが変わり、全削除するとヒーローも消える（消えた場合はリセット提案が出る）。AI パネルは事前定義シナリオを再生し、エディター → ヒーローを連動して書き換える。

```
                        ┌─────────────────────────────┐
                        │  .c--kvEditorHero（ヒーロー出力） │ ← innerHTML = sanitize(html)
                        └─────────────△───────────────┘
                                      │ ライブ反映（rAFスロットル）
┌───────────────────────────────────────────────────────┐
│ state.html（唯一のモデル・常にHTML表記）              │
└──△──────────────────△────────────────────△────────────┘
   │ そのまま         │ jsxToHtml()        │ setCode() / setViewText()
┌──┴─────────┐  ┌─────┴───────┐      ┌─────┴────────┐
│ HTMLタブ   │  │ JSXタブ     │      │ player.ts    │
│ (textarea) │  │ (textarea)  │      │ シナリオ再生 │
└────────────┘  └─────────────┘      └──────────────┘
```

- データフローは単方向：入力（どのタブでも / プレイヤーでも）→ `state.html` 更新 → ヒーロー描画 + ハイライト再描画
- textarea は 1 つだけで、タブ切替時に中身（各タブの生テキスト）を差し替える。ハイライトは textarea の背面ではなく**前面に重ねた `pre` レイヤー**（`pointer-events: none`）で表示し、textarea 側は文字を透明にして caret だけ見せる

## 追加パッケージ

すべて `apps/docs/package.json` にのみ追加(公開パッケージには変更なし)。

### dependencies（shiki 一式・すべて `^4.0.2`）

| パッケージ | 概要 | なぜ必要か |
|---|---|---|
| `@shikijs/core` | shiki の本体（`createHighlighterCore`）。言語・テーマ・エンジンを外部から注入する最小コア | エディターのハイライトのすべての土台。ビルド時 SSR（初期表示）とクライアント（編集時の再ハイライト）の両方で使う |
| `@shikijs/engine-javascript` | TextMate 文法を純 JS の正規表現で実行するエンジン | デフォルトの Oniguruma エンジンは WASM（数百KB + 初期化コスト）が必要。ブラウザで軽く動かすため JS エンジンを採用。`forgiving: true` で一部非互換の文法パターンをエラーにせずスキップする |
| `@shikijs/langs` | TextMate 文法定義集。`@shikijs/langs/html` と `@shikijs/langs/jsx` のみをサブパス import | HTML タブ / JSX タブそれぞれのハイライトに必要。この2つだけを取り込むことでバンドルを絞っている（それでも html 文法が JS/CSS 文法を内包するため gzip 約110KB。アイドル時の遅延ロードで初期表示への影響はなし） |
| `@shikijs/themes` | テーマ定義集。`@shikijs/themes/github-dark` のみをサブパス import | エディターの配色。github-dark の背景 `#24292e` が docs の `--codeBlock-bgc` と同一で、サイト内のコードブロックと色が揃う |

### 解説: Astro に shiki が入っているのに、なぜ追加が必要だったか

shiki 自体は Node でもブラウザでも動く isomorphic なライブラリで、「サーバーサイド専用」なわけではない。それでも追加が必要だったのは、次の 2 つの独立した理由による。

**1. Astro の shiki は内部依存（transitive dependency）で、アプリからは import できない**

`astro` は Markdown / MDX のコードブロックや `<Code>` コンポーネントのハイライトのために shiki v4 に依存しているが、これは Astro の内部実装の都合であって、apps/docs に公開されているものではない。pnpm は isolated な node_modules 構造のため、自分の `package.json` に宣言していないパッケージはそもそも解決できない。仮に import できる構造だったとしても、宣言なしの間接依存への依存（phantom dependency）は Astro 側の依存変更で突然壊れるアンチパターンになる。

そこで `@shikijs/*` を直接依存として追加した。バージョンを Astro 内部の shiki と同じ `^4.0.2` に揃えているため、pnpm は同一インスタンスに解決（dedupe）し、node_modules 上の実質的な追加コストはほぼない。

**2. Astro が shiki を使うのはビルド時だけで、クライアント向け API は存在しない**

Astro のハイライトはすべてビルド時（SSG）に完結し、ハイライト済みの HTML が出力されるだけで shiki のコードは 1 バイトもブラウザへ配信されない。「Astro の shiki をブラウザで再利用する」ための公開 API は存在しないため、クライアントでライブハイライトするには自前で import する必要があった。

**3.（補足）ブラウザで使う場合の実際のハードルはサイズ**

`shiki` メタパッケージをそのまま import すると全言語文法 + 全テーマ + Oniguruma（WASM）エンジンが含まれて非常に重い。そのため上記の表のとおり fine-grained 構成（コア + 2 文法 + 1 テーマ + JS エンジン）とし、gzip 約 110KB の非同期チャンクに抑えた上でアイドル時に遅延ロードしている。

## ファイル構成

```
KvEditor/
├── KvEditor.astro   # マークアップ + ビルド時SSR（lang prop で言語選択）
├── initial-code.ts      # 言語別の初期HTML（single source of truth）
├── scenario.ts          # AIシナリオ定義（データのみ。メッセージは言語別・edits は言語共有）
├── README.md            # このドキュメント
└── lib/
    ├── editor.ts        # コントローラ（状態・タブ・ヒーロー連動・スクロール追従・入力上限）
    ├── player.ts        # シナリオ再生エンジン
    ├── diff.ts          # 再生アニメ用のdiff計算（行ハンク + 文字単位）
    ├── convert.ts       # HTML ⇔ JSX 双方向変換
    ├── sanitize.ts      # ヒーロー描画前の無害化
    ├── validate.ts      # 入力上限値 + HTMLタグバランスチェック
    ├── snackbar.ts      # エディター右下の通知・提案表示（スタック式）
    ├── strings.ts       # パネル・スナックバーの UI 文言定数（両言語とも英語で共通）
    ├── scroll-hint.ts   # AIパネルのメッセージ領域の上下端フェード制御（CSS変数 --kvEditor-mask-top / --kvEditor-mask-bottom を更新）
    └── highlight.ts     # shiki ラッパー（ビルド時 + クライアント共用）

styles: src/styles/_kv-editor.scss（main.scss から @use）
組み込み: src/pages/index.astro（ja・旧ヒーロー・kv-search・ダミーSVGを置換）
        src/pages/[lang]/index.astro（en・`<KvEditor lang={lang} />` で英語版を表示）
```

モジュール間の依存は一方向に保っている: `editor.ts`（DOM を握るコントローラ）が各 lib を束ね、`player.ts` は `EditorApi` インターフェース越しにのみエディターへ触る。`convert.ts` / `diff.ts` / `sanitize.ts` / `validate.ts` は DOM イベントに依存しない純粋な関数群になっている。

## i18n（言語対応）

日本語トップ（`/`）と英語トップ（`/en/`）で同じコンポーネントを使う。仕組みは次のとおり:

- **SSR 側**: `KvEditor.astro` が `lang` prop（省略時は root 言語 = ja。`SimpleLayout` と同じパターン）を受け取り、`INITIAL_HTML_BY_LANG[lang]` でヒーロー SSR・textarea 初期値・ビルド時ハイライトを選択。aria-label は `translations.ts` の `kvEditor` カテゴリから取得
- **クライアント側**: `.astro` の `<script>` は**サイト全体で 1 バンドル共有**（hoisted module）のため、ビルド時 props では言語分岐できない。`data-kv-lang` 属性を `[data-kv-editor]` に出力し、`editor.ts` が実行時に読み取って `INITIAL_HTML_BY_LANG` / `SCENARIO_BY_LANG` から選択する。`player.ts` は言語を知らず、`initialHtml` / `scenario` をオプションとして注入される
- **言語で変わるのはリード 2 行と href プレフィックスのみ**。マークアップ構造・クラス属性は言語間で必ず揃える（scenario の `edits` がクラス属性への文字列置換で全言語に効く前提）。`edits` の from/to にリード文・href など言語で変わる文字列を含めないこと
- **言語差のスタイル**（英語トップの行間・見出しサイズ等）はエディター内容に持ち込まず、`_kv-editor.scss` の `html[lang='en'] .c--kvEditorHero` ブロックで吸収する
- パネル内 UI 文言（"Ask AI to edit..." / Interrupted / Resume / Done / スナックバー）は両言語とも英語で共通

## initial-code.ts — 唯一の情報源

言語別の初期 HTML（`INITIAL_HTML_BY_LANG[lang]`）は次の 4 箇所で共用される。1 箇所にまとめることで SSR とクライアントの初期状態が必ず一致する。共有テンプレート関数から各言語を生成するため、整形ルール・クラス属性が言語間でズレることはない。

1. ヒーローの SSR（`set:html`）→ SEO 用に h1 がページソースに含まれる
2. エディター（textarea）の初期値
3. ハイライト済み `<pre>` のビルド時 SSR（初期表示のフラッシュ防止）
4. シナリオ再生のリセット時の戻し先

**制約**: `convert.ts` のプリンタ出力と同じ整形ルール（後述: 2 スペースインデント・単一テキスト子は 80 字以内でインライン化。レスポンシブ表記は正準形 = BP クラスを base の直後に昇順・`style` を class の直後）で書くこと。ズレると HTML → JSX → HTML の往復でコードが勝手に書き換わる。自動テストは置いていないため、変更したら JSX タブへ切り替えて HTML タブへ戻り、コードが書き換わらないことを手動確認すること。

内容はヒーローの見出し（h1）・リード文（p）・2 つのボタン風リンク（`l--flex`）で構成し、`data-modal-open="search-modal"` 付きの検索アンカー（⌘K チップ入り）を含む。h1 とリード p はレスポンシブ表記（`-fz:4xl -fz_md` + `--fz_md: var(--fz--5xl)` 等）を持ち、SP 縮小の実装とレスポンシブの書き方のデモを兼ねる（JSX タブでは `fz={['4xl', null, '5xl']}` と表示される）。⌘K チップも同機構で SP では非表示（`-d:none -d_md` + `--d_md: inline-block`。キーボードショートカットはデスクトップ前提のため）。なお、デザインモックアップ（SVG）記載のクラスの一部（`-g:8` / `-bg:base-2` / `-fw:medium` 等）は Lism に実在しないため、ビルド済み `main.css` に存在するクラスだけで再構成している。

## KvEditor.astro — SSR とマークアップ

frontmatter で `await highlight(initialHtml, 'html')` を実行し、ハイライト済み `<pre>` もビルド時に埋め込む。JS 読み込み前から「色付きのコード + ヒーロー」が完全表示され、JS が動き出すと編集・再生機能が段階的に足される（プログレッシブエンハンスメント）。

```
.c--kvEditorHero[data-kv-hero]      … ヒーロー出力（set:html={initialHtml} で SSR）

.c--kvEditor[data-kv-editor][data-kv-lang] … grid: エディター 1fr + パネル 12.6875rem。md未満は縦積み（エディター + 下段パネル 146px）
├── .c--kvEditor_window
│   ├── .c--kvEditor_bar        … 信号ドット + HTML/JSX タブ（role="tablist"。各タブは id="kv-tab-html/jsx" + aria-controls="kv-editor-panel"。背景はウィンドウと同一）
│   └── .c--kvEditor_editor[role="tabpanel"][id="kv-editor-panel"] … 重ねレイヤー（下記）。両タブ共有の 1 パネルで、aria-labelledby はアクティブタブの id
│       ├── .c--kvEditor_pre[aria-hidden]      … 表示用（pointer-events: none）
│       │   └── .c--kvEditor_preInner          … ★transform でスクロール追従
│       │       └── shiki の <pre><code>
│       ├── textarea.c--kvEditor_input         … 入力用（文字は透明・caret のみ表示）
│       └── .c--kvEditor_snackbarStack[id="kv-editor-notices"][data-kv-snackbar][role="status"] … 通知スタック（JS が折りたたみラッパー + カードを動的追記）
└── aside.c--kvEditor_panel     … AIパネル（SPでは下段に全幅表示）
    ├── .c--kvEditor_placeholder … 空状態: グラデーション円形ロゴ（orb）+ "Just ask. The code writes itself."
    ├── .c--kvEditor_messages[data-kv-messages] … 吹き出し・中断ステータス行の追記先（空の間は非表示）
    ├── p.u--srOnly[data-kv-live][aria-live="polite"] … SR向けの隠しライブリージョン（player.ts が確定文言のみを告知する）
    └── button.c--kvEditor_ask[data-kv-play]   … 入力欄風トリガー（"Ask AI to edit..." + 右下に ↑ 矢印の矩形）
```

マークアップ上の細かい配慮:

- textarea には `spellcheck="false"` / `autocomplete` / `autocapitalize` / `autocorrect` off と `wrap="off"`（折り返さず横スクロール。`pre` レイヤーの `white-space: pre` と一致させる）を指定
- textarea の中身は Astro が自動エスケープする。閉じタグ直前に空白を入れない（入れると初期値に混入する）
- タブは ARIA タブパターンを完全実装: `role="tablist"` / `role="tab"` / `aria-selected` に加え、`aria-controls` で共有 tabpanel（`.c--kvEditor_editor`）を参照し、roving tabindex（選択タブのみ `tabindex="0"`）+ ArrowLeft / ArrowRight / Home / End の矢印キー操作（automatic activation）に対応。キー操作は対象タブの `.focus()` + `.click()` を経由し、再生中断リスナー等のクリック処理も発火させる。ハイライトレイヤーは `aria-hidden`（読み上げ対象は textarea 側のみ）
- 「Ask AI to edit...」トリガーは `aria-label="Ask AI to edit... (play the AI demo)"` でデモ再生ボタンであることを明示（可視テキスト先頭・WCAG 2.5.3 準拠。タイピング演出で中身が変わってもアクセシブルネームが安定する）。再生中はクリックが「停止（中断）」として機能するため、`aria-label` を `Stop the AI demo` に切り替え、再生を抜けたら元のラベルへ戻す（機能し続けるボタンなので `aria-disabled` は使わない）
- textarea 内では Tab キーで 2 スペース（プリンタの整形ルールと同じ）のインデントを挿入する。選択が複数行にまたがる場合は選択を置換せず、選択範囲に触れる各行の行頭へ 2 スペースを挿入する（一般的なコードエディターの動き）。Shift+Tab はアウトデント（選択範囲に触れる各行の行頭から先頭のスペースを最大 2 つ削除。削除対象がない場合も既定のフォーカス移動はさせない）。キーボードトラップにならないよう（WCAG 2.1.2）、Esc → 直後の Tab / Shift+Tab が既定のフォーカス移動になり脱出できる。複数行の一括処理中は行ごとの再変換・再ハイライトを抑止し、完了後に 1 回だけ反映する（行数ぶんの同期全文ハイライトで固まらないため）
- textarea は構文エラー時に `aria-invalid="true"` が付き、`aria-describedby="kv-editor-notices"` でスナックバー（通知スタック）を常設参照する
- `data-kv-*` 属性が JS のフックで、クラス名はスタイル専用（フックと見た目の分離）

## editor.ts — コントローラ

`initKvEditor()` が DOM 要素を集めて全機能を配線する。必須要素（hero / demo / textarea / preInner）が見つからなければ何もせず終了する。

### 状態モデル

```ts
const state = {
  html: initialHtml,                      // 唯一のモデル（常にHTML表記）
  activeTab: 'html' as EditorLang,
  tabText: { html: initialHtml, jsx: '' }, // 各タブの生テキスト
  stale: { html: false, jsx: true },        // モデルから再生成が必要か
};
```

`tabText` を分けて持つのは**ユーザーの整形を保持する**ため。HTML タブを編集しても、JSX タブに切り替えるまで JSX テキストは再生成しない（`stale` フラグで遅延評価）。逆に JSX タブでの編集も、HTML タブへ戻るまで HTML テキストの再整形を遅延する。切替時に `stale` なタブだけ `htmlToJsx()` / モデルそのまま で再生成する。

### 入力フロー（`processInput`）

- **HTMLタブ**: `state.html = textarea.value` → ヒーロー描画 + ハイライト。JSX 側を stale に
- **JSXタブ**: `jsxToHtml()` を試行。
  - 成功 → モデル更新・ヒーロー反映・HTML 側を stale に
  - 失敗（編集途中の不正な JSX）→ **last-good なモデルを維持**し、JSX タブに `data-invalid` 属性（CSS で warning 色のインジケーター）。ハイライトだけは生テキストで更新

### ヒーロー描画

`hero.innerHTML = sanitize(state.html)` を **rAF でスロットル**（フラグ 1 本で 1 フレーム 1 回に制限）。再生中のタイピングアニメは十数 ms 間隔で `setViewText` が呼ばれるため、毎回 DOM を書き換えないための措置。

ブラウザの HTML パーサーは寛容なので、再生中断などで閉じタグが欠けた状態でも描画は破綻しない（仕様として許容）。エディターを空にするとヒーローも空になるが、初期化時に初期表示の自然高さをインラインの `min-height` として固定し（高さは em ベースで幅に依存するため、ResizeObserver で幅が変わった時だけ再測定）、レイアウトが潰れて下のエディターがジャンプすることは防いでいる。JS 初期化前は CSS の `min-height: 2rem` がフォールバック。

### シンタックスハイライト（遅延ロード + 同期実行）

- 初期表示は SSR 済みなので、shiki 本体（非同期チャンク・gzip 約110KB）は `requestIdleCallback`（未対応ブラウザは 1.5 秒後の `setTimeout`）で遅延ロード
- ロード完了後は **`highlightSync()`（同期 API）で入力のたびに即時再描画**。非同期 + debounce だと textarea とハイライトが一瞬ズレるため。入力上限が 2,000 字（後述）なので同期ハイライトの最悪コストは十分小さく、rAF スロットル等は入れない（caret とのズレを 1 フレームも生まないことを優先）
- ロード前に編集された場合は `.fallback`（同一フォントメトリクスのプレーンテキスト）に退避。エスケープは自前の `escapeHtml` で行う

`padTrailingNewline`: コード末尾が改行のとき、`pre` 側では最終空行が高さを持たず textarea とズレるため、空白 1 文字を足してから描画する。

### スクロール追従（transform 方式）

**スクロールするのは textarea だけ**。ハイライトレイヤーは scroll イベント（`passive: true`）で

```ts
preInner.style.transform = `translate3d(${-scrollLeft * scale}px, ${-scrollTop * scale}px, 0)`;
```

を適用して 1:1 追従する。`scale` は textarea の computed transform（`DOMMatrixReadOnly`）から読み取る縮小率（後述の iOS ズーム対策で textarea は scale されており、`scrollTop / scrollLeft` は変形前のローカル座標で返るため、視覚上の移動量へ換算する必要がある）。縮小率は md ブレークポイントでしか変わらないため、毎スクロールで computed style を読まずにキャッシュし、`matchMedia('(min-width: 800px)')` の change で境界を跨いだ時だけ再取得する。`scrollTop` 代入による同期を使わない理由：

1. `overflow: hidden` 要素へのスクロール代入はスクロール可能量でクランプされ、レイヤー間の寸法差があるとズレる
2. `innerHTML` 差し替えでスクロール位置がリセットされる事故が起きる（transform は `preInner` 自体に付くので、その中身を差し替えても保持される）

さらに `renderHighlight()` の最後で必ず `syncScroll()` を呼び、描画更新とスクロール位置を常に一致させる。スクロールバーは textarea 自身のものなので、つまみの位置・サイズとコンテンツは常に正確に対応する。

### 入力上限の強制（巻き戻し方式）

大量入力によるクラッシュ / フリーズ防止（毎キー入力でハイライト・変換・ヒーロー描画が走るため）。上限は `MAX_CODE_LENGTH = 2,000` 字（デモ用途の上限。初期コードは最大約 910 字（英語版。レスポンシブ表記の style 属性を含む）で、約 2 倍強の編集余地を残している）。

- **超過する入力は受け付けない**: `beforeinput` 時点（変更前）の値とカーソル位置をスナップショットしておき、`input` で超過を検知したら値・選択範囲ごと巻き戻す。「貼り付けたら末尾が黙って消えた」という切り捨て事故が起きない
- **IME 対応**: 変換中（`isComposing`）の巻き戻しは入力が壊れるため、`compositionstart` でスナップショットを取り、`compositionend` でまとめて判定・巻き戻す
- **超過状態からの脱出**: タブ切替の変換（HTML ⇔ JSX の整形で長さが変わる）で表示テキストが上限を超えることがあるため、長さが増えない編集（削除・同長置換）は超過中でも受け付ける（削除まで巻き戻されて上限内へ戻れなくなるのを防ぐ）
- タブ切替・`setCode()`・`setViewText()` 後にもスナップショットを更新し、巻き戻し先が古い状態にならないようにしている
- プレイヤーの書き込みは上限チェックの対象外（シナリオ・初期コードは上限内に収めて書くこと）

### 構文チェック・空チェック（デバウンス評価）

`<div` と打っている途中は常に「不正」なので、**入力が止まって 800ms 後に評価**する。タイピング継続中はスナックバーが出ない。

- **HTML タブ**: `findHtmlIssue()`（後述）でタグバランスを検査。検知してもヒーローは従来どおり寛容に描画し続ける（警告のみ）。タブの warning 色インジケーターもスナックバーもデバウンス後（invalid 判定がデバウンス評価にしかないため）
- **JSX タブ**: `processInput` での `jsxToHtml()` 即時判定結果を `jsxInvalidNow` に控えておき、デバウンス発火時に再パースせず流用する。タブの warning 色インジケーターは即時、スナックバーはデバウンス後
- スナックバーの表示は「正常 → 不正への遷移時」に 1 回だけ（`syntaxReported` フラグ。不正のまま編集を続けても連発しない）。タブの warning 色は不正な間は付き続け、構文エラーの永続的な手がかりを担う（両タブ共通。タブ切替で保持テキストが不正なまま戻った場合も復元される）
- **空チェック**: エディターが空（trim して空文字）のままデバウンス評価を迎えると、リセット提案（後述のアクション付きスナックバー）を表示。空提案の表示中に入力が再開されたらデバウンスを待たず即座に閉じる
- タブ切替・`setCode()` 時は評価タイマーを破棄して非表示に（古いメッセージの誤表示防止）。ただし空のままのタブ切替では、リセット提案を出し直して引き継ぐ（入力があるまで常時表示）

### 検索モーダルのデリゲーション

lism-ui の `setModal.ts` は初期化時に `document.querySelectorAll('[data-modal-open]')` で**要素へ直接バインド**するため、ヒーローを innerHTML で書き換えるとリスナーが消える。対策として、ヒーローコンテナに委譲リスナーを置き、`[data-modal-open]` のクリックを**ヒーロー外の常設トリガー（ヘッダーの検索ボタン）へ `.click()` で転送**する。`openDialog()` 側に連打ガードがあるため、初回ロード時（SSR 直後は直接バインドも生きている）の二重発火も無害。

### プレイヤー向け API（`EditorApi`）

プレイヤーはこのインターフェース越しにのみエディターへ触る:

- `setCode(code)` … コード全文の確定的な置き換え。モデル・ヒーロー・ハイライトを更新し、構文チェックをリセット。JSX タブがアクティブなら `htmlToJsx()` で変換した表記を表示する（表示テキストの決定は呼び出し側へ委ねず `setCode` 内で行い、表示とモデルの乖離を作らない）
- `setViewText(text)` … タイピングアニメの 1 フレーム反映。HTML タブは部分的な HTML でも描画できるため**モデル・ヒーローも同期**し、JSX タブはタイピング途中が不正な JSX になるため**表示のみ**更新する（モデルの確定は `setCode` で行う）
- `revealPosition(line, linePrefix)` … 編集位置を可視範囲へスクロールする（再生アニメ用）。行位置は行番号 × line-height、横位置は `linePrefix`（行内の先行テキスト）を canvas の `measureText` で実測して求める（等幅前提にしないので日本語混在でも正確）。textarea 内部のスクロールに加え、編集行がページのビューポート外にある場合は window 側もスクロールする（SP でエディター下の AI パネルを見ている間に編集箇所が画面外、というケースへの対策）。スクロールが発生したら true を返す（プレイヤー側が「間」を挟む判断に使う）。`prefers-reduced-motion` では smooth ではなく即時スクロール。scrollTop / clientWidth / フォント計測はすべて scale 変形前のローカル座標系で一貫しているためそのまま計算できる
- `getCode()` / `getActiveTab()` / `getViewText()` … 読み取り
- `textarea` / `tabButtons` … 中断トリガー（focus / pointerdown / タブクリック）のイベント登録用

## convert.ts — HTML ⇔ JSX 双方向変換

デモ専用の軽量実装。lism-css の実行ロジックは import せず、**`lism-css/config` の `PROPS` / `TOKENS` / `BREAK_POINTS`（純データ、React 非依存）だけ**を参照する。これにより「どの属性名が Lism prop か」「どの prop が BP 対応か」「どの値がトークンか」の判定は本物の定義と一致しつつ、クライアントバンドルに React が入らない。

### アーキテクチャ: パーサー 2 つ + 共通プリンタ

両方向とも「入力をパースして中間表現（`PrintableNode` ツリー: 出力タグ名・変換済み属性・子）に落とし、共通のプリンタで文字列化する」構成。**両方向が同じプリンタで整形するからこそ往復（ラウンドトリップ）が安定する**。

- HTML → JSX: `<template>` の innerHTML パース（寛容）→ `htmlElementToJsx()` で要素ごとに変換
- JSX → HTML: `DOMParser` の XML パース（厳密）→ `jsxElementToHtml()` で要素ごとに変換

### 変換ルール

| HTML | JSX | 備考 |
|---|---|---|
| `-fz:5xl` などの class | `fz="5xl"` などの prop | `-{key}:{val}` 形式で key が `PROPS` に存在するもの。**機械的変換** |
| `-fz:4xl -fz_md` class + `style="--fz_md: var(--fz--5xl)"` | `fz={['4xl', null, '5xl']}` | レスポンシブ表記（本物の Lism 出力と同形式）。`PROPS` の `bp: 1` の prop のみ・**配列記法のみ**。集約は往復ガード付き（後述） |
| `-bd` などの bare クラス | `bd`（値なしの boolean prop） | key が `PROPS` に存在するもののみ（本物の `val === true` → `-{prop}` と同じ規則）。XML は値なし属性を書けないため前処理でマーカー化する（後述） |
| `-hov:-o` などの class | `hov="-o"` prop | `hov` は `PROPS` 外の特別扱い prop（本物は `getLismProps` 内で分岐）。文字列形式のみ対応で、複数トークンはカンマ結合（`hov="-o,up"`） |
| `l--stack` / `l--flex` / `l--box` | `<Stack>` / `<Flex>` / `<Box>` | タグが div 以外なら `as="tag"` を付与 |
| `h1`〜`h6` | `<Heading level="n">` | Heading のデフォルト（level=2, タグ=`h{level}`）に準拠 |
| `p` | `<Text>` | Text のデフォルトタグ = p |
| prop クラスを持つその他のタグ（a, span 等） | `<Lism as="tag" …>` | Lism のデフォルトタグ = div |
| prop クラスを持たないタグ | そのまま（小文字タグ） | |
| 変換できないクラス | `className="…"` として保持 | 往復しても失われない |
| その他の属性（href, data-* 等） | そのまま引き継ぎ（順序保持） | |

属性の出力順も規則化している: `level` / `as` → Lism props（配列 prop は base トークンの出現位置）→ `className` → `style` → その他の属性、の順。JSX → HTML では `class` を先頭（レイアウトクラス → props 由来 → className 由来の順で連結）に、`style` をその直後に出す。順序が決定的だから往復で属性が並び替わらない。

### JSX のパース

`DOMParser` の **XML モード**でパースする（複数ルート対応のため `<jsx-root>` でラップ）。

- XML パースの前に軽量な前処理（`preprocessJsxAttrs`）を通す: 開始タグ内の属性を走査し、XML で表現できない 2 形式だけを私用領域文字のマーカー付き引用属性へ書き換える。①`={[...]}`（配列 prop）はマーカー + JSON へ（配列リテラルの読み取りは専用の安全なパーサ: 数値・引用文字列・null のみ。ネスト・末尾カンマ・エスケープは拒否。eval 不使用）、②値なし属性（`bd` 等の boolean prop）は boolean マーカーへ。**どちらにも当てはまらない構文（その他の `{}` 式・引用符なし値）は書き換えずそのまま残す** → XML パースエラー → null → last-good が従来どおり成立する
- XML は厳密なので、閉じタグ漏れ・配列リテラル以外の `{}` 式・引用符なし属性は**パースエラー → `null` を返す**。呼び出し側の「不正な間は last-good 維持」がこれだけで成立する
- タグ名の大文字小文字が保持される（HTML パーサーだと小文字化されてコンポーネント名が壊れる）
- 未知の大文字コンポーネント・不正な `level`（1〜6 以外）は明示的に `JsxConvertError` を投げ、`jsxToHtml()` が catch して `null` に変換する（それ以外の例外は握り潰さず再 throw）

### レスポンシブ props（配列記法）の双方向変換

本物の Lism はレスポンシブ値を「`-{prop}_{bp}` クラス + `--{prop}_{bp}` の inline CSS 変数」の組で出力する（`getLismProps.ts` の `setAttrs`）。このデモ用サブセットを実装し、`fz={['4xl', null, '5xl']}` ⇔ `-fz:4xl -fz_md` + `--fz_md: var(--fz--5xl)` の往復を成立させている。

- **展開（JSX → HTML）**: 配列 `[base, sm, md, lg, xl]` の base は既存どおり `-{key}:{val}` へ機械変換、BP 成分は `-{key}_{bp}` クラス + `--{key}_{bp}` 変数の組へ。値の変換は本物の `getMaybeCssVar` のサブセット（space トークンは整数 → `var(--s{n})`・負値 → `calc(-1 * var(--s{n}))`・`0` → `0`、その他トークンはカタログ登録値のみ `var(--{token}--{key})`、未登録は生値）
- **集約（HTML → JSX）**: BP クラスを持つ prop ごとに base トークン + BP クラス + style 変数から配列を復元する。**往復ガード**: 復元した配列を同じ展開関数（`expandBpProp`）で再展開し、元のクラス・宣言を**文字単位で完全に再現できる組だけ**を集約する。1 つでも一致しなければその prop は集約せず素通し（base は文字列 prop、BP クラスは className、変数は style 残余 — この経路は従来仕様のまま往復安定）
- クラスだけ（変数なし）・変数だけ（クラスなし）・正準形でない値（`--p_md: 40` 等）は集約されず素通しされる
- 集約対象の要素の style 属性は宣言リストへパース可能であること（括弧の不整合などパース不能なら、その要素は集約せず class・style とも素通し）

### 対応範囲の制限（仕様）

- 配列リテラル以外の `{}` 式（`g={8}`・オブジェクト記法 `fz={{base,md}}`・`{}` 内の式や変数参照）は非対応 → XML パースエラーになり last-good 動作。レスポンシブのオブジェクト記法はドキュメントが推奨する配列記法へ寄せる方針（xs スロットも配列記法に無いため非対応）
- 配列 prop は `PROPS` の `bp: 1` の prop のみ。bp 非対応 prop（`bgc` / `c` 等）や `hov` への配列は変換エラー → last-good 動作
- 値なし属性（boolean prop）は `PROPS` にある prop のみ。`PROPS` 外の値なし属性（`data-x` 等）は変換エラー → last-good 動作。同一 prop の bare クラスと BP クラスが同居する場合（`-p -p_md` + 変数）は、同名 prop の重複を避けるため集約せず素通しする
- `hov` は文字列形式（`hov="-bgc"`）のみ。boolean 形式（値なしの `-hov` クラス）と オブジェクト形式（`hov={{bgc:'red'}}` — inline CSS 変数が絡む）は非対応で、`-hov` は className として保持される（`hov` は `PROPS` テーブル外のため boolean prop 変換の対象にもならない）
- prop 名の認識は本物と同期する一方、値の変換は `-prop:val` クラスへの機械変換のみ。本物の Lism がクラスでなく inline CSS 変数にする値（トークン外の任意値: `mbs="3.5rem"` 等）は、クラスにしてもビルド済み CSS に存在せず見た目には効かない
- 名前付き文字実体は XML 定義済みの `&amp; &lt; &gt; &quot; &apos;` のみ対応。`&nbsp;` 等の XML 定義外の実体は JSX タブでは XML パースエラーになり last-good 動作
- コメントノードは両方向とも無視（出力に含めない）

### プリンタ（整形ルール）

- 要素・テキストは 1 行ずつ、2 スペースインデント
- 単一テキスト子で行長 80 字以内（インデント込み）なら 1 行にまとめる（例: `<span …>⌘ K</span>`）
- void 要素は `<br />`。空要素は JSX では `<Tag />`、HTML では `<div></div>`（`<div />` は不正な HTML のため）
- 複数行テキストは行ごとに分割し、各行を trim して出力。空白のみのテキストノードは整形由来と見なして捨てる
- テキストは `& < >`、属性値はさらに `"` をエスケープする

**レスポンシブ表記の正準形**（「1 文字も変わらない」往復保証はこの形で書かれた入力に対するもの。ズレた入力も集約はされるが、往復でこの形へ正規化される）:

- HTML: class 内は base トークンの直後に BP クラスを sm → md → lg の昇順で並べる。`style` は class の直後に置き、生成変数（prop の出現順 × BP 昇順）→ その他の宣言の順に `名前: 値` を `; ` で連結
- JSX: 配列リテラルは `key={['4xl', null, '5xl']}` 形式（区切りは `, `・ギャップは `null`・末尾の null は削る・数値は裸、それ以外はシングルクォート）。base のみの配列（`p={[20]}`）は受理するが、再生成時は文字列 prop（`p="20"`）へ正規化される

## sanitize.ts — 無害化

脅威モデルは **self-XSS のみ**（エディターの入力者 = 閲覧者。入力が保存・共有されることはない）。「安全なものだけ許可する」ホワイトリスト方式ではなく、「実行経路になるものだけ除去する」ブラックリスト方式で十分と判断した。`<template>` にパースして:

- 実行経路になる要素を除去: `script, style, link, meta, base, iframe, object, embed, form`
- `on*` 属性を除去（大文字小文字不問）
- `href/src/srcset/xlink:href` の `javascript:` / `data:text/html` スキームを除去（U+0000〜U+0020 の制御文字・空白を取り除いて正規化してから判定するので、`java\nscript:` のような偽装も検知する）

初期 SSR（`set:html={INITIAL_HTML}`）は開発者が書く信頼済みコンテンツなのでサニタイズしない。クライアントでの再描画は常にサニタイズを通す。

## validate.ts — 入力上限値とタグバランスチェック

- `MAX_CODE_LENGTH = 2_000`: エディターの最大入力文字数（editor.ts の巻き戻し処理が参照する定数）
- `findHtmlIssue(code)`: スタック式の軽量タグバランスチェック。ブラウザの HTML パーサーは寛容で「不正」を返さないため、よくあるミスだけを自前で検知する
  - 検知対象: 閉じ漏れ（`unclosed <div>`）/ 対応しない閉じタグ（`stray closing </div>`）/ 書きかけタグ（`incomplete tag`）/ 未終了コメント（`unterminated comment`）
  - 誤検知しないための処理: 属性値内の `>` は引用符を追跡して無視、`a < b` のような地の文の `<` はタグとして扱わない（直後が英字・`/`・`!` のときだけタグ開始と見なす。ブラウザと同じ挙動）、void 要素・自己終了タグ・doctype はスタックに積まない
  - WHATWG の省略可能な終了タグ（optional end tags）はテーブル駆動で暗黙クローズし、ブラウザと同様に valid 扱いする: 次の開始タグによる暗黙クローズ（`<p>a<p>b`・`<li>a<li>b`・`<table><tr><td>a<tr>` の連鎖等。`<hr>` 等の void 要素でも発動）/ 親要素の終了タグによる暗黙クローズ（`<div><p>a</div>`）/ 入力末尾で開いたままの省略可能要素（`<p>hello`）
  - raw text 要素（`script` / `style` / `textarea` / `title`）の中身はタグとして解釈せず、対応する閉じタグまでスキップする（`<textarea>a < b</textarea>` 等を誤検知しない）
  - 既知の限界: 内容モデル（`span` 内の `p` 等の不正なネスト）や属性の妥当性は検証しない。`<p>` の終了タグ省略が許されない親（`a`・`audio` 等）の例外規定は実装せず一律で省略可能として扱う。「よくあるミスだけを検知する」軽量チェックの範囲内として許容している
  - 戻り値の詳細メッセージは内部・デバッグ用で、表示側は一律 `Invalid HTML syntax` を使う（後述）

## snackbar.ts — 通知・提案の表示

エディター右下（absolute 配置のコンテナ `.c--kvEditor_snackbarStack`。`role="status"` でスクリーンリーダーにも通知）に出すスナックバー風の通知。一般的なスナックバー同様、**複数の通知を縦にスタック表示**する。これにより、例えば「空のときのリセット提案（永続）」の上に「上限到達の警告（自動クローズ）」が積まれても、提案が上書きで消えず Restore の手段が失われない。2 つの variant を持つ:

**通知型（`show`）** — 上限超過・構文エラー用

- メッセージは**端的な英語**: `Invalid HTML syntax` / `Invalid JSX syntax` / `Character limit reached (2,000)`
- すべて **4 秒で自動クローズ**。**同一文言は積み増さず**、既存カードを末尾（最前面）へ寄せてタイマーを延長する。構文エラーの永続的な手がかりはアクティブタブの warning 色が担う（HTML / JSX 両タブ共通）
- 見た目は **warning トーン**（動作は継続する非致命的な通知のため、赤ではなくアンバー）: 警告アイコン（octicon alert を CSS mask で描画）+ アンバーのボーダー。色は `--kvEditor-warning`（github-dark の yellow 系）で、JSX タブのインジケーターと共通
- `pointer-events: none` でエディター操作を妨げない（コンテナ自体もクリックを透過する）

**提案型（`showAction`）** — エディターが空になった時のリセット提案

- エディターが空のままデバウンス評価を迎えると、`The editor is empty.` + `Restore initial code` ボタンを表示
- **自動クローズしない**。入力の再開（即時に消える）か Restore ボタンで閉じる
- スタック内に**常に 1 つだけのシングルトン**（再表示は既存の提案を即時差し替える）
- Restore は初期コード（`initialHtml`）に復元（JSX タブなら JSX 表記に変換して復元）し、フォーカスをエディターへ戻す（`preventScroll: true` でページのスクロール位置は動かさない）
- この variant のみ `pointer-events: auto`（ボタンをクリックできる）。見た目は警告ではないため warning ではなく **info トーン**（ⓘ アイコン + ニュートラルなボーダー）

**スタックの出入りアニメーション**: カードを直接ではなく、**折りたたみラッパー（`.c--kvEditor_snackbarRow`）の height だけ**をアニメーションさせる。カード間の隙間はカード（`.c--kvEditor_snackbar`）の margin-top で持たせ、ラッパーの `overflow: hidden`（BFC 化）で height に内包させるため、「カード + 隙間」が 1 つの height トランジションで滑らかに畳める（ラッパーの padding で隙間を持たせると、border-box では height: 0 まで縮まずカクつく）。カード自体は opacity + translateY のフェードのみを担当する（`prefers-reduced-motion` ではどちらのトランジションも無効）。height トランジションの完了待ちは `transitionend` + タイムアウトのフォールバックで、reduced-motion 等で発火しないケースにも対処している。

## highlight.ts — shiki の最小構成

- `@shikijs/core` + JS 正規表現エンジン（`forgiving: true`）+ `html`/`jsx` 文法 + `github-dark` テーマのみの fine-grained bundle
- ハイライターの生成は 1 回だけ（Promise をモジュールスコープにキャッシュ）。ビルド時（frontmatter）とクライアントで同じモジュールを使う
- shiki が出力する `pre` の背景は CSS で打ち消し、ウィンドウ背景は Figma モックアップ準拠の `#26292c` を使う（トークンの配色 = ハイライト色は github-dark のまま）
- API は 3 つ:
  - `highlight()` … async。ビルド時（frontmatter）と初期化用
  - `preloadHighlighter()` … クライアントでの事前初期化
  - `highlightSync()` … 初期化後の同期ハイライト（入力のたびに呼ぶ。未初期化なら `null` を返し、呼び出し側がプレーン表示にフォールバック）
- transformer で shiki 出力の `tabindex` を削除（`aria-hidden` レイヤー内にフォーカス可能要素を置かないため）

## player.ts — シナリオ再生エンジン

### ステートマシン

```
idle ──click──▶ playing ──全ステップ完遂──▶ done ──click──▶ (リセットして) playing
                  │ ▲
   textareaにfocus/ │ │ Resume ボタン or click
   pointerdown /   ▼ │ （"Interrupted" 行だけ取り除き、中断したフェーズの続きから残りを再生）
   タブ切替 /    interrupted（チャットに "Interrupted" + Resume を表示）
   Askボタンクリック
```

- **1 クリック = 全ステップ連続再生**: 「Ask AI to edit...」のクリックで全ステップを順に一気に再生する。ステップの切り替わりには少し長めの「間」（`PAUSE_BETWEEN_STEPS`）を挟む（最後のステップの後には置かず、完遂した瞬間に done になる）
- **再生はアクティブタブの表記で行う**: シナリオは HTML で持ち、JSX タブでは `htmlToJsx()` で変換した文字列をタイピングする（AI 吹き出しも `aiMessageJsx` に切り替え）
- **再生開始時にコードをスナップしない**: コード書き換えは「現在のエディター内容 → `resultCode`」の diff タイピングなので、再生前にユーザーが編集していても、その状態を出発点として目標コードへ書き換える動きになる（done 後のリスタートだけは初期コードへ戻す）。**例外はエディターが空のとき**: 空から始めると初期コード全文のタイピングになり冗長なため、初期コード（`initialHtml`）へ即時復元してから再生する（失う編集がない場合のみの復元なので、上記の設計と両立する）。**もう 1 つの例外は書き換えアニメの想定所要時間が上限（`MAX_CODE_ANIM_MS`）を超えるとき**（上限いっぱいの巨大な貼り付け・空にしてからの Resume 等）: そのステップの開始コード（前ステップの `resultCode`。最初のステップは初期コード）へ即時復元してから再生する。復元後の diff はシナリオが意図した小さな編集そのものになるため、チャット文言と書き換えの動きが常に一致し、アニメ時間に上限が付く。復元でヒーローが縮んでエディターがビューポート外へ出た場合は、エディターウィンドウを `scrollIntoView` でビューポートの上下中央へ戻す（done 後のリスタート等のリセット系スナップも同様）
- **中断**: 再生中に textarea へ `focus` / `pointerdown`、タブクリック、または「Ask AI to edit...」トリガーの再クリック（再生中は停止ボタンとして機能する）で**その場で即中断**。エディターは書きかけの状態をそのまま残し（仕様）、入力欄トリガーはプレースホルダー表示（`Ask AI to edit...`）へ戻し、チャット末尾にステータス行（"Interrupted" + Resume ボタン）を追加する。`AbortController` + abort 対応 `sleep()` で実装し、非同期ループは `AbortedError` で脱出する（それ以外の例外は再 throw）
- **再開**: Resume ボタンまたは「Ask AI to edit...」のクリック（どちらも同じ処理）。ステップの頭へ巻き戻さず、**中断した瞬間のフェーズ（`resumePhase`: user / ai / code）の続きから**再生する。"Interrupted" ステータス行（`interruptedRow`）だけを取り除き、吹き出し・書きかけのコードはそのまま残す。AI 吹き出しは途中まで打ったテキストが目標文言の先頭一致なら続きの文字から打ち（不一致 — 中断後のタブ切替等 — なら打ち直す）、コードは「現在のビュー → 目標コード」の diff で残りを書き換える。したがって中断中のユーザー編集もスナップで上書きされず、そこを出発点に目標コードへ書き換わる。`resumePhase` は各フェーズの完了時点（後続ポーズの前）に更新するため、ポーズ中に中断しても再開時に吹き出しを二重生成しない
- **全ステップ完遂（done）**: チャット末尾にステータス行（"Done"）を表示する。再クリックでチャットをクリアし初期コードへ戻して最初から。初期コードへ戻す（編集を破棄する）のは設計判断: `resultCode` は累積のため、最終状態（やその上への編集）から step 1 を再生すると「後続ステップの変更を取り消す diff」がタイピングされる undo→redo の壊れた演出になる。リプレイは初期コードへのリセットが前提（仕様として編集は破棄する）

### 1 ステップの流れ

1. **ユーザー発話**: 入力欄トリガー（`.c--kvEditor_ask`）に 1 文字ずつタイピング（`is--typing` クラスで文字色を通常色にし、点滅キャレットを表示）→ 短いポーズ → 送信演出（プレースホルダーへ戻し、ユーザー吹き出しに全文一括表示）
2. **AI 発話**: AI 吹き出しへ 1 文字ずつタイピング。メッセージ領域は追記のたびに末尾へ自動スクロール（スクロールイベントが発火しない末尾追記でも上下端フェードがズレないよう、`scroll-hint.ts` の更新関数を明示的に呼ぶ）
3. **コード書き換え**: 後述の diff タイピング。完了したらステップ間の「間」を挟んで次のステップへ

吹き出しは `<p class="c--kvEditor_msg is--user / is--ai">` を `[data-kv-messages]` へ追記する。中断時（"Interrupted" のラベル + `.c--kvEditor_statusBtn` の Resume ボタン）・完了時（"Done" のラベルのみ）のステータス行も同じ領域へ `<p class="c--kvEditor_status">` として追記する。スクリーンリーダーへの通知は可視のチャット領域ではなく、隠しライブリージョン（`u--srOnly` + `[data-kv-live]`・`aria-live="polite"`）へ `announce()` で流す。1 文字ずつのタイピング途中は告知せず、確定した文言のみ（ユーザー吹き出しの表示時・AI 発話のタイピング完了時・中断時 "Interrupted"・完了時 "Done"）を告知する。連続して同一文言でも読み上げられるよう、一度空にしてから rAF で本文を設定する。

タイピング・ポーズの速度はモジュール先頭の定数に集約している（ms）: ユーザー入力 30 / AI 発話 22 / コード削除 12（2 文字ずつ）/ コード挿入 18（1 文字ずつ）、送信前 300 / AI 応答前 400 / コード書き換え前 500 / ハンク間 350 / 編集位置へのスクロール後 300 / ステップ間 1400（reduced-motion 時は 900）。

### コード書き換えアニメ（ハンク単位の diff タイピング）

全文置換ではなく、行単位の LCS（`lib/diff.ts` の `diffLineHunks()`）で**変更された行のまとまり（ハンク）**を検出し、上から順に 1 ハンクずつ書き換える。`<Flex>` → `<Stack>` のように開始タグと閉じタグが離れて変わるケースでも、間の無変更な子要素を巻き込んで再タイプしない。ハンク間には短いポーズ（`PAUSE_BETWEEN_EDITS`）を挟み、編集箇所を移動している演出にする。適用済みハンクで行数が増減するため、行番号のズレ（`lineShift`）を補正しながら順に適用する。

アニメ開始前にハンク列から想定所要時間（削除・挿入のティック数 × 各インターバル + ハンク間ポーズ）を見積もり、上限（`MAX_CODE_ANIM_MS` = 3 秒）を超える場合はステップ開始コードへ即時復元してから diff を取り直して再生する（前述のステートマシン節の例外を参照）。

各ハンクの書き換え前に、編集開始位置（`diffCode()` の共通 prefix `head` の末尾）を `editor.revealPosition()` で可視範囲へスクロールする。モバイルでは編集箇所が textarea のスクロール範囲外（横に長い行）やページのビューポート外にあり演出が見えないことがあるための措置で、スクロールが発生した場合は短い「間」（`PAUSE_AFTER_REVEAL`）を挟んでから書き換えを始める。

各ハンク内はさらに文字単位で共通 prefix / suffix を除き（`diffCode()`）、実際に変わる文字だけを:

1. 削除フェーズ: 後ろから数文字ずつ削る
2. 挿入フェーズ: 新しい文字列を 1 文字ずつタイプ

フレームの反映は `editor.setViewText()` を毎ティック呼ぶ。HTML タブではモデル・ヒーローも同期するが、JSX タブではタイピング途中が不正な JSX になるため**表示のみ**更新し、ステップ完了時に `snapTo()`（内部で `editor.setCode(html)`）でモデル（＝ヒーロー）を確定する。ヒーローは rAF スロットル・ハイライトは同期実行なので負荷は問題にならない。

### reduced-motion

`prefers-reduced-motion: reduce` の場合、タイピング演出（入力欄・吹き出し・コード）を省略して即時適用し、ステップ間の「間」も短め（900ms）にする。判定は `matchMedia` を都度参照するので、再生中の設定変更にも追従する。

## diff.ts — 再生アニメ用の diff 計算

player.ts から使う純粋関数 2 つ。対象は高々数十行のデモコードなので、実装は簡潔さを優先している。

- `diffCode(from, to)` … 文字単位で共通の先頭（`head`）・末尾（`tail`）を除き、実際に変わる部分（`removed` / `inserted`）だけを返す。ハンク内のタイピング範囲を最小化する
- `diffLineHunks(fromLines, toLines)` … 行単位の LCS（動的計画法・O(m×n)）で「`fromLines[fromStart, fromEnd)` を `toLines[toStart, toEnd)` に置き換える」ハンクの列を返す。一致行はスキップし、不一致の連続区間を 1 ハンクにまとめる（ハンクを順に適用すると必ず `to` が復元できる）

## scenario.ts — シナリオデータ

```ts
interface ScenarioStep {
  userMessage: string;    // ユーザー側吹き出し（表記非依存）
  aiMessage: string;      // AI側吹き出し（HTMLタブ再生時）
  aiMessageJsx?: string;  // AI側吹き出し（JSXタブ再生時。省略時は aiMessage で代用）
  resultCode: string;     // ステップ完了時のエディター全文・HTML表記（差分ではない）
}
```

- `resultCode` は**全文かつ累積**（前ステップの結果を含む）。全文にしているのは、中断→再開を含むどの時点からでも diff 計算の目標として一意に定まるようにするため
- **言語対応**: `userMessage` / `aiMessage` / `aiMessageJsx` は `Record<DemoLang, string>` で定義し、`edits` は言語共有。`SCENARIO_BY_LANG` として各言語の `resultCode` を言語別初期コードから導出する（`edits` はクラス属性のみを対象にすること — 前述の i18n セクション参照）
- **ソース上は全文を重複して持たない**: 各ステップは「前ステップのコードへの文字列置換」（`edits: [from, to][]`）として定義し、`resultCode` はモジュール初期化時に言語別初期コードから順に適用して導出する。これにより `initial-code.ts` の変更は自動で全ステップへ波及する（かつては全文スナップショットを 3 つ持っており、初期コードの変更を波及し忘れると再生時の diff が「変更を取り消す編集」をタイピングするバグがあった）
- **fail-fast**: `edits` の置換前文字列がちょうど 1 回現れない場合（初期コード変更とのズレ・曖昧な指定）はモジュール初期化時に例外を投げる。沈黙して壊れず、開発中に必ず気づける。全言語を eager に導出するため、どの言語のズレも初期化時に検知される
- `edits` はプリンタの整形ルールを保つ範囲で書くこと（変更時は JSX タブとの往復で壊れないことを手動確認）
- `aiMessage` / `aiMessageJsx` は表記の違い（`-c:brand` クラス vs `c="brand"` props 等）を文言にも反映するためのペア
- 現在は仮の 3 ステップ: ①見出しに `-c:brand` ②ボタンを `-bdrs:99`（ピル型）③ラッパーを `l--flex` → `l--stack`（JSX タブで Flex → Stack の対応も見せられる）

## _kv-editor.scss — スタイルの要点

`@layer lism-component` に記述（lism-base のベーススタイルより優先させるため）。

### ウィンドウ全体

- **常時ダーク・フラット構成**: サイトテーマに関わらずエディターウィンドウは常にダーク。全体が単一の `#26292c`（バーの色分けなし）で、タブのアクティブ・AIパネル・入力欄風トリガーはすべて「白8%オーバーレイ」（`--kvEditor-surface`）で面を作る（Figma モックアップ準拠）。色は `--kvEditor-*` のローカル変数（bgc / surface / snackbar-bgc / text / text-dim / warning）に集約
- **ヒーロー側はサイトテーマに追従**: トークン化されていない任意色（リード文の `#333`・検索ボックスの文字色 / 輪郭）のみ `:root[data-theme='dark'] .c--kvEditorHero` で上書きする。見出し色・ボタン背景は `--gray-hi-c` 変数のダーク値で自動対応
- レイアウトは grid: エディター `minmax(0, 1fr)` + パネル `12.6875rem`（203px）、全体 `max-width: 56.4375rem`（903px）× `height: 28rem`（448px）。md 未満は縦積み（エディター 1fr + 下段パネル `9.125rem` = 146px、全体 537px）
- ウィンドウバーの信号ドットは span 1 つ + box-shadow 2 つで 3 色を描画。タブは幅 4rem（64px）固定（モックアップ準拠）

### エディター（重ねレイヤー）

- **フォントメトリクスの視覚上の完全統一**: `pre` / `.fallback` は 14px（SP 12px）・line-height 1.25（初期コード 21 行がエディターに縦スクロールなしで収まる）・padding `0.5rem 1rem` 等を共通ルールで適用。1px でもズレると caret 位置が狂う
- **iOS の自動ズーム対策（textarea の scale 縮小）**: iOS はフォーカスした入力欄の font-size が 16px 未満だと画面ごと自動ズームする。これを避けるため textarea だけ `font-size: 16px` とし、`transform: scale(var(--kvEditor-input-scale))`（`0.875` = 14/16、SP は `0.75` = 12/16）で pre レイヤーと同じ見た目に縮小する。width / height / padding は縮小率の逆数（`calc(… / var(--kvEditor-input-scale))`）で拡大して視覚上一致させる。このとき lism-css の reset（`@layer reset`）にある `textarea { max-inline-size: 100% }` が拡大後の width をクランプしてしまう（スクロールバーが内側に寄る）ため、`max-inline-size: none` で解除している。textarea の文字自体は透明なので pre レイヤーと合うべきは caret・選択範囲の位置だけであり、等幅フォントの字送りはサイズに対して線形（16px × 0.75 = 12px の字送りと厳密一致）なのでズレない。スクロール座標の換算は editor.ts の `syncScroll` が行う（前述）
- **`.c--kvEditor_pre pre *` への強制継承**: lism-css のベースに `* { line-height: calc(1em + var(--hl) * 2) }` という全要素対象ルールがあり、shiki の `code` / `.line` スパンに直接当たって textarea とズレる。これを打ち消すため子孫全部に `inherit` を明示（lism-component レイヤーは lism-base より強い）
- textarea は文字を透明（`color: transparent`）にして caret（`caret-color`）だけ表示。選択範囲も `::selection` で色を敷きつつ文字は透明のまま
- `preInner` は `width: max-content` + `will-change: transform`（横スクロール時にハイライトが切れず、transform 追従を合成レイヤーで行う）

### AI パネル

- 白8% + 左ボーダー白20%（SP では下段全幅・境界は背景差のみでボーダーなし）
- パネルとメッセージ領域に `min-height: 0` を指定（グリッド / フレックスアイテムのデフォルト `min-height: auto` を打ち消さないと、メッセージ領域の overflow スクロールが効かない）
- メッセージ領域は `scrollbar-gutter: stable`（スクロールバーの出現で幅がガタつかない）、`:empty` で非表示
- メッセージ領域の上下端には、スクロール余地を示すグラデーションフェード（`mask-image`）を敷く。フェード高さの CSS 変数 `--kvEditor-mask-top` / `--kvEditor-mask-bottom` は `scroll-hint.ts` がスクロール位置に応じて更新し、端までの残り距離に比例して伸縮させるため、transition なしでも端に近づくにつれて滑らかに消える
- 中断ステータス行（`.c--kvEditor_status`）は吹き出しと違い背景なしの控えめな表示（dim 色・ラベルとボタンを両端揃え）。Resume ボタン（`.c--kvEditor_statusBtn`）はスナックバーの Restore ボタンとスタイルを共用（セレクタを連結して定義）
- 空状態はグラデーションの円形ロゴ（`#89f9e1 → #87caf7 → #af8cff`）+ プレースホルダー文
- 入力欄風トリガー（`.c--kvEditor_ask`）は `margin-block-start: auto` で常にパネル下端へ固定（プレースホルダーが消えてメッセージがまだ空の間もジャンプしない）。右下に `↑` 入りの 12px 矩形（`#373a3d`）。再生中のタイピング表示は `.is--typing` で文字色を通常色に切り替え、`::after` の点滅キャレット（1px 幅・steps アニメ）を付ける

### レスポンシブ

- **SPのヒーロー縮小はエディター内容（初期コード）のレスポンシブ表記が担う**: h1 とリード p が `-fz_md` クラス + `--fz_md` 変数を持ち、md 以上でだけ大きいサイズに切り替わる（Lism の実機構がそのまま効く。デモとしてレスポンシブ表記を見せる意図も兼ねる）。CSS 側で `font-size` を絞る旧方式（`0.7em`）は二重縮小になるため廃止。CSS 側が担うのはトークン化できない任意値（色・行間・影）のみ
- Lism の BP クラスは `@container (min-width: 800px)` で効く（コンテナは `SimpleLayout` の `.is--container` ラッパー）。エディターウィンドウ等の docs ローカルなスタイルのブレークポイントは Lism の `md`（800px）に統一し `@media not (min-width: 800px)` 表記（コンテナ幅 ≒ ビューポート幅のため境界差はスクロールバー幅程度）

### 英語トップ専用の調整（`html[lang='en'] .c--kvEditorHero`）

置き換え前の `[lang]/index.astro` 静的ヒーローのスタイルを尊重するための言語差分。エディター内容は言語間で構造を揃え、言語差はすべて CSS 側で吸収する:

- 見出しの `letter-spacing: var(--lts--tight)`、リード文の `line-height: 1.75`（SP は `1.5`）はレイヤー内で指定
- SP の見出しサイズは言語共通の初期コードのレスポンシブ表記（`-fz:4xl -fz_md` + `--fz_md`。前述）に任せる。旧静的ヒーローの SP サイズ（`2.25rem`）を CSS で固定する案は、非レイヤールールが必要になりユーザーがエディターで打った `-fz:*` を上書きしてしまうため不採用
- Get Started ボタンのセレクタは href のプレフィックスが言語で変わるため後方一致（`a[href$='/docs/installation/']`）

## index.astro / [lang]/index.astro の変更

- ヒーロー（旧 Heading / Text / Button / kv-search 入力）と TODO のダミー SVG `<Group>` を `<KvEditor />` に置換
- 旧 `#kv-search` の inline script（Enter で検索モーダルを開いて入力を転送する処理）と `.c--kv-search` スタイルを削除（検索はモックアップ準拠のアンカー + ⌘K チップに置き換わり、クリックでモーダルが開く）
- `main.scss` に `@use './kv-editor'` を追加
- 背景動画・後続セクションは変更なし
- `[lang]/index.astro`（en）も同様の置換を実施（`<KvEditor lang={lang} />`）。ページ側の `:global(html) { --fz-mol: 8 }`（トップページのフォントスケールを ja と統一するオーバーライド）は維持している。旧英語ヒーローのみが使っていた `_theme.scss` の `.c--line-height` は削除済み

## 既知の制限・今後の調整ポイント

- JSX タブの `{}` 式はレスポンシブの配列記法（`p={[20, 40, 50]}`）のみ対応。オブジェクト記法・単一値 `{20}`・式や変数参照は非対応（仕様）。編集途中は last-good 維持で、タブの warning 色とデバウンス後のスナックバー以外のエラー表示はない
- sanitize は self-XSS 前提の軽量実装。入力の保存・共有機能を将来足す場合は DOMPurify 等への差し替えを検討
- 初期コード・シナリオの文言、ヒーローの色味・余白は仮。デザイン照合して調整予定
- shiki チャンクは gzip 約110KB（html 文法が JS/CSS 文法を内包するため）。アイドル時ロードなので初期表示には影響しない

## 検証方法

このコンポーネントに自動テストは置いていない（プロジェクトの慣行に合わせ、UI まわりの検証は手動で行う）。

```bash
nr dev:docs                       # 手動確認
pnpm --filter lism-docs typecheck # 型チェック
```

手動確認の要点:

- **ラウンドトリップ安定性**: JSX タブへ切り替えて HTML タブへ戻り、コードが 1 文字も書き換わらないこと。`initial-code.ts`・`scenario.ts` の `resultCode`・`convert.ts` のいずれかを変更したら必ず確認する
- ライブ編集（ヒーロー連動・ハイライト・スクロール追従・caret 位置）
- 再生・中断（Interrupted + Resume）・再開・done 後のリスタート
- 上限超過・構文エラー・空エディターのスナックバー表示
- ⌘K（検索モーダル）/ reduced-motion / SP 表示 / ダークモード
