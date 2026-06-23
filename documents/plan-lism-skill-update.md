# Lism スキル群 再設計プラン

`lism-css-guide` を読ませても、**初期実装（「このデザイン作って」）でもリファクタ（「これ直して」）でも、ベストプラクティスに従わず取りこぼす**——この同一の問題（読む ≠ 手順を実行する）を起点に、issue #343 / #395 も取り込んで **Lism のスキル群をどう作り直すか** をまとめた作業計画。この 1 ファイルだけ読めば実装に入れることを目標にする。

> 作成: 2026-06-22 / ステータス: コア設計確定・実装未着手（運用判断は §9-1 未決事項を参照）
> 関連 issue: #343（公式ベストプラクティス整合）/ #395（アンチパターン追加・構成/命名/軽量化）
> ⚠️ **issue 参照時の注意**: 上記 issue 本文は作成時点のスナップショット。論点はこの plan に消化済みなので、実装は **plan を正典**とする。issue 本文を読む場合も記述を鵜呑みにせず、必ず現在のコード／docs／MCP の実態を一次情報として確認する。


## 1. ゴール

**問題**: `lism-css-guide` を読ませても、① 初期実装でも ② リファクタでも、ベストプラクティスに従わず取りこぼす。根本原因は同じ＝「**読む ≠ 手順を実行する**」。受け身の参照では forcing function（強制力）が働かない。

**ゴール**:

1. **`lism-css-guide` を「新規実装時の手順制御も担うスキル」へ強化**する（① 対策）。読む資料ではなく、**実装前 preflight ＋ 提出前セルフチェック**で作法を強制する（#343 / #395）。
2. **既存コード改修用の専用スキル `lism-css-refactor` を新設**する（② 対策）。**Inventory ＋ 順序パス ＋ Self-review** で取りこぼしを潰す。
3. 2 つのスキルで**知識を重複させない**。guide＝知識＋手順制御（前向き）、refactor＝手順制御（後ろ向き）。


## 2. 用語集（先に読む）

| 用語 | 意味 |
|---|---|
| **route（ルーティング）** | 毎回全部を読ませず、必要なときに該当の参照ファイルだけを読みに行くこと |
| **spine（共有スパイン）** | 両スキルが共通で参照する中核ファイル。ここでは guide の `antipatterns.md` |
| **Inventory（棚卸し）** | 対象コード内の実体（クラス／CSS 宣言／数値／重複／コンポーネント）を 1 行ずつ表に列挙すること |
| **verdict（判定）** | 棚卸し／preflight の各行に付ける処理判定。**refactor 系**と **forward 系**の 2 系統がある（記号は共有するが意味が異なる。下表直後の注を参照） |
| **idiomatic** | Lism の作法どおり、お手本に沿った書き方 |
| **preflight（プリフライト）** | 実装前に「使う予定の値・クラス」を列挙してトークン一覧と照合する事前確認（guide の既存概念） |
| **提出前セルフチェック** | guide 側①。**新規実装した直後**に走らせる確認ゲート（実装前 preflight と対で使う） |
| **Self-review ゲート** | refactor 側②。**リファクタ修正案を出した後**に走らせる重い退行チェック |
| **forward coverage / backward regression** | 前向き被覆＝コード全要素を漏れなく見たか／後ろ向き退行＝自分の修正で新たに壊していないか |

> **verdict は 2 系統ある**（記号を共有するが意味が異なる）:
> - **refactor 系（後ろ向き・§5）**: ✅ 触らない／🔧 修正対象／⏸ 要ユーザー判断／⬜ 意図的に残す
> - **forward 系（前向き・§4-4a）**: ✅ 確定／⏸ 要確認／🔁 参照して確定／🆕 新規定義／⬜ 例外（直書き許容）
> - ⚠️ **記号衝突に注意**: ✅（触らない ↔ 確定）と ⬜（残す ↔ 例外）は系統で意味が反転する。両系統で共通なのは ⏸（要確認）のみ。


## 3. 全体像（2 スキル構成）

```
skills/
  lism-css-guide/        # ① 通常実装の「判断入口」＋ 軽量リファレンス索引
  lism-css-refactor/     # ② 既存コードの棚卸し・挙動不変リファクタ（明示起動）
```

第 3 の「reference 専用スキル」は**作らない**（単独 skill は自動起動されず効きにくい。#395c2）。詳細リファレンスは guide 内の軽量索引＋公式 docs `.md` URL／MCP に逃がす。

### なぜ 2 つに分けるのか（使う 3 つの瞬間）

| 瞬間 | trigger | 担当スキル |
|---|---|---|
| ① 新規実装（デザイン／要件 → コード） | 実装中に自動 | `lism-css-guide` |
| ② 既存コードのリファクタ／監査 | ユーザーが明示起動 | `lism-css-refactor` |
| ③ 仕様の逆引き（このトークン何がある？等） | 随時 | `lism-css-guide`（軽量索引）＋ docs/MCP |

③ は単独スキル化せず guide に内包する。①③＝guide、②＝refactor。**3 つとも同じ知識を別の向きで使う**だけなので、知識は guide に一本化し、refactor は手順だけ持つ。

### 役割分担

| | lism-css-guide | lism-css-refactor |
|---|---|---|
| 向き | 前向き（intent → 実装） | 後ろ向き（既存コード → 監査） |
| trigger | 実装中に自動 | 明示起動 |
| 主軸 | 目的別ガイド ＋ 実装前 preflight ＋ 提出前セルフチェック | Inventory ＋ 順序パス ＋ Self-review ゲート |
| 知識 | 共有 spine を保持 | 一般知識は複製せず guide へ route／退行知識（common-mistakes）は自前で保持 |


## 4. スキル A: `lism-css-guide` オーバーホール仕様

役割を「百科事典」から **「実装の判断入口＋軽量索引」** に変える。**物理ディレクトリ名と frontmatter の `name` は当面 `lism-css-guide` のまま**（§7）。

### 4-1. SKILL.md に持たせるもの

guide は「読む資料」ではなく、新規実装の**手順制御**も担う。SKILL.md に以下を置く。

**(A) 実装フロー（厳守・forward）** — refactor の順序パス（§5-3 Pass 2〜9）を**前向きに写像**した authoring workflow（手順数は guide=0〜4／refactor=0〜7 で対称ではない。対応するのは各 Pass ↔ FP）：

```
0. 目的別ガイドで Primitive/コンポーネントを選定
1. 実装前 preflight: デザイン/要件から、使う Primitive・Component・token・responsive 方針を列挙し tokens と照合し **Authoring Plan** を出す（§4-4a。変更規模で軽量/通常/値照合付きに分ける）
2. ⏸（px 丸め・任意色・挙動変更等）が残る項目は、その部分を**実装する前に**ユーザー確認（§4-4a「⏸ 条件」）。勝手に確定しない
3. 実装する
4. 提出前セルフチェック（§4-4b）で Authoring Plan と実装を照合し、最終 ⏸ 残があれば再確認
```

**(B) 目的別実装ガイド**（前向き選定。「何をしたい → どれを使う」。§4-2）
**(C) 参照ルーティング表**（§4-5）

> 既存 guide には既に「プリフライト・プリミティブ選定／トークン照合／c-- 分解」がある。オーバーホールでは**これらを消さず (A) の preflight として強化・明示**する。

### 4-2. 目的別実装ガイド（骨子）

| やりたいこと | まず使う |
|---|---|
| 画像・動画・iframe を置く | `Frame` |
| ボタン | `@lism-css/ui` の `Button`、または `set--plain` |
| hover 効果 | `-hov:*` / `set--var:hov` / `has--transition` |
| カラム | `Columns` / `AutoColumns` / `WithSide` |
| 幅制御 | `Container` / `Wrapper` / `max-sz` |
| 小さい UI 部品 | `c--*` ＋ Property Class |
| レスポンシブ | base 値・`isContainer`・標準 BP を確認 |

各項目に「判断に必要な 1〜3 行要約」「よくある NG」「詳細 URL」を添える（URL だけにしない。#343）。

### 4-3. antipatterns.md の増強（共有 spine）

`antipatterns.md` は guide 側に置き、両スキルが参照する中核ファイル。**既存分はそのまま**、以下 #395c1 を**追加**する。

