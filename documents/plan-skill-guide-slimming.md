# Lism guide スリム化プラン（Usage の docs リンク化）

`lism-css-guide` の個別クラス解説が肥大しているのを、**判断材料は skill に残しつつ、行数を食うだけの `## Usage` を docs `.md` URL に逃がして**圧縮する作業計画。どこまで削るか（ゼロ／最小例／フル）は agent の実挙動で変わるため、`plan-skill-evals.md` のハーネスで比較検証してから確定する。このファイルだけ読めば着手できることを目標にする。

> 作成: 2026-06-25 / ステータス: 方針確定・検証待ち（着手は #460 の検証後）
> 関連 issue: #460（軽量化方針の検証）/ 置き換え元 #343（close 済み・本方針へ再スコープ）
> 関連 plan: [`plan-lism-skill-update.md`](./plan-lism-skill-update.md) §4-8（軽量化ハイブリッド方針の出どころ）/ [`plan-skill-evals.md`](./plan-skill-evals.md)（検証を回すハーネス）
> ⚠️ issue 本文より本 plan を正典とする。着手時は現在の skill / docs / MCP の実態を一次情報として確認する。


## 1. ゴール / 背景

- **問題**: PR #459 の guide 強化で個別クラス解説が純増した（例: `l--frame.md` は 100 行）。一方で軽量化（#343）には 459 で一切手を付けていない。
- **方針**: #343 当初の「個別解説を全部 docs URL に逃がして約 70% 圧縮」ではなく、`plan-lism-skill-update.md` §4-8 の**保守的ハイブリッド**に沿う。判断材料は skill に残し、行数を食うだけの重複（Usage）だけを docs `.md` URL に逃がす。
- **ゴール**: 個別クラス解説を「**判断材料 ＋ 詳細は docs URL**」の形に圧縮する。削り幅（Usage をゼロにするか最小例を残すか）は §4 の比較検証で確定する。


## 2. 何が skill を重くしているか

`l--frame.md`（全 100 行）のセクション内訳:

| セクション | 行数 | 扱い |
|---|---|---|
| 概要 + 基本情報 | 〜11 | 残す |
| `## 既定の挙動`（足す/足さない判断） | 6 | **残す**（judgment・refactor の route 先） |
| `## 専用Props`（使い分け） | 6 | 残す |
| `## Usage`（応用例の塊） | **72（全体の 72%）** | **docs URL へ逃がす** |
| `## 関連プリミティブ` | 5 | 残す |

- Usage が容量の大半。しかも docs `.mdx` と**見出し単位で 1:1 重複**しており、ビルド済み `.md`（例: `https://lism-css.com/docs/primitives/l--frame.md`）が受け皿として既に存在する。
- 一方 `## 既定の挙動` のような判断文は **docs 側に無い**（docs の `## CSS` は生 SCSS 止まり）。judgment を docs に逃がすと「URL を踏まないと作法が分からない」状態になり §4-8 に反する → **judgment は skill に残す**。


## 3. 畳んだ後のファイル骨格（before → after）

`l--frame.md` を例にした after イメージ（100 行 → 約 30 行）:

```markdown
# l--frame / `<Frame>`

直下のメディア要素（img, video, iframe）を自身のサイズにフィットさせるクラス。アスペクト比固定のメディア枠に使う。

## 基本情報
- クラス名: `l--frame` / コンポーネント: `<Frame>`
- SCSS ソース: https://.../_frame.scss
- 公式ドキュメント・使用例: https://lism-css.com/docs/primitives/l--frame.md   ← Usage はここへ

## 既定の挙動
- `overflow:hidden` を既定で持つ。通常 `ov="hidden"` は足さない。
- 直下メディアは `display:block;width:100%;height:100%;object-fit:cover` でフィット済み。
- 直下メディアへ `w`/`h`/`object-fit:cover` を重ねない。意図的に変える時だけ追加。

## 専用Props
| Prop | 説明 |
|---|---|
| `ar` | アスペクト比（`16/9` 等）。汎用 CSS Prop |

## 関連プリミティブ
- is--layer / l--center / a--icon
```

残すもの／逃がすものの一般則:

- **残す（判断材料・URL を踏まなくても効く）**: 概要 1〜3 行 / 基本情報（クラス名・コンポーネント・SCSS ソース・docs URL）/ `## 既定の挙動` / `## 専用Props` / `## 関連プリミティブ`
- **docs URL へ逃がす**: `## Usage` の応用例ブロック群（figure / video / iframe / Layer / レスポンシブ など）


## 4. 削り幅の 3 版と出し分け基準（要検証）

Usage をどこまで削るかは agent が実際に docs URL を踏むか次第で、机上で断定できない。次の 3 版を比較する。

| 版 | 内容 | 狙い | 懸念 | 実物 |
|---|---|---|---|---|
| **ゼロ版** | Usage 全削除、docs URL リンクのみ | 最軽量 | agent が URL を踏まず自前知識で書く → 非 Lism 流に戻る | `test/460-skill-slimming` ブランチ（検証中） |
| **最小例版** | 最も基本の 1 例だけ残し応用は URL | 判断文 ＋ 最小例で Lism 流をアンカー（+5 行程度） | フルよりは弱い | 未作成 |
| **フル版** | Usage を skill 内に全保持 | 最確実 | 最重量 | PR #459 時点（分岐元） |

