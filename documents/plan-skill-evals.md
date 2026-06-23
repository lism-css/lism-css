# Lismスキル 評価用サンプル整備＋稼働テスト 計画

`lism-css-refactor`（新設）・`lism-css-guide`（強化）といったagent向けskillが、「**読む ≠ 手順を実行する**」の罠を実際に克服できているかを、**第三者エージェントで経験的に検証**するための土台を用意する計画。具体的には (1) 評価用サンプルコード群、(2) skill稼働テスト（`empirical-prompt-tuning`）の運用を整備する。

> 作成: 2026-06-23 / ステータス: 方針確定・着手は後回し（PR #459 のスコープ外）
> 関連: [`documents/plan-lism-skill-update.md`](./plan-lism-skill-update.md)（skill群再設計の正典）、PR #459（guide強化＋refactor新設＋CLI複数skill配布）
> このファイルだけ読めば着手できることを目標にする。

## 概要 / ゴール

- agent向けskillは「読ませても従わず取りこぼす」ことがあり、**書いた本人にはskillが効くか判定できない**（設計意図を知っているバイアス）。
- そこで、**設計意図を知らない素のエージェント**に対象skillだけ渡して、わざとアンチパターンを混ぜたサンプルコードを処理させ、取りこぼし・手順スキップを計測する。落ちた箇所をskill文言にフィードバックして反復改善する。
- ゴール: 上記サイクルをいつでも回せるよう、**評価用サンプル群**と**回し方の手順（README）**をリポジトリに常設する。

## 背景・前提

- PR #459 で skill群再設計のフェーズ3（`lism-css-refactor` 新設）まで完了。残りは**フェーズ4（CLI複数skill配布の一般化）**で、本計画とは独立。
- 大元の課題は [`plan-lism-skill-update.md`](./plan-lism-skill-update.md) §1: 受け身の参照では forcing function が働かず、初期実装でもリファクタでもベストプラクティスを取りこぼす。
- この検証手法は `empirical-prompt-tuning` skill が担う用途そのもの（agent向けテキスト指示を、バイアスを排した実行者に動かしてもらい、両面評価で反復改善する）。
- 今回のセッションではユーザー判断で**後回し**。本計画は着手時の出発点。

## 配置方針（確定）

評価用サンプルは **`skills/` の中（skillディレクトリ内側）に置かない**。理由は配信ロジックにある。

- `lism skill add` の配信は giget の `downloadTemplate(github:{repo}/skills/{skill名}#{ref})` で、その skill ディレクトリを**サブディレクトリ含め丸ごとDL**する（[`packages/lism-cli/src/commands/skill/skillSource.ts`](../packages/lism-cli/src/commands/skill/skillSource.ts) L14）。
- DL後は `copyDirRecursive(srcDir, destDir)` で**中身を全ファイル**ユーザーの `.{tool}/skills/{skill名}/` へコピーする（[`packages/lism-cli/src/commands/skill/add.ts`](../packages/lism-cli/src/commands/skill/add.ts) L108）。**allowlist・除外フィルタは無い**。
- したがって `skills/lism-css-refactor/samples/` のように skill の内側へ置くと、`lism skill add` した**全ユーザーに配布される**。さらに `compareSkillDirs` がファイル単位の差分管理に含めるため、overwrite/update 判定にも巻き込まれて邪魔になる。

採用する置き場所:

- **第一候補: リポジトリ直下に専用ディレクトリ `skill-evals/`**（`samples/` でも可）。
  - 配信ゼロリスク（取得は skill 名固定。npm公開も `packages/*` のみ＝ルート直下ディレクトリは無関係）。
  - turbo（`nr build` / `nr typecheck`）の対象は `packages/`・`apps/` の workspace のみなので、ここに置けばビルド・型チェックの対象外。
- **却下: `skills/` 直下に兄弟ディレクトリ（例 `skills/_samples/`）**。
  - 取得は skill 名固定（フェーズ4 も計画上は明示レジストリ `['lism-css-guide','lism-css-refactor']`）なので、レジストリ外の兄弟は技術的には配信されない。
  - だが `skills/` は「1ディレクトリ＝1配信skill」の意味の場所。非skillが混ざると将来の誤解・誤登録の温床になるため避ける。

## サンプルの形式（暫定方針・着手時に最終決定）

わざと壊したコードは、**実ファイル（`.tsx`/`.astro`/`.css`）より `.md` にフェンス埋め込みする方を推奨**。

- 理由: `.md` 埋め込みなら lint/型チェックに一切引っかからず、`expected`（出るべき所見・⏸）を同じファイルに併記できる。
- 注意（重要）: **lint-staged（pre-commit）は拡張子glob でリポジトリ全体に走る**。今回の commit でも `skills/` 配下の `.md` に prettier がかかった。つまり、
  - `.md` 埋め込み → prettier がかかるだけで実害なし。
  - 実ファイルの壊れた `.tsx`/`.astro` → eslint に引っかかる可能性大。実ファイルにするなら `eslint`/`prettier` の ignore 追加が必要。