| 追加するアンチパターン | NG → OK の要点 |
|---|---|
| Reset 済みプロパティの再指定 | `m="0"` を付ける → 何も書かない（reset で `margin:0` 済み） |
| `Frame` 未使用のメディア枠手組み | `<Lism ov="hidden"><img></Lism>` → `<Frame ar="16/9"><img></Frame>` |
| primitive 既定値の重複指定 | `<Cluster ai="center">` `<Frame ov="hidden">` `Frame`直下`img`に`w/h` → 付けない |
| hover を component CSS に書いて負ける | `.c--button:hover{}` → `-hov:*` / `hov={{}}` を使う |
| レスポンシブ配列の冗長指定 | `['column','column','row']` → `['column', null, 'row']` ／ `['0','0','0']` → `'0'` |
| 標準 HTML 属性を `exProps` に入れる | `exProps={{width,height,loading}}` → そのまま `width height loading` を渡す |
| サイト最外殻を `Wrapper` に使う | 最外殻は `z--*` 等、`Wrapper`/`is--wrapper` は幅制限したい直下領域だけ |

> 既存 antipatterns.md が既にカバー済み（重複追加しない）: Token typo / px 直書き / Property Class で書けるのに CSS / `is--` 誤用 / `c--` 乱用 / kebab-case 命名 / `--keycolor` 誤用 / Prop 型ミス / レイアウト選択ミス / レスポンシブ抜け。

### 4-4. 実装前 preflight ＋ 提出前セルフチェック（① 用・guide SKILL.md に置く）

「読んでも従わない」を直すには、書く前後の 2 段で強制する。

#### 4-4a. 実装前 preflight（Authoring Plan）

実装前 preflight の成果物を **Authoring Plan** と呼ぶ。refactor の Inventory（既存コードの棚卸し）とは逆向きで、**これから書く構造・値・responsive・CSS境界・命名を「使う予定」として宣言**し、各項目に verdict を付けてから書く。Authoring Plan は §4-4b 提出前セルフチェックの**照合元**になる（書いた後に Plan と実装を突き合わせる）。

設計は **§5-3 refactor 順序パスの前向き写像**（同型 7 フィールド）。FP1〜FP8 は §5-3 の各 Pass に対応する。**FP0（入力整理）だけは refactor から導けない forward 固有手順**（§8。デザイン/要件 → 方針列挙の入口）。

##### 実行レベル（preflight の重さを規模で変える）

forcing function の過剰発火（小さな変更にも重い preflight が走る）を防ぐため、変更規模で深さを変える。

| レベル | trigger | 走らせるパス | 出力 |
|---|---|---|---|
| 不要 | 説明のみ／コード変更なし／既存 idiomatic の微修正 | — | — |
| 軽量 | 小変更（数行・既存パターン内） | FP1・FP5 中心 | Authoring Plan を 3〜5 行で箇条書き |
| 通常 | 新規 UI / コンポーネント / セクション | **核 = FP0・FP1・FP5・FP6**／FP2・FP3・FP4・FP7・FP8 は該当時のみ展開 | ドメイン別表（§4-4a「出力フォーマット」） |
| 値照合付き | Figma/スクショ等のデザイン再現 | 通常＋FP5 を厳密化 | 上記＋token 差分表（デザインデータ取り込みフロー） |

##### preflight パス（FP0–FP8）

順序に意味がある（先に構造を決めないと、何に値を載せ・どこに状態を持たせ・何を命名するかが定まらない）。各パスは §5-3 と同型の 7 フィールド（**列挙 / 照合・verdict / 決め方 / route先 / OK・避ける罠 / 事前に潰す失敗 / guide依存**）。verdict: **✅ 確定 / ⏸ 要ユーザー確認 / 🔁 参照して確定 / 🆕 新規定義 / ⬜ 例外（直書き許容）**。**通常レベルでも該当しない FP は省略してよい**（核 = FP0/1/5/6 ＋ 該当 FP に絞り、形式埋めを避ける）。

**FP0: 入力整理**（★forward 固有・§5-3 に対応なし）
- **列挙**: 対象（ページ/セクション/部品）・粒度・framework（React/Astro/素の HTML）・既存制約（命名・レイヤ・公開 class・CMS・外部 JS・E2E）・不明点を 1 行ずつ
- **照合・verdict**: 不明点（base 値が読めない・状態の有無・反復数・忠実度方針）は ⏸ で先に確認。憶測で確定しない
- **決め方**: 既存コードの命名・レイヤ・実装パターンを先に確認してから方針を置く
- **route先**: なし（デザイン入力＋既存コードが情報源）
- **OK・避ける罠**: OK=「何を/どの粒度で/再利用するか」を先に宣言 ／ 罠=デザインの px からいきなり書き始める
- **事前に潰す失敗**: スコープ未確定で全体に拡張、状態・レスポンシブの存在見落とし
- **guide依存**: なし（§8「forward 固有手順」本体）

**FP1: 構造・セマンティクス選定**（← §5-3 Pass 2）
- **列挙**: 必要な構造（縦並び/横並び/カラム/メディア枠/幅制御/オーバーレイ/全体リンク）と要素・heading レベル・ランドマーク等のセマンティクスを列挙し、§4-2 目的別ガイドで Primitive/Trait/Component を割当
- **照合・verdict**: 標準 Primitive で組める→✅ ／ カラム系等の迷い→🔁（§4-5 route）／ @lism-css/ui で済む→✅ or 🔁
- **決め方**: 検討順 = Layout Primitive → Trait → Atomic → UI コンポーネント。div + Property Class でゴリ押さない。メディア枠は Frame、幅制御は Wrapper/Container、全体リンクは BoxLink
- **route先**: primitive-class.md#カラムレイアウト-primitive-の使い分けガイド / primitives/l--*.md / trait-class.md / components-core.md / components-ui.md / antipatterns.md#レイアウト選択ミス
- **OK・避ける罠**: OK=`<Columns cols={3}>`・`<Frame ar="16/9">` ／ 罠=`<div -d:grid gtc=…>`・手組みメディア枠・最外殻に Wrapper
- **事前に潰す失敗**: div-soup・固定 Grid・Frame 未使用・Wrapper 誤用
- **guide依存**: §4-2 に「メディア枠→Frame／幅制御→Wrapper・Container／全体リンク→BoxLink／等幅列→Columns」明記（§4-10）

**FP2: reuse・コンポーネント境界**（← §5-3 Pass 3・該当時のみ）
- **列挙**: 同じ部品が 3 箇所以上になりそうか／値差分・slot 構造があるか
- **照合・verdict**: **3+ 反復見込み かつ 同じ意味の UI 部品として安定**→🆕 component 化して着手 ／ 1〜2 回・局所・一時的重複・意図的な例示コード→✅ そのまま ／ 値差分・slot 要→⏸（Props 設計先行）
- **決め方**: CSS の c-- 新設でなく React/Astro コンポーネント抽出。`<Lism>`/プリミティブ基盤、`className="c--*"` は意味名で残す。透過（className/style/data-*/ARIA/handler）を最初から Props 設計に含める
- **route先**: components-core.md / components-ui.md / css-rules.md#component-classc-- / property-class.md
- **OK・避ける罠**: OK=反復する Tag を最初から Tag コンポーネント化 ／ 罠=同じ Property Class 束をコピペ展開
- **事前に潰す失敗**: 後から 3 箇所重複に気づいて作り直し
- **guide依存**: 「同 Property Class 束 3 箇所以上→コンポーネント抽出」を SKILL.md/examples に（§4-10）

**FP3: 命名設計**（← §5-3 Pass 7）
- **列挙**: 新設する c-- / z-- / p-- 名と Block/Element/Modifier 構造
- **照合・verdict**: prefix 後 camelCase・`c--block`/`c--block--modifier`/`c--block_element` に合う→✅ ／ サイト領域→🆕 z-- ／ ページ固有→🆕 p-- ／ 公開 API・CMS・外部 JS・E2E 依存→⏸
- **決め方**: naming.md の省略・命名規則に従う。再利用 UI でない領域は z--、ページ固有は p--
- **route先**: naming.md / css-rules.md#component-classc-- / css-rules.md#独自プレフィックス / antipatterns.md#クラス名の命名ミスkebab-case / antipatterns.md#カスタムクラスを何でも-c---にしない
- **OK・避ける罠**: OK=`c--featureCard`・`c--featureCard_body` ／ 罠=`c--feature-card__body`・サイトヘッダを c-- に
- **事前に潰す失敗**: kebab-case 命名・何でも c--・ゾーニングを c-- に
- **guide依存**: z--/p-- 使い分け例と公開クラスを ⏸ にする判断基準（§4-10 P7）

