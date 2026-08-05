# PR #539: 共有viteキャッシュの排他をrename占有方式に作り直す

> 状態: Ready

## 概要 / ゴール

PR #539（mockupの起動高速化）は、viteの依存キャッシュ（`cacheDir`）を`os.tmpdir()`配下の安定パスに置いて起動間で使い回す。しかし同じデータディレクトリで複数の`lism-mockup dev`を同時に起動すると、viteの依存キャッシュcommit（`fs.renameSync`の連続、プロセス間の排他なし）が競合し、ENOTEMPTY/ENOENTでcommitに失敗した側が依存最適化を失ったまま起動する（viteはエラーログ1行で続行するため、ブラウザ表示が壊れるのに原因が分かりにくい）。

これを「**cacheDir自体をrenameして占有する**」方式で防ぐ。完了時には次の状態になる：

- 共有キャッシュへ書き込むdevプロセスは常に高々1つ
- 2つ目のdevは起動を止めず、プロセス固有の一時ディレクトリへ退避する（キャッシュ再利用を諦めるだけ）。例外として、キャッシュがまだどこにも無い同時フレッシュ起動では、各プロセスが自pid名のディレクトリを新規作成してそれぞれ占有に成功する（書き込み先が別々なので安全。終了時に先勝ちで共有パスへ収束する）
- クラッシュ（SIGKILL含む）で残った占有は、次回起動が自動回収する

## 背景・前提

### 経緯（PRレビューB1の2ラウンド）

1. ラウンド1: 当初実装は「viteが`_metadata.json`を見て再最適化するのでロック不要」と想定していたが、vite 7.3.6のcommit処理（`chunks/config.js`の`commitProcessingDepsCacheSync`付近）にはプロセス間の排他がなく（リトライ付きrenameはWindows専用）、同時書き込みで壊れることが実証された。
2. ラウンド2: ロックファイル方式（`<cacheDir>.lock`を`wx`フラグで作成、pid記録、stale時はrename退避→pid検証→復元）を実装したが、**stale回収の競合で生きたロックを巻き込む窓**が指摘された：
   - AとBが同じstaleロック（死んだpid X）を読む
   - Bが先に回収して自分のロックを作る（Bが正当な保持者）
   - Aが遅れて`renameSync(lockPath, aside)`を実行 → Bの生きたロックを退避してしまう
   - 空いたlockPathをCが取得 → Aの復元は失敗し、BとCが両方保持者のまま並走
   - 根本原因は「lockPathという1つの共有地点を、全プロセスがrename元として使う」構造にある

### 採用方式（rename占有）が競合を構造的に防ぐ理由

- 各プロセスが書き込むのは常に**自分のpid名のディレクトリ**（`<共有パス>.inuse.<自pid>`）だけ
- renameの元になるのは「共有パス（renameの原子性で1者しか取れない）」か「死んだpidの残骸（所有者が既にいない）」だけ
- 生きたプロセスの占有ディレクトリ（`.inuse.<生きているpid>`）は、誰のrename元にもならない。ラウンド2の競合のような「生きた占有を第三者が動かす」操作が存在しない

### 検証済みの前提（vite 7.3.6の実物で確認済み）

- `getConfigHash()`のハッシュ対象は`root`/`resolve`/プラグイン名/`optimizeDeps`/`define`/`assetsInclude`のみで、**cacheDirのパスは含まれない**。パスがpidで変わってもconfigHash不一致による再最適化は起きない
- `_metadata.json`の`file`/`src`は、書き込み時に`path.relative(depsCacheDir, ...)`（`stringifyDepsOptimizerMetadata`）、読み込み時に`path.resolve(depsCacheDir, ...)`（`parseDepsOptimizerMetadata`）で処理される**cacheDir相対パス**。占有ディレクトリはすべて同じ親（tmpdir直下）の兄弟なので、rename後も相対パスの解決結果は変わらず、キャッシュは有効なまま
- `react({ exclude: [RegExp(cacheDir)] })`はプラグイン名しかハッシュされないため影響しない

### 現状のコード（このプランの変更対象）

