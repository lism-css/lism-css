# PR Draft: Lism スキル群オーバーホール（フェーズ2 = guide 強化）

> ステータス: **下書き / フェーズ2実装完了・検証済み（ブランチ/PR作成のみ手元実行待ち）**
> 作業ブランチ: `feat/lism-skill-overhaul`（`dev` から分岐）
> マージ先（base）: `dev`
> 正典プラン: [`documents/plan-lism-skill-update.md`](./plan-lism-skill-update.md)

このファイルは PR 本文のドラフト兼「今後の実装手順チェックリスト」。実装の進行に合わせて随時更新する。完成したら本文をこのファイルから `gh pr create --body-file` に渡す。

---

## 概要（PR Summary 下書き）

`lism-css-guide` を読ませても初期実装・リファクタの双方でベストプラクティスを取りこぼす問題（「読む ≠ 手順を実行する」）に対し、スキル群を再設計する。本 PR は正典プラン `documents/plan-lism-skill-update.md` の **フェーズ2「guide オーバーホール」** を対象とする（§8 のフェーズ順に従い guide を先行）。

`lism-css-refactor` 新設（フェーズ3）と CLI 複数 skill 配布の一般化（フェーズ4）は本 PR のスコープ外。

関連 issue: #343（公式ベストプラクティス整合）/ #395（アンチパターン追加・構成/命名/軽量化）

---

## スコープ（この PR でやること）

- [x] `skills/lism-css-guide/SKILL.md` を「索引＋判断入口」へ刷新（実装フロー / 目的別ガイド / 参照ルーティング表）。500 行以下を維持（§4-1, §4-2, §4-5, §4-8）
- [x] `description` を coding 寄りへ変更。クラス prefix 逆引きキーワード（`c--* l--* a--* is--* has--* set--* u--* -prop:value`）は温存（§4-9）
- [x] `skills/lism-css-guide/references/authoring-workflow.md` 新設（FP0–FP8 の 7 フィールド詳細）（§4-4a, §4-11）
- [x] `skills/lism-css-guide/references/authoring-output-format.md` 新設（Authoring Plan 出力フォーマット表 / ⏸ 条件 / デザインデータ取り込みフロー）（§4-4a, §4-11）
- [x] `skills/lism-css-guide/examples/authoring-plan.md` 新設（Authoring Plan 記入見本）（§4-11）
- [x] `skills/lism-css-guide/antipatterns.md` を増強（#395c1 の 7 パターン追加）（§4-3）
- [x] `skills/lism-css-guide/primitives/l--*.md` に既定 CSS 概要を追記（既定値重複指定の防止）（§4-6）
- [x] クラス紹介系ファイルのソースリンク整備（特に `utility-class.md`）（§4-7）

## スコープ外（後続 PR）

- `skills/lism-css-refactor/` 新設（フェーズ3 / §5）
- `packages/lism-cli` 複数 skill 配布の一般化（フェーズ4 / 付録 A）
- MCP `get_guide` の `GUIDE_TOPICS` への `references/`・`examples/` 追加（任意。公開したい場合のみ）
- 物理 rename（`lism-coding-guide` / `lism-refactor`）（§7）

---

## 実装手順（チェックリスト）

### 1. SKILL.md 刷新（§4-1 / §4-2 / §4-5 / §4-9）

- [x] frontmatter `description` を coding 寄りに更新（逆引き prefix キーワードは残す）
- [x] 実装フロー（0〜4 の authoring workflow）を追記
- [x] 目的別実装ガイド表（§4-2）を追加（各項目に 1〜3 行要約・よくある NG・詳細 URL）
- [x] 参照ルーティング表（§4-5）を追加
- [x] 既存の「プリフライト・プリミティブ選定/トークン照合/c-- 分解」は消さず preflight として明示
- [x] FP0–FP8 一覧・実行レベル・verdict 2 系統・§4-4b 接続だけ本体に残し、詳細は `references/` へ逃がす
- [x] `wc -l` で 500 行以下を確認

### 2. references/ 新設（§4-4a / §4-11）

- [x] `references/authoring-workflow.md`（FP0–FP8 の 7 フィールド詳細）
- [x] `references/authoring-output-format.md`（出力フォーマット表 / ⏸ 条件 / 取り込みフロー）

### 3. examples/ 新設（§4-11）

- [x] `examples/authoring-plan.md`（前向き宣言の記入見本）

### 4. antipatterns.md 増強（§4-3 / #395c1）

- [x] Reset 済みプロパティの再指定
- [x] `Frame` 未使用のメディア枠手組み
- [x] primitive 既定値の重複指定
- [x] hover を component CSS に書いて負ける
- [x] レスポンシブ配列の冗長指定
- [x] 標準 HTML 属性を `exProps` に入れる
- [x] サイト最外殻を `Wrapper` に使う
- [x] 既存パターンと重複させない（Token typo / px 直書き / 等は再掲しない）

