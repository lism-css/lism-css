# Plan: Icon プリセットを線データ化し、`@lism-css/icons` パッケージを新設する

基準日: 2026-09-10・0dd0cee2
状態: Phase 1・2実装済み。Phase 3は未着手。
関連: [docs/decisions.md](../docs/decisions.md) の 2026-09-10 の7エントリ（半塗りの星・コア候補・dot廃止・線データ化・Illustrator 正本・パッケージ分割）

## 概要 / ゴール

- `lism-css` の Icon プリセットを、Phosphor v2 の塗りアウトラインパスから線描画データ（24グリッド）へ切り替え、`weight`（light 1 / regular 1.5 / bold 2）と `strokeWidth` で太さを変えられるようにする。
- コアに残すのは厳選した線アイコンだけにし、残り（fill 系を含む）を新パッケージ `@lism-css/icons` として `packages/icons/` から公開する（`@lism-css/icons/react` / `@lism-css/icons/astro`）。
- アイコンの正本は Illustrator ファイル `lism-icons.ai`（24×24pt アートボード、アートボード名＝アイコン名）。書き出した SVG をリポジトリに置き、スクリプトで正規化してコアのプリセットと icons パッケージのコンポーネントを生成する。

完了すると、アイコンの追加・修正は「`.ai` を編集 → 一括書き出し → 生成スクリプト実行 → コミット」の一本道になる。

## 背景・前提

### 動機

- 現行プリセットは `caret-down` / `caret-right` / `arrow-down` / `arrow-right` だけ bold 相当（Phosphor の 256 グリッドで線幅 24）で、他は regular（16）。混ぜると太さが揃わない。
- 太さ違いを `-bold` のような名前で増やすとパスが丸ごと重複する。線描画なら1データで thin 〜 bold を出せる。
- プリセットは1オブジェクトでバンドルされ tree-shaking できない。fill 系まで抱えるとコアが肥大する。

### 着手前にコードで裏取りした事実

- プリセットは `packages/lism-css/src/components/atomic/Icon/presets.ts` の `phIcons` / `originalIcons` / `logoIcons`（各 `{ viewBox, path }`）。`presets.ts` 全体で約 27KB、`phIcons` 部分で約 16KB。
- 描画は `SVG.tsx` と `packages/lism-css/packages/astro/atomic/Icon/SVG.astro`。どちらも `path` 属性の経路と、`__html` で内部マークアップを流す経路を持ち、ルート `<svg>` に `fill="currentColor"` を付ける。線データはこの `__html` 経路で描ける。
- `getProps.ts` はプリセットを `exProps = { ...exProps, ...presetIconData }` でマージしている（プリセットが後勝ち）。`Icon.tsx` / `Icon.astro` の描画も `{...getLismProps(lismProps)} {...exProps}` の順で `exProps` が最後。このままだと利用側の `strokeWidth` がプリセット既定に上書きされる。
- `packages/lism-css/src/scss/primitives/atomic/_icon.scss` は `flex-shrink: 0`、`fill: currentcolor`（`fill` 属性がない場合）、`width/height: 1em`（`width` 属性がない場合）のみ。stroke 系の記述はない。
- `@lism-css/ui` がプリセット名で参照しているのは `packages/lism-ui/src/components/{Alert,Callout}/presets.ts` の `lightbulb` / `alert` / `warning` / `check-circle` / `question` / `info` / `note` と、Modal / Popover の閉じるボタンの `x`。
- fill 系の利用箇所は `templates/lp/astro/src/pages/{,en/}interior/index.astro` の `caret-down-fill` と、`apps/docs/src/content/{ja,en}/ui/Badge.mdx` の `star-fill` のみ。
- 太字4種の利用件数（docs + templates + packages）: `caret-right` 99、`arrow-right` 64、`caret-down` 12、`arrow-down` 0。`@lism-css/ui` 本体はこの4つを使っていない。
- docs の一覧は `apps/docs/src/content/{ja,en}/primitives/a--icon.mdx` 内の `PresetIcons` が `phIcons` 等のオブジェクトのキーから生成している。
- `lism-css` の exports は `./react`（dist）と `./react/*`、`./astro`（`./packages/astro/index.ts`）と `./astro/*`（`.astro` ソースをそのまま配布）。icons パッケージはこれに倣う。
- `pnpm-workspace.yaml` は `packages/*` を含み、`linkWorkspacePackages: true`、`minimumReleaseAgeExclude` に `@lism-css/*` が入っている。`.claude/commands/release.md` はパッケージ表に行を足す形で対応できる。
- `git-lfs` 3.3.0 はインストール済み。`.gitattributes` は未作成。
- Phosphor の帰属表示は現在 README のクレジット1行と `presets.ts` 冒頭のコメントのみ。npm に入る `dist` ではコメントが落ちる可能性がある。

