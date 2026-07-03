# Lismスキル群 解説

Lism CSSが配布するAIエージェント向けskillについて、何ができるのか、どう導入するのか、内部でどういう処理の流れになっているのかを整理する運営者向けメモ。

PR459で、それまで「読むだけの資料」だった`lism-css-guide`を「AIに手順を踏ませる実行ガイド」へ作り変え、リファクタ専用の`lism-css-refactor`を新設し、CLIを複数skill配布へ一般化した。以下は現行仕様に基づく整理。


## 配布しているskill

配布対象は以下の2つ。実体はリポジトリの`skills/{name}`配下、配信元は`packages/lism-cli/src/constants.ts`の`SKILL_NAMES`で管理する。

| skill | 役割 | 起動する場面 |
|---|---|---|
| `lism-css-guide` | 新規実装、UI作成、ページ作成、コンポーネント作成の前向き作業 | 要件・デザインからコードを書くとき |
| `lism-css-refactor` | 既存コードの監査・整理・リファクタの後ろ向き作業 | ユーザーがリファクタ・監査・整理を明示したとき |

`lism-css-refactor`は、token値やPrimitive選定などの一般知識を自分で重複保持しない。判断に迷ったら同階層の`lism-css-guide`へrouteする設計で、知識の正典は常にguide側に置く。`lism-css-refactor`のSKILL.md冒頭にも「`lism-css-guide`が同じ階層に入っていることを前提にする」と明記されている。

---

## どう導入する？

### `lism-cli skill`コマンド

配布元パッケージは`lism-cli`（binは`lism-cli`のみ。`lism`というbinは存在しない）。サブコマンドは`add` / `check` / `update`の3つ。

```bash
# 対話モード（プロジェクト直下の .claude / .agents / .cursor 等のマーカーから使用中ツールを自動検出し、選択式で導入先を決める）
pnpm dlx lism-cli skill add

# skill名を指定して個別に導入（未指定なら全skill = lism-css-guide + lism-css-refactor）
pnpm dlx lism-cli skill add lism-css-guide
pnpm dlx lism-cli skill add lism-css-refactor

# 導入先ツールを明示指定
pnpm dlx lism-cli skill add --claude --cursor
pnpm dlx lism-cli skill add --all

# 既存配置との差分確認（変更/追加/ローカル限定ファイルのサマリ表示）
pnpm dlx lism-cli skill check
pnpm dlx lism-cli skill check --verbose

# 配置済みskillをまとめて最新版へ上書き
pnpm dlx lism-cli skill update --claude
```

対応するツールと配置先（`packages/lism-cli/src/commands/skill/paths.ts`の`SKILL_PATHS`）：

| ツールフラグ | 配置先 | 自動検出マーカー |
|---|---|---|
| `--claude` | `.claude/skills/<skill>` | `.claude` |
| `--codex` | `.agents/skills/<skill>` | `.agents`, `.codex` |
| `--cursor` | `.cursor/skills/<skill>` | `.cursor` |
| `--windsurf` | `.windsurf/skills/<skill>` | `.windsurf` |
| `--cline` | `.cline/skills/<skill>` | `.cline` |
| `--copilot` | `.github/skills/<skill>` | `.github/copilot-instructions.md`, `.github/copilot` |
| `--gemini` | `.gemini/skills/<skill>` | `.gemini` |
| `--junie` | `.junie/skills/<skill>` | `.junie` |

各サブコマンドの引数・オプション：

| サブコマンド | 引数 | オプション |
|---|---|---|
| `skill add [skill]` | skill名（省略時は全skill、未知の名前はエラー） | `-o, --overwrite`、`--ref <ref>`、ツールフラグ（`--all`含む） |
| `skill check` | なし（常に全skill×全ツールが対象） | `--ref <ref>`、`-v, --verbose` |
| `skill update` | なし（常に全skillが対象） | `--ref <ref>`、ツールフラグ（`--all`含む） |

ツールフラグを1つも指定しなかった場合、`skill add`はプロジェクト直下のマーカーから使用中ツールを自動検出し、それを初期選択状態にした対話式チェックボックスで導入先を確定する（`skill check`はツールフラグを持たず、常に「配置済み＝各`<配置先>/SKILL.md`が存在するもの」全件を対象にする）。

### 開発版・PR版を試す

`--ref <ref>`で、skillファイルの取得元ブランチ・タグ・コミットを変えられる。未指定時の既定値は`constants.ts`の`DEFAULT_SKILL_REF`（`DEFAULT_UI_REF`/`DEFAULT_TEMPLATES_REF`と同様、dev/mainマージ運用で手動切替される値。詳細は[cli-guide.md](./cli-guide.md)を参照）。

```bash
lism-cli skill add --ref dev
lism-cli skill add --ref feat/some-branch
lism-cli skill check --ref dev
```

