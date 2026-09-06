基準日: 2026-09-05・e2b7ac10

# GitHubリポジトリをlism-css/coreへリネームする

状態: Ready

## ゴールと対象範囲

既存のGitHubリポジトリ`lism-css/lism-css`を、同じOrganization内の`lism-css/core`へリネームする。コード・履歴・Issue・PRを維持し、CLIの取得先、公開情報、サイトのGit連携を新名へ揃える。

今回の依頼はプランの保存まで。リネーム、コード変更、npm公開、デプロイは実行しない。

対象はGitHubのリポジトリ名とそれを参照する箇所。npmのパッケージ名、import文、CSS、コンポーネントAPI、ローカルのルートディレクトリ名は変更しない。

## 背景・確認済みの前提

- 移行先の`lism-css/core`はユーザー指定。リポジトリを分割する依頼ではなく、モノレポ全体のリネームである。
- 基準日時点のGitHub APIでは`full_name`は`lism-css/lism-css`、リポジトリIDは`994630274`、既定ブランチは`main`、GitHub Pagesは未使用。参照できるOrganizationの一覧に`core`はない。実施直前にも空きを確認する。
- 管理対象のソース・設定・文書に旧名を含む参照は83ファイル・140行。生成物と本プランは集計対象外。数は実施時に再確認する。
- CLIの取得元は`packages/lism-cli/src/constants.ts`の`SOURCE_REPO`に集約されている。使用中のgigetはロックファイル上で3.3.0。
- `packages/create-lism/tsup.config.ts`は`lism-cli`を依存ごとbundleへ内包する。CLI本体だけを公開しても、既存の`create-lism`の取得先は変わらない。
- npm公開はルート`package.json`の公開スクリプトを使う運用。[CLIガイド](../documents/cli-guide.md)が公開手順と事前チェックを管理している。
- `.github/workflows/test.yml`に旧名の固定参照やnpm公開処理はない。現時点でリネームのためのCI定義変更は不要。
- 公式サイトはVercel連携中で、`main`のコミットステータスでもVercelの成功を確認した。テンプレートプレビューはGitHubリポジトリ名ではなくCloudflare Pagesのプロジェクト名を指定して直接デプロイする構成。

GitHubはリネーム時に既存のWeb参照とGit操作を転送する。旧名を再利用すると転送が失われる。GitHub PagesのプロジェクトURLと、旧名で参照されるActionは転送の例外。[GitHub公式仕様](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)

### 別プランとの関係

- [apps/docsをapps/siteへ改名するプラン](./plan-rename-apps-docs-to-site.md)は別作業。このプラン内のサイトのパスは基準日時点の`apps/docs`を使う。先に改名が完了していたら、作業時に`apps/site`へ読み替え、変更対象一覧を取り直す。
- [Cloudflare Workers移行プラン](./plan-511-docs-to-cloudflare-workers.md)も別作業。GitHubのリネームを先に終える場合は新名でGit連携を登録する。Workers移行が先なら、確認対象をVercelから実際に稼働しているWorkers Buildsへ変更する。
- Workers移行プランの却下案に「ドメイン・GitHub・npmすべて`lism-css`のまま維持する」とあるが、これは`lismcss`表記への変更を退けた判断であり、本プランと矛盾しない。本プランはOrganization名`lism-css`を維持し、リポジトリ名だけを`core`へ変える。あの記述を改名を戻す根拠にしない。
- GitHubの改名とホスティング・DNSの切り替えを同時に行わない。どちらかの配信確認を終えてから次に進む。先後に機能上の必須依存はない。

## 不変条件

- 同じリポジトリを改名し、ID・履歴・ブランチ・タグ・Issue・PRを維持する。既定ブランチとPRのターゲットも変えない。
- 旧名`lism-css/lism-css`で案内用を含む別リポジトリを作らず、旧URLからの転送を維持する。
- 既定refとリポジトリ内の配信パスは変更しない。新名が利用可能になる前に、新名を埋め込んだCLIをnpmへ公開しない。
- 移行直前の公開版CLIと更新版CLIの両方が、同じrefのテンプレート・UI・スキルを取得できる状態を確認する。
- `lism-css.com`、テンプレートプレビューのURL、npmのパッケージ名と既存の利用方法を維持する。