**FP4: 状態・バリエーション設計**（← §5-3 Pass 6）
- **列挙**: 動的に変わる状態（active/open/disabled/current…）と、見た目違いのバリエーション（solid/outline…）
- **照合・verdict**: 状態→🆕 data-* / ARIA ／ 見た目違い→🆕 `c--name--variant` ／ 役割宣言に正規 Trait（is--container 等）が当たる→✅
- **決め方**: 状態は属性セレクタ、バリエーションは BEM Modifier。is-- を状態/バリエーションに流用しない。CSS セレクタと JS の toggle 対象も最初から揃える前提で設計
- **route先**: trait-class.md / trait-class/is--*.md / antipatterns.md#is---の誤用状態バリエーション / css-rules.md#component-classc--
- **OK・避ける罠**: OK=`data-is-active`＋`[data-is-active]`・`c--tag--solid` ／ 罠=`is--active`・`is--solid`
- **事前に潰す失敗**: is-- 誤用、状態とスタイルの混在
- **guide依存**: 正規 Trait 一覧＋状態/variant/独自 Trait の境界例（§4-3／§4-10 P6）

**FP5: 値・トークン照合**（← §5-3 Pass 5・最重要）
- **列挙**: 使う予定の値（spacing/color/fz/radius/shadow/size/lh/lts…）をすべて列挙
- **照合・verdict**: tokens.md にある（完全一致）→✅ ／ typo・既存規約上明確な置換→🔁 正規トークンへ ／ **近似丸め・任意色推測・ブランド色・密度/忠実度判断・デザイン値置換→⏸**（§4-4a デザインデータ取り込みフローへ）／ 1px 罫線・transform 微調整・@media 閾値→⬜
- **決め方**: トークン値を流用。⏸ は guide のデザインデータ取り込みフロー（候補トークン＋差分表 → A/B/C 確認）に従い、確認まで書かない
- **route先**: tokens.md / property-class.md / antipatterns.md#token-typo存在しない値 / antipatterns.md#px--固定値の直書き / antipatterns.md#--keycolor-の誤用
- **OK・避ける罠**: OK=`-fz:xs -p:10 -bgc:base-2 -bdrs:10` ／ 罠=`padding:13px` そのまま・`bgc="secondary"`
- **事前に潰す失敗**: px 直書き・token typo・存在しない値・--keycolor 誤用
- **guide依存**: tokens.md に離散値・例外・取り込みフローを維持（§4-8／§4-10 P5）

**FP6: レスポンシブ方針**（← §5-3 Pass 8）
- **列挙**: 各値の base 値・切替 BP（sm/md/lg）・**運用方式（container query か media query か）**・（container query 運用なら）レスポンシブ値を載せる要素の祖先 isContainer の有無・固定 Grid 化していないか
- **照合・verdict**: base 値あり・標準 BP・（container query 運用なら）祖先 isContainer あり→✅ ／ base 抜け・xs 誤用→🔁 ／ **`$is_container_query:0` 等で media query 運用が確認できる場合は isContainer 必須としない→✅**（Pass 8 と同じ例外）／ 固定列をレスポンシブ化（`cols={[1,2,3]}`）→⏸（挙動変更）
- **決め方**: base 値を必ず置く・標準 BP へ・必要な祖先に isContainer。冗長配列は圧縮（`['column', null, 'row']`）
- **route先**: responsive.md / trait-class/is--container.md / property-class.md / primitive-class.md#カラムレイアウト-primitive-の使い分けガイド / antipatterns.md#レスポンシブ抜け
- **OK・避ける罠**: OK=`p={{base:'20', md:'30'}}`＋祖先 isContainer ／ 罠=`gtc="repeat(3,1fr)"` 固定・base 抜け・isContainer なしで切替
- **事前に潰す失敗**: レスポンシブ抜け・固定 Grid・（container query 運用時の）isContainer 祖先なし
- **guide依存**: 冗長配列圧縮・`$is_container_query:0` 時の扱い・container 配置方針を responsive 系に（§4-10 P8）

**FP7: CSS境界の分解**（← §5-3 Pass 4）
- **列挙**: 書く予定の各 CSS 宣言を「Property Class/Props へ移す宣言」と「CSS にしか書けない宣言」に分解（既存 SKILL の c-- 分解 preflight）
- **照合・verdict**: 単一要素向け宣言束（fz/padding/color/bg/radius 等）→✅ マークアップへ ／ 擬似クラス・擬似要素・状態切替・子孫セレクタ→✅ CSS に残す
- **決め方**: `-{prop}:{value}` or `<Lism prop="value">` へ移す。`.c--*` の CSS は空でよいが**クラス名はマークアップに残す**
- **route先**: property-class.md / css-rules.md#component-classc-- / antipatterns.md#property-class-で書けるのに-css-で書く
- **OK・避ける罠**: OK=`.c--tag{}`（空）＋`<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">` ／ 罠=単一要素の宣言を全部 `.c--tag{}` に書く
- **事前に潰す失敗**: Property Class で書けるのに CSS に溜める・空化のついでに意味クラスを消す
- **guide依存**: property-class.md の省略名一覧・tokens.md の値リストが正確であること

**FP8: 既定値の確認**（← §5-3 Pass 9・横断ルール）
- **列挙**: 使う各 Primitive が既に持つ既定 CSS を確認し、同値を Props/Property Class で重ねていないか（Cluster の ai/fxw、Frame の ov・直下メディア fit 等）
- **照合・verdict**: 既定と同値→足さない ／ 既定と違う意図的上書き→✅ つける ／ guide 未整備の Primitive 既定→guide TODO へ（⏸ でなく）
- **決め方**: §4-6 の primitive 既定 CSS 概要を見て、念のための `ai="center"`/`ov="hidden"`/直下 img `w/h` を足さない
- **route先**: primitives/l--cluster.md / primitives/l--frame.md / primitive-class.md / components-core.md
- **OK・避ける罠**: OK=`<Cluster g="15">`・`<Frame ar="16/9"><img/></Frame>` ／ 罠=`<Cluster fxw="wrap" ai="center">`・Frame 直下 img に `-w:100%` `object-fit`
- **事前に潰す失敗**: 既定値の重複指定（#395c4）
- **guide依存**: 各 primitives/l--*.md に既定 CSS 概要（§4-6／§4-10 P9）

##### 出力フォーマット（Authoring Plan）

軽量レベルは 3〜5 行の箇条書き。通常／値照合付きレベルはドメイン別の表で出す。各行に必ず verdict を付け、⏸ が残る項目はその部分を書き始めない（保留して先に確認）。

- **構造表**: 対象領域 / 採用 Primitive・Component / 理由 / route先 / 判定
- **token 表**: 用途 /（デザイン値）/ 採用 token / 差分 / 判定 ←「値照合付き」では差分列を必須化
- **responsive 表**: 対象 / base / sm / md / lg / container 祖先 / 注意
- **構成表（命名・CSS境界・状態・既定値）**: c--*名 / Props・Property Class で書く / CSS に残す / 状態・variant / 既定で足りる（指定しない）
- **確認事項表（⏸）**: 項目 / 要確認理由 / 候補

##### ⏸ でユーザー確認する条件

- px/rem/em を token へ丸める／token を新規追加・基準値（`--s-unit` 等）を上書きする
- 任意色・ブランド色・密度・忠実度など、仕様から確定できないデザイン判断
- responsive 挙動が見た目・UX・DOM 順を変える（固定 Grid → 可変化、isContainer 位置）
- 公開 class 名・CMS・外部 JS・E2E セレクタに依存する命名/構造変更

##### デザインデータ取り込みフロー（「値照合付き」レベルで使用）

Figma/スクショ等のデザイン値を token へ落とすときの判定フロー。「値照合付き」レベル（§4-4a 実行レベル表）はこのフローを前提とする（このフローが無いと当レベルは未定義になる）。

1. **候補抽出**: デザイン値（px/色/比率…）ごとに最寄り token を 1〜2 個挙げる
2. **差分表**: 各値を `用途 / デザイン値 / 候補 token / 差分（px・% 等）/ 判定` の列で出す
3. **判定（3 段階）**:
   - **完全一致**（デザイン値 ＝ token 値）→ ✅ そのまま採用
   - **typo・既存規約上明確な置換**（`secondary`→`base-2` 等）→ 🔁 自動置換
   - **近似丸め・任意色・ブランド色・密度/忠実度判断** → ⏸ ユーザーへ A/B/C 提示して確認（A=最寄り token に丸め／B=custom token 化／C=直書き例外）
