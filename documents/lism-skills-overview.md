# Lismスキル群 解説

PR459でリニューアルしたLism CSSのskillsについて、何ができるのか、どう使うのか、内部でどういう処理の流れになっているのかを整理する。

## ひとことで言うと

今回のリニューアルは、Lism CSSのskillを**「読むだけの資料」から「AIに手順を踏ませる実行ガイド」へ作り変える**もの。

これまでの課題は、`lism-css-guide`を読ませても、初期実装でもリファクタでもベストプラクティスを取りこぼすことだった。つまり「読む」だけでは、Primitive選定・token照合・Property Class化・レスポンシブ確認などを実作業で必ず実行する強制力が足りなかった。

PR459では、その問題に対して次の3本柱で対応している。

| 柱 | 内容 |
|---|---|
| `lism-css-guide`強化 | 新規実装用ガイドを、単なる索引から「判断入口＋手順」へ刷新 |
| `lism-css-refactor`新設 | 既存コードの監査・リファクタ専用skillを追加 |
| CLI複数skill配布 | `lism skill`を複数skill対応へ一般化 |

結果として、Lismのskillは役割の違う2つになる。

| skill | 役割 | 起動する場面 |
|---|---|---|
| `lism-css-guide` | 新規実装、UI作成、ページ作成、コンポーネント作成の前向き作業 | 要件・デザインからコードを書くとき |
| `lism-css-refactor` | 既存コードの監査・整理・リファクタの後ろ向き作業 | ユーザーがリファクタ・監査・整理を明示したとき |

重要なのは、`lism-css-refactor`はtoken値やPrimitive選定などの一般知識を自分で重複保持しないこと。迷ったときは同階層の`lism-css-guide`へrouteする。知識の正典はguideに寄せ、refactorは既存コードを順番に棚卸しする手順に集中する。

---

## 何ができる？

### `lism-css-guide`でできること

`lism-css-guide`は、新規UI・ページ・コンポーネントを書くときの実装ガイド。単なるクラス一覧ではなく、**実装前preflight→実装→提出前セルフチェック**を通すことで、Lismらしい書き方の取りこぼしを防ぐ。

主に以下を扱う。

- Primitive選定
  - `Stack` / `Cluster` / `Grid` / `Columns` / `AutoColumns` / `WithSide` / `Frame`など
- Trait選定
  - `Container` / `Wrapper` / `Layer` / `BoxLink` / `has--transition`など
- token照合
  - spacing / color / font-size / radius / shadowなど
- Property Class / Lism Props活用
  - CSSに書くべきか、`-p:20`や`p="20"`へ寄せるべきか
- レスポンシブ設計
  - base値、`sm` / `md` / `lg`、container query、`isContainer`祖先の有無
- 命名設計
  - `c--*` / `z--*` / `p--*`
  - `c--block_element` / `c--block--modifier`
- 状態・バリエーション設計
  - 状態は`data-*`/ARIA
  - 見た目違いは`c--name--variant`
  - `is--active`のような`is--`誤用を避ける
- アンチパターン確認
  - div手組み、px直書き、存在しないtoken、固定Grid、Primitive既定値の重複など

### `lism-css-refactor`でできること

`lism-css-refactor`は、既存のLism CSSコードを棚卸しして、**挙動を変えずに**idiomaticな書き方へ寄せるためのskill。

主に以下を検出・提案する。

- div手組みレイアウトをPrimitiveへ置換できる箇所
  - 例: 手組みメディア枠 → `Frame`
  - 例: 固定的な等幅列 → `Columns`
- CSSに溜まった装飾束をProperty Class / Propsへ移せる箇所
- token逸脱
  - px/rem/em直書き
  - 存在しない値
  - `bgc="secondary"`のような曖昧値
- `is--`誤用
  - `is--active` / `is--open` / `is--solid`など
- 命名ミス
  - kebab-case
  - 何でも`c--`にする
  - `z--` / `p--` / `c--`の使い分けミス
- レスポンシブ抜け
  - base値なし
  - `xs`など標準外BP
  - container query運用時の`isContainer`祖先不足
- Primitive既定値の重複
  - `<Cluster fxw="wrap" ai="center">`
  - `<Frame ov="hidden">`
  - Frame直下imgへの`w/h/object-fit`重複指定

ただし、refactorの原則は**挙動不変・最小diff**。公開class名、CMS、外部JS、E2Eセレクタ、DOM順、レスポンシブ挙動に影響しそうな変更は勝手に実行せず、`⏸`としてユーザー確認に回す。

---

## どう使う？

### CLIで導入する

PR459で`lism skill`は複数skill対応になる。引数なしの`add`/`update`は、登録済みskillをまとめて扱う。

```bash
lism skill add
```

上記は、CLIが知っている全skillを導入する。PR459時点では以下の2つ。

- `lism-css-guide`
- `lism-css-refactor`

個別に入れることもできる。

```bash
lism skill add lism-css-guide
lism skill add lism-css-refactor
```

導入先ツールも指定できる。

```bash
lism skill add --codex
lism skill add --claude --cursor
lism skill add --all
```