## 状態と影響経路

| 状態 | 更新箇所・更新者 | 参照する既存経路 |
| --- | --- | --- |
| GitHubのowner/repoと転送 | GitHubのリポジトリ設定 | Git remote、Webリンク、GitHub API、raw URL、Git連携、skillsの配信 |
| CLIに埋め込む取得元 | `constants.ts`の`SOURCE_REPO` | `create.ts`の`downloadTemplatePath`、`ui/fetcher.ts`の`fetchCatalog`・`fetchComponent`・`loadHelperTree`、`skill/skillSource.ts`の`fetchSkillSource` |
| npmの公開バージョンと配布物 | `lism-cli`・`create-lism`のビルドと公開 | `lism-cli create`、`create-lism`、`ui list/add`、`skill add/check/update`。`skill update`は既存の追加処理を再利用する |
| npmのリポジトリ・問い合わせ先 | 7パッケージの`package.json` | npmのパッケージページ。公開済みバージョンの情報はソース編集だけでは更新されない |
| 配布するリンク・導入例 | README、サイト、スキル、テンプレート、運用文書 | Web閲覧、サイトの`llms.txt`、導入済みスキル、生成済みプロジェクト、MCPに同梱される文書 |
| サイトのGit連携 | 実施時のホスティングサービスの接続設定 | ブランチ更新によるプレビュー・本番デプロイ |
| skills.shのsourceと集計、利用側のlockfile | skills.sh側の登録状態、利用側の`skills-lock.json` | skills経由のインストール・更新、掲載ページ、インストール数 |