4. **custom token 化の条件**: 同値が複数箇所で再利用される・デザインシステム上の意味を持つ → custom token 候補（⏸ で確認）。1 回限りの局所値は丸め or 例外で済ます
5. **デザインデータが無い**（テキスト要件のみ）場合: 差分表は省略し、既存 token から最も近い意味の値を選ぶ簡易運用。新規数値が要るときだけ ⏸

> 注: `--s-unit` 等の基準値をプロジェクトが上書きしていると px の「完全一致」判定が崩れる。上書きの有無を先に確認する。

##### §4-4b 提出前セルフチェックへの接続

- 実装後、Authoring Plan（preflight 表）と実装結果を 1 行ずつ照合する
- 差分を 3 分類: ① 計画変更（意図的 → 記録）／ ② 実装漏れ（直す）／ ③ 要確認（⏸ 再浮上）
- §4-4b は新ルールの再点検ではなく、**「preflight で決めた方針が守られたか」を見るゲート**として機能する

#### 4-4b. 提出前セルフチェック（書いた後）

実装後に通す確認。各項目は antipatterns.md / 各参照へ route する。この項目群は **§5-3 の refactor 順序パスと同一のチェック集を前向きに適用したもの**（同じルールを「書いた後」に当てる）。**まず §4-4a の Authoring Plan と実装を 1 行ずつ照合し、差分を「計画変更／実装漏れ／要確認」に分類**してから、以下を点検する（§4-4a「§4-4b への接続」）。

- `<div>`＋素の CSS でなく Primitive（Stack/Flex/Grid/Columns 等）で書けないか
- `@lism-css/ui` の既存コンポーネントで置き換えられないか
- CSS に書いた宣言が Property Class / Lism Props へ移せないか
- `c--*` は意味づけとして妥当か（状態・バリエーション流用でないか）
- 状態は `data-*`、バリエーションは `c--name--variant` になっているか
- spacing / color / font-size / radius / shadow がトークンに合っているか
- px / rem / em 直書きに必然性があるか
- 固定 PC 前提の Grid（`gtc="repeat(3,1fr)"`）になっていないか
- レスポンシブ切替に必要な `isContainer` 祖先があるか
- 同じ Property Class の束が 3 箇所以上ならコンポーネント化を検討したか
- `Heading level={3}` のような Props 型ミスがないか
- **primitive が既に持つ CSS を Lism Props / Property Class で再指定していないか**（#395c4）
- 既存の命名・レイヤー・ファイル配置に合っているか

### 4-5. 参照ルーティング表（guide SKILL.md に置く）

| 調べたいこと | 読む参照ファイル |
|---|---|
| レイアウト選定 | `primitive-class.md`（必要なら `primitives/l--*.md`） |
| トークン（余白・色・角丸・影・fz） | `tokens.md` |
| CSS レイヤー・`c--*`・カスタム CSS | `css-rules.md` |
| 命名・prefix・Property Class 表記 | `naming.md` |
| Property Class へ移せるか | `property-class.md` |
| レスポンシブ・コンテナクエリ | `responsive.md` |
| React/Astro コンポーネント | `components-core.md` |
| UI コンポーネント置換 | `components-ui.md` |
| 典型ミス確認 | `antipatterns.md` |

### 4-6. primitive 既定 CSS 概要の追加（#395c4）

各 `primitives/l--*.md` に「既定の挙動」を**短く**追加する（全 CSS 転載でなく、重複指定の判断に必要なプロパティだけ）。AI がソースを読まず `ai="center"` `ov="hidden"` を念のため足すのを防ぐ目的。

確定済みの記載内容（issue で SCSS 確認済み）:

- `l--cluster`: `display:flex` / `flex-wrap:wrap` / `align-items:center`。**`gap` は既定で持たない**（間隔は `g`/`-g:*` で指定）。通常 `fxw="wrap"` `ai="center"` は足さない。
- `l--frame`: `overflow:hidden`。直下 `img/video/iframe` を `display:block;width:100%;height:100%;object-fit:cover` でフィット。通常 `ov="hidden"` や直下メディアへの `w/h/object-fit` は足さない。

要 SCSS 確認の対象（既定 CSS を読んで概要を書く）: `l--center` / `l--stack` / `l--grid` / `l--columns` / `l--autoColumns` / `l--tileGrid` / `l--switchColumns` / `l--withSide` / `l--flow`。

### 4-7. クラス紹介系のソースリンク整備（#395c1 末尾）

primitive / trait / property-class / set-class / utility-class / components-ui の各個別ファイルに、公式 docs だけでなく **SCSS/TS ソースへのリンク**を揃える。ただし SKILL.md の判断ロジック自体は外部リンク依存にしない。

### 4-8. 軽量化／ハイブリッド方針（#343）

- **ローカルに残す**: 判断ロジック・優先順位・1〜3 行要約・離散トークン値（spacing `5/10/15…`・色名）・primitive 既定 CSS 概要・アンチパターン。→ これらは refactor の route 先でもあるので**消さない**。
- **docs `.md` URL／MCP へ逃がしてよい**: 網羅的なプロパティ表・全プリセット値の一覧など、判断に必須でない大型データのみ。
- **逃がす前に受け皿を確認**（#343）: docs `.md` URL へ逃がしてよいのは、対応する docs ページ／アンカーが実在するものに限る。独立ページが無くても親ページ内アンカー（例: `trait-class.md#has--gutter`）があれば受け皿として可。無いものは skill 内に要約を維持するか、先に docs ページを用意する。
- SKILL.md は索引（目次）として使い、500 行以下を維持（#343）。

### 4-9. 命名・description（物理 rename は後回し）

- 物理名・`name` は `lism-css-guide` のまま。`description` は「実装時に起動されやすい coding 寄り」へ変更するが、**現 description のクラス prefix 逆引きキーワード（`c--*` `l--*` `a--*` `is--*` `has--*` `set--*` `u--*` `-prop:value`）は温存する**。guide は用途③「仕様の逆引き」も担うため、削除すると逆引き時の自動起動性が落ちる（Claude Code の skill 自動起動は description 文字列で判定。なお MCP の `get_guide`/`get_overview` は topic/ファイル指定で配信し description を検索に使わないため、description 変更の影響を受けない）。
  - 例: `Lism CSS で UI やページを実装・修正する時に使う実装ガイド。Primitive 選定・token 照合・Property Class/Lism Props 活用・レスポンシブ設計・アンチパターンセルフチェックを行う。c--*, l--*, a--*, is--*, has--*, set--*, u--*, -prop:value 形式のクラスやトークンの逆引きにも使う。`
- 将来の物理 rename は §7。

### 4-10. guide 強化 TODO（パス精緻化から確定）

§5-3 各パスの「guide 依存」列を集約。多くは §4 の各節に対応。★＝今回新規に判明した項目。

- [ ] 目的別ガイド（§4-2）に「メディア枠→Frame／幅制御→Wrapper・Container／全体リンク→BoxLink／等幅列→Columns」を明記（P2）
- [ ] 「同 Property Class 束 3 箇所以上→コンポーネント抽出」を SKILL.md/examples に（§4-4b・§5 examples）（P3）
- [ ] tokens.md に離散値・例外・デザイン取り込みフローを維持（§4-8）（P5）
- [ ] 正規 Trait 一覧＋状態/variant/独自 Trait の境界例を antipatterns.md に（§4-3）（P6）
- [ ] ★ `z--`/`p--` の使い分け例＋公開クラスを ⏸ にする判断基準を guide に（P7）
- [ ] ★ 冗長レスポンシブ配列の圧縮ルール・`$is_container_query:0` 時の扱い・container 配置方針を responsive 系に（P8）
- [ ] 各 `primitives/l--*.md` に既定 CSS 概要（特に frame/cluster。§4-6/#395c4）（P9）
- [ ] ★ SKILL.md 本体には「FP0–FP8 一覧＋実行レベル＋verdict 語彙＋§4-4b 接続」だけ置き、7 フィールド詳細・出力フォーマット表は **guide 自身の `references/authoring-workflow.md`／`references/authoring-output-format.md`／`examples/authoring-plan.md`** へ逃がす（§4-8 の 500 行維持・構成は §4-11）。**refactor 配下や本 plan には逃がさない**（plan は配布物でなく skill 実行時に参照不可／refactor へ置くと §5-6 の依存方向 refactor→guide が逆転）（P-forward）