対応している配置先は以下。

| tool | 配置先 |
|---|---|
| claude | `.claude/skills` |
| codex | `.agents/skills` |
| cursor | `.cursor/skills` |
| windsurf | `.windsurf/skills` |
| cline | `.cline/skills` |
| copilot | `.github/skills` |
| gemini | `.gemini/skills` |
| junie | `.junie/skills` |

ツール指定がない場合は、プロジェクト直下の`.claude` / `.agents` / `.cursor`などのマーカーから利用中と思われるツールを自動検出し、選択式で導入先を決める。

### 更新・差分確認

```bash
lism skill check
lism skill check --verbose
lism skill update
```

- `check`: ローカルに導入済みのskillが配布元と一致しているか確認する
- `check --verbose`: ファイル単位の差分も表示する
- `update`: 引数なし`add --overwrite`相当で、登録済みskillを最新版で上書きする

### 開発版・PR版を試す場合

`--ref`を指定すると、skillファイルの取得元ブランチ・タグ・コミットを変えられる。

```bash
lism skill add --ref dev
lism skill add --ref feat/lism-skill-overhaul
lism skill check --ref dev
```

ただし、`--ref`が切り替えるのは**取得するskillファイルの場所**だけ。CLI本体が知っているskill一覧は、実行しているCLIの`SKILL_NAMES`に依存する。

そのため、`lism-css-refactor`をCLI経由で扱うには、CLI側にもPR459の変更が入っている必要がある。

| やりたいこと | CLI更新が必要か |
|---|---|
| 既存の`lism-css-guide`をdev版にする | 旧CLIでも可能な場合がある |
| `lism skill add lism-css-refactor`で導入する | 必要 |
| 引数なし`lism skill add`でguide+refactorを一括導入する | 必要 |
| 手動で`.agents/skills/lism-css-refactor/`などへコピーする | 不要 |

つまり、`--ref`は「どこから取るか」を変えるだけで、「CLIが何のskillを知っているか」は変えない。

---

## `lism-css-guide`の処理の流れ

`lism-css-guide`の基本フローは以下。

```txt
目的確認
  → 実装前preflight
  → Authoring Plan作成
  → ⏸項目はユーザー確認
  → 実装
  → 提出前セルフチェック
  → 報告
```

### preflight実行レベル

作業規模によって、preflightの重さを変える。

| レベル | trigger | 出力 |
|---|---|---|
| 不要 | 説明のみ、コード変更なし、既存idiomaticな微修正 | なし |
| 軽量 | 数行の小変更、既存パターン内の変更 | 3〜5行の箇条書き |
| 通常 | 新規UI、コンポーネント、セクション | ドメイン別表 |
| 値照合付き | Figma/スクショ等のデザイン再現 | token差分表つき |

### Authoring PlanのFP

Authoring Planは、これから書く構造・値・命名・responsive方針を事前に宣言するための成果物。FP0〜FP8で整理する。

| FP | 見ること |
|---|---|
| FP0 | 入力整理。対象、粒度、framework、既存制約、不明点 |
| FP1 | 構造・セマンティクス選定 |
| FP2 | reuse・コンポーネント境界 |
| FP3 | 命名設計 |
| FP4 | 状態・バリエーション設計 |
| FP5 | 値・token照合 |
| FP6 | レスポンシブ方針 |
| FP7 | CSS境界の分解 |
| FP8 | Primitive既定値の確認 |

重要なのは、形式的に全部埋めることではなく、実装に影響する項目だけを列挙すること。

### `⏸`にする条件

次のようなものはAIが勝手に判断せず、ユーザー確認に回す。

- px/rem/emをtokenへ丸める
- 任意色・ブランド色・密度・忠実度を決める
- tokenを新規追加する
- 固定Gridをレスポンシブ化する
- `isContainer`の位置を変える
- 公開class名、CMS、外部JS、E2Eセレクタに依存する構造や命名を変える

### 提出前セルフチェック

実装後は、Authoring Planと実装を1行ずつ照合する。

- 計画どおり実装できたか
- 計画変更があるなら理由があるか
- 実装漏れがないか
- 未確認の`⏸`を勝手に実装していないか

そのうえで、Primitive選定、token、Property Class化、レスポンシブ、命名、状態、既定値重複などを確認する。

---

## `lism-css-refactor`の処理の流れ

`lism-css-refactor`の基本フローは以下。

```txt
スコープ確定
  → 対象コード・周辺・利用箇所を読む
  → Inventory表を作る
  → Pass1〜9で判定する
  → draft diffを作る
  → Self-reviewゲートを通す
  → 修正案を提示する
  → ユーザー許可後に適用する
  → 検証・報告する
```

### Inventory表

最初に、対象範囲内の実体を1行ずつ棚卸しする。

- class / className
- Lism Props
- CSS宣言
- style属性
- `@media` / `@container`
- 重複したクラス束やProps束

これはチェックリストではなく、**コード上に存在する実体を落とさず列挙する表**。棚卸し漏れがあると後続Passで検出できないため、ここが重要になる。

### Pass1〜10