gigetのGitHub providerはGitHub APIのtarballを取得し、UIカタログは`fetchCatalog`がraw URLから直接取得する。両経路を確認する必要がある。[giget 3.3.0の実装](https://github.com/unjs/giget/blob/v3.3.0/src/providers.ts)

## 実施手順

本リポジトリのコード変更は1PRにまとめる。`dev`から`chore/rename-github-repository-to-core`を作り、PRのターゲットも`dev`にする。GitHubの改名と公開は、その変更を準備したうえで順に実施する。別リポジトリの修正は別差分として扱う。

### 1. 事前確認

- 既存の未コミット変更・並行作業を確認し、この作業へ混ぜない。
- GitHubの改名権限、新名の空き、稼働中のホスティング接続先を確認する。名前を予約するために`core`リポジトリを作らない。
- 現在のリポジトリID、ブランチ・タグ一覧、`origin`、ホスティングのGit接続と直近の正常デプロイを記録する。秘密情報は記録しない。
- npm上の`lism-cli`と`create-lism`の最新バージョンを確認して控える。旧版の確認にはこの固定バージョンを使い、公開後の`latest`を旧版として扱わない。
- `skills.sh/lism-css/lism-css`の掲載状態と集計を確認する。引継ぎ方法が不明のまま集計を失ってよいとは判断しない。必要なら運営への確認結果かユーザーの受容判断を実施条件として残す。
- 切り替えの間は別のCLI公開やホスティング移行を重ねない。進行中の公開・デプロイがある場合は完了を確認してから改名する。

### 2. 変更を準備する

以下の`lism-css/lism-css`だけを`lism-css/core`へ置換する。単独の`lism-css`、パッケージ名、ディレクトリ名、refまで一括置換しない。

| 対象 | 変更内容 |
| --- | --- |
| `packages/lism-cli/src/constants.ts` | `SOURCE_REPO`を新名に変更 |
| `packages/lism-cli/src/commands/create.test.ts` | 取得URLの期待値9か所を新名に変更。main/dev、base/overlay、言語差分の既存ケースを維持 |
| `packages/{lism-css,lism-ui,lism-cli,create-lism,mcp,mockup,plugin}/package.json` | `repository.url`と、存在する`bugs.url`を変更。フィールド構造や各パッケージのnameは変えない |
| `packages/mockup/src/vite/lucide-icons.ts` | `generateLucideModule`のエラーメッセージにあるIssue URLを変更 |
| `apps/docs/src/config/site.ts` | `siteConfig.author.github`を変更 |
| `apps/docs/src/integrations/docs-md/build-llms-txt.ts` | 生成するGitHubリンクを変更 |
| `apps/docs/src/content/{ja,en}/` | skills、mcp、responsive、UIコンポーネント記事の旧URL・導入例を変更 |
| ルートとpackages配下のREADME | ライセンス、ソース、導入例などの旧URLを変更 |
| `skills/lism-css-guide/` | 参照リンクを持つ8ファイルを変更。raw/blob/treeの形式は維持 |
| `templates/blog/astro/{minimal,personal,techlog}/` | `about.astro`、`src/config/site.ts`、techlogの`mdx-extensions.mdx`。`.lang/en`側も対象 |
| `templates/minimal/{astro,vite}/` | Headerのリンクとトップ画面のスキル導入例を変更 |
| `documents/cli-guide.md`、`documents/lism-skills-overview.md` | 配信元・導入例の説明を変更 |
| `.claude/commands/update-skills.md` | リンク生成規約のURL例を変更。後続の更新で旧名が戻らないようにする |

- スキルの8ファイルは`customize.md`、`components-core.md`、`components-ui.md`、`base-styles.md`、`property-class.md`、`property-class/all-props.md`、`set-class.md`、`utility-class.md`。
- サイトはURLと導入例の置換に限定し、記事構成やデザインを変えない。テンプレートは[保守ルール](../templates/README.md)に従い、意図的な言語差分を維持する。
- CLI2パッケージは公開時点の最新版から同じ次のpatchバージョンへ上げ、既存のリリース手順に従って変更内容を記録する。バージョン番号を本プランに固定しない。
- CLI以外の5パッケージはURL変更だけで即時公開を必須とせず、次回の通常公開で反映する。生成物や公開済みアーカイブを直接書き換えない。
- 修正をPRとして準備し、次のローカル確認を終える。この時点ではmainへの反映とnpm公開を行わない。

### 3. 改名前の確認

- 旧名を再検索し、本プランや意図的な履歴記録以外に現行の取得先・導入例が残っていないことを確認する。ignore対象・生成物・依存ディレクトリは読まない。
- `lism-css/lism-css`の文字列検索では拾えない、リポジトリ名を表す表示文言・ラベルも目視で確認する。例として`apps/docs/src/content/{ja,en}/skills.mdx`のGitHubリンクは、リンク文字列が`lism-css/skills/lism-css-guide/`のようにリポジトリ名を省略した形になっている。URLと表示文言の両方を新名に揃える。
- `packages/lism-cli`の既存テストを実行し、URLの期待値を含む既存ケースが通ることを確認する。
- [CLIガイドのpublish前チェック](../documents/cli-guide.md#publish前チェック)を満たし、2つのCLIをビルドする。PRの既存CIも通す。
- 既存の`create.test.ts`はgigetを、`ui/add.test.ts`はfetcherをモックする。CI成功だけでは新URLや旧URLの転送を保証できないため、次工程の実取得確認を省略しない。

### 4. GitHubをリネームし、新旧URLを確認する

1. GitHubのSettingsから既存リポジトリを`core`へリネームする。新規作成・コピー・旧リポジトリ削除は行わない。
2. `full_name`とリポジトリIDを照合し、同じIDのまま新名になったことを確認する。既定ブランチ、ブランチ・タグ一覧、既存Issue・PRも確認する。
3. このcloneの`origin`を`git@github.com:lism-css/core.git`へ更新し、fetchできることを確認する。他のcloneやforkのupstreamも使用者が更新する。
4. 変更をmainへ反映する前に、同じrefに対する新旧のGitHub APIのtarballとrawの`packages/lism-ui/registry-index.json`が取得でき、同じ配信内容を指すことを確認する。HTTPステータスだけでなく、アーカイブ内の必要なパスとJSONの内容まで確認する。
5. 控えた旧版CLIで、後述の実取得確認を行う。旧版が壊れた場合は新CLIの公開へ進まず、失敗時の手順に従う。

### 5. 変更を反映し、公開する

1. 準備したPRを`dev`へ反映する。ビルドした更新版CLIでも実取得確認を行う。既定refを変更せず、dev側の配布物確認が必要な場合だけ既存の`--ref`オプションを使う。
2. 実施時のホスティングで接続先が`lism-css/core`になっていることを確認する。自動追従しない場合は、既存プロジェクトのGit接続を新名へ変更する。ドメインやホスティングプロジェクトを作り直さない。
3. 通常のデプロイ手順で変更をmainへ反映し、本番サイトと生成される`llms.txt`のリンク、JSON-LDの`codeRepository`を確認する。プレビューを利用中ならその自動デプロイも確認する。
4. 新URLのmainから必要な配布物が取得できることを確認してから、[CLIガイドのbuild / publish](../documents/cli-guide.md#build--publish)に従って`lism-cli`と`create-lism`を公開する。
5. npmから更新版を取得し、両パッケージのバージョンと実取得を確認する。ビルド済みのローカル版だけで完了判定しない。

### 6. 外部の参照と後片付け

- skills経由の新名でのインストールと、文書で案内する`gh skill install`を一時ディレクトリで確認する。skills.shの掲載先・source・集計も確認し、未解消事項をCLIの成否と分けて扱う。
- [lism-with-astro-microcmsのskills-lock.json](https://github.com/lism-css/lism-with-astro-microcms/blob/main/skills-lock.json)に旧名のsourceがある。別リポジトリの差分として、新取得元に追従させる。スキル本文まで更新される場合は差分を確認し、ハッシュだけを推測で書き換えない。
- Organization内の旧参照を再検索する。外部の利用者が持つ生成済みプロジェクト・スキル・Git remoteは一括更新できないため、旧URLの転送を維持する。
- 完了条件を満たしたら、ルートの文書規則に従って本プランを削除する。未解消の外部対応がある間は完了扱いにしない。

## 失敗・競合の確認

| 場面 | 期待する動作 | 検証方法 |
| --- | --- | --- |
| APIは取得できるがrawが404、または旧URLだけ失敗 | 新CLIの公開を止める。旧名で別リポジトリを作って補修しない | 新旧owner/repoのtarballとraw JSON、旧版の`ui list`をそれぞれ確認 |
| タイムアウトや一時的なネットワーク障害 | 成功と扱わず、取得先とサービス状態を確認する。未検証のまま公開しない | HTTPエラー・CLIの終了結果を確認。同じ手段で2回連続失敗したら反復を止め、原因を切り分ける |
| 別の公開・移行と競合 | 先行作業を終え、mainの内容と公開対象を揃えてから再開 | リリース担当、PR、mainのSHA、進行中の公開・デプロイを照合 |
| リネーム後に手順が中断 | 現在の名前・ID・main・npmの公開状態から再開地点を決める | GitHub API、npmのバージョン、ホスティングの履歴を確認。改名を盲目的に再実行しない |
| CLIの片方だけ公開成功 | 成功済みの同一バージョンを再公開しない。未公開側の失敗を直す | npm上の両パッケージのバージョンを照合。不具合があれば新しいpatchで是正する |
| 改名後にGit連携が止まる、改名前に始まったデプロイが遅れて完了する | 最後に配信されたSHAを確認し、新名に接続した状態で対象mainをデプロイする | ホスティングの接続先・対象SHA・本番結果を照合。既存サイトを削除しない |
| skills.shの新ページが404、旧sourceや集計が残る | CLIの取得成功と区別し、事前に決めた引継ぎ・受容方針に従う | 新名での導入、掲載ページ、source、移行前後の集計を個別確認 |

### 復旧方針

- 新CLI公開前に新旧の取得互換性を確保できない場合は、変更のmain反映・公開を保留する。リネーム直後の一時障害かを確認し、改名を戻す必要がある場合は同じリポジトリを旧名へ戻す。元の名前の空きとIDを先に確認し、別リポジトリは作らない。Git remoteとGit連携も実際の名前に揃え、旧版の取得成功を再確認する。
- 新CLIの公開後は`core`を前提にする利用者も発生するため、安易に名前を戻さず、新名を保った修正と次のpatch公開を優先する。npmの公開済みバージョンの削除・上書きは復旧策にしない。
- 旧CLIの失敗を受容して移行を続ける判断は、このプランでは行わない。

## 判断の根拠・受容する範囲・対象外

- 既存リポジトリの改名を採用する。新規リポジトリへのコピーや分割は履歴・Issue・PRの移行作業を増やし、今回の目的に不要。
- 取得先は既存の`SOURCE_REPO`を変更する。新しい設定項目や恒久的な二重取得処理は追加しない。旧版との互換性はGitHubの転送と実取得で確認する。
- CLI本体とラッパーを同時に更新する。ラッパーは本体を内包するため、片方だけの更新では新名への追従が揃わない。
- リンクだけが古い公開済みパッケージ・導入済みファイルは、転送が機能することを条件に残存を許容する。全利用者への強制更新やCLI以外の一斉再公開は行わない。
- npm名の変更、API変更、モノレポ分割、サイトの改名、ホスティング・DNS移行、CIの構成改善、依存更新は対象外。
- skills.shの集計消失や旧CLIの停止は受容済みリスクに含めない。前者の扱いは実施前の要確認事項、後者は公開を止める条件とする。

## 未確認事項・実施前に決めること

- 実施日時と、別プランに対する先後関係。
- 実施時点のVercelまたはWorkers Buildsが改名へ自動追従するか。コードだけでは接続設定を確定できない。
- skills.shの集計・掲載URLの引継ぎ方法。リネーム後に旧sourceが残る[未解決報告](https://github.com/vercel-labs/skills/issues/703)があり、自動移行を保証できない。引継ぎ保証が得られない場合に受容するかは未決。
- npm側にリポジトリ名を固定したTrusted Publishing設定が存在するか。現行のCIは使用していないが、導入されていた場合は新名で接続を作り直す必要がある。[npm公式仕様](https://docs.npmjs.com/trusted-publishers/)
- Organization外の利用者やサービスが持つ参照は網羅できない。調査時の検索結果を全件保証として扱わない。

## 完了条件・検証方針

- 同じリポジトリIDで新名が有効になり、既存の履歴・ブランチ・タグ・Issue・PRを参照できる。新旧のGit URLから読み取りでき、旧名が再利用されていない。
- 現行のソース・設定・文書から旧名の参照がなくなっている。過去の変更記録と移行確認用の記述は除外理由を確認する。
- 既存のCLIテスト、公開前チェック、PRのCIが成功している。URL文字列をなぞるだけの新規テストや、無関係なテスト拡充は行わない。
- 改名前に控えた公開版、ローカルの更新版、npmに公開した更新版で、以下を一時ディレクトリへ実取得して確認する。キャッシュだけで成功しないよう、新しい作業環境で通信と取得内容を確認する。

| 経路 | 確認内容 |
| --- | --- |
| `lism-cli create`と`create-lism` | 通常テンプレートを取得できる。base/overlay型と言語overlay型も代表例で確認し、必要なファイルが揃う |
| `ui list` | raw経由のカタログを取得し、一覧を表示できる |
| `ui add` | UI本体と、その依存helperを取得・配置できる。helperを持つ代表コンポーネントを選ぶ |
| `skill add/check/update` | スキルを取得・配置し、同じrefへの差分確認と更新ができる |
| `--ref dev` | 代表的な取得経路でdevを取得でき、既定のmain取得も維持される |

- 公開したCLI2パッケージのバージョンが揃い、新名を参照している。
- 本番サイトのGit連携が動作し、対象mainのデプロイが成功する。サイトと`llms.txt`のGitHubリンク、および`apps/docs/src/lib/jsonLd.ts`が`siteConfig.author.github`から出力するJSON-LDの`codeRepository`が新名で、サイトURLは変わっていない。デザイン変更はないため、ブラウザによるUI確認は検証に含めない。
- スキルの新しい導入例が動作し、skills.shの掲載・集計が事前に決めた条件を満たす。別リポジトリの既知のlockfile参照も対応を終えている。
- 実装前に`plan-review`でこのプランをレビューし、合格後に状態を`Ready`へ変更する。
