# テスト監査レポート（mockup関連）

> 監査日: 2026-08-06 / 基準: `dev` @ `8b464189`
> 範囲: `packages/mockup/`（src / viewer / templates / bin）、`skills/lism-mockup-guide/`、mockup関連のturbo・CI設定
> 前提: プロジェクト全体の監査は[#507](https://github.com/lism-css/lism-css/issues/507)（2026-07-06、mockup構築前）で実施済み。本レポートはその後に追加されたmockup領域のみを対象とする。

## サマリー

- `packages/mockup`のテストは全体として質が高い。249テスト / 17ファイルが約1.3秒で全てパスし、import境界（`allowlist` / `boundary`）のバイパス経路やキャッシュ占有の実プロセス競合まで踏み込んで検証されている。#507で指摘した「回帰テストの習慣」も、mockupの`fix:`コミット2件はいずれもテストを同時に更新しており改善している。
- 一方で、**ユーザーが最初に触る経路が丸ごと未検証**という穴が3つ残っている。(1) `init`で配られる`templates/pages/*.jsx`を実際にビルドするテストがない、(2) CLIエントリ`src/index.ts`がカバレッジ0%（終了コードとエラー整形が未検証）、(3) 配布物である`viewer/`がテストゼロ・カバレッジ計測対象外。
- カバレッジ数値の見え方に注意が必要。既定の`vitest run --coverage`は「テストからimportされたファイル」しか集計しないため94.07%と出るが、`--coverage.all`で未importファイルを含めると**71.61%**まで下がる。差分のほぼ全てが`viewer/`と`src/index.ts`。
- 構成面では、`packages/mockup`にvitest設定ファイルが存在しない（#507の指摘11「設定の置き場所がバラバラ」の延長）。この状態ではviewerにDOMテストを追加できないため、上記(3)の障壁になっている。
- **逆方向（無駄なテストの削減）の余地は小さい**。249件が約1.3秒で終わり、ファイル並列実行で`dev.test.ts`が律速のため、他を削っても全体の実行時間は縮まない。**削除できるテストは実質2件**で、残りの改善は「テスト内の重い呼び出し回数を減らす」「脆いアサートを緩める」であり件数は減らない。削る価値があるのは実行時間ではなく「壊れやすさ」で、特に**`lism-css`のCSS整形に密着したアサート**（`tokens.test.ts:399`）は他パッケージの変更で突然落ちるため直す価値がある。詳細は「軽量化の観点」の節へ。

## ワークスペース別テスト現状一覧

`pnpm --dir packages/mockup exec vitest run`の実測（合計249 passed / 0 failed、wall clock 1.23〜1.49s。3回実測で初回のみ約20%遅い）。件数は`--reporter=json`の実測値。

| 領域 | テストファイル数 | テスト件数 | 種別 | 主な検証内容 | 実行時間 |
| --- | --- | --- | --- | --- | --- |
| `src/commands/` | 4 | 52 | 統合（実fs・実vite） | initのscaffoldと衝突/`--force`、checkのbundle成否とエラー整形、devのtransformと再構築、依存欠落の警告 | dev 800ms / check 550ms |
| `src/core/` | 6 | 95 | ユニット〜統合（一部実子プロセス） | config/tokensのスキーマ検証、ページ探索とsymlink越境防止、viteキャッシュ占有の排他制御 | concurrency 354ms / 他は100ms未満 |
| `src/vite/` | 7 | 102 | ユニット | import許可リスト、境界判定、仮想lucide-reactの生成コード・型・実DOM突合、仮想モジュール生成 | 各50ms前後 |
| `src/index.ts`（CLIエントリ） | 0 | 0 | — | — | — |
| `src/scripts/` | 0 | 0 | — | — | — |
| `viewer/`（Reactビューア） | 0 | 0 | — | — | — |
| `templates/`（配布scaffold） | 0（存在確認のみ） | — | — | — | — |
| `skills/lism-mockup-guide/` | 0 | — | — | — | — |

ファイル別の内訳（件数）: check 15 / dev 24 / init 11 / diagnostics 2 / tokens 53 / data-dir 18 / pages 12 / cache-claim 8 / cache-claim.concurrency 3 / runtime.claim 1 / boundary 25 / allowlist 24 / lucide-icons 28 / lucide-runtime 8 / virtual-modules 7 / config 5 / lucide-types 5。

上表の実行時間は**全体実行時（ファイル並列）**の各ファイル所要時間。「軽量化の観点」の節に載せた単独実行の数値はvitestの起動コストを含むため、この表とは直接比較できない。

### カバレッジ実測

| 集計方法 | Stmts | Branch | Funcs | Lines |
| --- | --- | --- | --- | --- |
| 既定（`--coverage`） | 94.07% | 88.59% | 96.87% | 94.55% |
| 未importファイル込み（`--coverage.all`、`src/**` + `viewer/src/**`） | **71.61%** | **66.54%** | **61.18%** | **71.33%** |

低い順の内訳（`--coverage.all`）:

| ファイル | Stmts | Branch | 未カバー行 |
| --- | --- | --- | --- |
| `viewer/src/**`（18ファイル） | 0% | 0% | 全体 |
| `packages/mockup/src/index.ts` | 0% | 0% | 12-69 |
| `packages/mockup/src/scripts/generate-lucide-types.ts` | 0% | — | 15-20 |
| `packages/mockup/src/commands/dev.ts` | 70.23% | 68.42% | 54-86, 90, 144-172 |
| `packages/mockup/src/commands/init.ts` | 91.83% | 81.63% | 51-69, 149, 152, 200-210 |
| `packages/mockup/src/core/data-dir.ts` | 92.59% | 88.52% | 151-155, 164, 175, 178 |
| `packages/mockup/src/core/cache-claim.ts` | 93.05% | 82.35% | 126, 138, 172 |
| `packages/mockup/src/commands/check.ts` | 96.29% | **65%** | 32-35, 38-53, 63 |

---

## 指摘リスト

### 高

- **[高1]** `packages/mockup/templates/pages/landing.jsx`ほかテンプレートJSX全ファイル
  - 問題: `lism-mockup init`でユーザーへ配られるscaffoldページが、**一度もビルド・レンダリングされていない**。`packages/mockup/src/commands/init.test.ts:44`は`EXPECTED_FILES`の存在確認とJSONパースのみで、JSXの中身は検証していない。`check.test.ts` / `dev.test.ts`は`src/test-helpers/fixtures.ts`の独自フィクスチャを使い、`templates/`を参照していない（grep済み・該当なし）。
  - 影響: テンプレートは`lism-css` / `@lism-css/ui`（いずれも`workspace:*`依存で頻繁に変わる）のAPIを直接使っている。API変更でテンプレートが壊れると、**全ての新規ユーザーが`init`直後の`dev`で失敗する**。CIは検知できない。
  - 改善案: 一時ディレクトリに`initCommand`でscaffoldし、そのまま`checkCommand`を通す統合テストを1本追加する。`checkCommand`は「スキーマ検証 + import境界 + 全ページのbundle成功」を既に保証する（`packages/mockup/src/commands/check.ts:1-11`）ため、検証機構は既にあり、templatesに向けるだけで済む。`check.test.ts`の既存パターンをそのまま流用できる。

- **[高2]** `packages/mockup/src/index.ts`（カバレッジ0%、未カバー12-69）
  - 問題: CLIエントリに対応するテストが存在しない。特に`fail()`（`packages/mockup/src/index.ts:16-25`）の`process.exitCode = 1`と、`MockupContractError`時の`at {file}`付きエラー整形が未検証。各コマンドの`.test.ts`は関数を直接呼んで`rejects.toThrow`を見ているだけで、CLI層の終了コードは通らない。
  - 影響: `check`は「エージェントの自己確認用」と明記されたコマンド（`packages/mockup/src/commands/check.ts:2`）。終了コードが0のままになる回帰が入ると、**エラーなのにエージェント側は成功と判断して先へ進む**。`lism-mockup-guide`スキルの`init → 実装 → check`ワークフロー全体が静かに無意味になる。
  - 改善案: `bin/lism-mockup.mjs`を子プロセスで起動し、不正なデータディレクトリに対する`check`の終了コードが1であること、正常時が0であることを確認するスモークテストを追加する。あわせて`--version`と不正サブコマンド時の挙動も1本で拾える。

- **[高3]** `packages/mockup/viewer/src/**`（18ファイル、全てカバレッジ0%）
  - 問題: viewerは`package.json`の`files`に含まれる配布物（`packages/mockup/package.json:30-36`）で、`dev`でユーザーが実際に操作するUIだが、テストが1つもない。lintとtypecheckの対象にはなっているが、ロジックの検証はゼロ。
  - 影響: 特に`packages/mockup/viewer/src/lib/useViewerRoute.ts:52-132`はURLクエリの優先順位（`?page=`が`?view=`より優先）・history push・popstate同期を担い、壊れると共有URL・ブラウザの戻る/進む・ギャラリーの埋め込みiframeが同時に機能しなくなる。
  - 改善案: DOM不要な純粋関数から着手するのが費用対効果が高い。優先順に:
    1. `packages/mockup/viewer/src/lib/groupPages.ts:25-46`（カテゴリ集約。型のみimportで実行時依存なし）
    2. `packages/mockup/viewer/src/lib/pinnedPage.ts:34-46`（固定ページの分離とlabel/category上書き。同上）
    3. `packages/mockup/viewer/src/lib/useViewerRoute.ts`の`buildPageHref` / `buildGalleryHref` / `buildTokensHref` / `buildEmbedSrc`（export済みの純粋関数）
    4. `packages/mockup/viewer/src/lib/isModifiedClick.ts:10-12`（1行で書ける）

    `packages/mockup/viewer/src/lib/useViewerRoute.ts:26`の`readRouteFromUrl`は非exportのため、URLパースの優先順位ルールを直接テストするにはexportの追加が必要。

- **[高4]** `packages/mockup/bin/lism-mockup.mjs:2` / `packages/mockup/package.json:20-21`
  - 問題: ビルド成果物（`dist/index.js`）を実際に起動する検証がない。テストは全てsrc（TypeScript）を直接読んでいる。
  - 影響: `packages/mockup/tsconfig.json:5-6`のコメントが「emitするimport指定子は自前で`.js`を付ける」と注意している通り、ESMビルド固有の落とし穴が存在する。srcのテストが全て通っても公開物が起動しないパターンを検知できない。#507の指摘4（`create-lism`のスモークテスト）と同じ構図。
  - 改善案: 上記「高2」のCLIスモークテストを`bin/lism-mockup.mjs`経由で書けば、この指摘も同時に解消できる（1本で兼ねられる）。ただし`dist`のビルドが前提になるため、turboの`test`タスクにmockup自身の`build`を依存させるか、テスト側でdistの有無を確認してスキップする設計判断が必要。

### 中

- **[中]** `packages/mockup/src/commands/dev.ts:144-172`（`devCommand`本体、Stmts 70.23% / Branch 68.42%）
  - 問題: `dev.test.ts`は`createMockDevServer`のみを使い、`devCommand`を一度も呼んでいない。`server.listen()`、起動完了ログ、`process.once('exit'|'SIGINT'|'SIGTERM', cleanup)`のハンドラ登録と二重cleanup防止（`cleaned`フラグ）が未検証。
  - 改善案: シグナルハンドラの検証は難度が高く、`createMockDevServer`側が厚くテストされている以上、意図的な線引きの可能性がある（→ 要確認）。少なくとも起動完了時の`console.log`フォーマットは容易に検証できる。ただし#500（Ctrl+C中断処理）の修正履歴を踏まえると、cleanupの冪等性だけは押さえておく価値がある。

- **[中]** `packages/mockup/src/commands/check.ts:32-53`（Branch 65%）
  - 問題: `toCheckError()`のフォールバック分岐（`err.loc`がなく`err.id`のみ、`message`も`frame`もない、`describeMissingLucideExport`がnull）と、`printSummary`のダークトークン行（53行目）の一部が未検証。`check`の出力はエージェントが読む唯一の情報源。
  - 改善案: `loc`を持たないエラー（依存解決失敗など）を起こすフィクスチャを1つ足し、`at {file}`行が出ない場合のメッセージ形を固定する。

- **[中]** `packages/mockup/src/core/paths.ts`（専用テストファイルなし）
  - 問題: 10個のexportに対して専用テストがない。カバレッジ96.15%は`vite/*`や`pages.ts`経由の間接実行によるもので、境界値は狙って検証されていない。特に`isInsideDir`（`packages/mockup/src/core/paths.ts:58-61`）は`pages.ts`のsymlink越境防止というセキュリティ境界で使われるが、`packages/mockup/src/core/pages.test.ts:86-93`の間接テストは「全く別のディレクトリ」ケースのみで、`/data`と`/data-other`のような**プレフィックス衝突**は未検証。
  - 改善案: `isInsideDir` / `hasNodeModulesSegment` / `splitQuery`（`?`と`#`の併存）/ `toImportSpecifier`（Windowsパス変換）に絞った単体テストを1ファイル追加。単純なパス結合関数（`getMockPackageRoot`等）は対象外でよい。

- **[中]** `packages/mockup`にvitest設定ファイルが存在しない
  - 問題: `vitest.config.*` / `vite.config.*`がなく、`"test": "vitest run"`が既定設定で走っている。既定environmentは`node`、devDependenciesに`jsdom` / `happy-dom` / `@testing-library/react`はいずれも無い（`packages/mockup/package.json:58-66`）。
  - 影響: 上記「高3」のviewerテストのうち、DOMを伴うもの（hook・コンポーネント）は現状の構成では追加できない。純粋関数のテストは設定なしでも追加できるため、まずはそちらから始められる。
  - 改善案: 純粋関数のテストを先に入れ、DOMテストが必要になった段階で`vitest.config.ts`を新設して`environment: 'jsdom'`（またはファイル先頭の`// @vitest-environment jsdom`）を導入する。#507の指摘11（設定の置き場所がパッケージごとにバラバラ）とあわせて方針を決めるとよい。なお`viewer/src/App.tsx:17`と`viewer/src/components/TokensView.tsx:3`は`virtual:lism-mockup/*`を**実行時** importしているため、これらのコンポーネントテストには仮想モジュールのモックかvite pluginの登録が追加で必要になる。

- **[中]**カバレッジ計測の既定値が実態を過大に見せる
  - 問題: `--coverage`単体では未importファイルが集計外になり94.07%と出るが、実質は71.61%（上表）。この差を知らないまま数値を見ると、viewerとCLIエントリの穴が見えない。
  - 改善案: カバレッジを継続的に見るなら`coverage.all`と`coverage.include`を設定ファイルに固定する。CIに組み込むかは別途判断でよい（現状CIではカバレッジを取っていない）。

- **[中]** `pnpm check:mockup`がCIで走らない
  - 問題: ルートに`init:mockup` / `check:mockup` / `dev:mockup`スクリプトがあり`packages/mockup/__test__`を対象にしているが、`__test__`は`.gitignore:3`の`__*`によって**リポジトリ管理外**（`git check-ignore`で確認済み）。したがってCIではこの経路が一切実行されない。`.github/workflows/`にmockup固有のステップは無い（grep済み・該当なし）。
  - 改善案: これは「高1」（templatesを`checkCommand`に通す統合テスト）を入れれば実質的に解消する。`__test__`はローカルの手動確認用として現状のままでよい。
  - 補足: `packages/mockup/templates`と`packages/mockup/__test__`の差分は`README.md`のみ（`diff -rq`で確認）。`__test__`はtemplatesのコピーとして機能している。

### 低

- **[低]** `packages/mockup/src/core/cache-claim.test.ts:14-51`と`packages/mockup/src/core/cache-claim.concurrency.test.ts:45-73`
  - 問題: `createSharedPath` / `deadPid` / `createMarkedDir` / `readMarker` / `inuseEntries`の5つのヘルパーがほぼ丸ごと重複定義されている。検証内容自体（同一プロセスの決定的動作vs実プロセスの競合不変条件）は重複していない。
  - 改善案: `src/test-helpers/`へ切り出す。ファイル分離の意図は保ったまま重複だけ解消できる。

- **[低]** `packages/mockup/src/commands/init.test.ts:9-19`
  - 問題: `EXPECTED_FILES`がハードコードのリスト。`initCommand`側は`collectTemplateFiles()`（`packages/mockup/src/commands/init.ts:22-36`）でtemplatesディレクトリを再帰走査するため、テンプレートにファイルを追加してもコピーはされるが、テストは追加分を検証しない（追加を忘れても落ちない）。
  - 改善案: 期待値を`templates/`の実走査結果と突き合わせる形にするか、少なくとも「テンプレート内のファイル数と生成物のファイル数が一致する」アサートを足す。

- **[低]** `packages/mockup/src/commands/init.test.ts:33-41`
  - 問題: このファイルだけ`src/test-helpers/fixtures.ts`を使わず、生の`mkdtemp` / `writeFile`を直接使っている。他3ファイルは`createDataDir` / `createTempDir` / `writeFiles`を利用。
  - 改善案: 機能的な問題はないため優先度は低いが、揃えると新規テストの書き方が1つに定まる。

- **[低]** `packages/mockup/src/vite/lucide-icons.test.ts:209`
  - 問題: `expect(SUPPORTED_LUCIDE_API).toEqual(['Icon', 'createLucideIcon'])`は定数リテラルをそのまま突き合わせる自己参照的な検証で、実装が壊れたことを検知する力が弱い。
  - 改善案: 実害は小さい。残すなら「この定数を変えたら意図的な仕様変更である」ことを示すコメントを添えるだけでよい。

- **[低]** `packages/mockup/src/vite/lucide-runtime.test.ts`
  - 問題: 対応する`lucide-runtime.ts`は存在しない。実体は`lucide-icons.ts`の`generateLucideModule()`が出力する**生成コード**を実行して本物のlucide-reactとDOM比較するテスト。#507の指摘11（テストファイル名と対象の不一致）と同種。
  - 改善案: ファイル冒頭に目的の説明コメントがあり内容は妥当なので、変更は必須ではない。気になるなら`lucide-icons.runtime.test.ts`など対象が分かる名前にする。

- **[低]** `packages/mockup/src/scripts/generate-lucide-types.ts`（カバレッジ0%）
  - 問題: テストなし。ただし内部で使う`generateLucideTypes` / `loadLucideIconSet`は他ファイルで検証済みで、未検証なのは出力パスの組み立て（`fileURLToPath` + 相対URL）とファイル書き込みの副作用のみ。
  - 改善案: `build`スクリプトの一部として毎回実行されるため、壊れればビルドで落ちる。テスト追加の優先度は低い。

---

## 良かった点（維持したいもの）

- **回帰テストの習慣が定着している**: mockup関連の`fix:`コミット2件（`1fb78081`仮想lucide-reactの対応範囲、`7831e88a` mockupキャッシュへのlockfile反映）は**いずれもテストファイルを同時に変更している**。#507の指摘8（fixコミット10件中4件でテスト変更なし）に対して、mockupでは改善されている。
- **セキュリティ境界の検証が厚い**: `allowlist` / `boundary`のバイパス経路は、`..` traversal・Windows形式の区切り文字（`packages/mockup/src/vite/allowlist.test.ts:216`）・symlink脱出（文字列レベルとvite解決後の2層）・URLクエリ付きid（`packages/mockup/src/vite/boundary.test.ts:157-164`）・`/@fs/`直書き・絶対パス・外部URLが個別に検証されている。
- **実プロセスでしか出ない競合を実プロセスで検証している**: `packages/mockup/src/core/cache-claim.concurrency.test.ts`は子プロセス3つを一斉起動して順序非依存の不変条件を確かめており、全体実行時354msのコストに見合う。

---

## 要確認（意図的な設計の可能性があるもの）

- **`devCommand`本体が未テストな点**（`packages/mockup/src/commands/dev.ts:144-172`）: 実ポートのlistenとプロセスシグナルの扱いはテストしづらく、ロジックの大部分を`createMockDevServer`に切り出して**そちらをテストする設計**にした可能性が高い。ただし起動完了ログのように容易に検証できる部分も未検証のため、完全に意図的かは判断できない。

- **`src/index.ts`のテスト不在**: 「各コマンド関数の単体テストで十分」という判断の可能性はある。ただし`fail()`の終了コード設定はコマンド関数のテストでは絶対に通らない経路であり、意図的な省略か単なる漏れかは今回の調査では確定できなかった。上記「高2」で高優先度に置いたのは、`check`がエージェント向けコマンドである点を重視した判断。

- **`check.test.ts:105-138`のlucide関連エラーメッセージ検証**: `packages/mockup/src/vite/lucide-icons.test.ts`と重複するが、「check経由で実際にユーザー/エージェントへ届くメッセージが正しいか」を保証する統合テストとしての意図があり得る。**テスト自体の削除は推奨しない**（後述の[軽1]は、この範囲のうち`:135-137`について「テストを消す」のではなく「同じdirに対する`check()`の呼び出しを3回から1回に減らし、文言アサートを代表1フレーズに絞る」という提案であり、矛盾しない）。

- **`allowlist.test.ts:205-229`と`boundary.test.ts:210-217`のsymlink検証の重複**: 前者は文字列レベルの許可リスト判定、後者はvite解決後の実ファイルパス判定で、`packages/mockup/src/vite/boundary.ts:203-212`のコメントに二段構えの意図が明記されている。**意図的な多層防御**であり冗長ではない。

- **`dev.test.ts:42-77`の`beforeAll`共有サーバー構成**: 他3ファイルがtestごとに独立した一時ディレクトリを作るのに対し、devサーバーだけ全testで共有している。vite devサーバーの起動コストを踏まえた設計と思われるが、明示的なコメントは確認していない。

- **大文字小文字違い / Windows形式絶対パス（`C:\...`）によるバイパス**: `allowlist` / `boundary`に該当テストがない。macOS/Linux前提の開発・CI構成であれば不要かもしれず、リスクの大小は判断できなかった。実装側でも特別扱いはされていない。

- **`skills/lism-mockup-guide/SKILL.md`と`packages/mockup/templates/AGENTS.md`の整合**: 両方がエージェント向けのデータ契約を説明しているが、内容の同期を検証する仕組みはない。ドキュメント同士の整合はテストの守備範囲外という判断もあり得るため、指摘には含めていない。

---

## 判断できなかった点・未確認の点

- **`packages/mockup/src/vite/config.ts`と`packages/mockup/src/vite/lucide-types.ts`がv8カバレッジレポートに一切現れない**。両ファイルとも専用テスト（`config.test.ts` / `lucide-types.test.ts`）から確かにimportされているにもかかわらず、`--coverage.all --coverage.skipFull=false`を付けても表に出てこない。原因は特定できなかった。したがって**この2ファイルの実カバレッジは不明**であり、`createMockViteConfig`（`packages/mockup/src/vite/config.ts:79-153`）が`check` / `dev`の統合テストでどこまで通っているかも数値では確認できていない。カバレッジ数値を判断材料にする場合はこの点に注意が必要。
- `packages/mockup/src/core/types.ts`もレポートに現れないが、こちらは型定義中心で実行コードがほぼ無いためと考えられる（未確認）。
- viewerに`.tsx`テストを追加した際、vitestのesbuildがJSXをどう変換するか（`react-jsx`ランタイムの自動適用の有無）、および`vi.mock('virtual:lism-mockup/pages', ...)`がpluginなしで機能するかは、いずれも実行検証していない。
- テンプレートJSX（`packages/mockup/templates/pages/*.jsx`）が現時点で実際にビルドを通るかどうかは、監査中に手動実行していない（読み取り専用監査のため）。「高1」は「検証する仕組みが無い」という指摘であって、「現在壊れている」という指摘ではない。
- CI上での実行時間は未計測。本レポートの実行時間は全てローカル（macOS）での実測値。
- `packages/mockup/types/lucide-react.d.ts`が誰からどう参照される想定かは追跡していない（`package.json`に`types`フィールドが無い点を含む）。
- 「軽量化の観点」の指摘のうち、[軽1]〜[軽4]は該当箇所のコードを直接読んで確認したが、**[軽5]と[軽6]は調査時の報告に基づく判断で、`lucide-runtime.test.ts`の該当行（`:116-118`）と`lucide-icons.test.ts:230-248`は直接読んでいない**。この2件は唯一「テストの削除」を提案しているものなので、実施前に該当箇所を読んで包含関係を確認すること。

---

## 軽量化の観点（無駄なテストを削る）

「穴を埋める」の逆方向として、削除・統合できるテストを全249件から洗い直した結果を記す。

### 前提となる実測値

| 対象 | 時間 |
| --- | --- |
| mockup全体（wall clock） | 1.23〜1.49秒（3回実測。初回のみ約20%遅い） |
| Duration内訳 | import 6.17s / transform 1.60s / tests 1.90s（※ファイル並列実行のため合計はwall clockを超える） |
| `src/commands/dev.test.ts`（単独） | 766ms |
| `src/commands/check.test.ts`（単独） | 987ms |
| `src/core/cache-claim.concurrency.test.ts`（単独） | 330ms |
| `src/core/tokens.test.ts`（単独） | 414ms |
| `src/vite/lucide-runtime.test.ts`（単独） | 102ms |
| モノレポ全体（`turbo run test --force`） | 26.0秒 |

単独実行の数値はvitestの起動コストを含むため、「ワークスペース別テスト現状一覧」の全体実行時の数値とは直接比較できない（例: `tokens.test.ts`は全体実行時76msに対し単独414ms）。

**結論: mockupに「重くて困っているテスト」は無い。** 249件が約1.3秒で終わり、テストファイルは並列実行されるため、全体実行時に最も長い`dev.test.ts`（800ms）が律速になる。したがって他のファイルをどれだけ削っても**パッケージ全体のwall clockはほぼ変わらない**。

**削除できるテストは実質2件だけ**（[軽5]と[軽6]）で、249件が247件になるにすぎない。以下の[軽1]〜[軽4]は件数を減らす提案ではなく、「テスト内の重い呼び出し回数を減らす」「他パッケージの都合で落ちる脆いアサートを緩める」という**保守コストの改善**である。軽量化の実利は実行時間ではなくこちらにある。

### 削る価値があるもの（優先度順）

- **[軽1]** `packages/mockup/src/commands/check.test.ts:82-83`と`:135-137`
  - 問題: **同一のディレクトリに対して`check()`を複数回呼んでいる**（前者は2回、後者は3回）。`checkCommand`は毎回フルのvite buildを実行するため、同じビルドを繰り返している。このパッケージで唯一の「明確な無駄」。
    ```js
    // :135-137 — 同じdirに対して3回ビルドしている
    await expect(check(dir)).rejects.toThrow(MockupContractError);
    await expect(check(dir)).rejects.toThrow(/pulls every lucide icon into the bundle/);
    await expect(check(dir)).rejects.toThrow(/the icon components plus "Icon" and "createLucideIcon"/);
    ```
  - 改善案: 1回だけ呼んで例外を捕まえ、`instanceof`とメッセージの複数アサートをその1つの例外に当てる。実build 3回分（check.test.ts単体で約200ms、2割）の削減。**ただしパッケージ全体のwall clockは変わらない**（並列実行で`dev.test.ts`が律速のため）。
  - 追加: `:136-137`の文言は`packages/mockup/src/vite/lucide-icons.test.ts:230-247`で`describeMissingLucideExport`に対して**同一の文字列がすでに検証済み**。check側は「rollupのMISSING_EXPORTがこのメッセージへ差し替わる配線」の確認だけで足り、文言の再アサートは代表1フレーズに絞れる。

- **[軽2]** `packages/mockup/src/core/tokens.test.ts:399` ← **最も危険**
  - 問題: `expect(css).toMatch(/:root,\n\.set--s \{[\s\S]*--s30: 1\.5rem;/)`は、**`lism-css`（外部パッケージ）のCSS出力における改行位置とセレクタ結合**に密着している。lism-cssが整形を変えただけで、mockup側に何のバグもないのにこのテストが落ちる。モノレポで最も扱いにくい壊れ方。
  - 改善案: mockupが保証すべきは「spaceの上書きがCSSに反映されること」なので`toContain('--s30: 1.5rem;')`で十分。`.set--s`のスコープ構造はlism-css側のテストの責務。

- **[軽3]** `packages/mockup/src/core/tokens.test.ts:381`
  - 問題: `toContain('export default {\n  "tokens": {\n    "color": {\n      "canvas": "#f7f7f7"')`が`JSON.stringify(obj, null, 2)`のインデント幅をそのまま埋め込んでおり、整形の変更だけで落ちる。
  - 改善案: `export default `以降を`JSON.parse`して`toEqual`するか、`toContain('"canvas": "#f7f7f7"')`まで緩める。

- **[軽4]** `packages/mockup/src/vite/lucide-icons.test.ts:157`と`:167`（**この2行のみ**）
  - 問題: `:157`は生成コードの**計算式のソーステキスト**（`strokeWidth: absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth`）を照合している。`packages/mockup/src/vite/lucide-runtime.test.ts:86-90`が同じ生成コードを実行して「size=48ならstrokeWidth=1」という**結果**を保証しており、そちらの方が強い。式を等価な別表現へ書き換えただけで落ちる。`:167`の`DEFAULT_VIEW_BOX`変数名チェックも同種の実装詳細ロック。
  - 注意: `:150-166`の属性リスト**全体**は削らないこと。`:147-149`のコメントに「lism-cssの`.a--icon:where(:not([fill]))`が属性の有無で分岐するため、ここがずれると既存モックアップの見た目が変わる」と理由が明記されており意図的。**削るのは157と167の2行だけ**にとどめる。

- **[軽5]** `packages/mockup/src/vite/lucide-icons.test.ts:177-179`（`dangerouslySetInnerHTML`の文字列確認）
  - 問題: `packages/mockup/src/vite/lucide-runtime.test.ts:116-118`が生成モジュールの`Bell`を実際にrenderし、`<path d="M1 2"/>`が子要素として出力されることを確認済み。bodyがそのまま埋め込まれることの実証を包含している。
  - 改善案: 削除可（検知能力は落ちない）。

- **[軽6]** `packages/mockup/src/vite/lucide-icons.test.ts:244-248`（「どの場合も対応範囲を添える」）
  - 問題: 直前の`:230-234`（iconsケース）・`:237-241`（Belllケース）と**同じ2入力**に対して、`LUCIDE_SCOPE_NOTE`の断片を追加確認しているだけ。
  - 改善案: 既存2テストに1アサーションずつ追記して統合（単純削除ではない）。

### 削減候補に見えるが、消さない方がよいもの

- **`packages/mockup/src/core/cache-claim.concurrency.test.ts`の3件（330ms、子プロセス9回起動）**: 単独ファイルとしては3番目に重いが、3件はそれぞれ別の競合シナリオ（温かいキャッシュの奪い合い / 新規作成の競合 / 残骸回収の排他）を見ており、`fs.renameSync`によるOSレベルの排他は**同一プロセスでは原理的に再現できない**。`cache-claim.test.ts`の8件は逐次呼び出しのため排他性そのものは検証していない。重複ではない。
- **`packages/mockup/src/commands/dev.test.ts:157-172`（境界チェック）**: `packages/mockup/src/vite/boundary.test.ts:170-173, 241-248`と入力パターンが重複するが、`beforeAll`でサーバーを共有しているため**削除しても実行時間は変わらない**。整理するなら可読性目的であり、軽量化としての実利はない。
- **`packages/mockup/src/commands/dev.test.ts:229-279`（cacheDir/configDir占有3件）**: `cache-claim.test.ts`は`claimViteCacheDir`単体、こちらは`prepareMockRuntime`が`exclusiveViteCache`に応じて呼び分ける**runtime側の配線**を見ており別レイヤー。`:258`が`prepareMockRuntime`を3回呼ぶのも「1つ目が占有 → 2つ目が退避 → 1つ目解放後に3つ目が引き継ぎ」という状態遷移の連鎖で、分割・統合できない。
- **プロトタイプ汚染対策系**（`tokens.test.ts:57, 67, 75, 273` / `data-dir.test.ts:114, 127` / `pages.test.ts:63, 79`）: 一部に重複はある（例: `tokens.test.ts:127`は`:57`と`:122`でカバー済み）が、実行コストがほぼゼロでセキュリティ性質の多重防御。削る費用対効果がない。
- **`packages/mockup/src/vite/lucide-runtime.test.ts`全8件（102ms）**: 本物のlucide-react 0.577.0の出力と文字列完全一致で比較しており、**外部パッケージのバージョン追随を検知する唯一の手段**。生成コードの構文誤り・実行時例外も静的アサートでは代替不能。このパッケージで最も価値が高いテスト群。
- **`packages/mockup/src/vite/lucide-icons.test.ts:181-199`**: PUREアノテーション数（tree-shaking契約）と生成物の規模は、実行結果のDOMには現れずソースレベルでしか検証できない。
- **`packages/mockup/src/core/data-dir.test.ts` / `pages.test.ts`全体**: 各`toThrow`が異なる分岐・異なる文言に対応しており、同じコードパスの入力違いの反復はほぼ無い。無理な`it.each`化は分岐の違いを覆い隠すだけで実質的な軽量化にならない。

### モノレポ視点での本命（範囲外だが記録）

軽量化の投資先としてはmockupより**`@lism-css/plugin`**の方が大きい。`turbo run test --force`で**17.86秒**（モノレポ全体26.0秒の**68%**）を占めた。ただし`pnpm --dir packages/plugin exec vitest run`の単独実行では2秒台（203件全パス）で終わっており、**この差の原因は未確認**。turboのタスク定義かplugin側のtestスクリプトの確認が必要。

また、最初の計測で`turbo run test --force`実行時に「pluginのテスト1件失敗」という結果が出たが、単独で2回実行したところ203件全てパスし**再現しなかった**。原因は特定できていない。

---

## 次のアクションの目安

工数の小さい順に並べると、以下の3つで「高」の指摘4件のうち3件が解消する。

1. **CLIスモークテスト1本**（高2 + 高4を同時に解消）: `bin/lism-mockup.mjs`を子プロセス起動し、正常時exit 0 / 異常時exit 1を確認する。
2. **templatesを`checkCommand`に通す統合テスト1本**（高1を解消）: `initCommand` → `checkCommand`を一時ディレクトリで実行する。
3. **viewerの純粋関数テスト1ファイル**（高3の着手）: `groupPages` / `pinnedPage` / `isModifiedClick` / `buildXxxHref`系。vitest設定の追加なしで書ける。

軽量化については、実行時間の短縮効果がほぼ無いため単独で着手する価値は低い。**該当ファイルを別件で触るついでに[軽1]〜[軽6]を直す**のが現実的（特に[軽2]はlism-css側の変更で突然落ちるため、遭遇したらその場で直す価値がある）。