### 4-11. guide オーバーホール後のディレクトリ構成

既存はフラット構成（`SKILL.md` ＋ `antipatterns.md` 等 ＋ `primitives/` `property-class/` `trait-class/` サブディレクトリ）。オーバーホールでは **既存ファイルを維持しつつ `references/` と `examples/` を追加**する（サブディレクトリ追加は既存パターンと整合）。

```
skills/lism-css-guide/
  SKILL.md                       # 索引（FP0–FP8 一覧／実行レベル／verdict 2 系統／§4-4b 接続）。500 行以下を維持
  antipatterns.md                # 共有 spine（§4-3 で増強。両スキルが参照）
  tokens.md / responsive.md / naming.md / property-class.md / css-rules.md / components-*.md  # 既存（維持・一部増強）
  primitives/l--*.md             # 既存 ＋ 既定 CSS 概要（§4-6）
  property-class/ , trait-class/  # 既存サブディレクトリ
  references/                    # ★新設: SKILL.md から逃がす authoring 詳細
    authoring-workflow.md        #   FP0–FP8 の 7 フィールド詳細
    authoring-output-format.md   #   Authoring Plan 出力フォーマット表（§4-4a）
  examples/                      # ★新設
    authoring-plan.md            #   Authoring Plan の記入見本（前向き宣言の例）
```

> **MCP 注記**: `get_guide` は `GUIDE_TOPICS`（固定トピック→ファイル map）で配信し、現状 `naming.md`/`trait-class.md` 等も非公開。新設 `references/`・`examples/` は **MCP 公開したい場合のみ `packages/mcp/src/tools/get-guide.ts` の `GUIDE_TOPICS` に追加**する（しなくても既存の非公開ファイルと同じ扱いで動作に支障なし）。`get_overview` は `SKILL.md` を読むため、SKILL.md 刷新は MCP 出力に反映される。


## 5. スキル B: `lism-css-refactor` 仕様

役割 = 既存コードの棚卸し・**挙動不変**リファクタ。ユーザーが明示起動する。**Lism の一般知識（authoring 知識）は複製せず guide へ route する**が、リファクタ固有の退行知識（common-mistakes.md）・出力フォーマット・before→after 例は refactor 側に持つ。

### 5-1. ディレクトリ構成

```
skills/lism-css-refactor/
  SKILL.md                  # ワークフロー（§5-2）＋ guide への route ＋ 原則
  references/
    checklist.md            # 順序パス（§5-3）。各パス = Inventory 表の 1 列を埋める作業
    common-mistakes.md      # リファクタ退行専用（§5-5）。authoring 系は guide へ route
    output-format.md        # Inventory 表・修正案 diff・Self-review 表の固定フォーマット
  examples/
    markup.md               # div-soup → primitive 化の before→after（丸ごとスニペット）
    css.md                  # CSS 束 → Property Class 化／CSS に残す宣言の線引き
    component-extraction.md # 重複 3 箇所以上 → コンポーネント抽出の before→after
  scripts/
    scan-lism-smells.mjs    # 任意・後回し（§5-7）
```

### 5-2. SKILL.md のワークフロー（厳守）

```
0. スコープ確定（対象ファイル/コンポーネント/選択範囲を明示。勝手に全体へ広げない）
1. 対象コード・周辺・利用箇所を読む
2. Inventory 表を出力（§5-4）
3. 順序パスで各行に verdict（§5-3）。判断に迷う箇所だけ guide へ route
4. 修正案の **draft diff** を作る（まだ提示しない）
5. **Self-review ゲート**（common-mistakes.md で退行を再照合・§5-5）← 提示の前に走らせる forcing function
6. Self-review 後の修正案を diff 形式＋ルール出典つきで提示
   └ ⏸（px 丸め・色推測など要確認）はここでユーザー確認。勝手に確定しない【必須チェックポイント】
7. ユーザーが実装を許可している場合だけ適用（挙動不変・最小 diff を明記）
8. 検証（テスト/ビルド/型チェック）と残リスクを報告
```

**原則:** リファクタは見た目・挙動を変えない。変わる提案は「これは挙動が変わる」と隔離して別途 sign-off を取る。idiomatic な箇所は触らない（churn を生まない）。**公開 class・外部 JS・E2E セレクタ・CMS など外部契約に依存する箇所の変更は ⏸**（断行しない）。

### 5-3. 順序パス（確定）

順序に意味がある（先に構造を決めないと個別監査が無駄になる）。各パスは Inventory 表（§5-4）の 1 列を埋める。verdict: ✅ 触らない / 🔧 修正対象 / ⏸ 要ユーザー判断 / ⬜ 意図的に残す。各パスの「退行注意」は §5-5 へ、「guide 依存」は §4-10 へ集約済み。

#### Pass 1: 棚卸し
- **検出**: 対象範囲内の class/className・Lism Props・CSS 宣言・style 属性・@media/@container・重複クラス束をすべて列挙
- **判定**: 原則 verdict を確定しない。対象外だけ ✅／意図的スコープ外だけ ⬜／残りは Pass 2 以降へ
- **直し方**: 修正しない。Inventory 表の行を作るだけ
- **route先**: なし（§5-4 への入口）
- **NG→OK**: NG=`.c--card{padding}` だけ拾い `p={[20,30]}` や `is--active` を漏らす ／ OK=class/Props/CSS/値/重複/レスポンシブを別行で列挙
- **退行注意**: 棚卸し漏れは後続で検出不能。特に style 属性・配列 Props・CSS 変数・JS の class 切替を落としやすい
- **guide依存**: 不要

#### Pass 2: 構造パス
- **検出**: `<div>`/`<section>` に `display:flex/grid`・`-d:flex/grid`・`gtc`・`fxd`・`fxw`・`ai`・`jc` が集まる、またはメディア枠/幅制御/オーバーレイ/全体リンクを手組み
- **判定**: Stack/Flex/Cluster/Grid/Columns/Frame/WithSide/Wrapper/Container/Layer/BoxLink で同じ挙動にできる→🔧 ／ 既に適切な Primitive/Trait→✅ ／ DOM 順・セマンティクス・JS 依存・レスポンシブ挙動が変わる→⏸ ／ 独自レイアウト意図が明確→⬜
- **直し方**: 手組み構造を Primitive/Trait へ置換し、余白・色は Lism Props/Property Class へ。複雑な Grid 配置を無理に Columns へ潰さない
- **route先**: primitive-class.md / primitives/l--*.md / trait-class.md / trait-class/is--*.md / components-core.md / components-ui.md / antipatterns.md#レイアウト選択ミス
- **NG→OK**: NG=`<div className="c--cards -d:grid -g:20" style={{gridTemplateColumns:'repeat(3,1fr)'}}>` → OK=`<Columns className="c--cards" cols={3} g="20">` ／ NG=`<div className="c--media -ov:hidden -ar:16/9"><img/></div>` → OK=`<Frame className="c--media" ar="16/9"><img/></Frame>`
- **退行注意**: Grid→Columns で複雑なトラック/エリア指定を失う、Wrapper 追加で直下子要素幅が変わる、Frame 化で直下メディア以外の子に既定が当たる
- **guide依存**: 目的別ガイドに「メディア枠→Frame／幅制御→Wrapper・Container／全体リンク→BoxLink／等幅列→Columns」を明記

#### Pass 3: 重複パス
- **検出**: 同じ Property Class 束・Lism Props 束・`c--*` 構造・CSS 宣言束が 3 箇所以上
- **判定**: 同じ意味の UI 部品として抽出できる→🔧 ／ 2 箇所以下・一時的な局所重複→✅ ／ 値差分やスロット構造を Props 化する必要→⏸ ／ 意図的に展開した例示コード→⬜
- **直し方**: CSS へ逃がさず React/Astro コンポーネントとして抽出。`<Lism>`/Inline/Box/Stack 等をベースにし `className="c--*"` は意味名として残す
- **route先**: components-core.md / components-ui.md / css-rules.md#component-classc-- / property-class.md / antipatterns.md#property-class-で書けるのに-css-で書く
- **NG→OK**: NG=`<span className="c--tag -fz:xs -px:10 -py:5 -bgc:base-2 -bdrs:10">` が 3 回以上 → OK=`function Tag({children}){return <Inline className="c--tag" fz="xs" px="10" py="5" bgc="base-2" bdrs="10">{children}</Inline>}`
- **退行注意**: className/style/data-*/ARIA/event handler の透過漏れ、レスポンシブ Props を単一値に潰す、抽出で HTML 要素が変わる
- **guide依存**: 「同 Property Class 束 3 箇所以上→コンポーネント抽出」を SKILL.md/examples に明記

