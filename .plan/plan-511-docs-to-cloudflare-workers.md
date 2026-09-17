# Plan: apps/site のデプロイ先を Vercel から Cloudflare Workers へ移行する（#511）

基準日: 2026-09-17・6c8b2a1cf
状態: In progress（Phase 1〜6 完了。Phase 7 のリポジトリ側クリーンアップは PR 3 で対応中。残り: Vercel 側のドメイン解除・削除 → プラン削除）
対象Issue: [#511](https://github.com/ddryo/lism-css/issues/511)（[#506](https://github.com/ddryo/lism-css/issues/506) はクローズ済み。本プラン内で対応する）

## 概要 / ゴール

apps/site（公式ドキュメントサイト `lism-css.com`）のデプロイ先をVercelからCloudflare Workers（静的アセット配信）+ Workers Builds（Git連携）へ移行する。あわせて `lism-css.com` のDNSゾーンをVercel DNSからCloudflareへ移管する（WorkersのCustom Domainに必要なため）。

完了時の状態：

- `lism-css.com` がCloudflare Workersから配信されている
- `lism-css.com` のDNSゾーンがCloudflare上にあり、既存レコード（メール・Search Console・サブドメイン）がすべて維持されている
- mainへのpushで本番デプロイされる運用が維持されている
- 存在しない`.md` URLへの404レスポンスに`Content-Type: text/markdown`が付かない（#506解消）
- Vercel固有のファイル・設定がリポジトリから消え、Vercel上のプロジェクト・ドメインも消えている（クリーンアップ後）

## 背景・前提

### リポジトリ側（コードで裏取り済み）

- apps/siteは完全な静的サイト（`apps/site/astro.config.ts`にアダプター設定なし・SSRなし）。OG画像・Pagefind検索・sitemap・llms.txtはすべてビルド時生成でホスティング先に依存しない
- Vercel固有の依存は`apps/site/vercel.ts`の1ファイルのみ。中身は次の3点：
  - `buildCommand: 'cd ../.. && pnpm build:site'`
  - `redirects: vercelRedirects`（`apps/site/src/config/redirects.ts`で定義。**8件**：`/docs/`・`/en/docs/`→overview の2件と、camelCase版リダイレクト6件）
  - `headers` 2種（OG画像PNGの`Cache-Control` / `*.md`への`X-Robots-Tag: noindex`+`Content-Type: text/markdown; charset=utf-8`）
- `wrangler`はルート`package.json`のdevDependenciesに導入済み（`^4.107.0`）。`templates.lism-css.com`でCloudflare Pagesの利用実績あり
- `apps/site/src/pages/404.astro`が存在するため、ビルドで`dist/404.html`が生成される
- `astro.config.ts`に`trailingSlash`指定なし（デフォルト`ignore`）・`build.format`指定なし（デフォルト`directory`）。全ページが`{path}/index.html`で出力されるため、Workersのデフォルト`html_handling: "auto-trailing-slash"`と整合する想定（Phase 2で実測）
- OG画像の実際の出力先は`/docs/og/`・`/ui/og/`・`/en/docs/og/`・`/en/ui/og/`の4ディレクトリ（distで確認済み）。`public/ogimg-default.png`（ルート直下）は元のVercelパターン（`/:path*/og/:slug*.png`）でも対象外なので扱い変更なし
- `.md`ファイルは`/ui.md`のような浅い階層と`/ui/accordion.md`のような深い階層の両方に出力される（`/*.md`パターンは複数セグメントへのマッチが必要）
- `apps/site/lastmod-map.json`はローカル生成してコミットする運用（`apps/site/scripts/generate-lastmod-map.ts`）のため、CI環境の変更による影響はない

### DNS・ドメイン側（2026-09-05にdigとVercel管理画面で確認済み）

- レジストラはxdomain（XServer）。ネームサーバーは`ns1/ns2.vercel-dns.com`へ委任されており、**DNSゾーンの実体はVercel DNS**にある。xdomain側のDNSレコード画面は未使用。Cloudflareアカウントにゾーンは無い
- WorkersのCustom Domainには「An active Cloudflare zone」が必須（公式明記）。ネームサーバーを変えずにCNAMEだけで向けるpartial setupはBusiness以上のプラン限定（公式明記）のため、**ネームサーバーをCloudflareへ変更する工程が必要**
- Vercel側の接続プロジェクトは`lism-css-docs`のみ。`www.lism-css.com`はVercelのドメイン設定で「Redirects to lism-css.com」（307）になっている。apexはVercelが自動管理するALIAS、wwwは`*`（ワイルドカード）のALIASで解決している（どちらもロック付きでVercel管理。wwwの明示レコードは無い）
- 現行ゾーンのレコード（移管時にすべて再作成する）：
  - MX `smtp.google.com`（Google Workspaceのセカンダリドメインとして登録済み・Gmail有効。受信箱にはテストメールのみで実質未使用。送信用のSPF/DKIM/DMARCも無し。念のためコピーする）
  - TXT `google-site-verification` ×2（Search Consoleのドメイン認証。落とすと認証が切れる）
  - `templates` CNAME → `lism-templates.pages.dev`（テンプレートプレビュー。Cloudflare Pagesのカスタムドメイン）
  - `cdn` CNAME → `lism-cdn.pages.dev`（docsの画像CDN。Cloudflare Pagesのカスタムドメイン。apps/site内の約190ファイルが画像参照に使っており、落ちるとドキュメントの画像が全滅する）
  - `wp` A → XServer系WordPressホスティング、`_acme-challenge.wp` TXT（その証明書認証用）。空のWordPressプロジェクトだが稼働中のためコピーする
  - CAA ×3（sectigo / letsencrypt / pki.goog）。Vercelの証明書発行用。**コピーしない**（CAA無し＝制限無し。Cloudflareの証明書発行にも影響しない）
  - `*`（ワイルドカード）ALIAS → Vercel（自動管理・ロック付き）。**コピーしない**（「受容済みリスク」参照）
  - SPF・DKIM・DMARCは無し。上記以外のレコードは無い（一覧全件を確認済み）
- Search ConsoleのプロパティはDNS TXT認証のため、TXTを移せばプロパティ再登録は不要

### #506 との関係

#506は「存在しない`.md` URLへの404レスポンスで、Content-Type（`text/markdown`）とボディ（HTML）が不一致になる」問題。Vercelの`headers`設定では「ファイルが実在する場合のみヘッダーを付ける」条件が書けないため、本Issue内で対応する前提でクローズ済み。本プランのPhase 1〜2の`.md` Content-Type方針で解決する。

## 実装プラン

### Phase 0: 事前確認（コード変更なし・ダッシュボード作業）

- [x] `lism-css.com`のDNSゾーンの所在：Vercel DNS（xdomainからNS委任）。Cloudflareには無い → ネームサーバー移管が必要（Phase 4）
- [x] www の扱い：Vercelのドメイン設定でapexへ307リダイレクト
- [x] 他のVercelプロジェクトによる`lism-css.com`サブドメインの利用：無し（接続プロジェクトは`lism-css-docs`のみ）
- [x] 現行DNSレコードの記録（digとVercel管理画面の全件）：「背景・前提」参照。DKIM等の追加レコードは無し
- [x] Vercel管理画面の残りの棚卸し：環境変数の有無 / Node.jsバージョン / Git連携の本番ブランチとプレビューの挙動（2026-09-14: Vercel CLIで確認。環境変数なし・Node.js 22.x・Root Directory `apps/site`。Git連携の本番ブランチとプレビュー挙動は未確認だがCloudflare側の設定には影響しない）
- [x] Google管理コンソールでの`lism-css.com`の状態：Google Workspaceのセカンダリドメインとして登録済み・Gmail有効。受信箱にはテストメールしか無く実質未使用だが、用途不明のため「使っている」扱いでMXをコピーする
- [x] Vercelで「プロジェクトからドメインを外す」と「チームからドメインを削除する」が別操作であり、DNSレコードが後者にひもづくことを確認する（Phase 7の手順とロールバックの前提）（2026-09-16: Vercel CLIで確認。`vercel domains ls`のチーム配下ドメインに`vercel dns ls`のレコードがひもづき、プロジェクト割り当て（`vercel domains inspect`のProjects欄: `lism-css-docs`にapexとwww）は別管理。Phase 7では先にプロジェクトから外し、次にチームから削除する）

### Phase 1: リポジトリ側の準備（devから作業ブランチを切る → PR 1）

- [x] `apps/site/wrangler.jsonc`を新規作成。静的アセット配信のみなので`main`（Workerスクリプト）は不要：

  ```jsonc
  {
    "name": "lism-site",
    "compatibility_date": "2026-07-01", // wrangler 同梱の workerd が対応する最新日付（先の日付だと wrangler dev が警告してフォールバックする）
    // プレビューURLはworkers_dev設定に連動して無効化されるため、明示的にtrueにする
    // （Phase 5でworkers_devをfalseにしてもプレビューURLを維持するため）
    "preview_urls": true,
    "assets": {
      "directory": "./dist",
      "not_found_handling": "404-page"
    }
  }
  ```

  `workers_dev`はこの時点では書かない（デフォルト有効のまま）。Phase 3の検証で`*.workers.dev` URLを使うためで、無効化はPhase 5で`"workers_dev": false`を設定ファイルに追記して行う（ダッシュボードだけで無効化しても次回のWranglerデプロイで再有効化されるため、必ず設定ファイルで管理する）。

- [x] `apps/site/public/_redirects`を新規作成し、`vercelRedirects`の8件を移植（301）：

  ```
  /docs/ /docs/overview/ 301
  /en/docs/ /en/docs/overview/ 301
  /docs/primitives/l--fluidCols/ /docs/primitives/l--autoColumns/ 301
  /docs/primitives/l--sideMain/ /docs/primitives/l--withSide/ 301
  /docs/primitives/l--switchCols/ /docs/primitives/l--switchColumns/ 301
  /en/docs/primitives/l--fluidCols/ /en/docs/primitives/l--autoColumns/ 301
  /en/docs/primitives/l--sideMain/ /en/docs/primitives/l--withSide/ 301
  /en/docs/primitives/l--switchCols/ /en/docs/primitives/l--switchColumns/ 301
  ```

  `redirects.ts`にある経緯のコメント（`/docs/`はAstro側だとmeta refreshの中間ページが一瞬見える件、casing違いの出力先衝突をAstro側で扱えない件）は`#`コメントとして`_redirects`にも書いておく（Phase 7で`vercelRedirects`を消したときに経緯が残るように）。

- [x] `apps/site/public/_headers`を新規作成し、`vercel.ts`のヘッダーを移植：

  ```
  /docs/og/*
    Cache-Control: public, s-maxage=31536000, max-age=86400, must-revalidate
  /ui/og/*
    Cache-Control: public, s-maxage=31536000, max-age=86400, must-revalidate
  /en/docs/og/*
    Cache-Control: public, s-maxage=31536000, max-age=86400, must-revalidate
  /en/ui/og/*
    Cache-Control: public, s-maxage=31536000, max-age=86400, must-revalidate
  /*.md
    X-Robots-Tag: noindex
  https://:version.:subdomain.workers.dev/*
    X-Robots-Tag: noindex
  ```

  - `_headers`は1パターンにsplat（`*`）1つまでの制約があるため、OG画像用は上記4ルールに展開する（実際の出力ディレクトリと一致することは確認済み）
  - **`.md`の`Content-Type`は`_headers`に書かない**（理由は「設計判断の根拠」参照）
  - 最後の`workers.dev`ホスト付きルールはCloudflare公式ドキュメント記載の例そのままで、プレビューURL（`<バージョンプレフィックス>-<Worker名>.<サブドメイン>.workers.dev`）とworkers.dev route上の全ページ（HTML含む）をnoindexにする。ホストを限定しているため、本番のカスタムドメイン（`lism-css.com`）には影響しない
- [x] ルート`.gitignore`に`.wrangler/`を追加（Phase 2の`wrangler dev`で生成されるため。`.vercel`の削除はPhase 7）
- [x] `apps/site/scripts/smoke-test.ts`を新規作成（デプロイ検証用スモークテスト）。`npx tsx scripts/smoke-test.ts --base={検証先URL}`で、Phase 2チェックリストのうちHTTPで機械的に確認できる項目（ステータス・Location・Content-Type・`X-Robots-Tag`・`Cache-Control`・404）を一括検査し、1件でも失敗したら非0で終了する。Phase 2（ローカル）・Phase 3（workers.dev）・Phase 6（本番）で同じスクリプトを`--base`違いで使い、環境間の確認漏れを防ぐ
  - HTMLページへのnoindexはworkers.devホスト上だけが期待値（本番カスタムドメインには付かない）のため、`--expect-html-noindex`のようなフラグで期待値を切り替えられるようにする
  - OG画像は出力ごとにファイル名が変わるため、実在するOG画像パスを引数で渡すか、sitemapから1件解決して検査する

### Phase 2: ローカル検証

`pnpm build:site && cd apps/site && npx wrangler dev`で以下を確認：

- [x] トップ・`/docs/overview/`・`/en/`の表示
- [x] trailing slash挙動（`/docs/overview`→`/docs/overview/`へのリダイレクト等、Astroの`directory`形式出力とWorkersの`auto-trailing-slash`の整合）（実測: 307で`/docs/overview/`へ）
- [x] リダイレクト：`/docs/`・`/en/docs/`がHTTP 301で`overview/`へ飛ぶこと（Astro出力の`/docs/index.html`（meta refresh）より`_redirects`が優先されること）
- [x] リダイレクト：`l--fluidCols`（camelCase・`_redirects`側）がHTTP 301で飛ぶこと
- [x] リダイレクト：`l--fluidcols`（小文字・Astro側`astroRedirects`）が**HTTP 200+meta refreshページ**（noindex・canonical付き）として配信され、正しく遷移すること。301にはならない（現行Vercel本番と同じ挙動。理由は「設計判断の根拠」参照）
- [x] `/*.md`パターンのヘッダー：深い階層（`/ui/accordion.md`）と浅い階層（`/ui.md`）の両方に`X-Robots-Tag: noindex`が付く
- [x] 実在する`.md`のContent-Type実測：Cloudflareのデフォルトで`text/markdown`（charset有無も確認）が付くか（実測: ローカルの`wrangler dev`では`text/markdown; charset=utf-8`だが、本番（workers.dev）はcharset無しの`text/markdown`。2026-09-14にフォールバックWorkerを導入）
- [x] OG画像（4ディレクトリ）の`Cache-Control`
- [x] 404ページ（ステータス404+カスタムページ）
- [x] 存在しない`.md` URL（例: `/naming.md`）が通常のHTML 404で返り、`Content-Type: text/markdown`が付かないこと（#506の解消確認）（実測: `text/html; charset=utf-8`の404。`X-Robots-Tag: noindex`は付くが受容済み）
- [x] Pagefind検索・OG画像表示・404ページの見た目（目視確認済み）。`/llms.txt`・sitemapはスモークテストで確認済み

上記のうちHTTPで機械的に確認できる項目は、Phase 1で追加するスモークテスト（`scripts/smoke-test.ts`）を`--base=http://localhost:8787`（`wrangler dev`のデフォルトURL）で実行して一括確認する。Pagefind検索の動作やOG画像・404ページの見た目などは目視で確認する。

`.md`のデフォルトContent-Typeが不足していた場合は、下記のフォールバックを導入してPhase 2のチェックリストを再実施する（`_headers`にContent-Typeを書かない理由は「設計判断の根拠」参照）。

#### `.md`のContent-Type不足時のフォールバック設計（2026-09-14: Phase 3の本番実測でcharset不足が判明し導入済み）

本番実測でcharsetが付かなかったため以下を導入した。PR 1マージ後の判明のため別PRで出す。ローカル（miniflare）はcharsetを付けるが本番は付けないので、この差はローカル検証では検出できない。

- `wrangler.jsonc`にWorkerスクリプトと`run_worker_first`を追加する：

  ```jsonc
  {
    "name": "lism-site",
    "compatibility_date": "{作成日}",
    "preview_urls": true,
    "main": "./worker/index.ts",
    "assets": {
      "directory": "./dist",
      "not_found_handling": "404-page",
      "binding": "ASSETS",
      "run_worker_first": ["/*.md"]
    }
  }
  ```

- [Worker](../apps/site/worker/index.ts)でASSETSの成功応答と304にヘッダーを付与する。304も対象にし、キャッシュ再検証でcharsetが失われるのを防ぐ。HTML 404などのエラー応答はそのまま返す。スモークテストで通常のGETとETag付き再取得の両方を検査する。

設計上の注意（Cloudflare公式ドキュメントで確認済み）：

- `_headers`は`ASSETS.fetch()`の応答にも適用される。Workerはそのヘッダーを引き継ぎ、`X-Robots-Tag: noindex`とcharset付きContent-Typeの最終値を明示する。Workerが独自生成する応答には`_headers`が自動適用されないため、この経路と区別する
- `_redirects`への影響はない：`_redirects`の8件はすべてHTML URLで、`run_worker_first: ["/*.md"]`の対象外のため従来どおり適用される
- `run_worker_first`のパターンはglob形式（`*`は貪欲マッチ、`!`で除外パターン）。`/ui.md`（浅い階層）と`/ui/accordion.md`（深い階層）の両方がWorkerへ来ることをPhase 2で確認する
- pathnameの`.md`判定はWorker内では行わない（`run_worker_first`で`/*.md`のみがWorkerへ来るため）。将来`run_worker_first`のパターンを広げる場合は`url.pathname.endsWith('.md')`のガードを追加すること

### Phase 3: Workers Buildsセットアップ（本番未切り替え・ダッシュボード作業）

- [x] リポジトリ接続：ルートディレクトリ`apps/site`、ビルドコマンド`cd ../.. && pnpm build:site`、デプロイコマンド`npx wrangler deploy`、本番ブランチ`main`（2026-09-14: Worker名`lism-site`、本番URLは`lism-site.loos.workers.dev`）
- [x] pnpm workspaceの依存解決がWorkers Builds環境で正しく行われるか確認（ルートでの`pnpm install`が必要。うまくいかない場合はビルドコマンドに`cd ../.. && pnpm install --frozen-lockfile && pnpm build:site`のように明示する）（2026-09-14: `SKIP_DEPENDENCY_INSTALL=1`にし、ビルドコマンドでルートの`pnpm install --frozen-lockfile`を明示した）
- [x] Node.jsバージョンを環境変数で指定（Phase 0で確認した値に合わせる）（2026-09-14: `NODE_VERSION=22`）
- [x] `PNPM_VERSION`も環境変数で指定し、ルート`package.json`の`packageManager`（現在は`pnpm@10.33.0`）と合わせる（ビルドの再現性のため。`packageManager`を更新したらこの環境変数も追従させる）（2026-09-14: 設定済み）
- [x] `*.workers.dev` URLでPhase 2と同じチェックリストを実施（スモークテストを`--base=https://lism-site.<サブドメイン>.workers.dev --expect-html-noindex`で実行＋目視確認）（2026-09-14: 初回は25/30で失敗5件はすべて`.md`のcharset不足。フォールバックWorker #622 反映後は304検査込みの35件すべて合格）
- [x] devブランチpushでプレビューURL（`<バージョンプレフィックス>-lism-site.<サブドメイン>.workers.dev`）が発行されることを確認（2026-09-14: PR #622 のブランチpushで`<バージョン>-lism-site.loos.workers.dev`と`<ブランチ名>-lism-site.loos.workers.dev`の2種類が発行され、GitHubのチェックとPRコメントにURLが載る）
- [x] プレビューURLで**HTMLと`.md`の両方**に`X-Robots-Tag: noindex`が付くことを確認（`_headers`のworkers.devホスト付きルールによる。フォールバックWorker導入時の`.md`はWorker側の付与で担保される）（2026-09-14: 両方に付くことを確認。フォールバックWorker込みでスモークテスト30件合格）
- [x] 初回ビルドの所要時間を確認（`.cache/og/`が永続化されない可能性が高いため。許容範囲かを判断）（2026-09-14: 合計約9分。内訳はインストール13秒・ビルド8分20秒・デプロイ30秒。OG画像キャッシュ無しでも許容範囲と判断）
- [x] ビルド時間対策としてWorkers Buildsの設定を絞る（2026-09-14: 「Builds for non-production branches」をOFF、監視パスの除外に`docs/*`・`documents/*`・`.plan/*`・`skills/*`・`.github/*`・`.claude/*`・`packages/mcp/*`・`packages/lism-cli/*`・`packages/create-lism/*`・`packages/mockup/*`・`apps/catalog/*`を設定。以後、ブランチpushでは上の2項目で確認したプレビューURLは発行されず、ビルドはmainへのpushでサイトに関係するパスが変わったときだけ走る。CI側も`test.yml`を`pull_request`のみにした（#623））

### Phase 4: DNSゾーンをCloudflareへ移管（配信元は変えない・ダッシュボード作業）

配信元の切り替え（Phase 5）とは切り離し、「DNSの管理者だけをVercelからCloudflareへ変える」工程。すべてのレコードをVercel向けのまま再作成してからネームサーバーを変えるため、サイト・メール・サブドメインの挙動は変わらない。Phase 1〜3と並行して進めてよい。

1. [x] Cloudflareダッシュボードで`lism-css.com`をゾーンとして追加する（Freeプラン）。自動スキャンで取り込まれたレコードは参考程度にし、Phase 0で控えた一覧と突き合わせる（2026-09-14: 作成済み。割り当てNSは`sara.ns.cloudflare.com`と`will.ns.cloudflare.com`）
2. [x] レコードを再作成する。**この時点ではすべてProxyオフ（DNS only）**：（2026-09-14: APIで9件作成済み。TTLは全件60）
   - `lism-css.com` CNAME → Vercel一覧にあるapex ALIASの値（`{ハッシュ}.vercel-dns-016.com`）。apexのCNAMEはCloudflareが全プランでデフォルトで平坦化する（公式明記）。万一動かない場合はdigで実測したVercelのA値で代替する
   - `www` CNAME → Vercel一覧にある`*` ALIASの値（`cname.vercel-dns-016.com`）。Vercel側のwww→apexリダイレクトを維持するため
   - `*`（ワイルドカード）はコピーしない
   - MX `smtp.google.com`（優先度は現行値）
   - TXT `google-site-verification` ×2（値をそのままコピー）
   - `templates` CNAME → `lism-templates.pages.dev`
   - `cdn` CNAME → `lism-cdn.pages.dev`
   - `wp` A、`_acme-challenge.wp` TXT（値をそのままコピー）
   - CAAはコピーしない
3. [x] ゾーンのSSL/TLS設定を「Full (strict)」にしておく（Phase 5でProxyをオンにしたときにFlexibleで動かないようにするため。Proxyオフの間は影響しない）（2026-09-14: 設定済み）
4. [x] ネームサーバー変更前に、Cloudflareから割り当てられたネームサーバーへ直接問い合わせて内容を確認する（`dig @{割り当てNS} lism-css.com A` / `MX` / `TXT`、`www`・`templates`・`cdn`・`wp`）。現行の応答と一致することを確認する（2026-09-14: 全件一致を確認）
5. [x] xdomainの「ネームサーバー設定」→「その他のサービスで利用する」で、`ns1/ns2.vercel-dns.com`をCloudflareの2つに置き換える（2026-09-14: 変更済み）
6. [x] CloudflareでゾーンがActiveになるのを待つ（数時間〜最大2日程度）。反映待ちの間は新旧どちらのDNSに当たっても同じ内容（Vercel向け）を返すため、混在しても問題ない（2026-09-14: 同日中にActive）
7. [x] Active後の確認：（2026-09-14: 全項目OK。1.1.1.1/8.8.8.8 ともCloudflare NS、apexは`server: Vercel`、wwwは307、templates/cdn/wpは応答、MX/TXTは一致、Search Consoleは所有者のまま）
   - `dig NS lism-css.com`がCloudflareのNSを返す
   - `https://lism-css.com/`が表示され、応答ヘッダに`server: Vercel`が残っている（配信元が変わっていないこと）
   - `https://www.lism-css.com/`がapexへリダイレクトされる
   - `https://templates.lism-css.com/`がされる。Cloudflare Pagesのカスタムドメイン画面で`templates.lism-css.com`・`cdn.lism-css.com`がActiveのままであること
   - Search Consoleのプロパティが「確認済み」のまま
8. [x] 数日そのまま置き、問題が無ければPhase 5へ（2026-09-16に再確認: NS・ゾーンActive・apex/www・templates/cdn/wp・MX/TXT・Search Consoleすべて問題なし）

### Phase 5: 本番切り替え（配信元をWorkerへ）

前提：Phase 1の変更が通常のリリースフローでmainへマージ済みで、Workers Buildsの本番デプロイが`*.workers.dev`で正常なこと。Phase 4が完了していること。（2026-09-14時点で両方とも満たしている）

進め方の補足（Phase 4で確立した手順）：

- DNSレコードの変更はAPIのスクリプトを用意し、ユーザーが実行する（エージェントからの直接実行は拒否されるため）。読み取り・検証はエージェントが行う
- Cloudflare APIトークン（ゾーン`lism-css.com`限定のDNS編集・ゾーン読み取り）が有効であること。2026-09-14に作ったトークンは2026-09-18に失効する。Phase 6以降でDNSを触るなら同じ設定で作り直す
- WorkerのCustom Domain追加・wwwのRedirect Rule・Always Use HTTPSはダッシュボードで行った

- [x] apex・wwwの切り替え前のTTLとVercel向けIPを控える（2026-09-16: apex CNAME `b51639e237d04ece.vercel-dns-016.com`、www CNAME `cname.vercel-dns-016.com`、いずれもTTL 60。平坦化後のA値は`216.150.1.65`/`216.150.16.65`。切り替え時刻はapex 06:38 UTC・www 06:44 UTC。TTLが60秒のため、Phase 7の開始条件（切り替え前TTLの経過）は切り替え直後に満たしている）

WorkerのCustom Domainは「既存のCNAMEレコードがあるホスト名には作成できない」（公式明記）ため、以下の順序で行う：

1. [x] Cloudflare DNSでapex（`lism-css.com`）のVercel向けCNAMEレコードを削除する（2026-09-16 06:38 UTC。レコードのバックアップはローカルに保存）
2. [x] WorkerにCustom Domain `lism-css.com`を追加する（2026-09-16: Cloudflareが`AAAA 100::`（Proxyオン）のDNSレコードを自動作成。証明書はゾーン有効化時に発行済みのUniversal SSLがそのまま使われ、待ち時間なし）
3. [x] `https://lism-css.com/`が証明書エラーなく表示され、`server: Vercel`が消えていることを確認する。スモークテストを`--base=https://lism-css.com`で実行する（2026-09-16: `server: cloudflare`、スモークテスト35件合格）
4. [x] wwwを切り替える：`www`のVercel向けCNAMEレコードを削除し、Proxyオンのプレースホルダレコード（AAAA `100::`）を作成する。Redirect Ruleで`www.lism-css.com`宛のリクエストを`https://lism-css.com`＋同じパス・クエリへ301する（2026-09-16 06:44 UTC。Redirect Rule「www to apex」: 式`(http.host eq "www.lism-css.com")`、動的ターゲット`concat("https://lism-css.com", http.request.uri.path)`、301、クエリ保持ON。HTTP・HTTPSとも301でパス・クエリの保持を確認。Vercel時代は307だったが恒久リダイレクトとして301に変えた。「受容済みリスク」参照）
5. [x] Vercelの`lism-css-docs`プロジェクトに`lism-css.com`と`www.lism-css.com`の割り当てを残し、チームのドメイン登録・DNSゾーンとともにPhase 7まで維持する。`curl --resolve`でホスト名を保ったまま控えたVercel向けIPへ接続し、apexがHTTPSで表示され、wwwが従来どおりapexへ307されることを確認する（2026-09-16: 控えたIPすべてでapex 200・www 307を確認）
6. [x] ゾーン設定「Always Use HTTPS」（SSL/TLS → Edge Certificates）をONにする（2026-09-16に追加した手順。切り替え後の確認で`http://lism-css.com/`が200で素のHTTP配信になっていた。Vercelは308でHTTPSへ飛ばしていた。ON後は`http://`→`https://`が301でクエリも保持される。DNS onlyのtemplates/cdn/wpには影響しない）
7. [x] `wrangler.jsonc`に`"workers_dev": false`を追記するPR（PR 2）をdevへマージし、リリースフローでmainへ反映してworkers.dev routeを無効化する（重複コンテンツのインデックス防止）（2026-09-16: #625。切り替え後の確認で見つかったHSTS欠落（Vercelは`max-age=63072000`を全応答に付けていた）への対応として、`_headers`の`/*`ルールと、スモークテストのHSTS検査・`--expect-https-redirect`検査も同じPRに含めた）
   - ダッシュボードだけで無効化すると次回のWranglerデプロイで再有効化されるため、必ず設定ファイルで行う
   - プレビューURLはPhase 1で`"preview_urls": true`を明示済みのため無効化されない（`preview_urls`未指定だと`workers_dev`に連動して無効化される）。ただし非本番ブランチのビルドはPhase 3でOFFにしたため、ブランチpushでプレビューURLが発行されることはない
8. [x] mainデプロイ後、本番で`--expect-https-redirect`付きスモークテストを実行し、HSTSの付与と`lism-site.loos.workers.dev`が応答しなくなったことを確認する（2026-09-16 07:12 UTCにデプロイ完了。スモークテスト36件合格、`.md`にもHSTS付与、workers.devはCloudflareの`error code: 1042`（404）で無効化を確認）

### Phase 6: 事後確認・監視（2026-09-16〜17。切り替え後のGooglebotクロール成功を確認できたため、1〜2週間の監視は不要と判断して短縮）

- [x] 本番URLでPhase 2のチェックリストを再実施（スモークテストは`--base=https://lism-css.com --expect-https-redirect`でPhase 5に合格済み。2026-09-16: Pagefind検索（ja/en）・OG画像4ディレクトリ・カスタム404・cdn画像の目視確認OK）
- [x] Search Consoleでsitemap再取得・インデックスエラーを監視（ドメイン不変のためプロパティ再登録は不要）（2026-09-16 07:19 UTCに`sitemap-index.xml`を再送信し、同時刻に再取得済み。218 URL・エラー0・警告0で切り替え前（2026-09-09）と同じ。2026-09-17のURL検査で、トップと`/en/`が切り替え後にクロールされPage Fetch成功・インデックス済み・正規URL不変であることを確認）
- [x] `templates.lism-css.com`・`cdn.lism-css.com`（docsの画像が表示されること）・`wp.lism-css.com`が引き続き動いていることを確認（2026-09-16: 3つとも応答を確認済み。`lism-css.com`のメールは未使用のため受信確認はしない。MXは残す）

### Phase 7: クリーンアップ（安定確認後 → PR 3）

前提：Phase 6の安定確認が完了し、Phase 5で記録したapex・wwwそれぞれの切り替え時刻から、切り替え前のTTLがすべて経過していること。Phase 4のNS移管後の待機時間で代替しない。

- [x] `apps/site/vercel.ts`を削除
- [x] `apps/site/src/config/redirects.ts`の`vercelRedirects`/`VercelRedirect`型を削除（`_redirects`に一本化）
- [x] `documents/docs-md.md`の`vercel.ts`セクションを`_headers`+Workerベースの記述に更新
- [x] `apps/site/scripts/generate-lastmod-map.ts`冒頭コメントの「Vercel等のCI環境では〜」の文言を更新
- [x] ルート`.gitignore`の`.vercel`を削除
- [ ] Vercelの`lism-css-docs`プロジェクトから`lism-css.com`と`www.lism-css.com`の割り当てを外す
- [ ] Vercelチームから`lism-css.com`を削除する（Vercel DNSのゾーンが消える。以後はNSをVercelへ戻すロールバックができなくなる）
- [ ] Vercelプロジェクト`lism-css-docs`を削除する

Phase 7が完了したら、デプロイ経路をWorkers BuildsからGitHub Actionsへ移す#624に着手する（本プランの対象外。Workers BuildsのGit連携解除はそちらで行う）。

### PR構成

PRは3つ（いずれもdevターゲット・時系列順に番号を振る）：

- **PR 1**（#621、マージ済み）: Phase 1のファイル追加（`wrangler.jsonc`・`_redirects`・`_headers`・`.gitignore`・`scripts/smoke-test.ts`）。Phase 2のローカル検証を済ませてから提出する。Phase 2で`.md`のContent-Type不足が判明した場合は、フォールバックWorker（`worker/index.ts`+`wrangler.jsonc`の`run_worker_first`）もこのPRに含める
- **PR 1b**（#622、マージ済み）: フォールバックWorker（`worker/index.ts`・`worker/index.test.ts`・`wrangler.jsonc`の`main`と`run_worker_first`）。Phase 3の本番実測でcharset不足が判明したため、PR 1マージ後に分離して提出した
- **PR 2**（#625、マージ済み）: `wrangler.jsonc`への`"workers_dev": false`追記に加え、切り替え後の確認で見つかったHSTS欠落の対応（`_headers`の`/*`ルール）とスモークテストの検査追加。本番切り替え（Phase 5）のタイミングでmainへ反映する必要があるため、PR 1には含めず分離した
- **PR 3**: Phase 7のクリーンアップ（Phase 6の安定確認後）

Phase 0・3・4・5・6はダッシュボード・確認作業でコード変更なし（Phase 5のPR 2を除く）。Phase 0〜4は2026-09-14に、Phase 5は2026-09-16に完了した。

## 設計判断の根拠

- **Cloudflare Workers（Pagesではなく）を採用**：Cloudflare公式が新規プロジェクトにはWorkersを推奨しており、Astro公式のCloudflareアダプター（v13以降）もPagesサポートを削除済みのため
- **`@astrojs/cloudflare`アダプターは導入しない**：完全な静的サイトでSSRがないため不要。`wrangler.jsonc`で`dist`を指定するだけでよい
- **ネームサーバーをCloudflareへ移管する**：WorkersのCustom DomainにはCloudflare上のアクティブなゾーンが必須で、ネームサーバーを変えないpartial（CNAME）setupはBusiness以上限定のため、Freeプランでは移管が唯一の道
- **ドメインを`lismcss.com`へ変えてVercelにリダイレクトを残す案は却下**（2026-09-05）：ネームサーバー移管は避けられるが、サイト移転扱いになりSEOとURL更新（リポジトリ内で約280ファイル・1500箇所超、公開済みnpm READMEやskills.sh配布分の再公開）のコストが移管より重い。npmの素の`lismcss`は「既存の`lism-css`と記号を除いて同名」のルールで持ち主でも取れないことを実際の`npm publish`で確認しており、scope付き`@lismcss/*`だけではブランド統一の旨みも小さい。ドメイン・GitHub・npmすべて`lism-css`のまま維持する
- **ゾーン移管（Phase 4）と配信元の切り替え（Phase 5）を分ける**：レコードをVercel向けのまま移管すれば、移管そのものはユーザーから見えない変更になる。問題の切り分けが容易で、Phase 4だけならxdomainでNSをVercelへ戻すだけでロールバックできる
- **Vercelのドメイン割り当て・チーム登録はPhase 7まで維持する**：Phase 5でDNSを切り替えても、旧応答はTTLが切れるまでキャッシュに残る（[Cloudflare公式FAQ](https://developers.cloudflare.com/dns/faq/)）。旧IPへ来る利用者に配信を続けるには、プロジェクトへの割り当ても必要。チーム登録・DNSゾーンだけを残しても代わりにならない。両方を残すことで、ロールバック時のドメイン再割り当ても不要になる
- **CAAはコピーしない**：Vercelが自身の証明書発行用に置いたもの。CAA無しは「どのCAでも発行可」で、Cloudflareの証明書発行にもXServer側のLet's Encrypt更新にも支障がない
- **`.md`の`Content-Type`を`_headers`に書かない**：`_headers`はパスパターン式のため、存在しない`.md` URLの404レスポンスにも`text/markdown`が付いてしまい、#506と同じ不整合が再発する。方針は次の2段構え：
  1. Cloudflareのデフォルト挙動で実在する`.md`に適切なContent-Type（charset付き）が付くならそれで完了（#506も自然に解消）
  2. 不足していた場合は、`run_worker_first`の小さなWorkerコードで「ASSETSに実在するか判定してから」Content-Typeを付与する
- **`X-Robots-Tag: noindex`は`_headers`のパスパターンのままでよい**：存在しないURLの404に付いても実害がないため
- **`_redirects`のcase-sensitivity問題は実測のみで対応**：Cloudflareの`_redirects`がcase-sensitiveかは公式ドキュメントに明記がない。ただし小文字版（Astro側`astroRedirects`）とcamelCase版（`_redirects`側）の宛先が同一のため、どちらの挙動でも結果は正しい。Phase 2で両casingを実測して確認する
- **workers.dev無効化とプレビューURL維持は`wrangler.jsonc`で両立させる**：プレビューURLは`preview_urls`未指定だと`workers_dev`設定に連動して無効化される（公式明記）。また、workers.devをダッシュボードだけで無効化しても次回のWranglerデプロイで再有効化される（公式明記）。そのため`preview_urls: true`をPhase 1から明示し、`workers_dev: false`はPhase 5で設定ファイルに追記する
- **プレビューURLのnoindexは`_headers`のホスト付きルールで付与する**：Vercelと違い、Cloudflareはプレビュー環境に自動でnoindexを付けない。公式ドキュメント記載の例（`https://:version.:subdomain.workers.dev/*`）をそのまま使い、workers.devホスト上のHTML・`.md`全体をnoindexにする
- **小文字URLのリダイレクトは現行どおりmeta refreshのまま**：`astroRedirects`はAstroの静的ビルドで「HTTP 200+meta refreshページ（noindex・canonical付き）」として出力されており（`dist/docs/primitives/l--fluidcols/index.html`で確認済み）、現行Vercel本番でも301ではない。今回の移行は挙動維持が原則のため変えない。76件を`_redirects`へ移して本物の301にする改善は考えられるが、移行とは独立した変更のためスコープ外とする（やるなら別Issue）
- **HTTP→HTTPSのリダイレクトはゾーン設定「Always Use HTTPS」で行う**：WorkerのCustom DomainはHTTPリクエストをそのままWorkerへ通すため、Vercelが自動でやっていたHTTPS化を明示的に用意する必要がある。ゾーン設定ならProxyオンの全ホスト（apex・www）に一括で効き、Redirect Ruleより前に処理される。Worker内で判定する案は、設定1つで済むものをコードにする理由がないため採らない
- **HSTSは`_headers`の`/*`ルールで付与する（ゾーン設定のHSTSではなく）**：Vercelと同じ`max-age=63072000`（2年）をそのまま再現でき、設定がリポジトリに残ってスモークテストで検証できる。ダッシュボードのHSTS設定はmax-ageの上限が12か月。`_headers`はリダイレクト応答（`_redirects`・Redirect Rule）には付かないが、HTML・`.md`・静的ファイルの応答に付けば足りる
- **PR分割は3つ（Phase 1 / Phase 5 / Phase 7）**：間のPhaseはダッシュボード作業のため。PR 2（`workers_dev: false`）を分けるのは本番切り替えのタイミングでmainへ反映する必要があるため、PR 3（クリーンアップ）を分けるのは安定確認（Phase 6）を挟んでからロールバック手段（`vercel.ts`・Vercel上のドメイン）を消すため

## 未決事項・要確認・事前準備

- 解決済み: Vercelの環境変数は無し、Node.jsは22.x（Phase 0で確認）
- 解決済み: `lism-css.com`のメールは未使用（Google Workspaceのセカンダリドメインとして登録はあり）。MXはコピー済みで残す
- 解決済み: Vercelで「プロジェクトからドメインを外す」と「チームからドメインを削除する」は別操作で、DNSゾーンは後者にひもづく（Phase 0で確認）
- 解決済み: `.md`のデフォルトContent-Typeはローカル（miniflare）ではcharset付き、本番ではcharset無し。フォールバックWorkerで`text/markdown; charset=utf-8`を付与する（2026-09-14）
- 解決済み: `/*.md`パターンは浅い階層（`/ui.md`）・深い階層（`/docs/primitives/a--decorator.md`）ともPhase 2で`X-Robots-Tag`付与を実測
- Workers Buildsでのpnpm workspaceビルドの成立（Phase 3で確認。必要ならビルドコマンドにinstallを明示）
- `.cache/og/`（OG画像ビルドキャッシュ）がWorkers Buildsで永続化されず、ビルド時間が伸びる可能性（初回デプロイで許容範囲か確認）
- ゾーン移管後にCloudflare Pagesのカスタムドメイン`templates.lism-css.com`・`cdn.lism-css.com`がそのまま動くか（Phase 4で確認。Pages側がProxyオンのCNAMEを要求する場合はそれに従う）

## 失敗時の対応・ロールバック

Vercelのプロジェクト・apex/wwwの割り当て・チーム上のドメイン登録・DNSゾーンはPhase 7まで残す。以下はこれらが維持されている間のロールバック手順。

### A. Phase 5（配信元切り替え）後に戻す：配信元だけVercelへ戻す

ゾーンはCloudflareのまま、apex・wwwの向き先を戻す。

1. Vercelプロジェクトにapex・wwwの割り当てが残っていることを確認し、Phase 5の手順5と同じ方法でVercel側のHTTPS配信・wwwリダイレクトを確認する。正常に応答しなければ、復旧するまでCloudflare側を変更しない
2. WorkerからCustom Domain `lism-css.com`を削除する
3. CloudflareのDNS設定を開き、Worker向けの管理レコードが残っていないか確認する。残っていれば手動で削除する（Custom Domain削除時にDNSレコードが自動削除されるかは公式ドキュメントに明記がないため、「外れている」前提で進めない）
4. Phase 4で作ったとおりに、apex・wwwのVercel向けCNAMEレコード（Proxyオフ）を復元する。wwwのプレースホルダとRedirect Ruleは削除する。Always Use HTTPSはDNS onlyのホストには効かないため、ONのままでよい
5. `https://lism-css.com/`がVercel配信（`server: Vercel`）でHTTPSエラーなく表示され、`https://www.lism-css.com/`がapexへ307されることを確認する

注意：Custom Domain削除時、自動発行されたAdvanced Certificateは**自動では削除されない**（公式明記）。残っていても動作上の実害はないが、恒久的にVercelへ戻す判断をした場合はダッシュボードから手動削除する。

### B. Phase 4（ゾーン移管）後に戻す：DNSの管理者をVercelへ戻す

Phase 5まで進んでいた場合は、先にAの手順を完了してから以下を行う。

1. xdomainの「ネームサーバー設定」で`ns1/ns2.vercel-dns.com`に戻す
2. 反映を待つ。VercelチームにドメインとDNSレコードが残っている限り、移管前と同じ内容で応答する

Phase 7でVercelチームからドメインを削除したあとは、Bのロールバックは使えない。

## 受容済みリスク・対象外（やらないこと）

- **Cloudflare Pagesへの移行はしない**：新規はWorkersが公式推奨のため
- **`@astrojs/cloudflare`アダプターは導入しない**：静的サイトのため不要
- **ドメイン変更（`lismcss.com`）・GitHub orgの移管・npmパッケージのリネームはしない**：「設計判断の根拠」参照。`lismcss.com`をブランド保護のために取得して`lism-css.com`へリダイレクトする件は本プランの対象外（任意・別件）
- **テンプレートプレビュー（`templates.lism-css.com`、Cloudflare Pages）のWorkers移行はしない**：今回のスコープ外。別途判断する
- **ビルド時間の改善（デプロイ経路のActions化・サイトのコンパイル最適化）はしない**：#624で別途扱う。Phase 7完了後に着手する
- **`astroRedirects`（小文字URL等・76件）の`_redirects`移行（301化）はしない**：現行Vercel本番と同じmeta refresh挙動を維持する。移行とは独立した改善のためスコープ外（やるなら別Issue）
- **www→apexのリダイレクトが307から301に変わることは受容**：恒久リダイレクトとして正しく、SEO上も有利なため
- **Vercelの`*`（ワイルドカード）ALIASはコピーしない**：未定義のサブドメインは現在Vercelの404を返しているが、移管後は名前解決されなくなる。実害がなく、意図しないサブドメインが解決しない方が健全なため
- **ネームサーバー反映待ちの間に新旧DNSが混在することは受容**：どちらもVercel向けの同じ内容を返すため実害がない
- **存在しないURLの404に`X-Robots-Tag: noindex`が付くことは受容**：実害がないため
- **リダイレクト応答（www→apex・`_redirects`・HTTP→HTTPS）にHSTSが付かないことは受容**：ブラウザはHTTPSで受け取った最終ページの応答からHSTSを記憶するため、HTML・`.md`に付いていれば足りる
- 作業中、環境変数の値・アカウント情報・シークレット類・DNSレコードの認証用トークン値をリポジトリやIssue/PRに記載しない（設定はCloudflare/Vercel/xdomainの管理画面上でのみ扱う）

## 完了条件

- Phase 2・3・4・5の各チェックリストがすべて通っている
- `lism-css.com`のNSがCloudflareで、移管前のレコード（MX・TXT・`templates`・`cdn`・`wp`）がすべて再現され、メール・Search Console・各サブドメインが移管前どおり動いている
- 本番URL（`lism-css.com`）で：表示・検索・リダイレクト（camelCase=301 / 小文字=現行同等のmeta refresh / `/docs/`=301）・404・`.md`ヘッダー・OG画像キャッシュがVercel時代と同等以上
- `www.lism-css.com`がapexへ301される
- `http://lism-css.com/`がHTTPSへ301され、HTML・`.md`の応答にVercel時代と同じHSTS（`max-age=63072000`）が付いている
- workers.devホスト上のURL（プレビューURL含む）のHTML・`.md`に`X-Robots-Tag: noindex`が付いている
- `/naming.md`等の存在しない`.md` URLがHTML 404で返り`text/markdown`が付かない（#506の対応完了）
- Search Consoleでsitemapが再取得され（エラー0）、切り替え後のGooglebotクロールがPage Fetch成功している
- Phase 5の切り替え後も旧Vercel向けIPでHTTPS配信・wwwリダイレクトを確認でき、Phase 7の開始条件を満たすまでドメイン割り当てを維持している
- Phase 7完了時点でリポジトリからVercel痕跡（`vercel.ts`・`vercelRedirects`・`.gitignore`の`.vercel`）が消え、Vercel上のプロジェクトとドメイン登録も消えている