- `packages/mockup/src/core/cache-lock.ts` + `cache-lock.test.ts`: ラウンド2のロックファイル方式。**全面的に破棄**
- `packages/mockup/src/core/runtime.ts`: `prepareViteCacheDir()`が`{cacheDir, lock}`を返し、`cleanup()`で`lock.release()`を呼ぶ統合の継ぎ目は**そのまま使う**（中身だけ差し替え）
- `packages/mockup/src/commands/dev.ts`: `prepareMockRuntime(dir, { exclusiveViteCache: true })`は**変更なし**
- `packages/mockup/src/core/tokens.ts`: `writeConfigModule()`のアトミック書き込み（temp→rename）は対応済みで**変更なし**
- `packages/mockup/src/commands/check.ts`: checkはビルドのみで依存最適化を行わず、cacheDirへ読み書きしない。占有には**参加させない**（変更なし）

## 実装プラン

### 1. `core/cache-lock.ts`と`cache-lock.test.ts`を削除

### 2. `core/cache-claim.ts`を新規作成

```ts
export interface ViteCacheClaim {
  /** 占有したcacheDirの絶対パス（`<共有パス>.inuse.<自pid>`）。 */
  readonly dir: string;
  /** 占有を返却する。2回以上呼んでも無害。 */
  release(): void;
}

export function claimViteCacheDir(sharedPath: string): ViteCacheClaim | null;
```

**claim（取得）の手順**：`inuse = "<sharedPath>.inuse.<自pid>"`として

0. `inuse`自体が既に存在するなら、何もせず`null`を返す。生存中のpidはOS内で一意なので、このパスを作れたのは「自プロセス（＝既に占有中。同一プロセスの二重取得）」か「同じpidを再利用した死んだ前任者の残骸」のどちらかで、いずれも取得しないのが安全。**このガードが必要な理由**：POSIXの`rename`は移動先が既存の空ディレクトリだと置換に成功するため、ガードなしで手順1を行うと（例：フレッシュ起動で空の`inuse`を持つ自プロセスと、返却済みの`sharedPath`が同時に存在する状況で）既存の占有と新しい取得が同じディレクトリを所有し得る。ガード自体は競合しない：`inuse`を新規に作れるのは生きている自プロセスだけで、Nodeはシングルスレッドのためチェックと後続操作の間に自プロセス自身が割り込むこともない
1. `renameSync(sharedPath, inuse)`を試す。成功なら占有完了（前回の温まったキャッシュを引き継ぐ）。失敗したら（ENOENT=共有パスなし、EPERM=他ユーザー所有等、理由を問わず）手順2へ
2. `sharedPath`の親ディレクトリを`readdirSync`し、`<basename>.inuse.<正の整数>`にマッチする項目を集める。`readdirSync`自体が失敗したら`null`
   - **生きているpid**（`process.kill(pid, 0)`が成功、またはEPERM）の項目が1つでもあれば`null`（使用中。呼び出し側が退避）
   - **死んでいるpid**の項目を順に`renameSync(残骸, inuse)`で回収を試す。成功なら占有完了。ENOENTなら別プロセスが先に回収した（＝いま生きた占有者がいる）ので`null`。それ以外の失敗（EPERM等）は次の候補へ
   - マッチ0件、または死んだ候補がEPERM等で全滅した場合は手順3へ
3. `renameSync(sharedPath, inuse)`をもう一度試す（スキャン中に他プロセスが返却した場合を拾う）。成功なら占有完了。失敗したら（理由を問わず）`mkdirSync(inuse, { recursive: true })`で新規作成を試す。成功なら占有完了、これも失敗したら`null`
4. 占有完了後、残っている死んだpidの残骸をbest-effortで`rmSync`する（失敗は無視。別プロセスが回収済みでもパスベースの削除はENOENTになるだけで、回収先を壊さない）

**エラーの収束規則**：`claimViteCacheDir()`は例外をthrowしない。上記の各手順で個別に定めた失敗はすべて「次の手順へ進む」か`null`（退避）へ収束させ、想定外の例外も関数全体の`try/catch`で`null`に落とす。不変条件「占有に失敗しても起動は失敗しない」を、この関数の契約として保証する。

**release（返却）の手順**：

1. 2回目以降の呼び出しは何もしない（フラグ管理）
2. `renameSync(inuse, sharedPath)`を試す。成功なら次回起動がこのキャッシュを引き継ぐ
3. renameが失敗した場合は、**理由を問わず**（`sharedPath`に別プロセスの返却済みキャッシュが既にあるENOTEMPTY/EEXISTのほか、`inuse`の消失、権限・I/Oエラー等も同じ扱い）、自分のディレクトリを`rmSync(inuse, { recursive: true, force: true })`でbest-effort破棄する
4. `rmSync`も失敗した場合（Windowsで開いたハンドルが残っている等）はそのまま放置する。プロセス終了後は死んだpidの残骸になるので、次回起動の手順2が回収する（壊れない）