### 出し分けの仮説（検証で覆る可能性あり）

「正しい出力が `## 既定の挙動` の文章だけから導けるか」で分ける。

- **導ける（単純な primitive: `l--cluster` / `l--stack` 等）** → **ゼロ版**。fetch 不要で間違えようがない。
- **導けない（Lism 固有の非自明な書き方: `l--frame` の img 直下/Layer、`l--withSide`、`l--autoColumns` 等）** → **最小例版**。例自体が判断材料。

根拠: 例があると agent は満足して URL を踏まない（fetch 率は下がる）。逆にゼロだと「踏みに行く」より「自前知識で埋める」確率が高く、汎用 CSS/React の一般論（＝ Lism が `## 既定の挙動` で禁じた既定値の二重指定など）に戻りやすい。例の役割は「fetch 節約」ではなく「Lism 流をその場に固定するアンカー」。


## 5. 検証方法（`plan-skill-evals.md` のハーネスを使う）

- 「どの版にするか」は `plan-skill-evals.md` の skill-evals ハーネス ＋ `empirical-prompt-tuning` で決める。#460 はその検証 issue。
- やり方: 設計意図を知らない素のエージェントに、各版の guide だけ渡して同一タスクを処理させ、以下を計測する。
  - agent が docs `.md` URL / MCP `get_component` を実際に踏む率
  - 出力の Lism 準拠度（既定値の二重指定など antipattern を踏まないか）
  - 出力品質・トークン消費
- 対象に**非自明 primitive**（`l--frame` / `l--withSide` / `l--autoColumns`）と**単純 primitive**（`l--cluster` / `l--stack`）の両方を含め、§4 の出し分け仮説を検証する。
- 注意: `lism skill add` の単独配布では MCP（`get_component` 等）が無い環境もある。MCP がある環境は取得が確実だが、**ゼロ版の受け皿として MCP を前提にはできない**ため、素の docs `.md` URL を踏むかどうかが律速になる。検証時は MCP 有り／無しの両環境を意識する。
- 注意: docs `.md` URL の取得が実質できない環境（オフライン、WebFetch 不許可・許可プロンプトで agent が取得を諦めるケース）も検証環境に含める。この環境では受け皿が存在しないのと同じになり、ゼロ版の弱点が最も出やすい。


## 6. スコープ / 対象ファイル

- **対象**: `skills/lism-css-guide/` 配下の個別クラス解説（`primitives/*.md`、必要に応じて `trait-class/*.md` / `property-class/*.md`）の `## Usage`。
- **非対象**: judgment（`## 既定の挙動` 等）・`antipatterns.md`・`SKILL.md` 索引部・`references/` / `examples/`（これらは skill 維持）。
- **前提**: 逃がし先の docs `.md` URL が実在することをファイルごとに確認（§4-8「逃がす前に受け皿を確認」）。受け皿が無いクラスは skill に要約を残すか、先に docs ページを用意する。


## 7. 実装プラン（着手手順）

1. **検証先行**: `plan-skill-evals.md` のハーネスで §4 の 3 版を比較し、出し分け方針（ゼロ / 最小例 / 複雑度で出し分け）を確定する（= #460）。
2. **受け皿チェック**: 対象クラスごとに docs `.md` URL の実在を確認（無いものは除外 or 先に docs 作成）。
3. **1 ファイルで型を作る**: 確定方針で `l--frame.md` を §3 の骨格に圧縮し、agent の挙動が劣化しないか確認。
4. **一括展開**: 残りの個別クラス解説へ横展開。
5. **回帰確認**: MCP `get_guide` 等が壊れないか、guide 内のローカルリンク切れが無いかを確認。


## 8. 設計判断の根拠

- **judgment は逃がさない**: `## 既定の挙動` は docs に無い skill 固有の判断材料で、refactor の route 先でもある（§4-8）。逃がすと URL 依存で作法が欠落する。
- **Usage は逃がす**: docs `.mdx` と 1:1 重複し受け皿が既存。skill 容量の大半（frame で 72%）を占める。
- **削り幅は実挙動で決める**: agent が URL を踏むかは経験的問題。机上で決めず §4 / §5 で検証する。


## 9. 未決事項

- ゼロ / 最小例の最終的な出し分けライン（§4 の検証結果で確定）。
- 対象を primitives に限るか、trait-class / property-class まで広げるか。
- guide の手順制御（C 表一式）自体のアブレーションを #460 の検証に含めるか。「最小ゲート＋提出前セルフチェック＋antipatterns のみ」の軽量対照版と比較し、C0–C8 の実装プラン表が準拠率を実際に上げているかを測る（上げていなければ手順制御側も大幅に畳める）。
- 受け皿が無いクラスの扱い（docs 先行作成 or skill 要約維持）。
- 全ゼロで統一する場合の forcing（「応用・詳細は必ず docs `.md` / MCP を参照」を SKILL.md に 1 行）を入れるか。


## 10. 完了条件

- §4 の 3 版比較から Usage の畳み方針が確定している。
- 対象の個別クラス解説が §3 の骨格（判断材料 ＋ docs URL）に圧縮されている。
- MCP `get_guide` / guide 内リンクの回帰が無い。