#### Pass 4: Property Class 抽出パス
- **検出**: `.c--*` の CSS ブロックに、擬似クラス/子孫セレクタを伴わない単一要素向け宣言束（font-size・padding・color・background・border-radius 等）
- **判定**: Property Class/Props で書ける→🔧 マークアップへ ／ 擬似クラス・擬似要素・状態切替・子孫セレクタ付き→✅ CSS に残す ／ 同束 3 箇所以上→🔧（Pass 3 連携）
- **直し方**: `-{prop}:{value}` or `<Lism prop="value">` へ移す。`.c--*` の CSS は空でよいが**クラス名はマークアップに残す**
- **route先**: property-class.md / tokens.md / antipatterns.md#property-class-で書けるのに-css-で書く
- **NG→OK**: NG=`.c--tag{font-size:var(--fz--xs);padding:var(--s10);background:var(--base-2);border-radius:var(--bdrs--10)}`＋`<span class="c--tag">` → OK=`.c--tag{}`（空・名前は残す）＋`<span class="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10">`
- **退行注意**: @container/@media 内の同プロパティ移し忘れ／単一値化、空化でクラス名削除、`!important`・詳細度依存の挙動変化
- **guide依存**: property-class.md の省略名一覧・tokens.md の値リストが正確であること

#### Pass 5: トークン監査パス
- **検出**: px/rem/em 直書き、`p="8"`/`fz="14"`/`bgc="secondary"` など存在しない値、`--keycolor` のグローバル利用、任意色/任意サイズの style 属性
- **判定**: tokens.md にある値で既に書けている→✅ ／ guide に明確な置換がある **typo→🔧（自動置換）** ／ **px 丸め・任意色推測・デザイン値置換→⏸** ／ 1px 罫線・transform 微調整・@media 閾値など例外→⬜
- **直し方**: 既知 typo は正規トークンへ置換。固定値は最寄り候補と差分を出し、ユーザー確認後に Props/Property Class/token CSS 変数へ
- **route先**: tokens.md / property-class.md / antipatterns.md#token-typo存在しない値 / antipatterns.md#px--固定値の直書き / antipatterns.md#--keycolor-の誤用
- **NG→OK**: typo（🔧）: `bgc="secondary" c="muted"` → `bgc="base-2" c="text-2"` ／ 丸め（⏸）: `padding:24px; border-radius:8px` → `p="30"/bdrs="20"` 候補を提示し確認後に適用（`p="8"` も丸めなので ⏸）
- **退行注意**: プロジェクトで `--s-unit`/トークンを上書きしていると px 一致が崩れる。`--keycolor` は局所軸色でありブランド色代替にしない
- **guide依存**: tokens.md に離散値と例外を残す。カスタムトークン検出時の扱いとデザイン値取り込みフローを SKILL.md に維持

#### Pass 6: trait/状態/バリエーションパス
- **検出**: `is--active`/`is--current`/`is--disabled`/`is--open`/`is--solid`/`is--outline` など、guide 掲載外の `is--*` が状態や見た目違いに使われている
- **判定**: 正規 Trait（`is--container`/`is--wrapper`/`is--layer`/`is--boxLink`/`is--coverLink`/`is--skipFlow`/`is--side`、`has--transition` 等）→✅ ／ 状態管理→🔧 で `data-*` または ARIA ／ 見た目違い→🔧 で `c--name--variant` ／ 独自 Trait が役割宣言として妥当だが guide 外→⬜ または ⏸
- **直し方**: 状態は属性セレクタへ、バリエーションは BEM Modifier へ。CSS セレクタと JS の toggle 対象も同時更新
- **route先**: antipatterns.md#is---の誤用状態バリエーション / trait-class.md / trait-class/is--container.md / trait-class/is--wrapper.md / css-rules.md#component-classc--
- **NG→OK**: NG=`<a className="c--catTab is--active">`＋`.c--catTab.is--active{}` → OK=`<a className="c--catTab" data-is-active>`＋`.c--catTab[data-is-active]{}` ／ NG=`<span className="c--tag is--solid">` → OK=`<span className="c--tag c--tag--solid">`
- **退行注意**: JS の `classList.toggle('is--active')`・テスト・CSS セレクタを直し忘れると状態表示が壊れる。`aria-current` 等が使える箇所は意味も確認
- **guide依存**: 正規 Trait 一覧と、状態/variant/独自 Trait の境界例を antipatterns.md に維持

#### Pass 7: 命名パス
- **検出**: `c--feature-card`・`c--my-card--primary`・`c--card__body`・`has--gutter-x`、サイト領域を表す `c--header`/`c--sidebar` など
- **判定**: prefix 後が camelCase で `c--block`/`c--block--modifier`/`c--block_element` に合う→✅ ／ 参照を全更新できる内部クラス→🔧 ／ 公開 API・CMS・外部 JS・E2E セレクタ依存→⏸ ／ 既存運用上あえて残す非 Lism 命名→⬜
- **直し方**: クラス名・CSS セレクタ・JS 参照・テスト参照を同時に rename。ゾーニングは `z--*`、ページ固有は `p--*` へ
- **route先**: naming.md / css-rules.md#component-classc-- / css-rules.md#独自プレフィックス / antipatterns.md#クラス名の命名ミスkebab-case / antipatterns.md#カスタムクラスを何でも-c---にしない
- **NG→OK**: NG=`.c--feature-card .c--feature-card__body{}` → OK=`.c--featureCard .c--featureCard_body{}` ／ NG=`.c--site-header{}` → OK=`.z--header{}`（再利用 UI でない場合）
- **退行注意**: CSS だけ rename して JS/テスト/HTML 生成側を漏らす。`c--block.c--otherBlock` のような Block 併用を見逃す
- **guide依存**: `z--`/`p--` の使い分け例と、公開クラスを ⏸ にする判断基準を guide または refactor 例に追加

#### Pass 8: レスポンシブパス
- **検出**: 配列/オブジェクト Props、`-{prop}_{bp}`、`--{prop}_{bp}`、`xs`/`xl` キー、固定 `gtc="repeat(3,1fr)"`、レスポンシブ値の祖先に `is--container` がない箇所
- **判定**: base 値あり・sm/md/lg・祖先 isContainer あり→✅ ／ base 抜け・xs 誤用など明確なミス→🔧 ／ isContainer 追加位置や固定 Grid のレスポンシブ化で挙動が変わる→⏸ ／ SCSS 設定で media query 運用が確認済み→⬜
- **直し方**: base 値を補う、標準 BP へ直す、必要な祖先へ isContainer を追加。固定 3 列→`Columns cols={3}` は同等だが、`cols={[1,2,3]}` 化は挙動変更なので ⏸ で確認
- **route先**: responsive.md / antipatterns.md#レスポンシブ抜け / trait-class/is--container.md / property-class.md / primitive-class.md#カラムレイアウト-primitive-の使い分けガイド
- **NG→OK**: NG=`<Box p={{sm:30}}>` → OK=`<Box p={{base:'20', sm:'30'}}>`（base 値が既存見た目から確定できる場合）／ NG=`<div className="-p_sm" style={{'--p_sm':'var(--s30)'}}>` → OK=`<div className="-p:20 -p_sm" style={{'--p_sm':'var(--s30)'}}>`
- **退行注意**: isContainer を置く位置でコンテナ幅・発火タイミングが変わる。重複配列を単一値に潰すと BP 差分を消す
- **guide依存**: 冗長レスポンシブ配列の圧縮ルール・`$is_container_query:0` 時の扱い・container 配置方針を responsive 系に追記