### 5. primitives/l--*.md に既定 CSS 概要（§4-6 / #395c4）

確定済み（SCSS 確認済み・プラン記載）:
- [x] `l--cluster`: `display:flex` / `flex-wrap:wrap` / `align-items:center`、`gap` は既定なし
- [x] `l--frame`: `overflow:hidden`、直下 `img/video/iframe` を `display:block;width:100%;height:100%;object-fit:cover`

SCSS を読んで概要を書く（本リポジトリの `packages/lism-css/src/scss/primitives/layout/_*.scss` で確認済み）:
- [x] `l--center`: `display:grid; place-content:center; place-items:center`
- [x] `l--stack`: `display:flex; flex-direction:column`（gap なし）
- [x] `l--grid`: `display:grid; > * { min-width:0 }`
- [x] `l--columns`: `display:grid; grid-template-columns:repeat(var(--cols,2), minmax(0,1fr))`
- [x] `l--autoColumns`: `display:grid; repeat(auto-fill, minmax(min(var(--cols,20rem),100%),1fr))`
- [x] `l--tileGrid`: `display:grid; grid-template: repeat(rows) / repeat(cols) minmax(0,1fr)`
- [x] `l--switchColumns`: `display:flex; flex-wrap:wrap`（子に flex-grow/flex-basis）
- [x] `l--withSide`: `display:flex; flex-wrap:wrap`（`is--side` 基準で 2 カラム自動切替）
- [x] `l--flow`: `display:flow-root; > * + * { margin-block-start:var(--flow) }`

### 6. ソースリンク整備（§4-7）

- [x] `utility-class.md` は既にソースファイル列あり。追加で `l--box`/`a--decorator` のTSソースリンクを補完
- [x] その他クラス紹介系ファイルのソースリンク欠落を確認・補完

### 7. 検証

- [x] `wc -l skills/lism-css-guide/SKILL.md`（170行、500行以下）
- [x] guide 内リンク切れチェック（新設 `references/`・`examples/` への参照含む）
- [x] `nr build:mcp`
- [x] `nr lint`（0 errors / 既存 warning のみ・今回の変更とは無関係）
- [x] `nr typecheck`（0 errors）
- [x] `nr --filter @lism-css/mcp test`（`get_overview` が SKILL.md を読むため、刷新後も通ることを確認）

---

## 変更済みファイル（フェーズ2）

- `skills/lism-css-guide/SKILL.md`
- `skills/lism-css-guide/references/authoring-workflow.md`
- `skills/lism-css-guide/references/authoring-output-format.md`
- `skills/lism-css-guide/examples/authoring-plan.md`
- `skills/lism-css-guide/antipatterns.md`
- `skills/lism-css-guide/responsive.md`
- `skills/lism-css-guide/css-rules.md`
- `skills/lism-css-guide/primitives/l--*.md`（layout primitivesの既定CSS概要）
- `skills/lism-css-guide/primitives/l--box.md` / `a--decorator.md`（TSソースリンク補完）

---

## レビュー時の注意

- 実装は **プラン（`documents/plan-lism-skill-update.md`）を正典**とする。issue 本文はスナップショットのため鵜呑みにしない。
- guide 先行・refactor 設計同時の方針（§8）。refactor スキル本体は本 PR では作らない。
- 既存の有用な記述（preflight・取り込みフロー等）は削除せず強化する方針。

---

## ブランチ / PR 作成コマンド（手元で実行）

> 注: 本作業環境では `.git` が読み取り専用のため、エージェントからブランチ作成・push・PR 作成を実行できない。以下を手元で実行すること。

```bash
# dev から作業ブランチを作成（CLAUDE.md: 新ブランチは必ず dev から）
git switch dev
git switch -c feat/lism-skill-overhaul

# 進捗をコミット（plan更新 + PR下書き + guideオーバーホール）
git add documents/plan-lism-skill-update.md \
  documents/pr-draft-lism-skill-overhaul.md \
  skills/lism-css-guide/SKILL.md \
  skills/lism-css-guide/references \
  skills/lism-css-guide/examples \
  skills/lism-css-guide/antipatterns.md \
  skills/lism-css-guide/responsive.md \
  skills/lism-css-guide/css-rules.md \
  skills/lism-css-guide/primitives
git commit -m "docs: lism-css-guideのauthoring workflowを強化"

# push（origin = lism-css/lism-css）
git push -u origin feat/lism-skill-overhaul

# ドラフト PR を作成（base=dev）。本文はこの下書きを利用
gh pr create --draft --base dev \
  --title "feat: lism-css-guide スキルオーバーホール（フェーズ2）" \
  --body-file documents/pr-draft-lism-skill-overhaul.md

# 作成後の描画確認
gh pr view --web
```