### 外部仕様で確認済みの事実

- Phosphor v2（`@phosphor-icons/core` の `assets/`、`@phosphor-icons/react`）はウェイトごとに別の塗りパス。線幅では変えられない。
- `phosphor-icons/core` の `raw/{thin,light,regular,bold,fill,duotone}/` に線描画の元データがある（公式サイトの raw ダウンロードと同一）。bold は同じ形状に `stroke-width="24"`。caret / arrow は座標まで regular と同一。`info` のようなドット付きは bold でドット半径が 12 → 16 になり、線幅だけでは完全一致しない。ライセンスは MIT（`Copyright (c) 2023 Phosphor Icons`）。
- Illustrator 2026（30.7.0）の「スクリーン用に書き出し」（`exportForScreens`、プレゼンテーション属性・小数3桁・ID最小・レスポンシブ無し）は `<circle>` / `<polyline>` / `<line>` と線属性を保つ。円弧 `a` は `c` になる。出力にはルートの `id="a" data-name="レイヤー 1"`、アートボード名の `<g id="b" data-name="...">`、元データ由来の背景 `<rect>`、`stroke="#000"` が含まれる。
- Figma の書き出しは `<circle>` と円弧を3次ベジェへ展開する。svgo で円弧は戻るがドットは戻らず、正規化後で Phosphor raw の 1.6〜2 倍。
- `osascript` から Illustrator へ ExtendScript を流せる（新規ドキュメント作成、`groupItems.createFromFile` での SVG 配置、線幅込みの `resize`、アートボード命名、`exportForScreens`、`saveAs` を確認済み）。`app.doScript` でアクションを呼ぶとモーダルが出て止まるので使わない。ExtendScript のグローバル `name` と変数名が衝突するので変数名に `name` を使わない。
- Illustrator が背面にいると macOS の App Nap で ExtendScript が止まる（配置バッチが10分無応答、前面化した瞬間に再開）。実行前に System Events で前面化すると各バッチ1秒未満で完走する。AppleScript の `with timeout` は効かず AppleEvent は約2分で切れるので、配置は10個程度のバッチに分けて別々に呼ぶ。
- `pathItems.ellipse()` で作った円は `move(元パス, ElementPlacement.PLACEBEFORE)` で元の重ね順に入れられ、書き出しでは `<circle>` として出る。半径 0.375 に線幅 1.5 でも Illustrator・ブラウザとも塗りつぶしの点として描画される。

### 手元にある正本と試作

Phase 0 の成果物は`packages/icons/`へ移行済み。旧データ一式はリポジトリ外の`~/Downloads/lism-icons-phase0-archive/`に保管している。