- 暫定: **`.md` 埋め込みで開始**。エージェントには当該 `.md` を渡せばよい。

## 構成案

```
skill-evals/
  README.md              # 回し方（素のエージェントにskillだけ渡して取りこぼし計測）
  refactor/              # lism-css-refactor 用シナリオ
    01-div-soup/         # before: div手組み・固定Grid・object-fit重複 / expected.md
    02-token-violations/ # before: px直書き・存在しない値（secondary等）/ expected.md
    03-is-misuse/        # before: is--active / is--solid 流用 / expected.md
    ...
  guide/                 # lism-css-guide 用シナリオ（前向き）
    01-design-brief/     # 要件/デザイン → 期待される Authoring Plan / expected.md
```

各シナリオの中身:

- **before**: アンチパターンを混ぜた対象コード（`.md` フェンス埋め込み）。
- **expected.md**: そのシナリオで**出るべき所見・⏸・取りこぼしの正解**。採点の基準にする。

## テスト手法（empirical-prompt-tuning 運用）

1. **実行者の用意**: 設計意図を知らない素のエージェント（別セッション、またはサブエージェント＝Agent tool でskillだけ読ませる）。
2. **投入**: 対象skillだけ渡し、「このコードをリファクタして」（refactor）/「この要件で実装方針を出して」（guide）を投げる。**設計の前提知識は与えない**。
3. **計測（両面）**:
   - 実行者の自己申告: どこで迷ったか・何が曖昧だったか。
   - 指示側メトリクス: Inventory表が出たか / ⏸で正しく止まったか / 取りこぼし数 / スキップされた手順 を `expected.md` と突き合わせる。
4. **フィードバック**: 落ちた箇所の原因を skill 文言の曖昧さに求め、`lism-css-refactor` / `lism-css-guide` の該当箇所を修正する。
5. **反復**: 改善が頭打ちになるまで 2〜4 を繰り返す。シナリオも増やす。

## 実装プラン（後で着手する手順）

1. **置き場所と形式を確定**（未決事項を参照。暫定 `skill-evals/` ＋ `.md` 埋め込み）。
2. **`skill-evals/` 雛形を作成**: `README.md`（回し方）＋ refactor シナリオ 3 本程度 ＋ guide シナリオ 1 本 ＋ 各 `expected.md`。
3. **`empirical-prompt-tuning` skill を起動**し、素エージェントで 1 本回す。
4. **取りこぼし箇所を skill へフィードバック修正**（refactor/guide の文言）。
5. **頭打ちまで反復**し、シナリオを追加していく。

## 設計判断の根拠

- **skills/ の内側に置かない**: 配信が skill ディレクトリ丸ごと（giget DL ＋ `copyDirRecursive`、フィルタ無し）なので、全ユーザーに漏れ、差分管理にも巻き込まれる。コードで確認済み。
- **skills/ 直下の兄弟も避ける**: 技術的には配信されないが、`skills/`＝配信物という意味が濁り、将来の誤登録リスクがある。
- **ルート直下 `skill-evals/` を採用**: 配信ゼロ・turbo ビルド対象外・npm 公開無関係。
- **`.md` 埋め込みを推奨**: lint/型を汚さない・`expected` 併記が容易。実ファイルは lint-staged の eslint に引っかかるため、採るなら ignore 設定が前提。

## 未決事項・要確認・事前準備

- **置き場所の最終決定**: `skill-evals/`（第一候補）/ `samples/` / `documents/` 配下 のどれにするか。
- **サンプル形式の最終決定**: `.md` 埋め込み（暫定）/ 実ファイル＋ignore。
- **「素のエージェント」の固定運用**: 別セッション運用にするか、サブエージェント（Agent tool）でskillだけ読ませる手順を README に固定するか。再現性のある回し方を決める。
- **最初のシナリオ選定**: どのアンチパターンを優先するか（div-soup / token / is--誤用 / 既定値重複 / レスポンシブ抜け など）。
- **対象範囲**: refactor 優先か、guide（前向き Authoring Plan）も同時に評価するか。
- **公開可否**: `skill-evals/` を公開リポジトリに含めてよいか（含めて問題ない見込みだが要確認。社内限定にするなら `.gitignore` 等を検討）。
- **lint-staged の確認**: 着手時に flat config / lint-staged の対象 glob を再確認し、選んだ形式が pre-commit を汚さないか確かめる。

## 完了条件

- `skill-evals/` に最低数本のシナリオ（before ＋ `expected.md`）が揃っている。
- `README.md` に empirical-prompt-tuning の 1 サイクルを回す手順が書かれている。
- `lism-css-refactor` / `lism-css-guide` の文言へ、検証結果のフィードバックが最低 1 回反映されている。