**pidのパース**は正の整数のみ許可する（0以下を`process.kill()`に渡すとプロセスグループへのシグナルになるため）。`.inuse.`の後ろが正の整数としてパースできない項目は、この仕組みの管理対象外として無視する。

### 3. `runtime.ts`の`prepareViteCacheDir()`を差し替え

- `exclusive`（dev）のとき：`claimViteCacheDir(shared)`を呼び、成功なら`safeRealpath(claim.dir)`をcacheDirに使う。`null`なら既存の退避経路（`tempDir/vite-cache`）へ
- 非`exclusive`（check）のとき：従来どおり共有パスを返すだけ（読み書きしないため占有不要）
- 既存の`W_OK`チェックは削除してよい（他ユーザー所有のディレクトリはrename/mkdirの失敗として自然に退避・新規作成へ倒れる。sticky bit付きtmpでは他人の項目をrenameできずEPERMになるが、その場合も手順3の`mkdirSync`が自pid名で成功して起動は継続する）
- `resolveViteCacheDir()`のdocコメントを占有方式の説明に更新する

### 4. `prepareMockRuntime()`の例外時に返却する（PRレビューAdvisory対応）

占有取得より後の処理（`writeConfigModule()`・`buildTokensArtifacts()`等）を`try/catch`で囲み、throw時に`claim.release()`し、`tempDir`も`rmSync`（best-effort）で削除してから再throwする。この経路ではruntimeオブジェクトが返らず`cleanup()`も呼ばれないため、ここで消さないと一時ディレクトリが残留する。これによりエラー終了の直後の再起動でも、stale回収を待たずに共有キャッシュへ戻る。

前提として、`prepareMockRuntime()`の実行順は「`loadMockData()`（`tokens.json`の読み取り・検証を含む）→tempDir作成→claim取得→`writeConfigModule()`→`buildTokensArtifacts()`」であり、**不正な`tokens.json`はclaim取得前にthrowする**（この経路はtry/catchの対象外でよい）。検証方法は実装プラン手順8を参照。

### 5. `cleanup()`の解放をclaimに差し替え

`cacheDirLock?.release()`を`claim?.release()`に変更（呼び出し位置・経路は現状のまま：`dev.ts`の`process.once('exit')`/SIGINT/SIGTERM、`check.ts`のfinally、`createMockDevServer()`のcatch）。

### 6. `core/cache-claim.test.ts`を新規作成（同一プロセスの単体テスト）

同一プロセスで決定的に検証できる観点を担当する：取得・返却の基本動作、手順0の二重取得ガード（1回目のclaim保持中に2回目が`null`になり、1回目の占有ディレクトリが置換されないこと）、stale回収（`spawnSync(process.execPath, ['-e', ''])`で実際に終了した子プロセスのpidを使って残骸を作成し、内容物が引き継がれること）、返却時の収束（共有パスが既にあるときは自ディレクトリを破棄）、releaseの冪等性、パース不能な項目の無視。

### 7. 実プロセス間の競合テストを新規作成

前方式の欠陥は複数プロセスの交錯で発生したため、実際に別pidのプロセスを同時に走らせて検証する。

- `tsx`を`packages/mockup`のdevDependencyへ追加する（子プロセスがTSソースの`cache-claim.ts`を直接importするためのローダー。enginesの下限Node 20.19には型ストリップ機能がないため実行時ローダーが必要）
- 子プロセスハーネス`src/test-helpers/claim-child.ts`を作成する：引数で受け取ったsharedPathをclaimし、結果（成功/`null`・占有ディレクトリ・マーカーファイルの有無）をstdoutへJSON 1行で報告→親が作成するrelease指示ファイルをポーリングで待つ→`release()`して終了
- 親テストは`spawn(process.execPath, ['--import', 'tsx', ハーネスパス, ...])`で3〜4子を同時起動する
- インターリーブは固定できないため、**どの実行順でも成り立つ不変条件**をアサートする：
  - T1（共有キャッシュあり）: マーカー入り共有ディレクトリを用意。マーカーを引き継いで占有成功する子は**ちょうど1つ**。全子のrelease後、共有パスが1つだけ残ってマーカーを保持し、`.inuse.*`残骸がない
  - T2（フレッシュ）: 何も無い状態から同時起動。占有成功した子の占有ディレクトリは**全て相異なる**。release後、共有パスは高々1つ、残骸がない
  - T3（同一stale残骸）: 死んだpidのマーカー入り残骸を1つ用意。マーカーを引き継ぐ子は**高々1つ**（占有成功者が1子以上いればちょうど1つ）、占有ディレクトリの重複がない