- `design/lism-icons.ai`: 編集元。47アートボード。上段にコア34個、下段左に追加の線・半塗り7個、下段右に塗り6個を配置。アイコン間は12pt、エリア間は36pt。点は線描画円へ変換済み。`calendar`・`lock`・`lock-open`の角丸も修正済み。PDF互換オフ・未使用パネル項目削除済み。
- `design/raw/*.svg`: 初期形状の復元用の47件。Phosphor raw45件、自作の`menu-2`、`star`から作成した線・塗り混合の`star-half`。正本の編集は逆反映せず、ビルド入力には使わない。役割と取得元は[制作データの説明](../packages/icons/README.md)を参照。
- `scripts/`: 対応表・共通設定・実行用JSXの生成・役割別テンプレート・実行ラッパー・SVG検証。旧パスや`dot`を除き、現在の間隔と角丸補正に対応した。[スクリプトの使い方](../packages/icons/scripts/README.md)を参照。
- 旧スクリプトの取得・照合・正規化の試作、全パネル項目削除、実行ログ、バックアップは保管用フォルダに残す。移行版を使い、旧版は実行しない。
- 移行版をIllustratorで検証済み。新しい一時ファイルへの作成・5回の配置・点の変換・検証・書き出しを実行し、46SVGが修正済み正本の出力とバイト単位で一致した。既存の正本は変更していない。
- 書き出し検証済み（角丸修正・再配置・半塗りの星追加後）: 47件すべて`viewBox="0 0 24 24"`、線幅はすべて`1.5`、小さな点は21個の`<circle r=".375">`。修正した3つの角丸は`rx=".75" ry=".75"`。その他のパスはアートボードに対する座標が修正前と一致し、PNGでも形状を確認済み。

## 実装プラン（ざっくり）

### Phase 0: 正本の整備（コード変更なし）

1. 済: Lism 名 → Phosphor 名の対応表（末尾の「対応表」セクション）。ロゴアイコンは`lism-css`と`@lism-css/icons`の両方で収録対象外。
2. 済: 対応表に沿って `raw/regular/*.svg`（fill 系は `raw/fill/`）を取得し、Illustrator で 24×24pt アートボードへ配置（9.375%、線幅込み）、アートボード名を Lism 名にした。`menu-2` と `dot` は 24 グリッドで自作。
3. 済: 点（直径 2.25pt の塗り円 21 個）を半径 0.375pt の線描画円へ変換した（`packages/icons/scripts/ai/convert-dots.jsx`）。
4. 済: 正本・元SVG・配置スクリプトから`dot`を除外し、46件の再作成と書き出しを検証した。書き出しSVGのリポジトリ配置も完了（Phase 1参照）。
5. 済: 正本を`packages/icons/design/lism-icons.ai`へ移動し、`.gitattributes`で`.ai`をLFS対象に設定。`git -c core.hooksPath=.husky lfs install --local`で初期化し、`.husky/`にLFSフックを追加した。既存の`core.hooksPath=.husky/_`は維持。ポインタ変換を確認済み。
6. 正本・LFS設定・関連文書は`d8b6ba43`でコミット済み。Phase 1 の PR に含めてよい。

### Phase 1: `packages/icons/` 新設（PR 1）

1. 済: 編集元から47個のSVGを一括書き出しし、`packages/icons/src/svg/*.svg`へ無加工で配置した。ファイル一覧・viewBox・線幅・点・角丸・線と塗りの分類を検証済み。README・制作データ・自動化スクリプト・`THIRD_PARTY_LICENSES`も配置済み。SVG正規化・コンポーネント生成も実装済み。
2. 済: `scripts/normalize-svg.mjs`で正規化。継承属性を反映してから背景・ID・グループを除去し、色と線幅をルートへ集約する。形状・描画順・線の結合方法の例外・半塗りの塗り指定を保持する。非対応の入力はエラーにする。
3. 済: `scripts/generate.mjs`でReact・Astro各47コンポーネント、barrel2件、共通データを生成する。命名は`Home`・`StarHalf`・`StarHalfFill`・`Menu2`。生成ファイルはGit管理し、`--check`で入力との一致を検証する。データは`{ viewBox, attributes, body }`の名前マップ。
4. 済: `package.json`の公開設定とTypeScriptビルドを整備。`/react`・`/react/*`・`/astro`・`/astro/*`・`/data`を公開し、`LICENSE`と`THIRD_PARTY_LICENSES`を同梱する。`lism-css`への依存なし。ReactとAstroのpeerは任意で、利用する側のフレームワークだけを必要とする。
5. 済: ルートの`build:icons`・`publish:icons`と`.claude/commands/release.md`のパッケージ表に`icons`を追加。npmへの公開は未実施。
6. 済: Illustrator側の手順と自動化の知見を文書化し、制作データ用スクリプトを`packages/icons/scripts/`へ移行した。操作方法は同ディレクトリのREADME、固有の制約は`documents/illustrator-automation.md`を参照。