#### Pass 9: 既定値重複パス
- **検出**: Primitive が既に持つ挙動と同じ Props/Property Class を重ねる。例: `<Cluster fxw="wrap" ai="center">`・`<Frame ov="hidden">`・Frame 直下メディアへの `-w:100% -h:100%`/`object-fit:cover`
- **判定**: guide に既定値として明記済みで同値の重複→🔧 ／ 既定値と違う意図的上書き→✅ または ⬜ ／ guide 未整備の Primitive 既定値→（⏸ でなく）guide TODO へ回す ／ Property Class の詳細度が必要な上書き→⬜
- **直し方**: 重複 Props/Property Class だけ削除し、Primitive 自体と意味クラスは残す。Cluster の `g` は既定ではないので消さない
- **route先**: primitive-class.md / primitives/l--cluster.md / primitives/l--frame.md / components-core.md / property-class.md
- **NG→OK**: NG=`<Cluster fxw="wrap" ai="center" g="15">` → OK=`<Cluster g="15">` ／ NG=`<Frame ar="16/9" ov="hidden"><img className="-w:100% -h:100%" style={{objectFit:'cover'}}/></Frame>` → OK=`<Frame ar="16/9"><img/></Frame>`（l--frame 既定 CSS 概要が guide に明記された後に自動判定）
- **退行注意**: プロジェクト CSS で Primitive 既定を上書きしていると削除で見た目が変わる。直下メディア以外・`object-fit:contain`・`object-position` 指定は消さない
- **guide依存**: 各 `primitives/l--*.md` に既定 CSS 概要を追加（特に l--frame の overflow:hidden と直下メディア fit、l--cluster の flex-wrap/align-items/gap なし。§4-6/#395c4）

#### Pass 10: Self-review ゲート
- **検出**: 修正案の draft を作った直後（**ユーザー提示の前**・§5-2 step 5）
- **判定**: common-mistakes 全項目 OK→✅ ／ 自分の修正で退行を作った→🔧 ／ px 丸めや挙動変更が残る→⏸ ／ 合意済み例外→⬜
- **直し方**: 修正案を他人の PR として再点検し退行だけ直す。authoring 系は guide へ route し common-mistakes に再掲しない
- **route先**: なし（§5-5 と `references/common-mistakes.md` への入口）
- **NG→OK**: NG=CSS を空にした勢いで `className="c--tag"` も削除 → OK=CSS 宣言だけ移し意味クラスは残す ／ NG=`is--active`→`data-is-active` に変えたが CSS/JS セレクタ未更新 → OK=markup/CSS/JS/tests を同時更新
- **退行注意**: §5-5 の全項目
- **guide依存**: 不要（refactor 側 common-mistakes.md に退行専用で持つ）

### 5-4. Inventory 表と verdict（取りこぼし対策の本体）

チェックリスト（「〜したか？」）ではなく、**コード上の実体を 1 行ずつ棚卸し**し、各行に必ず verdict を付ける。黙って落とす項目をゼロにするのが狙い（forward coverage）。

| 実体（クラス/宣言/値/重複） | パス所見 | verdict | 根拠 |
|---|---|---|---|
| 例: `.c--tag { padding: var(--s10) … }` | Property Class へ移せる | 🔧 | antipatterns: CSS で書く |
| 例: `<Cluster ai="center">` | 既定値の重複 | 🔧 | l--cluster 既定 |
| 例: `padding: 13px` | トークン外 | ⏸ | 丸めはユーザー確認 |

verdict: **✅ 触らない／🔧 修正案あり／⏸ 要ユーザー判断／⬜ 意図的に残す**。

### 5-5. Self-review ゲート（backward regression）

修正案を出した後、**自分の修正案を他人の PR として** common-mistakes.md で再照合する。ここは authoring 系（antipatterns.md）を**再掲せず**、「リファクタしたから踏む退行」専用にする。

**全パス共通の退行（横断・必ず確認）** — 特定パスでなく複数パスで踏むため、common-mistakes.md の冒頭と SKILL.md 原則に置く：

- **透過漏れ**: 抽出/置換で `className`/`style`/`data-*`/ARIA/event handler を渡し忘れる
- **外部契約は ⏸**: 公開 class・CMS・外部 JS・E2E セレクタに依存する箇所の rename/構造変更は断行しない
- **同時更新**: `is--`→`data-*` 等で CSS だけ直し JS/テスト/HTML 生成を漏らす

**個別の退行（表）**:

| 確認項目 | 判定 | 由来パス |
|---|---|---|
| レスポンシブ配列を単一値に潰していないか（`p={[20,30]}`→`-p:20`） | OK/NG | P4/P8 |
| CSS を空にしたついでに `c--` 意味クラスまで消していないか | OK/NG | P4/P10 |
| `is--active`→`data-*` に変えて CSS/JS/test セレクタを直し忘れていないか | OK/NG | P6 |
| px を勝手に token へ丸めていないか（要確認を飛ばしていないか） | OK/NG | P5 |
| 抽出コンポーネントで props のレスポンシブ対応が抜けていないか | OK/NG | P3 |
| primitive 化・既定値削除で gap/align/幅/見た目が変わっていないか | OK/NG | P2/P9 |
| 既定値削除で project override や意図的上書きを消していないか | OK/NG | P9 |

### 5-6. guide への依存とフォールバック

- refactor は guide のローカルファイルへ route する。両スキルは各ツールの `.{tool}/skills/` 配下に並んで配置されるため、`lism-css-refactor/SKILL.md` からは `../lism-css-guide/antipatterns.md` のような**相対パス**で参照する。
- **前提**: `lism-css-guide` が同階層に導入済み。
- **未導入時のフォールバック**（SKILL.md に明記）: (a) `lism skill add` で guide 導入を促す、または (b) MCP の `get_*` ツール（`get_tokens` / `get_guide` 等）／公式 docs `.md` URL を参照して最低限の判断を行う。

### 5-7. scan スクリプト（任意・後回し）

正規表現ベースの「疑いリスト」生成。**lint ではなく seed**（最終判断は guide 参照込みで AI が行う）。今は作らず prose の整備を優先。検出候補は付録 B。


## 6. 共有 spine と重複回避ルール

- **`antipatterns.md`（guide 側）= authoring 系**（ゼロから書く時のミス）。両スキルが参照。
- **`common-mistakes.md`（refactor 側）= 退行系**（変更した結果壊れるミス）。antipatterns を再掲しない。
- guide の `提出前セルフチェック`（①・実装の前後で作法を強制）と refactor の `Self-review ゲート`（②・既存コードの退行総点検）は**別物**。前者は新規実装、後者はリファクタが対象。両方持つのが正しく、重複ではない。


## 7. 命名方針

| 時点 | guide | refactor |
|---|---|---|
| 今 | 物理名 `lism-css-guide` 据え置き／`description` だけ coding 寄りへ | 新設 `lism-css-refactor`（現 `lism-css-*` ファミリーに合わせる） |
| 将来（ペアで rename） | `lism-coding-guide` | `lism-refactor` |

- 物理 rename はコスト大（CLI `paths.ts` / docs / MCP / README に `lism-css-guide` が埋まっている。付録 A）。
- rename する場合は `lism skill add` に **alias または移行処理**を入れてから。CLI 複数 skill 配布の一般化（付録 A）と同時に行う。
- このスキルは CSS だけでなく React/Astro コンポーネント・Props も扱うため、改名時は `css` を外した `lism-coding-guide`（CLI コマンド `lism` とも揃う）。


## 8. 進め方（実装は guide 先行・設計は同時）

**「実装の順番」と「設計の順番」を分ける。**

- **実装は guide が先**: refactor は guide のファイルへ route するので、guide が空/弱いまま refactor を作ると参照先が無く機能しない。
- **設計は同時**: 「guide に何を盛るか」は refactor の監査パスを設計すると決まる。refactor のパスを全部書き出す＝guide に必要な antipattern と primitive 既定値を全部洗い出すこと。**refactor のパス設計が guide 強化の仕様書（完全性チェック）になる**。
- **ただし forward 固有手順は別**: デザイン → Primitive/token/responsive 方針の列挙 preflight（§4-4a）は refactor パスから導けない。guide の authoring workflow は §4-1（A）・§4-4a で設計済み。

| refactor のパスを設計すると… | guide に必要な中身が決まる |
|---|---|
| 「既定値重複」検出パス（§5-3 p9） | 各 `l--*.md` の既定 CSS 概要（§4-6 / #395c4） |
| 「トークン監査」パス（§5-3 p5） | spacing 離散値・色名のローカル要約（§4-8） |
| 「hover が Property Class に負ける」検出パス | 該当アンチパターンを antipatterns.md に追加（§4-3 / #395c1） |

### フェーズ