- 子の待機とテスト全体に必ずタイムアウトを付ける。CI環境でこのテストが不安定になった場合は、子の数の削減やリトライで調整する（テスト自体の削除は要相談）

### 8. `prepareMockRuntime()`例外時返却のテストを新規作成

`vi.mock`はテストファイル全体に効くため専用ファイル（例：`src/core/runtime.claim.test.ts`）とし、`./tokens.js`のpartial mockで`buildTokensArtifacts()`をthrowさせる（手順4に書いた通り、不正な`tokens.json`はclaim取得前にthrowするので使えない）。マーカー入りの共有キャッシュを事前に作成→`prepareMockRuntime(dir, { exclusiveViteCache: true })`がrejectすることを確認→共有パスが復元されてマーカーを保持し、`.inuse.*`が残っていないこと、`tempDir`（`lism-mockup-`プレフィックスの一時ディレクトリ）が削除されていることを確認する。

### 9. `dev.test.ts`のアサーション調整

- 「cacheDirは共有の場所を指す」: `runtime.cacheDir`の期待値を`` `${resolveViteCacheDir(dataDir, ['lucide-react'])}.inuse.${process.pid}` ``に変更
- 競合テスト2件（同時起動で退避／cleanup後に再取得）: 期待パスを同様に調整。ロジックは維持
- afterAllの後片付け: `cleanup()`（=返却で共有パスへ戻る）の後に共有パスを`rmSync`する形に調整

### 10. 全テスト・typecheck・lintを実行

PRは既存の#539に追加コミットする（分割しない）。

## 設計判断の根拠

B1ラウンド2の指摘時に検討した4案から採用：

- **案1（stale回収専用の第2ロックで直列化）**: 却下。回収mutex自体がクラッシュで残ると以後の回収が恒久停止する、という新しい欠陥を持ち込む
- **案2（stale回収なし、取れなければ常に退避）**: 却下。クラッシュ1回で、OSのtmp掃除（macOSは3日周期）まで共有キャッシュが使えなくなる
- **案3（rename占有）**: 採用。上記「競合を構造的に防ぐ理由」参照。ロックファイルとcacheDir本体という2つの状態の整合を保つ必要もなくなる
- **案4（共有キャッシュをPRから外す）**: 最後の手段。PRの主要成果の一部を失う

## 不変条件

1. 1つのcacheDirディレクトリへ依存最適化を書き込むプロセスは常に高々1つ（各プロセスは自pid名のディレクトリにしか書かない）
2. 共有パス`lism-mockup-cache-<key>`が存在するのは「誰も使っていない」ときだけ
3. renameの元になるのは「共有パス」と「死んだpidの残骸」のみ。生きたプロセスの占有ディレクトリを他プロセスが動かす操作は存在しない（例外はpid再利用のABAのみ。受容済みリスク参照）
4. 占有に失敗しても起動は失敗しない（退避してキャッシュ再利用を諦めるだけで、機能は同一）。`claimViteCacheDir()`は例外をthrowせず、あらゆる失敗を`null`（退避）へ収束させる
5. 自分の`inuse`パスが既に存在する場合は決して取得しない（POSIXの`rename`が空ディレクトリの移動先を置換する挙動から、占有ディレクトリの所有一意性を守る。claim手順0参照）

## 状態と影響経路

対象の状態は`os.tmpdir()`直下（realpath化済み）の：

- `lism-mockup-cache-<key>`: 共有キャッシュ（未使用時のみ存在）
- `lism-mockup-cache-<key>.inuse.<pid>`: 占有中キャッシュ（devの生存中）

読み書きする経路の全数：

| 経路 | 操作 |
| --- | --- |
| devの起動（`prepareViteCacheDir`→`claimViteCacheDir`） | rename取得/残骸回収/mkdir新規/残骸掃除 |
| devの実行中（viteの依存最適化） | `claim.dir`配下への読み書き（vite任せ） |
| devの終了（`cleanup()`→`release()`） | 共有パスへrename返却、または自ディレクトリ破棄 |
| `prepareMockRuntime()`の例外（手順4） | `release()`（同上） |
| check | 共有パスを設定値として参照するのみ。読み書きなし |