### Phase 2: `lism-css` の切り替え（PR 2）

1. 済: プリセットを`{ viewBox, body, ...ルート属性 }`へ変更し、34個の線アイコンを収録した。ロゴアイコンは含めない。
2. 済: `getProps.ts`で`body`を内部マークアップとして描画する。属性の優先順は「プリセット既定 → weight → 明示属性 → exProps」。`weight`はlight 1 / regular 1.5 / bold 2へ変換し、外部コンポーネントにも適用する。React・Astroの属性表記、raw SVG、明示寸法も検証済み。
3. 済: `bin/generate-icon-presets.mjs`で`@lism-css/icons/data`から`presets.ts`を生成する。生成物はGit管理し、ビルド時にも再生成する。iconsパッケージは開発依存だけに追加し、実行時の依存は増やさない。`book`・`cart`・`star`・`star-half`・`heart`・`lock`・`lock-open`・fill系・`dot`はコアから除外した。
4. 済: `_icon.scss`の変更は不要。`stroke-width`の既定は追加しない。
5. 済: docsのButton・Callout・Badge・Timelineなどはコア内のアイコンへ置き換えた。interiorの`caret-down-fill`は`caret-down`、`heart`は`chat`、feature01とinteriorの`book`は`note`へ変更した。ryokanはLPテンプレートの依存に`@lism-css/icons`を追加し、日英とも`Cart`と`Book`を使う。`menu-2`の既存15か所は`weight="light"`を指定する。
6. 済: docsの日英Iconページ・weightの表示例・スキル・MCPのdocs-index・changelogを更新した。`THIRD_PARTY_LICENSES`も生成時にコピーし、npmの配布対象に追加した。
7. 検証済み: コアのReactテスト11件、Astro実ビルドによる34プリセット・属性優先順・外部コンポーネント・Alert／Calloutの描画、コア型検査、lism-uiのビルドと121テスト、docs・LP・personal・techlogのビルドが成功した。

制作データも34個のコア区分に合わせて再配置・保存済み。`06-relayout.jsx`で再配置できる。移動前後の47SVGはバイト単位で一致し、リポジトリの入力SVGにも変更はない。

### Phase 3: docs（PR 2 に含めるか別 PR）

- `@lism-css/icons` のページ（import 方法、`weight` / `strokeWidth`、一覧）。一覧は icons パッケージのデータから生成する。

## 設計判断の根拠

`docs/decisions.md` の 2026-09-10 の7エントリに集約した。要点だけ再掲する。

- 線データ＋`weight`: 1データで太さを出せる。Phosphor v2 の塗りパスをウェイト別に複製する案は却下。
- 24 グリッド: Phosphor regular が 1.5 になり heroicons / lucide と数値を比べられる。16 / 32 / 48 は却下。
- Illustrator 正本: `<circle>` と線属性が保たれる。Figma はベジェ展開でデータが太る。
- モノレポ: 参照元が全部ここにある。切り出しは後からでもできる。

## 未決事項・要確認・事前準備