1. **設計フェーズ**: ✅ refactor 順序パス精緻化 完了（§5-3 確定／退行は §5-5／guide TODO は §4-10）。✅ **guide の authoring workflow 設計 完了**（§4-1 A／§4-4a の FP0–FP8・実行レベル・出力フォーマット・§4-4b 接続）。← **設計フェーズ完了**
2. **guide オーバーホール**（§4 全体: 実装フロー〈preflight＋目的別ガイド＋提出前セルフチェック〉・antipatterns 増強・primitive 既定 CSS 概要・ソースリンク・軽量化・description）。
3. **`lism-css-refactor` 構築**（§5。増強済み guide へ route）。
4. **CLI 複数 skill 配布の一般化**（付録 A）＋ 後段で物理 rename ＋ alias/移行。

> 開発中、refactor スキルはリポジトリの `skills/lism-css-refactor/` に置く。各ツールへの配布は §8 フェーズ 4（CLI 一般化）まで手動。それまでは `.claude/skills/` 等へ手動コピーで動作確認する。


## 9. 決定事項

| # | 論点 | 方針 | 状態 |
|---|---|---|---|
| 1 | 2 スキル構成 / 第 3 skill | 2 スキル。reference 専用 skill は作らない | ✅ |
| 2 | guide の役割 | 百科事典 → 判断入口＋軽量索引 | ✅ |
| 3 | 共有 spine | `antipatterns.md`（guide 側、#395c1 増強） | ✅ |
| 4 | Inventory/Self-review 二層 | 採用 | ✅ |
| 5 | common-mistakes の中身 | リファクタ退行専用（再掲しない） | ✅ |
| 6 | 命名 | 物理名据え置き＋description 先行、後段 `lism-coding-guide`/`lism-refactor` | ✅ |
| 7 | シーケンス | guide 先行・refactor 設計同時 | ✅ |
| 8 | scan スクリプト | 後回し。seed 専用・gate にしない | ✅ |
| 9 | examples 配置 | refactor `examples/` に独立（before→after は嵩張るため） | ✅ |
| 10 | 適用前の対話チェックポイント（⏸ px 等） | 必須（§5-2 step 6・Self-review 後の提示時） | ✅ |
| 11 | guide 未導入時のフォールバック | `lism skill add` 促し or MCP/docs 参照（§5-6） | ✅ |
| 12 | docs `.md` URL への肩代わり度合い | 保守的ハイブリッド（judgment はローカル維持・§4-8） | 🟡 guide 実装時に線引き |
| 13 | guide 一本化 vs 二分割（#395c2） | 一本化で開始、肥大時に再検討 | 🟡 様子見 |
| 14 | `check-ui-props` との接続 | **実体は project-local コマンド `.claude/commands/check-ui-props.md`**（配布スキルでない）。責務は lism-ui 内部の React↔Astro 既定 props 整合で、refactor（ユーザーコード対象・既定値重複除去）とは対象も観点も別。**スコープ外・無関係**として整理（参照接続も不要） | 🟡→確定見込み（§9-1 U4） |
| 15 | forward preflight 設計 | §5-3 の前向き写像 FP0–FP8（同型 7 フィールド）＋成果物 Authoring Plan。FP0 のみ forward 固有 | ✅ |
| 16 | preflight 実行レベル | 規模で「不要／軽量／通常／値照合付き」に段階化（forcing function 過剰発火の防止） | ✅ |
| 17 | forward verdict 語彙 | ✅ 確定 / ⏸ 要確認 / 🔁 参照して確定 / 🆕 新規定義 / ⬜ 例外 | ✅ |


### 9-1. 未決事項（実装前または運用で確定する）

冒頭ステータスの「コア設計確定」に含めない、運用判断で決める項目。決定事項テーブルの 🟡 はここへ集約する。

| # | 未決事項 | 選択肢 / 暫定方針 |
|---|---|---|
| U1 | docs `.md`/MCP へ逃がす範囲（決定 #12） | judgment はローカル維持の保守的ハイブリッド。具体的な線引きは guide 実装時 |
| U2 | guide 一本化 vs 二分割の肥大化ライン（決定 #13） | 一本化で開始。SKILL.md が 500 行を超え索引が機能不全になったら分割を再検討 |
| U3 | CLI 複数 skill 配布のデフォルト挙動（付録 A） | 全スキル導入か guide のみか。後方互換重視なら既定=guide のみ＋refactor は明示追加。`add`/`check`/`update` が既導入のみ見るか全スキルを見るかも要決定。既存ユーザーに refactor を勝手に追加するかも論点 |
| U4 | `check-ui-props` との関係（決定 #14） | 検証の結果スコープ外の公算大（lism-ui 内部用コマンドで refactor と無関係）。最終 sign-off で「無関係」に確定予定 |


## 10. 次アクション

1. ✅ **refactor 順序パス精緻化 完了**（§5-3 確定。退行は §5-5、guide 強化 TODO は §4-10 に反映済み）。
2. ✅ **guide の authoring workflow 設計 完了**（§4-4a に FP0–FP8・実行レベル・出力フォーマット・⏸ 条件・§4-4b 接続を反映）。**設計フェーズ完了**。
3. ✅ **設計レビューの反映 完了**（⏸ タイミング・Self-review 順・「対称」表現・参照切れ・guide 逃がし先 references/・verdict 2 系統・isContainer 例外・取り込みフロー・FP 省略可・description prefix 温存・check-ui-props 整理・未決事項 §9-1 分離）。
4. ✅ **issue #343/#395 照合 完了**（設計は issue 意図と整合。#343 の「has--* は docs 未対応」は現時点で解消済みと実態確認＝`trait-class.mdx` にセクション実在・MCP 登録済み。§4-8 に「逃がす前に受け皿確認」ルールを追加）。
5. **次アクション**: §8 フェーズ 2「guide オーバーホール」へ着手（§4 全体を実 SKILL.md／参照 .md に反映）。


## 付録 A: CLI 複数 skill 配布の一般化（フェーズ 4）

現状 CLI は単一スキル直書き。複数配布へ一般化するため改修する。

- `packages/lism-cli/src/constants.ts`: `SKILL_SOURCE_PATH = 'skills/lism-css-guide'`（単一）→ スキル名レジストリ（`['lism-css-guide','lism-css-refactor']`）＋ base パスへ
- `commands/skill/paths.ts`: `SKILL_PATHS`（`.{tool}/skills/lism-css-guide` 直書き）→ `tool → base` マップ ＋ `skillDestDir(tool, name)` ヘルパー
- `commands/skill/skillSource.ts`: `fetchSkillSource(skillName, ref)` で `skills/{name}` を取得
- `commands/skill/add.ts` / `check.ts` / `update.ts`: スキルを loop（`lism skill add [name]` で個別指定可。**既定挙動は未決＝§9-1 U3**: 全スキル導入か guide のみか。後方互換重視なら既定=guide のみ＋refactor は明示追加が安全）
- `commands/skill/index.ts`: `add` に positional `[skill]` を追加
- `messages.ts` / i18n: スキル名を差し込む文言調整
- 確認: `nr build:cli` / `nr lint` / `nr typecheck`

**関連影響先（rename 時に要確認）:**
- MCP サーバーは `skills/lism-css-guide/*.md` を正本に Markdown を返す（`documents/mcp-update.md`）。ディレクトリ名変更は MCP に波及。
- README / docs / `lism skill add` の出力パス文言。


## 付録 B: scan スクリプト検出候補（後回し・seed 用）

- `Heading level={3}`（数値 level）
- `hov="shadow"` 等の省略名ミス
- `is--active` / `is--solid` 系（状態・バリエーション流用）
- CSS 内の px / rem / em 直書き
- `.c--*` 内の `padding` / `font-size` / `background-color` 等（Property Class へ移せそう）
- `gtc="repeat(3, 1fr)"` のような固定 Grid

→ あくまで「疑いリスト」。検出ゼロ＝完了、にしない。


## 付録 C: 経緯・根拠（要約）

- 元要望: guide を読ませても **初期実装でもリファクタでも**ベストプラクティスに従わず取りこぼす（受け身読みでは forcing function が働かない）。refactor スキルで「チェック項目を列挙・確認」「guide を適宜参照」「修正案を出してから自分で『よくある間違い』を自己照合」したい → ① guide 強化（手順制御）＋ ② refactor 別建ての 2 本柱に。
- Claude/Codex で収束した主張: ① Inventory＋Self-review の二層（チェックリストでなくコード実体の棚卸し）、② antipatterns（guide）と common-mistakes（refactor 退行）の分担、③ 挙動不変・最小 diff。
- Codex 由来の採用点: 参照ルーティング、output-format の独立、scan の「seed であって lint でない」位置づけ、guide=判断入口への再フレーミング、物理名据え置き＋description 先行、guide-first シーケンス。
