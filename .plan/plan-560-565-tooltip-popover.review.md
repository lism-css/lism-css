## Plan Review (by GPT-5.4)

対象: `.plan/plan-560-565-tooltip-popover.md`

### 判定: 要修正

### Blocking
- B1: `@supports not`でフォールバックへ入っても、前段のanchor配置を無効化していない。プランはChrome 125〜130をフォールバック表示にするとしているが、[OddBirdの対応表](https://github.com/oddbird/css-anchor-positioning#browser-support)どおり、段階的に実装されたブラウザでは`anchor-scope`が未対応でも`position-area`等は有効になり得る。その場合、Tooltipの物理insetやPopoverの中央配置を指定しても、残った`position-area`と誤った共有anchorが配置へ影響し、「複数設置時にアンカーを取り違えない」という不変条件を守れない。[CSS Anchor Positioning仕様](https://drafts.csswg.org/css-anchor-position/#position-area)でも、`position-area`は包含ブロックとinset・marginの解決方法を変える。
  - 修正案: TooltipとPopoverのフォールバック規則で、anchor側に指定した配置関連プロパティを明示的に初期化する。少なくとも`position-area: none`、`position-try-fallbacks: none`、`justify-self: normal`、`align-self: normal`を戻し、その後にフォールバック用の`position`・`inset`・`margin`・`translate`を指定する。部分対応ブラウザでもcomputed styleがフォールバック値になる確認を完了条件へ追加する。
- B2: IDの優先順位がReactとAstroで一致せず、`aria-describedby`または`popovertarget`とPopupの`id`が不一致になり得る。プランはReactを`ctx?.id || 自身のprop`としてRootのContextを優先する一方、「子で明示上書きできる」としている。Astroでは子の明示IDだけがプレースホルダー置換を避けるため、Root配下でPopupだけを上書きするとTrigger/Closeとの配線が壊れる。これはアクセシビリティとネイティブ開閉の不変条件なので、実装前に共通契約を決める必要がある。
  - 修正案: compound利用時はRootの`tooltipId`/`popoverId`を唯一のID指定手段とし、子のID propsはRoot外で単体利用するときだけ使える契約に統一する。React/AstroともRoot配下ではRootのIDを必ず優先し、子へ競合するIDを渡してもTrigger・Popup・Closeの関連属性が一致するテストを追加する。
- B3: document共有のTooltipイベントについて、React Rootと解除関数の所有関係が未定義である。各Rootが`useEffect`から`setTooltip()`の解除関数を返す実装にすると、複数Rootのうち1つをunmountしただけで全体のリスナーが消え、残ったTooltipでEscとdismiss解除が動かなくなる。逆に解除しない設計なら、その永続singletonであることを計画上の不変条件にする必要がある。
  - 修正案: document委譲リスナーは最初の登録後、ページ存続中は保持する方式を推奨する。React Rootは`setTooltip()`を呼ぶだけで戻り値をeffect cleanupに使わず、解除関数はテストのリセット専用と明記する。代わりに各Rootで解除したいなら参照カウント方式を選ぶ。どちらの場合も「2つmount→片方だけunmount→残ったTooltipのEscと再表示が動く」テストと、Strict Mode相当の再実行テストを追加する。

---

## 対応記録 (round 1)

- B1: 修正 — 共通方針1に「部分対応ブラウザの扱い」を追加し、制約を「anchor側に書いたプロパティは全部フォールバックで上書き（anchor系は`position-anchor: auto; position-area: none; position-try-fallbacks: none; justify-self: auto; align-self: auto`で初期値へ）」に改めた。CSS例・Tooltip/Popoverのフォールバック節・設計判断・受容済みリスクを同じ内容に揃え、完了条件に「現行ChromeのDevToolsで`@supports not`を恒真にしてcomputed styleがフォールバック値になる確認（可能ならChrome for Testing 130でも）」を追加した。
- B2: 修正 — 共通方針6を「子の明示propがRootのIDより優先（React/Astro共通）」に統一し、Reactの解決順を`自身のprop || ctx?.id || プレースホルダー`へ変更。Root配下でIDを指定する手段は`tooltipId`/`popoverId`だけ、子のID propsはRoot外で単体利用する手段、Root配下で一部の子にだけ渡すと配線が壊れる、をdocsに明記する契約にした。Tooltip/PopoverのReactテストに「Root配下でPopupにだけ`id`を渡すと子が優先」「Root外で子に同じIDを渡すと一致」を追加。Accordion（React=Context優先、Astro=子優先）の既存の食い違いは対象外に明記。「Root優先」を採らなかった理由（Astroの置換方式では強制できない）は設計判断に記載。
- B3: 修正 — Tooltip JS節で、documentリスナーを「最初の呼び出しで1回登録しページ存続中は保持する永続シングルトン」と定義。`setTooltip()`は`void`を返してReactのcleanupに渡しても解除されない形にし、解除はテスト専用の名前付きexport `unsetTooltip()`へ分離。Reactは`useEffect(() => { setTooltip(); }, [])`でcleanupを返さないと明記。参照カウントを採らない理由を設計判断に追加。テストに「Root2つmount→片方unmount→Escで残ったRootに`data-dismissed`」「`<StrictMode>`でも`keydown`登録が1回」「`unsetTooltip()`後に再登録できる」を追加。

---

## Plan Review — follow-up (by GPT-5.4)

対象: `.plan/plan-560-565-tooltip-popover.md`

### 判定: Ready

### 前回Blockingの解消状況
- B1: 解消 — Tooltip/Popoverのフォールバックで`position-area: none`、`position-try-fallbacks: none`、self-alignment、inset、margin、translateを上書きする方針と、部分対応状態を強制したcomputed style確認が追加された。`position-anchor: auto`は現行仕様の初期値ではないが、`position-area: none`により前回指摘したanchor配置とフォールバック配置の競合は起きない。
- B2: 解消 — 子prop優先をReact/Astro共通の契約とし、Root配下ではRootのIDだけを指定すること、一部の子だけを上書きすると配線が壊れることが明記された。通常利用・子優先・Root外利用のテスト方針も追加され、優先順位の曖昧さはなくなった。
- B3: 解消 — documentリスナーを永続シングルトンと定義し、`setTooltip(): void`、テスト専用`unsetTooltip()`、React effectではcleanupを返さないことが明記された。複数Rootの一部unmount、Strict Mode、解除後の再登録もテスト対象になった。

### Blocking
- なし

### Advisory
1. `position-anchor`の現行仕様上の初期値は`normal`で、`auto`はPopoverの暗黙アンカーを選ぶ値である。「初期値へ戻す」という説明とcomputed styleの期待値は正確ではない。Chrome 128〜130との互換目的で`auto`を使うならその理由を明記するか、互換値と現行値をカスケードして記述すると誤解がない。[CSS Anchor Positioning仕様](https://drafts.csswg.org/css-anchor-position/#position-anchor)
2. `Popup.type="manual"`ではlight dismissとEscによる自動クローズが無効になる。Popover全体の説明は`auto`の挙動として書き、docsのProps節で`manual`との差を明記するとよい。[MDNのpopover属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover)
3. ルート`README.md`と`README.ja.md`にはコンポーネント一覧表はなく、`@lism-css/ui`の概要行があるだけである。追随表は、ルートREADMEでは概要行を更新し、`packages/lism-ui/README.md`と`README.ja.md`では一覧表へ2行追加する、と分けると作業内容が正確になる。