- 決定済（2026-09-10）: `star` / `star-fill` / `star-half-fill` / `note` は Phosphor v2.1 の新形状で進める。`menu-2` は既定 1.5 のまま（アイコン単位の既定線幅は持たない）。旧来の細い見た目が要る既存の利用箇所には Phase 2 で `weight="light"` を付ける（下記）。
- 決定済（2026-09-10）: `dot`は廃止する。根拠と対象範囲は[意思決定の記録](../docs/decisions.md)を参照。
- 決定済（2026-09-10）: 点（ドット）は塗り円ではなく、半径 0.375 の線描画円（線幅 1.5）にする。lucide（r=1 / 線幅 2）や heroicons（r=0.75 / 線幅 1.5）と同じ方式で、regular では Phosphor と同じ直径 2.25、light で 1.75、bold で 2.75 になり `weight` に追従する。半径が最小線幅（light 1）の半分以下なので、どの weight でも穴が開かず塗りつぶしに見える。対象は raw に塗り `<circle r="12">` を含む 11 アイコン（`alert` `calendar`×5 `chat`×3 `dots`×3 `dots-vertical`×3 `info` `lock` `lock-open` `question` `tag` `warning`、計 21 個）。変換は `.ai` 側で行い、再現できるようスクリプト化する。
- `menu-2` の利用箇所（Phase 2 で `weight="light"` を付ける候補、15 か所）: `apps/docs/src/pages/preview/patterns/hero/hero0{1,2,3,4}/{index,en}.astro`、`templates/lp/astro/src/components/{,en/}{interior,ryokan}/Header.astro`、`templates/lp/astro/src/components/corporate/Header.astro`、`templates/blog/astro/{techlog,personal}/src/components/Header.astro`。
- fill系（`*-fill`）は塗りだけなので`weight`で太さが変わらない。従来の`star-half`は`star-half-fill`として残し、新しい`star-half`は線と塗りを分ける。詳細は[意思決定の記録](../docs/decisions.md)の半塗りの星のエントリを参照。
- コア候補は34個に整理済み。範囲と理由は[意思決定の記録](../docs/decisions.md)のコア候補のエントリを参照。
- 決定済（2026-09-10）: ロゴアイコンは`lism-css`と`@lism-css/icons`のどちらにも含めない。既存のロゴプリセットと利用箇所の移行は別作業で進行中。
- 決定済: コンポーネントはPascalCase、塗り版は`Fill`接尾辞。データの入口は`/data`。利用方法は[パッケージREADME](../packages/icons/README.md)を参照。
- 決定済: Astroもアイコンごとの`.astro`を生成する。
- 決定済: `presets.ts`はGit管理し、ビルド時に再生成する。`gen:icons:check`で入力との一致を検証する。
- 決定済: 既存のdocsはコアのアイコンを使う。ryokanは`@lism-css/icons`を利用し、LPテンプレートへ依存を追加する。
- `.ai`の配置とLFS初期化は完了（Phase 0参照）。正本・設定は`d8b6ba43`でコミット済み。
- 事前準備: Illustrator の自動化権限（Phase 0で動作済み）。

## 完了条件（暫定）

- `<Icon icon="caret-down" />` が regular、`weight="bold"` で今と同じ太さで描ける。`strokeWidth={1}` のような明示指定が効く。
- `@lism-css/icons/react` と `/astro` から fill 系を含む全アイコンを import できる。
- Illustrator から一括書き出し → 生成スクリプト → 差分ゼロ、が再現できる。
- docs の一覧が生成データから出る。changelog に破壊的変更が載っている。

## Lism 名 → Phosphor 名 対応表

基準: `presets.ts` の `phIcons` 全キー（`logoIcons` は対象外）を `@phosphor-icons/core` 2.1.1 の `assets/{regular,bold,fill}` のパスと突き合わせた。取得元は `phosphor-icons/core` main の `raw/`。取得した raw は `packages/icons/design/raw/<Lism 名>.svg`、配置済みの正本は `packages/icons/design/lism-icons.ai`（`dot`削除・混合版`star-half`追加済みの47アートボード）。