`--ref`が切り替えるのは**取得するskillファイルの場所**だけで、CLIが認識するskill一覧（`SKILL_NAMES`）は実行しているCLI本体のバージョンに依存する。新しいskillをCLI経由で扱うには、CLI側にも対応するリリースが必要。

### skills.sh経由の配布

`lism-cli`を使わずskills.sh経由で導入する方法もある（トップレベル`README.md`の案内）。

```bash
npx skills add lism-css/lism-css
```

配信元は`lism-cli skill add`と同じ`skills/lism-css-guide/`・`skills/lism-css-refactor/`。詳細は[Skillsドキュメント](https://lism-css.com/en/docs/skills/)を参照。

---

## `lism-css-guide`の処理の流れ

`skills/lism-css-guide/SKILL.md`に定義された実装フロー（厳守）:

```txt
0. 実行レベル判定（不要/軽量/通常/値照合付き。「不要」なら以降省略可）
1. 初期確認（対象に関係する詳細ファイルを先に開く）
2. 目的別実装ガイドでPrimitive/コンポーネント候補を選定
3. 実装前チェック（C0–C8）→ 実装プラン作成（未確認判断には🔁を付ける）
4. 資料確認トリガーに従い、操作の直前に資料を読んで🔁を✅/⏸へ解消
5. ⏸が残る項目はユーザー確認
6. 実装
7. 提出前セルフチェックで実装プランと実装を照合
```

値照合付きレベル（Figma/スクショ等のデザイン再現）では、実装プランをチャット内の回答ではなく`.lism/plan.md`として保存する。

### 判定記号

`lism-css-guide`の実装プランで使う記号は次の3つのみ（`⬜`や`🆕`は使わない）。

| 記号 | 意味 |
|---|---|
| ✅ | 確定。新規定義や合意済み例外は`✅新規`・`✅例外`・`✅前提`のように注記する |
| 🔁 | 資料確認トリガー該当。対応資料を読んで✅/⏸へ解消するまでコードへ反映しない |
| ⏸ | 要ユーザー確認。確認まで実装しない |

`✅例外`にできるのは`antipatterns.md`の「直書きしてよい例外」に該当する場合のみで、根拠の引用が必須。自律実行などでユーザー確認が取れない場合は、原則準拠側の既定動作を選び`✅前提`として前提を明示した上で進める運用がある。

### 実装前チェック項目（C0–C8）とチェックレベル

C0〜C8（Check）で構造・命名・状態・トークン・レスポンシブ・CSS/Props境界・Primitive既定値を確認する。詳細と出力形式は`references/authoring.md`。事前チェックの重さは変更規模に応じて「不要/軽量/通常/値照合付き」の4段階に分ける。

### 提出前セルフチェック

実装プランと実装を1行ずつ照合し、「計画変更（意図的）/実装漏れ/要確認」に分類したうえで、プロセス照合・ルール照合・プラン再審査・個別確認を行う。サブエージェント／タスク委任機能が使える環境では、この照合を実装した本人ではなく**読み取り専用の評価サブエージェント**に委任し、結果を`.lism/review.md`へ保存、違反ゼロが出るまで修正→再評価を繰り返す。

---

## `lism-css-refactor`の処理の流れ

`skills/lism-css-refactor/SKILL.md`に定義されたワークフロー（厳守）:

```txt
0. 範囲を決める（対象ファイル/コンポーネント/選択範囲を明示）
1. 読む（対象コード・周辺・利用箇所）
2. Pass1実行 → 洗い出し表を .lism/plan.md として保存
3. Pass2–9実行（洗い出し表の各行に判定を付与）
4. 修正案の差分を作る（この時点ではユーザーに未提示）
5. Pass10実行（提示前の見直し・再審査。評価サブエージェントへ委任可）
6. 修正案を提示する（⏸はここでユーザー確認）
7. 適用する（ユーザー許可後のみ）
8. 検証して報告する
```

前提として、このskillは`lism-css-guide`が同じ階層に導入済みであることを想定する。無い場合はユーザーに`lism-cli skill add`での追加を案内し、guideなしで推測だけのリファクタ判断を進めない。

### Pass定義

| Pass | 確認すること |
|---|---|
| Pass1 | 対象コードの洗い出し |
| Pass2 | 構造（div手組みをPrimitive/Traitへ置き換えられるか） |
| Pass3 | 重複（3箇所以上あるものをコンポーネント化できるか） |
| Pass4 | Property Class化（CSSに書いた装飾をProps/classへ移せるか） |
| Pass5 | token（px直書き・存在しない値がないか） |
| Pass6 | 状態・バリエーション（`is--`の誤用がないか） |
| Pass7 | 命名（class名がLismの命名規則に合うか） |
| Pass8 | レスポンシブ（base抜け・固定Grid・container指定漏れ） |
| Pass9 | 既定値重複（Primitiveが元々持つ指定を重ねていないか） |
| Pass10 | 提示前の見直し（自分の修正案が元の見た目・動きを壊していないか） |

詳しい判定基準は`references/checklist.md`に集約されている。

### 判定記号

| 記号 | 意味 |
|---|---|
| ✅ | 触らない（既に問題ない／対象外） |
| 🔧 | 修正する（修正案を出す） |
| ⏸ | 要ユーザー確認（px丸め・色推測・挙動変更・外部依存など） |
| ⬜ | 意図的に残す（合意済み例外・独自意図が明確） |

Pass10の見直し（評価サブエージェントへの委任を含む）の結果は`.lism/review.md`へ保存し、違反ゼロが出るまで修正→再評価を繰り返してから提示する。

---

## 判定記号の注意（skill間の違い）

同じ記号でも、`lism-css-guide`（forward系）と`lism-css-refactor`（refactor系）では意味・使用可能な記号セットが異なる。

| 記号 | guide（forward系） | refactor系 |
|---|---|---|
| ✅ | 確定（`✅新規`・`✅例外`・`✅前提`の注記あり） | 触らない |
| 🔁 | 資料確認トリガー未通過 | （使わない） |
| ⏸ | 要ユーザー確認 | 要ユーザー確認 |
| 🔧 | （使わない） | 修正対象 |
| ⬜ | （使わない） | 意図的に残す |

共通しているのは`⏸`が「ユーザー確認なしに進めない」という意味であること。両skillとも、リスト外の記号や注記の組み合わせを自作することを明示的に禁止しており、該当行は未確定/未通過として扱う。

---

## CLI内部の処理の流れ

### `lism-cli skill add`

対象ファイル: `packages/lism-cli/src/commands/skill/add.ts`

```txt
positional引数からskill対象を解決（未指定なら SKILL_NAMES 全件）
  → ツールフラグから導入先を解決（未指定ならマーカー自動検出 + 対話選択）
  → skillごとに giget で github:lism-css/lism-css/skills/{name}#{ref} を一時ディレクトリへ取得（1回のみ）
  → 選択された各ツール配置先ごとに、既存ディレクトリとsha256で差分比較
  → 差分が無ければスキップ、あれば（--overwrite未指定時は）差分サマリ表示 → 上書き確認
  → コピー
  → 一時ディレクトリ削除
```

差分は`packages/lism-cli/src/commands/skill/skillSource.ts`の`compareSkillDirs`がファイル単位のsha256ハッシュで判定し、4種類に分類する。

| 種類 | 意味 |
|---|---|
| unchanged | ローカルとリモートが一致 |
| modified | 両方に存在するが内容が違う |
| added | リモートにのみ存在する |
| localOnly | ローカルにのみ存在する（旧ファイルまたはユーザー独自ファイル） |

### `lism-cli skill check`

対象ファイル: `packages/lism-cli/src/commands/skill/check.ts`

```txt
SKILL_NAMES × ALL_SKILL_TOOLS の全組から、配置先に SKILL.md があるものだけを「配置済み」として収集
  → skillごとにリモートを1度だけ取得
  → 配置済みの各ローカルディレクトリとファイル単位で比較
  → 差分サマリを表示（--verbose でファイル単位の詳細も表示）
```

配置済みが1件も無い場合は、その旨を案内して終了する。

### `lism-cli skill update`

`packages/lism-cli/src/commands/skill/update.ts`は、内部的に`skillAddCommand(undefined, { ...options, overwrite: true })`を呼ぶだけの薄いラッパー。つまり「skill引数なし・`--overwrite`強制」の`add`と同義で、登録済みの全skillを対象ツールへ強制上書きする。

---

## まとめ

- 配布skillは`lism-css-guide`（新規実装）と`lism-css-refactor`（既存コード整理）の2つ。知識の正典はguideに集約し、refactorはPass手順で棚卸しに専念する。
- 導入経路は`lism-cli skill add/check/update`（bin: `lism-cli`）と、skills.sh経由の`npx skills add lism-css/lism-css`の2系統。どちらも実体は`skills/{name}`が配信元。
- どちらのskillも、実装/リファクタの各ステップに`✅`/`🔁`/`⏸`/`🔧`/`⬜`のいずれかの判定記号を付けて進行を管理し、ユーザー確認が必要な項目（⏸）を明示する。値照合や洗い出し表など重い成果物は`.lism/plan.md`・`.lism/review.md`として保存し、サブエージェントへの検証委任も定義されている。
- CLI側は`--ref`で取得元ブランチを切り替えられるが、CLIが認識するskill一覧自体は実行しているCLI本体のバージョンに依存する点に注意する。