`lism-mockup-config-<key>`（生成configの共有）は本プランの対象外（`writeConfigModule()`のアトミック書き込みで対応済み。内容は同一入力から決定的なので排他不要）。

## 失敗・競合の確認

| 場面 | 期待する動作 | 検証方法 |
| --- | --- | --- |
| 同時起動（共有キャッシュあり） | rename勝者だけが占有。敗者は`null`→`tempDir/vite-cache`へ退避 | 実プロセス競合テストT1（手順7） |
| 同時起動（キャッシュなし・フレッシュ） | 各プロセスが別々の自pid名ディレクトリを作り正常動作。release時に先勝ちで共有パスへ収束し、負けた側は自ディレクトリを破棄 | 実プロセス競合テストT2（手順7）＋単体テスト（claim後に共有パスを手動作成してreleaseし、自ディレクトリが破棄されることを確認） |
| stale残骸の回収競合 | 同じ残骸を複数プロセスが見つけても、renameに成功した1つだけが回収 | 実プロセス競合テストT3（手順7）＋単体テスト（1者の回収成功と内容物の引き継ぎ） |
| 同一プロセスの二重取得 | 手順0のガードで2回目は`null`→退避。1回目の占有ディレクトリは置換されない | 単体テスト（claim保持中に同一プロセスで再claim） |
| SIGKILL/クラッシュ | `.inuse.<pid>`が残るが、次回起動が pid死亡を確認して回収 | 単体テスト（実際に終了した子プロセスのpidで残骸を作成→claimで回収） |
| `prepareMockRuntime()`の例外 | 占有を返却してから再throw。直後の再起動が共有キャッシュを使える | 単体テスト（`vi.mock`で`buildTokensArtifacts()`をthrowさせ、共有パスの復元とマーカー保持を確認。手順8） |
| claim内のファイルシステムエラー（`readdirSync`失敗・`mkdirSync`失敗・rename EPERM等） | 「エラーの収束規則」に従い`null`→退避で起動継続。throwしない | 単体テスト（再現できる範囲。例：親ディレクトリの権限操作）＋コードレビュー |
| 終了時のrename失敗（Windowsのハンドル保持等） | 破棄を試み、それも失敗なら放置。次回起動のstale回収で自然回復 | コードレビュー（実機Windows検証は対象外。壊れない方向の劣化であることを設計で担保） |
| 他ユーザー所有のディレクトリ（共有tmp環境） | rename/回収がEPERMになり、自pid名の新規作成または退避で起動継続 | コードレビュー（既存実装でも同趣旨の退避を確認済み） |

## 受容済みリスク・対象外

- **pid再利用のABA**: `process.kill(pid, 0)`での死亡確認とrenameの間に、OSが同じpidを新プロセスへ再割り当てし、かつそれが同じキャッシュキーのlism-mockupである場合のみ、生きた占有をrename元にしてしまう理論上の窓が残る。発生には「クラッシュ残骸＋pid一致＋同一データディレクトリ＋マイクロ秒単位の交錯」が全て必要で、ラウンド2で指摘された競合より数桁稀。ロックファイル方式を含むpidベースの手法すべてに共通する限界として受容する
- **OSのtmp掃除**: 長期間生存するdevの占有ディレクトリがOSに掃除される可能性は、共有キャッシュ設計自体が持つ既存の前提であり本プランでは扱わない
- **check実行中のdev起動**: checkはcacheDirへ読み書きしないため、排他不要（対象外）

## 完了条件 / テスト方針

- 「失敗・競合の確認」の各行に対応するテストが`cache-claim.test.ts`（単体）・実プロセス競合テスト（T1〜T3）・`runtime.claim.test.ts`（例外時返却）・`dev.test.ts`（統合）にあり、全て通る
- `packages/mockup`の`pnpm run test`（既存220件＋新規）・`typecheck`・`lint`が全て成功
- PR #539のfollow-upレビューでB1がResolvedになる

## 未決事項・要確認・事前準備

- モジュール名・API名（`cache-claim.ts` / `claimViteCacheDir`）は実装時に調整可
- CIにWindows環境があるかは未確認（なければWindows固有経路はコードレビュー担保のまま）