| Pass | 内容 |
|---|---|
| Pass1 | 棚卸し。実体を全列挙する |
| Pass2 | 構造。div手組みをPrimitive/Traitへ寄せられるか |
| Pass3 | 重複。3箇所以上ならコンポーネント抽出を検討 |
| Pass4 | Property Class抽出。CSS束をProps/Property Classへ移せるか |
| Pass5 | token監査。px直書き・存在しない値を検出 |
| Pass6 | trait/状態/バリエーション。`is--`誤用を検出 |
| Pass7 | 命名。kebab-caseや何でも`c--`を検出 |
| Pass8 | レスポンシブ。base抜け、固定Grid、isContainer不足を検出 |
| Pass9 | 既定値重複。Primitive既定と同じ指定を検出 |
| Pass10 | Self-reviewゲート。自分の修正案が退行を作っていないか確認 |

順序に意味がある。先に構造を決めないと、何に値を載せるか、どこに状態を持たせるか、何を命名するかが定まらないため、個別監査が無駄になりやすい。

### refactorのverdict

refactorでは以下の記号を使う。

| 記号 | 意味 |
|---|---|
| ✅ | 触らない。既にidiomatic、または対象外 |
| 🔧 | 修正対象。修正案あり |
| ⏸ | 要ユーザー判断。px丸め、色推測、挙動変更、外部契約など |
| ⬜ | 意図的に残す。合意済み例外、独自意図が明確 |

### Self-reviewゲート

draft diffを作ったあと、ユーザーへ提示する前に必ずSelf-reviewゲートを通す。

主に以下を確認する。

- 抽出・置換で`className` / `style` / `data-*` / ARIA / event handlerを渡し忘れていないか
- 公開class名、CMS、外部JS、E2Eセレクタを勝手に変えていないか
- `is--active`→`data-*`などで、CSSだけ直してJS/test/HTML生成側を漏らしていないか
- レスポンシブ配列を単一値に潰していないか
- CSSを空にしたついでに`c--`意味クラスまで消していないか
- pxを勝手にtokenへ丸めていないか
- Primitive化・既定値削除でgap/align/幅/見た目が変わっていないか

ここでNGがあれば、提示前に修正案を直す。丸めや挙動変更のようにユーザー判断が必要なものは、`⏸`として提示する。

---

## verdict記号の注意

`lism-css-guide`と`lism-css-refactor`では、同じ記号でも意味が一部違う。

| 記号 | guide（forward系） | refactor系 |
|---|---|---|
| ✅ | 確定 | 触らない |
| ⏸ | 要ユーザー確認 | 要ユーザー判断 |
| ⬜ | 例外、直書き許容 | 意図的に残す |
| 🔁 | 参照して正規値・正規Primitiveへ確定 | なし |
| 🆕 | 新規定義 | なし |
| 🔧 | なし | 修正対象 |

共通しているのは`⏸`が「ユーザー確認なしに進めない」という意味であること。表を出すときは、forward系なのかrefactor系なのかを明示する必要がある。

---

## CLI内部の処理の流れ

### `lism skill add`

```txt
対象skillを決める
  → 導入先ツールを決める
  → GitHubのskills/{name}を一時ディレクトリへ取得
  → 既存配置先とsha256で差分比較
  → 差分があれば上書き確認
  → コピー
  → 一時ディレクトリ削除
```

対象skillは`SKILL_NAMES`で管理される。

```ts
export const SKILL_NAMES = ['lism-css-guide', 'lism-css-refactor'] as const;
```

引数なしの場合は全skill、引数ありの場合はそのskillだけを対象にする。未知の名前はエラーになる。

### `lism skill check`

```txt
全skill × 全ツール配置先を走査
  → SKILL.mdがあるものだけ導入済みとして扱う
  → skillごとにリモートを一度取得
  → 各ローカル配置先とファイル単位で比較
  → 差分サマリを表示
```

差分は以下の4種類。

| 種類 | 意味 |
|---|---|
| unchanged | ローカルとリモートが一致 |
| modified | 両方に存在するが内容が違う |
| added | リモートにのみ存在する |
| localOnly | ローカルにのみ存在する |

### `lism skill update`

`update`は、内部的には引数なし`add --overwrite`相当。登録済みの全skillを強制上書きする。

---

## まとめ

PR459のskillリニューアルは、Lismの知識を増やすだけでなく、AIに**作業順序を守らせる**ための設計変更。

- 新規実装は`lism-css-guide`
  - Authoring Planで、書く前にPrimitive・token・responsive・CSS境界を宣言する
- 既存コード整理は`lism-css-refactor`
  - Inventory表と順序Passで、既存コードを漏れなく棚卸しする
- 一般知識はguideに集約
  - refactorは迷ったときだけguideへrouteする
- CLIは複数skill配布へ一般化
  - `lism skill add`でguide+refactorを一括導入できる
  - ただし`lism-css-refactor`をCLI経由で扱うには、CLI側にもPR459の変更が入っている必要がある

つまり、今回のリニューアルの価値は「Lism CSSのルールを知っている」ではなく、**実装やリファクタのたびに、そのルールを手順として実行させる**ところにある。