| Lism 名 | Phosphor 名 | 取得元 | 一致 | 備考 |
| --- | --- | --- | --- | --- |
| folder | folder-simple | raw/regular | 完全一致 |  |
| tag | tag | raw/regular | 完全一致 |  |
| calendar | calendar-dots | raw/regular | 完全一致 |  |
| clock | clock | raw/regular | 完全一致 |  |
| clockwise | clock-clockwise | raw/regular | 完全一致 |  |
| check | check | raw/regular | 完全一致 |  |
| check-circle | check-circle | raw/regular | 完全一致 |  |
| ban | prohibit | raw/regular | 完全一致 |  |
| alert | warning-octagon | raw/regular | 完全一致 |  |
| warning | warning | raw/regular | 完全一致 |  |
| question | question | raw/regular | 完全一致 |  |
| info | info | raw/regular | 完全一致 |  |
| good | thumbs-up | raw/regular | 完全一致 |  |
| bad | thumbs-down | raw/regular | 完全一致 |  |
| bookmark | bookmark-simple | raw/regular | 完全一致 |  |
| bookmark-fill | bookmark-simple | raw/fill | 完全一致 |  |
| heart | heart | raw/regular | 完全一致 |  |
| heart-fill | heart | raw/fill | 完全一致 |  |
| star | star | raw/regular | 完全一致 | v2.0.2 の assets と一致。v2.1 で形状変更されており、main の raw は新形状 |
| star-fill | star | raw/fill | 完全一致 | v2.0.2 の assets と一致。v2.1 で形状変更されており、main の raw は新形状 |
| star-half-fill | star-half | raw/fill | 完全一致 | v2.0.2 の `star-half-fill`（fill 版）と一致。v2.1 で形状変更されており、main の raw は新形状 |
| star-half | star | `star`から作成（24グリッド） | 対象外 | 外周は線、左半分は塗り |
| book | book | raw/regular | 完全一致 |  |
| note | note-pencil | raw/regular | 完全一致 | v2.0.2 の assets と一致。v2.1 でパスが微修正されている |
| chat | chat-dots | raw/regular | 完全一致 |  |
| lightbulb | lightbulb | raw/regular | 完全一致 |  |
| link | link | raw/regular | 完全一致 |  |
| cart | shopping-cart | raw/regular | 完全一致 |  |
| gear | gear | raw/regular | 完全一致 |  |
| home | house | raw/regular | 完全一致 |  |
| search | magnifying-glass | raw/regular | 正規化一致 | 現行 `path` 末尾の `ZZ` 誤記を除けば一致 |
| sign-in | sign-in | raw/regular | 完全一致 |  |
| sign-out | sign-out | raw/regular | 完全一致 |  |
| user | user | raw/regular | 完全一致 |  |
| lock | lock | raw/regular | 完全一致 |  |
| lock-open | lock-open | raw/regular | 完全一致 |  |
| x | x | raw/regular | 完全一致 |  |
| menu | list | raw/regular | 完全一致 |  |
| dots | dots-three | raw/regular | 完全一致 |  |
| dots-vertical | dots-three-vertical | raw/regular | 完全一致 |  |
| caret-down | caret-down | raw/regular | 完全一致 | 現行は bold |
| caret-right | caret-right | raw/regular | 完全一致 | 現行は bold |
| caret-down-fill | caret-down | raw/fill | 完全一致 |  |
| caret-right-fill | caret-right | raw/fill | 完全一致 |  |
| arrow-down | arrow-down | raw/regular | 完全一致 | 現行は bold |
| arrow-right | arrow-right | raw/regular | 完全一致 | 現行は bold |
| dot | - | 自作（24グリッド） | 対象外 | 編集元・元SVG・配置スクリプト・コアから除外済み |
| menu-2 | - | 自作（24グリッド） | - | `originalIcons`。2本線を線描画（`stroke-width` 1.5）で作り直した。現行の塗りパス（太さ 0.8）より太くなる |

- 一致の内訳: 完全一致 44（うち v2.0.2 の assets とのみ一致 4）、正規化一致 1。自作の`menu-2`と混合版`star-half`を加えた47件を収録し、`dot`は対象外。
- `star` / `star-fill` / `star-half-fill` / `note` は v2.1 で形状が変わっている。旧形状の raw は取得できない（v2.0.2 タグに `raw/` がない）ため、raw は新形状で進めている。
- `caret-down` / `caret-right` / `arrow-down` / `arrow-right` は座標が regular と同一なので raw/regular を使い、太さは `weight` で出す。
