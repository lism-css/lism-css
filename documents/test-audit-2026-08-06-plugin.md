# テスト監査レポート（@lism-css/plugin）

> 監査日: 2026-08-06 / 基準: `dev` @ `8b464189`
> 範囲: `packages/plugin/`（`src/**`・`bin/cli.mjs`・`vite.config.js`）と、このパッケージのテストが実行される turbo / CI 経路
> 前提: プロジェクト全体の監査は [#507](https://github.com/lism-css/lism-css/issues/507)（2026-07-06）、mockup 領域は [test-audit-2026-08-06-mockup.md](./test-audit-2026-08-06-mockup.md) で実施済み。本レポートは `@lism-css/plugin` のみを対象とする。

## サマリー

- **効率性: 削るものはほぼ無い。** 203テスト / 17ファイルが全てパスし、Duration 2.02〜2.08秒（wall clock 2.56〜2.62秒）。167件は10ms未満で、実行時間の実質すべては3ファイル・17回のフルツリー sass コンパイルが占めるため、件数を減らしても実行時間は縮まない。重い3ファイルを丸ごと消しても0.9秒減にしかならず、現実的な削減余地は0.4〜0.6秒（詳細は「軽量化候補」）。
- **効率性で唯一投資価値があるのは flake の解消。** `src/builder/next.test.ts:94` の watch テストが `turbo run test` の並列負荷下で3回中1回失敗し（実測）、そのとき Duration は 17.83秒（定常の約8.8倍）。単独実行では常に0.4秒台で通る。詳細は「軽量化候補」の[高]。
- **turbo のタスク定義や test スクリプトに異常はない。** mockup レポートが「原因不明」とした「turbo で17.86秒 / モノレポ全体の68%」は、この flake が発生した回の数値であり、定常状態の占有率は 19.4%（詳細は「モノレポ全体に対する比率」）。
- **安全性: 穴の位置が偏っている。** 全体カバレッジは stmt 89.27% / branch 81.06% だが、最も使われる Vite / Astro 統合のフックが1つも実行されておらず、利用者が少ないはずの webpack（97.22%）/ next（100%）は手厚い。テストコストと利用頻度が逆になっている。
- **最も影響が大きい未検証経路は2つ。** purge の `known` 自動構築（`shared.ts:22`。壊れると purge が有効なクラスを削除する方向の障害なのに、黙ってフォールバックするため検知手段がない）と、公開 CLI `bin/cli.mjs`（カバレッジ0%。cssnano を通す `minify: true` 経路の唯一の利用者でもある）。詳細は「テスト漏れ」の[高]。

## 監査範囲と確認方法

**対象**: `packages/plugin/src/**/*.test.ts`（17ファイル / 203テスト）と、対応する `src/**` 全ファイル・`bin/cli.mjs`・`package.json` の `exports` / `bin`。

**除外**: `node_modules`・`dist`・他ワークスペース。ただし「`@lism-css/plugin` を参照する他パッケージのテスト」の有無だけは `grep` で確認した（`packages/mockup/src/core/tokens.test.ts:4` が `loadBuildConfigs` を、`packages/lism-cli/src/commands/create.test.ts` が依存バージョン文字列としてのみ参照。plugin 側ロジックの重複検証ではない）。

**読んだ設定**: `packages/plugin/vite.config.js`（vitest 設定を内包。`environment: 'node'`、`typecheck.enabled: true`。専用の `vitest.config.*` は無い）、ルート `turbo.json`、ルート `package.json` の scripts、`.github/workflows/test.yml`。

**実行したコマンド**（すべて `packages/plugin` 直下、読み取り目的の実行のみ）:

```bash
pnpm exec vitest run --reporter=json              # 件数・ファイル別・テスト別の所要時間
pnpm exec vitest run --typecheck.enabled=false    # typecheck 有無の差分
pnpm exec vitest run --coverage --coverage.provider=v8 \
  --coverage.include='src/**' --coverage.include='bin/**'   # 未実行行・分岐・関数の特定
```

`@vitest/coverage-v8@4.1.10` は既にリポジトリの依存として存在していたため、新規インストールはしていない。

**利用したログ**: `packages/plugin/.turbo/turbo-test.log`（2026-08-06 22:24、`turbo run test` の実出力）。GitHub Actions のログは参照していない。

**計測回数**: 全体実行は6回（うち1回は coverage 付き）。すべて 203 passed / 0 failed。`next.test.ts:94` の watch テストは4回すべて成功（383〜461ms）。

## テスト現状一覧

`pnpm exec vitest run --reporter=json` の実測（203 passed / 0 failed）。所要時間はファイル並列実行時の各ファイル所要時間。**合計は 6.49秒だが wall clock は 2.6秒**で、律速は `webpack.test.ts`。

| テストファイル | 件数 | 種別 | 主な検証内容 | 実行時間 |
| --- | --- | --- | --- | --- |
| `builder/webpack.test.ts` | 14 | 統合（fake compiler + 実sass） | webpack の alias / CSS生成 / afterCompile・watchRun 配線 | 1496ms |
| `builder/next.test.ts` | 6 | 統合（実sass + 実fs.watch） | Turbopack相対・webpack絶対 alias、compose、dev watch再生成 | 1400ms |
| `builder/config-watcher.test.ts` | 3 | 統合（実fs.watch） | 変更検知 / 無関係ファイル無視 / close後の非発火 | 1063ms |
| `builder/generated-css.test.ts` | 3 | 統合（実sass、ツリー全体） | outDir へのCSS事前生成と alias map | 849ms |
| `builder/compile-entry.test.ts` | 10 | 統合（実sass、単一エントリ） | エントリ列挙、config反映、BP、#513回帰、キャッシュ | 730ms |
| `builder/scss-source.test.ts` | 5 | 統合（実sass） | bridge SCSS 生成と `.js`/`.ts` config 反映 | 363ms |
| `builder/dynamic-css.test.ts` | 7 | ユニット＋一部実sass | `resolveId` 解決、core SCSS の watch 登録 | 306ms |
| `builder/load-config.test.ts` | 15 | ユニット＋実fs | マージ順、config探索順（.ts→.mjs→.js）、jiti実読込 | 100ms |
| `purge/vite.test.ts` | 8 | ユニット＋実viteビルド1件 | hash再計算・参照同期・sourcemap削除・素通し | 91ms |
| `purge/astro.test.ts` | 9 | 統合（実fs、hook直呼び） | SSG/SSR出力の走査、リネーム同期、server/static分岐 | 46ms |
| `builder/build.test.ts` | 26 | ユニット（純粋関数） | **`serialize.ts` の SCSS直列化**（ファイル名と対象がズレている） | 27ms |
| `builder/gen-types.test.ts` | 33 | ユニット＋実fs | `lism-env.d.ts` 生成ロジックとマーカー安全性 | 6.4ms |
| `builder/vite.test.ts` | 10 | ユニット（形状のみ） | プラグイン名配列、config alias解決、astro integration名 | 6.3ms |
| `purge/core.test.ts` | 27 | ユニット（純粋関数） | セレクタ判定・safelist・known・OR/AND・at-rule再帰 | 4.1ms |
| `purge/shared.test.ts` | 14 | ユニット | signature判定、known解決、sourcemap、レポート整形 | 3.1ms |
| `builder/webpack-alias.test.ts` | 5 | ユニット（純粋関数） | webpack絶対 / turbopack相対 alias 構築 | 1.2ms |
| `purge/extract.test.ts` | 8 | ユニット（純粋関数） | Lismクラス抽出の正規表現 | 1.1ms |

### 実行時間の分布（実測）

| 区分 | 件数 | 備考 |
| --- | --- | --- |
| 10ms 未満 | 167 / 203 | 純粋関数テストが大半。合計しても実行時間に影響しない |
| 10〜100ms | 12 / 203 | — |
| 100ms 以上 | 24 / 203 | 実sassコンパイルか実fs.watch待ちを含むもの |

上位5件: `config-watcher.test.ts:62`（504ms、うち約500msは固定 `setTimeout`）/ `webpack.test.ts:175`（407ms）/ `next.test.ts:94`（383ms）/ `next.test.ts:24`（340ms）/ `webpack.test.ts:49`（335ms）。

`typecheck` の有無による差は 0.05〜0.51秒で、実行ごとの変動幅と重なるため有意差とは言えない。`--pool=threads` は既定の forks より 4.9% 遅く（2.13秒 vs 2.03秒）、pool の変更は軽量化の手段にならない。

### コストの正体: 17回のフルツリー sass コンパイル

`compileCssTree` のログマーカーを数えると、1回のテスト実行で **17回**のフルツリーコンパイル（1回あたり 10〜12エントリ）が走る。ファイル別に数えると、発生源は3ファイルだけ。

| ファイル | ツリーコンパイル回数 | ファイル所要時間 |
| --- | --- | --- |
| `builder/next.test.ts` | 7回 | 1400ms |
| `builder/webpack.test.ts` | 7回 | 1496ms |
| `builder/generated-css.test.ts` | 3回 | 849ms |

残りの14ファイルは `compileCssTree` を一度も呼ばない（`compile-entry.test.ts` と `dynamic-css.test.ts` は単一エントリの `createCssCompiler`、`scss-source.test.ts` は `sass.compileString` を使う）。

`next.test.ts` の7回が構造的に無駄が多い。`next.ts:67-74` は `generateCssToDir` を**無条件**で呼ぶため、alias の形しか見ていない4テスト（各162〜340ms）もフルツリーコンパイルを払う。対して `webpack.ts:128` は `const css = opts?.css ?? false;` でゲートしており、`webpack.test.ts` の14件中9件はコンパイルを起こさない（合計5ms）。この非対称が `next.test.ts` のコストの原因。

ただし `generateCssToDir` は `ignore` を公開しておらず（`generated-css.ts:63` で `full ? [] : FULL_ENTRIES_IGNORE` に固定）、**テスト側の書き換えだけではコンパイル対象を絞れない**。削るには実装側にテスト用の縫い目（エントリ指定オプション、またはコンパイラ差し替え）が必要で、テストのみの修正では完結しない。

### モノレポ全体に対する比率（実測、`turbo run test --force`）

| パッケージ | Duration | 件数 | ファイル数 |
| --- | --- | --- | --- |
| `@lism-css/catalog` | 4.02秒 | 149 | 40 |
| `@lism-css/plugin` | **2.40秒** | 203 | 17 |
| `lism-css` | 2.29秒 | 725 | 30 |
| `@lism-css/mockup` | 1.48秒 | 249 | 17 |
| `@lism-css/ui` | 988ms | 31 | 4 |
| `@lism-css/mcp` | 390ms | 66 | 4 |
| `lism-docs` | 384ms | 47 | 5 |
| `lism-cli` | 375ms | 113 | 9 |
| 合計 | 12.40秒 | 1583 | 126 |

plugin の占有率は Duration ベースで **19.4%**、件数ベースで 12.8%。[mockupレポート](./test-audit-2026-08-06-mockup.md) の248行目が記録した「17.86秒 / モノレポ全体の68%」は、同レポート250行目が「原因不明」としていた flake が発生した回の数値であり、**定常状態の比率ではない**。両者は別の事実ではなく同一実行の記録である。

turbo 経由の 2回目・3回目（Duration 2.03秒 / 2.02秒）は単独実行（2.03〜2.08秒）と一致しており、この差は turbo のオーバーヘッドではなく `next.test.ts:94` の flake の単独要因である（「軽量化候補」の[高]参照）。turbo のタスク定義や test スクリプトに異常はない。定常状態で最も重いのは `@lism-css/catalog`（40ファイル4.02秒）。

### カバレッジ実測

`--coverage.provider=v8`、`--coverage.include='src/**' --coverage.include='bin/**'`（未 import ファイルも集計対象）。

| 集計 | Stmts | Branch | Funcs | Lines |
| --- | --- | --- | --- | --- |
| 全体 | 89.27% | 81.06% | 89.50% | 90.47% |

低い順（`bin/cli.mjs` を含む）:

| ファイル | Stmts | Branch | Funcs | 未実行の中身 |
| --- | --- | --- | --- | --- |
| `bin/cli.mjs` | 0% | 0% | 0% | 全体（0/25行） |
| `src/builder/vite-typegen.ts` | 23.07% | 6.66% | 25% | `configResolved`(35) / `buildStart`(38) / `handleHotUpdate`(46) |
| `src/builder/shared.ts` | 30% | 66.66% | 50% | `buildConfigAwareKnown`(22) 全体 |
| `src/builder/astro.ts` | 64.28% | 33.33% | 25% | `astro:config:setup`(32) / `astro:build:start`(44) / known遅延解決(55) |
| `src/builder/vite-config-alias.ts` | 66.66% | 44.44% | 66.66% | `handleHotUpdate`(43) |
| `src/builder/vite.ts` | 78.57% | 66.66% | 25% | `configResolved`(49) / `buildStart`(52) / known遅延解決(61) |
| `src/builder/config-watcher.ts` | 81.81% | 84.61% | 83.33% | 55,56,63,67,68,81行 |
| `src/builder/dynamic-css.ts` | 83.33% | 68.62% | 78.26% | `isCoreConfigFile`(68) / `isCoreDistCssFile`(76) / `configResolved`(133) / `buildEnd`(170) / `closeBundle`(174) |
| `src/purge/astro.ts` | 89.65% | 78.43% | 100% | 28-34, 55, 99, 173行 |
| `src/purge/core.ts` | 90.69% | 81.86% | 100% | 属性セレクタ演算子・at-statement など（22/262行） |

`serialize.ts` は 96.26%。`build.test.ts` がファイル名に反して `serialize.ts` を対象にしているためで、**テスト漏れではない**（命名のズレのみ）。`typegen.ts` は stmt/branch/funcs すべて 100%。

## 軽量化候補

先に結論を書く。**実行時間を削る目的の候補は「無し」**。203テスト Duration 2.03秒、167件が10ms未満で、件数削減は時間短縮にならない。以下に挙げるのは (A) 壊れやすさの解消、(B) 保護になっていないアサーションの修正、(C) CI重複の解消、(D) 可読性目的の統合、の4種であり、いずれも件数削減や時間短縮を主目的にしていない。

### 前提: 削減余地の上限（実測）

| 実行対象 | Duration | wall clock | 件数 |
| --- | --- | --- | --- |
| 全17ファイル | 2.03秒 | 2.59秒 | 203 |
| 重い3ファイル（next / webpack / config-watcher）を除外 | 1.13秒 | 1.67秒 | 180 |
| 軽い10ファイルのみ | 456ms | 1.08秒 | 155 |

重い3ファイルを**丸ごと消しても** Duration は 2.03秒 → 1.13秒（0.9秒減）にしかならない。実際には3ファイルとも固有の保護（webpack の tapable 配線、next の Turbopack 制約、watcher の scope 判定）を持つので削除はできず、**現実的な削減余地は 0.4〜0.6秒程度**。

wall clock は並列実行なので律速は最長ファイル1本。ラダーは webpack 1496ms → next 1400ms → config-watcher 1063ms → generated-css 849ms と密に並んでおり、1本だけ速くしても次が律速になる。`webpack.test.ts` を describe 単位で2分割する（`追加 plugin の挙動` の705ms を別ファイルへ）のは coverage を落とさず実行できるが、律速が next.test.ts に移るだけで効果は約0.1秒。

一方、定常 2.03秒に対し `next.test.ts:94` の flake を引くと 17.83秒（約8.8倍）になり、その再現率は turbo 経由で3回中1回（実測）。**平均実行時間を0.5秒削る施策より、この最悪ケースを消す施策のリターンが桁違いに大きい**。軽量化の投資はここに絞るべきで、それが次の[高]である。

### [高] 要確認: `next.test.ts:94` の watch テストがタイムアウト限界に張り付いている

- 対象: `packages/plugin/src/builder/next.test.ts:94`（テスト単体タイムアウト 20000ms、ポーリング予算 16000ms は `next.test.ts:112`）
- 現在のコスト: **単独実行 383〜461ms（4回実測すべて成功）／`turbo run test --force` 経由で3回中1回失敗（1回目: watch テスト 17302ms・ファイル Duration 17.83秒、2回目 2.03秒、3回目 2.02秒）**。`.turbo/turbo-test.log`（2026-08-06 22:24）にも 16213ms での失敗が記録されている。同じコミット・同じコードで結果が変わっており、**再現率は約33%**。
- 根拠: 検証経路が「実 `fs.watch`（macOSはFSEvents） → `config-watcher.ts` の debounce → onChange 内で実 sass コンパイル + 型再生成」の3段非同期連鎖で、完了判定が `while (Date.now() - start < 16000)` のポーリング（`next.test.ts:112-114`）。`turbo run test` は test スクリプトを持つ8ワークスペース（lism-cli / lism-css / ui / mcp / mockup / plugin / catalog / docs）を既定 concurrency 10 で並列実行するため、CPU が飽和すると sass コンパイルが遅延して 16秒予算を超える。テスト自身のコメント（`next.test.ts:110`）も「初回 + FSEvents エコー + 実変更の再生成が積み上がる」と認めている。
- 残る保護: `config-watcher.test.ts:40-105` が `watchLismConfig` 単体の変更検知・無関係ファイル無視・close後の非発火をモック `onChange` で検証済み。`generated-css.test.ts` が CSS 再生成を、`gen-types.test.ts:259-325` が `lism-env.d.ts` の書き出し・不変時mtime維持・マーカー安全性を検証済み。つまり「部品」はすべて別途守られている。
- 失われる可能性: このテストだけが「dev フェーズで next.ts が watcher を実際に起動し、再生成まで到達する」という**配線の通し**を見ている。単純に削除すると `next.ts:82` 付近の watcher 起動漏れを検知できなくなる。
- 改善案: 削除ではなく、判定を実時間から切り離す。`webpack.test.ts:137-190` が採っている「フックのコールバックを捕捉して直接発火させる」決定的な方式へ寄せるのが最も筋が良い（同じパッケージ内に既に手本がある）。具体的には `withLism` に watcher の `onChange` を外部から取得・発火できる経路を用意するか、`watchLismConfig` をテスト時に差し替え可能にして「dev フェーズで watchLismConfig が正しい configPath で呼ばれること」だけを検証する形に分解する。実 `fs.watch` の検証は `config-watcher.test.ts` に任せる。
- 想定効果: 実行時間 約380ms → 数ms（推定）。より重要なのは **最悪ケースの 17.83秒が消える**こと。turbo 経由で3回中1回失敗する（実測）ため、CI でも同程度の頻度で赤くなっている可能性が高い。
- 根拠の強さ: **高**。守る振る舞い・重複先・失敗の実ログ・再現率（3回中1回）をすべて実測で特定できている。

### [中] 要確認: 実時間依存テストのタイムアウトが CI 実測に追随して延び続けている

- 対象: `packages/plugin/src/builder/webpack.test.ts:154`、`packages/plugin/src/builder/webpack.test.ts:190`（ともに 15000ms）
- 現在のコスト: ローカル実測はそれぞれ 298ms / 407ms。**タイムアウト値は実測の約37倍**。この2箇所は `53fba4d7`（2026-08-03、「Modal.stories.tsxとwebpack.test.tsのタイムアウトをCI実測に合わせて延長」）で 15000ms へ引き上げられた。
- 根拠: 実測300〜400msのテストに15秒のタイムアウトが必要になっているのは、CI 並列負荷下で実 sass コンパイルが桁違いに遅くなることの裏返し。上の `next.test.ts` と同じ構造的原因を指している。タイムアウト延長は症状の抑制であり、原因（並列負荷下の実コンパイル）には触れていない。
- 残る保護: なし（この項目はテスト削除の提案ではなく、構成の指摘）。
- 失われる可能性: 該当なし。
- 改善案: 2案ある。(1) `turbo run test` の concurrency を絞る（例 `turbo run test --concurrency=4`）か、CI の test ジョブでワークスペースを分割して同時実行数を下げる。(2) `next.test.ts` / `webpack.test.ts` の watch 系検証を決定的方式に寄せ、実コンパイル回数を減らす。(1) は全パッケージに効くが CI 全体時間が伸びる可能性があり、(2) は plugin 内で完結する。**(2) を先に行い、それでも不足なら (1)** を推奨。
- 想定効果: タイムアウト値を実測に見合う水準（2〜3秒）へ戻せるようになる。CI 時間そのものの削減効果は未計測。
- 根拠の強さ: **中**。コミット履歴とローカル実測は確認済みだが、CI 実測値（GitHub Actions のログ）は参照していない。

### [中] 修正（削除ではない）: キャッシュを検証できていない2件のアサーション

- 対象: `packages/plugin/src/builder/compile-entry.test.ts:137`（「同一 config・同一エントリはキャッシュされ同一結果を返す」14ms）、`packages/plugin/src/builder/compile-entry.test.ts:145`（「dispose 後も再コンパイルできる」28ms）
- 現在のコスト: 合計42ms。実行時間としては無視できる。
- 根拠: 両方とも `expect(a).toBe(b)` で**文字列同士**を比較している。JS の文字列プリミティブは内容が同じなら常に `Object.is` で真になるため、このアサーションは「キャッシュがヒットしたこと」を一切検知できない。`createCssCompiler` からキャッシュ機構を丸ごと削除して毎回再コンパイルするよう壊しても、出力が決定的である限り両テストは通り続ける。テスト名（「キャッシュされ」）と実際に検証している内容（「決定的である」）がズレている。
- 残る保護: キャッシュ**無効化**の側は `compile-entry.test.ts:75`（「tokens のインライン値が CSS に注入され、値だけの変更でもキャッシュが更新される」）が実質的に守っている（`configSignature` のトークン値ハッシュ化の回帰テスト）。つまり「変えたら変わる」は守られており、「変えなければ再計算しない」だけが未検証。
- 失われる可能性: 現状でも「決定的な出力である」ことの確認にはなっているため、修正せず放置しても保護が減ることはない。ただし**キャッシュが効いているという誤った安心感**を与えている。
- 改善案: 削除せず、検知可能なアサーションに変える。`compile` の呼び出し回数ではなく、実コンパイルの発生を観測できる指標（例: `createCssCompiler` に compile 実行回数のカウンタを持たせる、または `dispose` 前後で作業ディレクトリの mtime / 作成回数を見る）と比較する。`dispose` 側は「再コンパイルできる（=作業ディレクトリが作り直される）」ことが主眼なので、`toBe` 比較ではなく作業ディレクトリが再作成された事実を確認するのが素直。
- 想定効果: 実行時間の削減はほぼゼロ。効果は「キャッシュ機構の回帰を実際に検知できるようになる」こと。
- 根拠の強さ: **高**。アサーションの性質はコード上で確定でき、代替の保護先（`compile-entry.test.ts:75`）も特定できている。

### [中] CI重複解消: vitest の `typecheck` が `pnpm typecheck` と同じ検査を二重に行っている

- 対象: `packages/plugin/vite.config.js` の `test.typecheck.enabled: true`
- 現在のコスト: テスト実行あたり 0.05〜0.51秒（実行ごとの変動幅と重なるため下限は断定できない）。CI では test ジョブと typecheck ジョブの**両方**で型検査が走る。
- 根拠: 3点を確認した。(1) `packages/plugin` に型テストファイル（`*.test-d.ts`）が **0件**。(2) `expectTypeOf` / `assertType` の使用箇所も **0件**（`src/` 全体を grep）。(3) `tsconfig.json` の `include: ["src"]` は17個のテストファイルすべてを含み、`pnpm typecheck`（`tsc --noEmit`）が `--listFiles` で実際に17ファイルを読んでいることを確認済み。つまり vitest 側の型検査は「テストファイルの型エラー検出」しかしておらず、それは `tsc --noEmit` が既に行っている。**固有の検知能力がない。**
- 残る保護: `pnpm typecheck`（`turbo.json` の `typecheck` タスク、CI では専用ジョブ）が同じ範囲を同じ `tsconfig.json` で検査する。型エラーの検出漏れは発生しない。
- 失われる可能性: 型エラーが「テストの失敗」として表示されなくなり、`pnpm typecheck` を実行するまで気づかないケースが出る。ローカルで `nr test` だけを回す運用をしている場合はフィードバックが遅れる。逆に、将来 `*.test-d.ts` による型テストを導入するなら `typecheck.enabled` は必要になる。
- 改善案: 2案。(A) `test.typecheck.enabled` を外し、型検査は `pnpm typecheck` に一本化する。(B) 残すなら `typecheck.include` を `['**/*.test-d.ts']` に絞り、「型テスト専用」という役割を明示する（型テストを書き始めたときに機能する形にしておく）。**(B) を推奨** — 削減効果が小さいうえ、役割分担が明確になるため。
- 想定効果: 0.05〜0.5秒（実測の幅そのまま）。CI では test ジョブ側の型検査が消える。件数は変わらない。
- 根拠の強さ: **中**。「固有の検知能力がない」ことは型テスト0件・`tsc` が同一ファイルを検査していることの実測で示せたが、削減時間そのものは変動幅に埋もれており正確に測れていない。

### [低] 統合: 同じ分岐を通る2件（`findUserConfigPath` の明示 configPath）

- 対象: `packages/plugin/src/builder/load-config.test.ts:83`（「configPath が指定されていれば projectRoot からの相対パスを優先する」1ms）と `packages/plugin/src/builder/load-config.test.ts:123`（「明示 configPath に `.ts` を渡せる」0ms）
- 現在のコスト: 合計1ms未満。
- 根拠: `load-config.ts:79-83` の明示 `configPath` 経路は拡張子を一切見ず `path.resolve` + `existsSync` するだけ。`:123` は `:83` の入力拡張子を変えただけで、新しい分岐を通らない。
- 残る保護: `:83`（明示パス優先）と `:92`（存在しない明示パスはフォールバックしない）で明示 configPath 経路の分岐は網羅済み。拡張子ごとの探索優先順は `:99` / `:106` / `:115` が別に守っている。
- 失われる可能性: 「`.ts` を明示指定できる」ことのドキュメント的な明示性は下がる。`test.each` で拡張子をパラメータ化すれば両方残せる。
- 改善案: `test.each(['lism.custom.mjs', 'lism.custom.ts'])` へ統合する。
- 想定効果: 1件減、実行時間の効果はゼロ。可読性のみ。
- 根拠の強さ: **高**（重複先と残る保護をコードで特定済み）。ただし優先度は低い。

### [低] 統合: プラグイン名配列の同一アサーション

- 対象: `packages/plugin/src/builder/vite.test.ts:42`（「typegen:false でも typegen プラグイン自体は構成に残る」0ms）
- 現在のコスト: 0ms。
- 根拠: 期待値の配列が `vite.test.ts:23`（「purge なし: 3プラグイン」）と**完全に同一**。テスト自身のコメントも「名前一覧は変わらない」と明言している。`typegen: false` の実効果（`buildStart` が no-op になること）は検証していない。
- 残る保護: `vite.test.ts:23` が同じ配列を検証済み。
- 失われる可能性: 「`typegen: false` でもプラグイン構成が変わらない」という仕様の意図表明が消える。ただし後述の「テスト漏れ」で挙げるとおり、`typegen: false` の実効果（`vite-typegen.ts:38` の `buildStart`）は現状どこからも検証されていない。
- 改善案: 削除するより、`vite-typegen.ts` の `buildStart` を直接呼んで「disabled のとき `.d.ts` を書かない」ことを確認するテストへ**格上げ**する。next / webpack 側には同等のテスト（`next.test.ts:86`、`webpack.test.ts:202`）が既にあるため、Vite 側にだけ無いのが実態。
- 想定効果: 実行時間の効果はゼロ。効果は Vite 側の未検証分岐が1つ埋まること。
- 根拠の強さ: **高**（期待値が同一であることはコード上で確定）。

### [低] 統合: `.js` / `.ts` config で同じ検証を2回する実 sass テスト

- 対象: `packages/plugin/src/builder/scss-source.test.ts:76`（`.js`、79ms）と `packages/plugin/src/builder/scss-source.test.ts:90`（`.ts`、115ms）
- 現在のコスト: 合計194ms（ファイル全体363msの53%）。ただし `scss-source.test.ts` は律速ではないため wall clock への効果はゼロ。
- 根拠: 両者の検証構造（`userConfigPath` 確認 → 生成 `_lism-config.gen.scss` の内容確認 → 実 sass コンパイル後の CSS 確認）が丸ごと同一で、差分は config の拡張子と型注釈の有無だけ。
- 残る保護: `.js` / `.mjs` / `.ts` の探索順と jiti による `.ts` 評価は `load-config.test.ts:99-129`（合計3ms、実 sass なし）が既に検証している。`.ts` 側（`:90`）を残せば「TS構文の config が CSS まで反映される」通し確認も維持できる。
- 失われる可能性: `.js` config 特有の不具合（例: jiti が `.js` を別経路で読む場合の差異）を実コンパイルまで通して検知できなくなる。`load-config.ts` は拡張子で分岐していないため実害は低いと判断するが、断定はできない。
- 改善案: `.ts` 側（`:90`）のみ残し、`.js` 側（`:76`）を削除。または `test.each` で拡張子をパラメータ化して重複コードだけ削る（この場合実行時間は変わらない）。
- 想定効果: 約79ms削減（推定）。wall clock への効果はゼロ。効果は保守対象コードの削減のみ。
- 根拠の強さ: **中**。重複先と残る保護は特定できたが、「`.js` 固有の経路差が本当に無い」ことは `load-config.ts` の読解に基づく判断で、実験では確認していない。

### 候補として検討したが提示しないもの

以下は「重複しているように見えるが、削っても得るものが無い」と判断した。

- **`purge/core.test.ts` の `:is()`/`:where()`、`:not()`/`:has()` の対称テスト**（27件・合計4.1ms）: 同じ分岐を別の擬似クラス名で通しているのは事実だが、検証目的が「対象リストに実際に含まれているか」であり、名前ごとの確認そのものが保護。かつ4.1msで27件が終わるため削減効果は皆無。
- **`purge/extract.test.ts` / `purge/shared.test.ts` のプレフィックス7種反復**（合計4.2ms）: `test.each` 化は可読性の改善に留まる。
- **`purge/vite.test.ts:204` の実 vite ビルド e2e**: 静的な読解では「最も重いテスト」に見えるが、**実測84ms**。ファイル全体でも91ms。実バンドラで動く保証が84msで買えているので、削る理由がない。
- **`--pool=threads` への切り替え**: 実測で既定の forks より 4.9% 遅い（2.13秒 vs 2.03秒）。軽量化にならない。
- **`next.test.ts` の alias 系4件が `webpack-alias.test.ts` と結論を共有している点**: 「コストの正体」で述べたとおり、alias の形しか見ない4テストも `next.ts` の無条件コンパイルによって実 sass（各162〜340ms）を払っている。ただし `next.test.ts` 側は「`withLism` が両 alias を実際に注入する」配線を見ており、純粋関数テストでは代替できない。実 sass を回避するには `next.ts` に CSS 生成を抑止する経路（webpack 側の `css` オプション相当）を追加する必要があり、実装変更を伴うため監査範囲外とした。**要確認**として記録するに留める。

## テスト漏れ

### [高] `bin/cli.mjs` — 公開CLIがカバレッジ0%

- 対象: `packages/plugin/bin/cli.mjs:1-63`（実測 0/25行、stmt/branch/funcs すべて 0%）
- 問題: `package.json:27` で `lism-css` コマンドとして公開され、`documents/lism-config.md:132-139` と `skills/lism-css-guide/customize.md:300-306` が `npx lism-css build` / `--full` を正規の手段として案内している。それにもかかわらず、次のどれも検証されていない。
  - `build` で `dist/css` に CSS が生成されること（`cli.mjs:35-41`）
  - `--full` 指定時に `full.css` / `full_no_layer.css` が追加生成され、未指定時は `ignore` されること（`cli.mjs:40`）
  - サブコマンド無指定で Usage を出し、終了コード0で終わること（`cli.mjs:45-52`）
  - 未知サブコマンドで `Unknown command:` を stderr に出して**終了コード1**で終わること（`cli.mjs:54-56`）
  - 例外時に終了コード1で終わること（`cli.mjs:59-63`）
  - さらに `cli.mjs` は `../dist/builder/index.js`（ビルド成果物）を import するため、**ビルド後の `exports` 経路が壊れていても src ベースのテストでは検知できない**。
- 改善案: 子プロセスで実 CLI を起動する smoke テストを1ファイル追加する。`packages/mockup` の CLI テスト（`src/commands/*.test.ts`）が同じ構造の先例になる。最小構成は3ケース: (1) 一時ディレクトリで `build` を実行して主要 CSS が生成される、(2) `--full` で full 系が増える、(3) 未知コマンドで exit code 1。`dist` 依存のため turbo の `test` タスクが既に `dependsOn: ["^build"]` を持っている点は好都合だが、**自パッケージの build には依存していない**（`^build` は依存パッケージのみ）ので、CLI テストを追加する場合は `@lism-css/plugin#test` に自身の `build` 依存を足す必要がある。

### [高] Vite / Astro 統合のフックが1つも実行されていない

- 対象:
  - `packages/plugin/src/builder/astro.ts:32`（`astro:config:setup`）、`packages/plugin/src/builder/astro.ts:44`（`astro:build:start`）、`packages/plugin/src/builder/astro.ts:55`（known 遅延解決）
  - `packages/plugin/src/builder/vite.ts:49`（`configResolved`）、`packages/plugin/src/builder/vite.ts:52`（`buildStart`）、`packages/plugin/src/builder/vite.ts:61`（known 遅延解決）
  - `packages/plugin/src/builder/vite-typegen.ts:35`/`:38`/`:46`（全3フック。branch 6.66%）
  - `packages/plugin/src/builder/vite-config-alias.ts:43`（`handleHotUpdate`）
  - `packages/plugin/src/builder/dynamic-css.ts:133`（`configResolved`）、`:170`（`buildEnd`）、`:174`（`closeBundle`）
- 問題: `vite.test.ts` の10件中6件（`:23-45`、`:101-109`）は**プラグイン名の配列とintegrationの個数しか見ていない**（合計1ms）。フックの中身は一度も走らない。結果として、Vite / Astro 利用者に影響する次の動作が未検証。
  - Astro: `updateConfig({ vite: { plugins: [...] } })` に3プラグインが正しく渡ること、`root` が `config.root` から解決されること（`astro.ts:33`）
  - Vite / Astro: dev 中に `lism.config.*` を変更したとき full-reload / 型再生成が走ること（`vite-config-alias.ts:43`、`vite-typegen.ts:46`）。next / webpack には同等のテストがあるのに Vite / Astro には無い。
  - `typegen: false` の実効果（`vite-typegen.ts:38` の `buildStart` が no-op になる）。next（`next.test.ts:86`）・webpack（`webpack.test.ts:202`）にはある。
- 改善案: `webpack.test.ts:137-190` と同じ「フックを取り出して直接呼ぶ」方式が `vite.test.ts:13-20` の `callConfigHook` ヘルパーとして既に存在する。これを `configResolved` / `buildStart` / `handleHotUpdate` にも広げれば、実バンドラ起動なしで検証できる。Astro は `astro:config:setup` に `{ config, updateConfig }` のスタブを渡し、`updateConfig` が受け取ったプラグイン名を検証するだけで大半の穴が埋まる。

### [高] purge の `known` 自動構築が未検証（CSS が消える方向の障害）

- 対象: `packages/plugin/src/builder/shared.ts:22`（`buildConfigAwareKnown`、stmt 30%）と、その結果を使う `packages/plugin/src/builder/vite.ts:61` / `packages/plugin/src/builder/astro.ts:55`
- 問題: `purge` を `known` 未指定で有効にした場合（README / skill が案内する既定の使い方）、ビルド開始時に `buildConfigAwareKnown` が config 反映済み full.css をコンパイルして known セレクタ集合を作る。この関数が**一度も実行されていない**。さらに:
  - 失敗時は `shared.ts:28` の `catch` が黙って `undefined` を返し、同梱 full.css 由来のデフォルト（`purge/shared.ts:14` `loadDefaultKnownSelectors`）へフォールバックする。この分岐が起きると、**ユーザーが `lism.config` で追加した custom prop / token 由来のクラスが known に含まれず、purge が削除対象と判定する**。
  - `buildStart` / `astro:build:start` より前に purge が走る順序事故も、フックが未実行のため検知できない。
  - 参考: `loadDefaultKnownSelectors` 自体の正常系は `purge/vite.test.ts` の `known` 未指定テスト経由で実行されている（実測: 分離実行では0回、全体実行では100%）。未検証なのは `shared.ts:19` の失敗時フォールバックのみ。
- 改善案: `buildConfigAwareKnown` に対する直接テストを2ケース追加する。(1) custom prop を含む `lism.config` を与えたとき、その prop 由来のクラスが返り値に含まれる。(2) 壊れた config（または存在しない `scssDir`）で `undefined` が返り、例外が漏れない。加えて `vite.ts:61` / `astro.ts:55` の遅延解決クロージャを直接呼び、`knownRef.value` 未設定時にデフォルトへ落ちることを確認する。

### [中] `purge/core.ts` の属性セレクタ演算子が2種しか通っていない

- 対象: `packages/plugin/src/purge/core.ts:245-259`（`attrMatchesClass`）、未実行分岐 246 / 249 / 253 / 255 / 257 行。`packages/plugin/src/purge/core.ts:262`（`!attr.value` の即true分岐）も未実行。
- 問題: `core.test.ts`（27件）が通しているのは `*=`（`:63`,`:138`,`:145`）と `^=`（`:109`）のみ。`[class=...]`（完全一致）・`[class~=...]`（トークン一致）・`[class$=...]`（末尾一致）・`[class|=...]`（ハイフン区切り前方一致）・`[class]`（値なし）の5分岐が未検証。属性セレクタの判定を誤ると **有効な CSS ルールを削除する**（消える方向）か、逆に purge が効かなくなる。`purge/core.ts` は自前の文字列パーサーで、ここが判定の中核。
- 改善案: `test.each` で5演算子分を1テストに追加する。`core.test.ts` は27件4.1msなので、コストはほぼゼロ。

### [中] `minify: true`（cssnano）経路がテストから一度も通らない

- 対象: `packages/plugin/src/builder/compile.ts:35`（未実行分岐）、既定値は `compile.ts:77` / `compile.ts:129` / `generated-css.ts:53` で `minify = true`
- 問題: `generated-css.test.ts` は3件すべて `minify: false` を明示（`generated-css.test.ts:21`,`:40`,`:51`、コメントに「テストを軽くする」と明記）。`webpack.ts:106`/`:139` と `next.ts:73`/`:88` も `minify: false` を渡す（バンドラ側が最終 minify する設計）。**既定値 `true` を使うのは `bin/cli.mjs:35-41` だけで、その CLI がカバレッジ0%**。結果として autoprefixer + cssnano を通す出力が一度も検証されていない。cssnano / autoprefixer のバージョン更新で出力が壊れても検知できない。
- 改善案: 上記「`bin/cli.mjs` の smoke テスト」で自然に埋まる（CLI が既定 `minify: true` を使うため）。単独で埋めるなら `compile.ts` の `buildCssToDir` を `minify` 省略で1回呼び、出力が圧縮されている（改行・空白が落ちている）ことを確認する1ケースで足りる。

### [中] `purge` の `report` オプションの配線が未検証

- 対象: `packages/plugin/src/purge/vite.ts:145`（未実行）、`packages/plugin/src/purge/astro.ts:173`（未実行）
- 問題: `report: true` で削減バイト数をログ出力する機能。`purge/vite.test.ts` / `purge/astro.test.ts` は全17テストで `ctx.info` / `logger.info` の `vi.fn()` モックを用意しているが、**`report: true` を渡すテストが1件も無く、呼び出しをアサートしていない**。`formatReport` 単体は `purge/shared.test.ts:68-76` で検証済みなので、未検証なのは「hook から実際に呼ばれるか」の配線のみ。ユーザー影響は小さい（ログが出ないだけ）が、既にモックが用意されている分アサーションを1行足すだけで埋まる。
- 改善案: 既存テストの1つに `report: true` を渡し、`ctx.info` が `CSS: ... bytes` を含む文字列で呼ばれることを確認する。

### [低] `purge/core.ts` の at-statement 経路と壊れたCSSの扱い

- 対象: `packages/plugin/src/purge/core.ts:363`/`:364`（`iterateTopLevel` の at-statement 検出）、`packages/plugin/src/purge/core.ts:446`/`:447`（`processSegments` の at-statement 素通し）
- 問題: `@charset "UTF-8";` や `@import url(...);` のような `;` 終端の at-rule を入力に含むテストが無い。また `findBlockEnd` / `findStringEnd` / `findCommentEnd` の「終端が見つからず `css.length` を返す」フォールバック（壊れたCSS）も未検証。実際のビルド出力に `@charset` が現れる可能性は低くはない。
- 改善案: `core.test.ts` に `@charset` を含む入力を1ケース追加（素通しされ、後続ルールの判定も壊れないことを確認）。壊れたCSSは「例外を投げず原文を返す」ことを1ケース確認すれば十分。

### [低] `serialize.ts` の `bp` 異常系

- 対象: `packages/plugin/src/builder/serialize.ts` 未実行行 47 / 148 / 158 / 251、未実行分岐 46 / 76 / 128 / 145 / 157 / 251
- 問題: `bp` が配列指定のときの末尾カンマ処理、`bp` の型が不正なときの `TypeError`、キー特殊文字（`/` `%` `:`）のエスケープの一部が未検証。`build.test.ts`（26件27ms）が `serialize.ts` を 96.26% まで守っているので残りは少ない。ユーザー影響は「不正な config を書いたときのエラーメッセージ品質」に限られる。
- 改善案: `build.test.ts` に不正 `bp` で `TypeError` を投げる1ケースを追加。優先度は低い。

### [低] `config-watcher.ts` / `dynamic-css.ts` の周辺分岐

- 対象: `packages/plugin/src/builder/config-watcher.ts:55`,`:56`,`:63`,`:67`,`:68`,`:81`／`packages/plugin/src/builder/dynamic-css.ts:68`（`isCoreConfigFile`）,`:76`（`isCoreDistCssFile`）,`:133`,`:170`,`:174`
- 問題: watcher の再起動・エラー時処理と、dev 中に lism-css 本体の SCSS / dist CSS が変わったときの判定関数が未実行。後者は `a95005e3`（「fix: docs devでcore CSS更新を反映」）で追加された機能に対応する箇所で、**修正コミットに対応する回帰テストが部分的**。
- 改善案: `isCoreConfigFile` / `isCoreDistCssFile` は純粋な判定関数なので、パス文字列を渡す直接テストを数件追加すればコストゼロで埋まる。

## 構成上の問題

### CI で `pnpm build` が3回走っている

`.github/workflows/test.yml` は build → (typecheck / lint / test) の4ジョブ構成で、build ジョブが `packages/*/dist` を artifact としてアップロードし、後続ジョブがダウンロードしている。しかし:

- `turbo.json` の `test` と `typecheck` はどちらも `dependsOn: ["^build"]`。
- ワークフローに turbo のローカルキャッシュ（`node_modules/.cache/turbo`）を永続化するステップが無く、`TURBO_TOKEN` / `TURBO_TEAM` によるリモートキャッシュ設定も無い（確認済み）。`actions/setup-node` の `cache: "pnpm"` は pnpm ストアのキャッシュで、turbo キャッシュではない。

したがって typecheck ジョブと test ジョブは、artifact をダウンロードしたうえで**改めて依存パッケージの build を全部実行する**。artifact のアップロード / ダウンロード自体がほぼ無駄になっている。改善案は3つあり、どれか1つでよい。

1. build / typecheck / test の各ジョブで `.turbo` と各パッケージの `dist` を `actions/cache` で共有する（turbo のキャッシュヒットで build がスキップされる）
2. Turborepo Remote Cache を設定する
3. ジョブ分割をやめて1ジョブで `pnpm build && pnpm typecheck && pnpm lint && pnpm test` を直列実行する（turbo のローカルキャッシュが同一ジョブ内で効く）

これはリポジトリ全体の構成であり `@lism-css/plugin` 固有ではないが、plugin のテストが実行される経路上のコストなので記録する。

### `turbo run test` の並列度が実時間依存テストを壊している

test スクリプトを持つワークスペースは8つあり、turbo の既定 concurrency は10なので実質すべてが同時に走る。この負荷下で `@lism-css/plugin` の watch / 実 sass テストがタイムアウト限界に近づいていることは、「軽量化候補」の[高]（`next.test.ts:94` の実失敗ログ）と[中]（`53fba4d7` のタイムアウト延長）に記録した。plugin 側を決定的方式へ寄せるのが本筋だが、暫定策として `--concurrency` の指定も選択肢になる。

### テストファイル名と検証対象がズレている箇所

`packages/plugin/src/builder/build.test.ts`（269行 / 26件）は全編 `./serialize` のみを import しており、実際には `serialize.ts` のテスト。`serialize.test.ts` という名前ならカバレッジ状況が一目でわかる。同様に `packages/plugin/src/builder/vite.test.ts` は `vite.ts` / `vite-config-alias.ts` / **`astro.ts`** の3ファイルを対象にしており、`astro.ts` に専用テストが無いことが名前から見えにくい（実際に本監査でも一度、対象ファイルの取り違えが起きた）。リネームは任意だが、`astro.ts` のテストを追加する際は `astro.test.ts` として分けるのが望ましい。

### vitest 設定が `vite.config.js` に同居している

`packages/plugin/vite.config.js` の `test` フィールドに vitest 設定が入っており、専用の `vitest.config.*` は無い。現状は `environment: 'node'` と `typecheck.enabled: true` だけだが、後者は「軽量化候補」の[中]のとおり `pnpm typecheck` と重複している。[#507](https://github.com/lism-css/lism-css/issues/507) の指摘11（設定の置き場所がバラバラ）と同じ状況。カバレッジのしきい値や CLI smoke テスト用の設定（タイムアウト、`pool` 指定など）を入れる段階で分離を検討するとよい。

## 意図的な重複として残すもの

- **`webpack-alias.test.ts`（5件1.2ms）と `next.test.ts:24`/`:57`**: どちらも「webpack は絶対パス / Turbopack は `./` 相対」という結論に触れるが、前者は純粋関数の単体検証、後者は `withLism` が両方を実際に注入する配線検証。Turbopack が絶対パスを受け付けないという Next 固有の制約は、純粋関数テストだけでは配線漏れを検知できない。
- **`purge/vite.test.ts:120` と `purge/astro.test.ts:133`（8文字未満末尾をハッシュ扱いしない）**: 一見同じ検証だが、判定正規表現が Vite 用（`^(.+)([.-])([A-Za-z0-9_-]{8})\.css$`）と Astro 用（`^(.+)\.([A-Za-z0-9_-]{8})\.css$`）で別実装。#496 の回帰防止であり、片方だけでは他方の回帰を検知できない。
- **`purge/vite.test.ts` と `purge/astro.test.ts` の参照同期・sourcemap削除**: Vite は bundle オブジェクト操作（`viteMetadata.importedCss` / `manifest.json` / `delete bundle[key]`）、Astro はファイルシステム走査（`walk()` / `unlink()`）という完全に別の I/O 経路。両方必要。
- **`purge/astro.test.ts:230`/`:275`（server / static ビルド分岐）**: `4438146c`（#492「Astro SSR/hybrid構成でserver出力もスキャン」）の回帰テスト。Vite 側に対応概念が無いため重複ではない。
- **`config-watcher.test.ts`（3件）と `next.test.ts:94`**: どちらも `fs.watch` 経由の変更検知を通るが、前者は `watchLismConfig` 単体（debounce / 無関係ファイル無視 / close後の非発火）、後者は dev フェーズの通し配線。ただし後者は前述のとおり決定的方式への置き換えを推奨しており、その場合この重複は解消する。
- **`gen-types.test.ts` の低レベル関数14件（`:27-116`）と `generateLismEnvDts` 13件（`:118-257`）**: 入力→出力の対応は重複気味だが、統合側は「`declare module` ブロックが常に1つにまとまる」「`import type` が重複せず1行に集約される」というモジュール合成の不変条件（`:150`,`:172`,`:190`,`:205`,`:235`）を検証しており、単体側では代替できない。33件6.4msなので削減効果もゼロ。
- **`purge/core.test.ts`（27件）と `purge/vite.test.ts` / `purge/astro.test.ts` 内の purge 結果確認**: 後者は各テストで `.-p:20` が残り `.-m:10` が消えることを再確認しており、判定ロジック自体は `core.test.ts` の責務と重複する。ただしこれは「used 集合の構築（chunk.code / HTML からの抽出）が正しく `purgeLismCss` に渡っているか」という配線の確認であり、代表確認として1回は必要。実測1〜3msなので削る価値がない。

## 判断できなかった点・未確認の点

- **`next.test.ts:94` の CI 上での失敗頻度**。ローカルの `turbo run test --force` では3回中1回失敗した（実測）が、GitHub Actions のログは参照していないため、CI ランナー（ubuntu-latest / inotify）での再現率は不明。macOS の FSEvents 特有の遅延が要因の一部である可能性があり、Linux では頻度が異なりうる。
- **CI 実測時間**。`53fba4d7` が「CI実測に合わせて」タイムアウトを15000msへ延長した根拠となった実測値そのものは確認していない。ローカル実測（298ms / 407ms）との倍率だけを根拠にしている。
- **CI で `pnpm build` が3回走ることによる実時間の増加量**。turbo の依存解決とキャッシュ設定から論理的に導いた結論で、実際のジョブ所要時間は測っていない。
- **`attrCache`（`purge/core.ts:264`,`:293`）のメモ化が正しさを壊していないこと**。専用テストが無く、コード読解上問題なさそうという判断に留まる。
- **Windows でのパス変換**（`src/builder/normalize-path.ts`、`webpack-alias.ts` の相対パス化）。macOS 環境ではバックスラッシュ分岐に入らないため、実際の Windows 挙動は未確認。CI も ubuntu-latest のみ。
- **`bin/cli.mjs` の smoke テストが他パッケージに存在しないこと**。`packages/plugin` 外は grep で `bin/cli.mjs` を参照するテストが見つからなかったが、全ワークスペースを網羅的に読んではいない。
- **`vite-typegen.ts` / `vite-config-alias.ts` の `handleHotUpdate` が実 Vite dev サーバー上で正しく動いているか**。テストが無いため、現在の dev 体験が壊れていないことは「手動で使えている」という状況証拠に依存している。
- **本監査の範囲外だが目に入った点**: `packages/lism-css/src/lib/__tmp-debug.test.ts` というファイル名のテストが存在する。`@lism-css/plugin` の対象外なので内容は確認していないが、一時デバッグ用の残骸であれば整理対象かもしれない。

## 次のアクションの目安

安全性側は、「テスト漏れ」の[高]3件から着手する。

1. **CLI smoke テスト1ファイル**（[高] `bin/cli.mjs` と [中] `minify: true` 経路を同時に解消）: 子プロセスで実 CLI を起動する3ケース。turbo の `@lism-css/plugin#test` に自パッケージの `build` 依存を足す必要がある。
2. **Vite / Astro フックの直接呼び出しテスト**（[高] を解消）: 既存の `callConfigHook` ヘルパーを `configResolved` / `buildStart` / `handleHotUpdate` へ広げる。実バンドラ起動は不要。
3. **purge `known` 自動構築の直接テスト2ケース**（[高] を解消）: CSS が消える方向の障害に対する唯一の検知手段になる。

軽量化側は実測に基づく優先順位で次の通り。テスト件数の削減は167件が10ms未満のため効果ゼロで、やる意味がない。

| 順位 | 施策 | 効果 | 対象 |
| --- | --- | --- | --- |
| 1 | `next.test.ts:94` を決定的方式へ（軽量化候補の[高]） | **最悪ケース 17.83秒 → 3秒。再現率33%の赤が消える** | plugin 内で完結 |
| 2 | CI の turbo キャッシュ永続化（build の3重実行解消） | 未計測だがおそらく最大。テストコード側では縮まない | リポジトリ全体 |
| 3 | vitest `typecheck` の重複解消（軽量化候補の[中]） | 0.05〜0.5秒 + CI の二重型検査解消 | plugin 内で完結 |
| 4 | `webpack.test.ts` の分割・固定sleep短縮など | 合計 0.4〜0.6秒が上限 | plugin 内で完結 |

なお定常状態でテスト実行時間が最も長いのは `@lism-css/catalog`（40ファイル / 4.02秒）で、plugin（2.40秒）ではない。本監査の対象外だが、モノレポの CI 時間を縮める投資先としては catalog の方が大きい。
