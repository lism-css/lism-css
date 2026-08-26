# Plan: apps/docs のデプロイ先を Vercel から Cloudflare Workers へ移行する（#511）

> 状態: Ready
> 対象Issue: [#511](https://github.com/ddryo/lism-css/issues/511)（あわせて [#506](https://github.com/ddryo/lism-css/issues/506) も解決する）

## 概要 / ゴール

apps/docs（公式ドキュメントサイト `lism-css.com`）のデプロイ先をVercelからCloudflare Workers（静的アセット配信）+ Workers Builds（Git連携）へ移行する。

完了時の状態：

- `lism-css.com` がCloudflare Workersから配信されている
- mainへのpushで本番デプロイされる運用が維持されている
- 存在しない`.md` URLへの404レスポンスに`Content-Type: text/markdown`が付かない（#506解消）
- Vercel固有のファイル・設定がリポジトリから消えている（クリーンアップ後）

## 背景・前提（コードで裏取り済み）

- apps/docsは完全な静的サイト（`apps/docs/astro.config.ts`にアダプター設定なし・SSRなし）。OG画像・Pagefind検索・sitemap・llms.txtはすべてビルド時生成でホスティング先に依存しない
- Vercel固有の依存は`apps/docs/vercel.ts`の1ファイルのみ。中身は次の3点：
  - `buildCommand: 'cd ../.. && pnpm build:docs'`
  - `redirects: vercelRedirects`（`apps/docs/src/config/redirects.ts`で定義。camelCase版リダイレクト6件）
  - `headers` 2種（OG画像PNGの`Cache-Control` / `*.md`への`X-Robots-Tag: noindex`+`Content-Type: text/markdown; charset=utf-8`）
- `wrangler`はルート`package.json`のdevDependenciesに導入済み（`^4.107.0`）。`templates.lism-css.com`でCloudflare Pagesの利用実績あり
- `apps/docs/src/pages/404.astro`が存在するため、ビルドで`dist/404.html`が生成される
- `astro.config.ts`に`trailingSlash`指定なし（デフォルト`ignore`）・`build.format`指定なし（デフォルト`directory`）。全ページが`{path}/index.html`で出力されるため、Workersのデフォルト`html_handling: "auto-trailing-slash"`と整合する想定（Phase 2で実測）
- OG画像の実際の出力先は`/docs/og/`・`/ui/og/`・`/en/docs/og/`・`/en/ui/og/`の4ディレクトリ（distで確認済み）。`public/ogimg-default.png`（ルート直下）は元のVercelパターン（`/:path*/og/:slug*.png`）でも対象外なので扱い変更なし
- `.md`ファイルは`/ui.md`のような浅い階層と`/ui/accordion.md`のような深い階層の両方に出力される（`/*.md`パターンは複数セグメントへのマッチが必要）
- `apps/docs/lastmod-map.json`はローカル生成してコミットする運用（`apps/docs/scripts/generate-lastmod-map.ts`）のため、CI環境の変更による影響はない

### #506 との関係

#506は「存在しない`.md` URLへの404レスポンスで、Content-Type（`text/markdown`）とボディ（HTML）が不一致になる」問題。Vercelの`headers`設定では「ファイルが実在する場合のみヘッダーを付ける」条件が書けないため、移行先での対応が前提になっている。本プランのPhase 1〜2の`.md` Content-Type方針で解決する。

## 実装プラン

### Phase 0: 事前確認（コード変更なし・ダッシュボード作業）

- [ ] Vercelダッシュボードの棚卸し：管理画面のみで設定されている項目がないか
  - 環境変数の有無 / Node.jsバージョン / `www.lism-css.com`の扱い / Git連携の本番ブランチとプレビューの挙動
- [ ] `lism-css.com`のDNSゾーンがCloudflareアカウントにあるか確認（あればネームサーバー変更不要で切り替え可能）
- [ ] **現在のDNSレコードを控える**：apex（`lism-css.com`）とwwwそれぞれの「レコードタイプ・値・Proxy状態（オレンジ雲か）」を記録する。Phase 4の切り替え手順とロールバック手順の両方でこの記録を使う

### Phase 1: リポジトリ側の準備（devから作業ブランチを切る → PR 1）

- [ ] `apps/docs/wrangler.jsonc`を新規作成。静的アセット配信のみなので`main`（Workerスクリプト）は不要：

  ```jsonc
  {
    "name": "lism-docs",
    "compatibility_date": "{作成日}",
    // プレビューURLはworkers_dev設定に連動して無効化されるため、明示的にtrueにする
    // （Phase 4でworkers_devをfalseにしてもプレビューURLを維持するため）
    "preview_urls": true,
    "assets": {
      "directory": "./dist",
      "not_found_handling": "404-page"
    }
  }
  ```

  `workers_dev`はこの時点では書かない（デフォルト有効のまま）。Phase 3の検証で`*.workers.dev` URLを使うためで、無効化はPhase 4で`"workers_dev": false`を設定ファイルに追記して行う（ダッシュボードだけで無効化しても次回のWranglerデプロイで再有効化されるため、必ず設定ファイルで管理する）。

- [ ] `apps/docs/public/_redirects`を新規作成し、`vercelRedirects`の6件を移植（camelCase URL → 移行後URL、301）：

  ```
  /docs/primitives/l--fluidCols/ /docs/primitives/l--autoColumns/ 301
  /docs/primitives/l--sideMain/ /docs/primitives/l--withSide/ 301
  /docs/primitives/l--switchCols/ /docs/primitives/l--switchColumns/ 301
  /en/docs/primitives/l--fluidCols/ /en/docs/primitives/l--autoColumns/ 301
  /en/docs/primitives/l--sideMain/ /en/docs/primitives/l--withSide/ 301
  /en/docs/primitives/l--switchCols/ /en/docs/primitives/l--switchColumns/ 301
  ```

  `redirects.ts`にある移行経緯のコメント（casing違いの出力先衝突をAstro側で扱えない件）は`#`コメントとして`_redirects`にも書いておく（Phase 6で`vercelRedirects`を消したときに経緯が残るように）。

- [ ] `apps/docs/public/_headers`を新規作成し、`vercel.ts`のヘッダーを移植：

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
- [ ] ルート`.gitignore`に`.wrangler/`を追加（Phase 2の`wrangler dev`で生成されるため。`.vercel`の削除はPhase 6）
- [ ] `apps/docs/scripts/smoke-test.ts`を新規作成（デプロイ検証用スモークテスト）。`npx tsx scripts/smoke-test.ts --base={検証先URL}`で、Phase 2チェックリストのうちHTTPで機械的に確認できる項目（ステータス・Location・Content-Type・`X-Robots-Tag`・`Cache-Control`・404）を一括検査し、1件でも失敗したら非0で終了する。Phase 2（ローカル）・Phase 3（workers.dev）・Phase 5（本番）で同じスクリプトを`--base`違いで使い、環境間の確認漏れを防ぐ
  - HTMLページへのnoindexはworkers.devホスト上だけが期待値（本番カスタムドメインには付かない）のため、`--expect-html-noindex`のようなフラグで期待値を切り替えられるようにする
  - OG画像は出力ごとにファイル名が変わるため、実在するOG画像パスを引数で渡すか、sitemapから1件解決して検査する

### Phase 2: ローカル検証

`pnpm build:docs && cd apps/docs && npx wrangler dev`で以下を確認：

- [ ] トップ・`/docs/overview/`・`/en/`の表示
- [ ] trailing slash挙動（`/docs/overview`→`/docs/overview/`へのリダイレクト等、Astroの`directory`形式出力とWorkersの`auto-trailing-slash`の整合）
- [ ] リダイレクト：`l--fluidCols`（camelCase・`_redirects`側）がHTTP 301で飛ぶこと
- [ ] リダイレクト：`l--fluidcols`（小文字・Astro側`astroRedirects`）が**HTTP 200+meta refreshページ**（noindex・canonical付き）として配信され、正しく遷移すること。301にはならない（現行Vercel本番と同じ挙動。理由は「設計判断の根拠」参照）
- [ ] `/*.md`パターンのヘッダー：深い階層（`/ui/accordion.md`）と浅い階層（`/ui.md`）の両方に`X-Robots-Tag: noindex`が付く
- [ ] 実在する`.md`のContent-Type実測：Cloudflareのデフォルトで`text/markdown`（charset有無も確認）が付くか
- [ ] OG画像（4ディレクトリ）の`Cache-Control`
- [ ] 404ページ（ステータス404+カスタムページ）
- [ ] 存在しない`.md` URL（例: `/naming.md`）が通常のHTML 404で返り、`Content-Type: text/markdown`が付かないこと（#506の解消確認）
- [ ] Pagefind検索・OG画像表示・`/llms.txt`・sitemap

上記のうちHTTPで機械的に確認できる項目は、Phase 1で追加するスモークテスト（`scripts/smoke-test.ts`）を`--base=http://localhost:8787`（`wrangler dev`のデフォルトURL）で実行して一括確認する。Pagefind検索の動作やOG画像・404ページの見た目などは目視で確認する。

`.md`のデフォルトContent-Typeが不足していた場合は、下記のフォールバックを導入してPhase 2のチェックリストを再実施する（`_headers`にContent-Typeを書かない理由は「設計判断の根拠」参照）。

#### `.md`のContent-Type不足時のフォールバック設計（Phase 2で不足と判明した場合のみ導入）

実在する`.md`に適切な`Content-Type`が付かなかった場合のみ、以下をPR 1に含める。

- `wrangler.jsonc`にWorkerスクリプトと`run_worker_first`を追加する：

  ```jsonc
  {
    "name": "lism-docs",
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

- `apps/docs/worker/index.ts`を新規作成する。責務は「ASSETSが200を返した`.md`にだけヘッダーを付与する」ことに限定する：

  ```ts
  export default {
    async fetch(request: Request, env: { ASSETS: { fetch: typeof fetch } }) {
      const response = await env.ASSETS.fetch(request);
      // 実在する.mdのみヘッダーを付け替える。
      // 404はASSETSが返すHTML 404（text/html）をそのまま返す（#506の不整合を再発させない）
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'text/markdown; charset=utf-8');
        headers.set('X-Robots-Tag', 'noindex');
        return new Response(response.body, { status: response.status, headers });
      }
      return response;
    },
  };
  ```

設計上の注意（Cloudflare公式ドキュメントで確認済み）：

- `_headers`・`_redirects`は**Workerコードが生成したレスポンスには適用されない**（URLがルールに一致していても適用されない、と公式に明記）。そのため`run_worker_first`対象の`/*.md`では、`X-Robots-Tag: noindex`を上記のとおりWorker側で自前付与する。`_headers`の`/*.md`ルールは効かなくなるが削除はせず、Worker側で付与している旨のコメントを`_headers`に書く
- `_redirects`への影響はない：`_redirects`の6件はすべて`/docs/primitives/…/`のHTML URLで、`run_worker_first: ["/*.md"]`の対象外のため従来どおり適用される
- `run_worker_first`のパターンはglob形式（`*`は貪欲マッチ、`!`で除外パターン）。`/ui.md`（浅い階層）と`/ui/accordion.md`（深い階層）の両方がWorkerへ来ることをPhase 2で確認する
- pathnameの`.md`判定はWorker内では行わない（`run_worker_first`で`/*.md`のみがWorkerへ来るため）。将来`run_worker_first`のパターンを広げる場合は`url.pathname.endsWith('.md')`のガードを追加すること

### Phase 3: Workers Buildsセットアップ（本番未切り替え・ダッシュボード作業）

- [ ] リポジトリ接続：ルートディレクトリ`apps/docs`、ビルドコマンド`cd ../.. && pnpm build:docs`、デプロイコマンド`npx wrangler deploy`、本番ブランチ`main`
- [ ] pnpm workspaceの依存解決がWorkers Builds環境で正しく行われるか確認（ルートでの`pnpm install`が必要。うまくいかない場合はビルドコマンドに`cd ../.. && pnpm install --frozen-lockfile && pnpm build:docs`のように明示する）
- [ ] Node.jsバージョンを環境変数で指定（Phase 0で確認した値に合わせる）
- [ ] `PNPM_VERSION`も環境変数で指定し、ルート`package.json`の`packageManager`（現在は`pnpm@10.33.0`）と合わせる（ビルドの再現性のため。`packageManager`を更新したらこの環境変数も追従させる）
- [ ] `*.workers.dev` URLでPhase 2と同じチェックリストを実施（スモークテストを`--base=https://lism-docs.<サブドメイン>.workers.dev --expect-html-noindex`で実行＋目視確認）
- [ ] devブランチpushでプレビューURL（`<バージョンプレフィックス>-lism-docs.<サブドメイン>.workers.dev`）が発行されることを確認
- [ ] プレビューURLで**HTMLと`.md`の両方**に`X-Robots-Tag: noindex`が付くことを確認（`_headers`のworkers.devホスト付きルールによる。フォールバックWorker導入時の`.md`はWorker側の付与で担保される）
- [ ] 初回ビルドの所要時間を確認（`.cache/og/`が永続化されない可能性が高いため。許容範囲かを判断）

### Phase 4: 本番切り替え

前提：Phase 1の変更が通常のリリースフローでmainへマージ済みであること（Workers Buildsの本番ブランチはmainのため）。

WorkerのCustom Domainは「既存のCNAMEレコードがあるホスト名には作成できない」（公式明記）ため、以下の順序で行う：

1. [ ] Phase 0で控えたDNSレコードの記録（apex・wwwのタイプ・値・Proxy状態）が最新であることを再確認する
2. [ ] apex（`lism-css.com`）の既存DNSレコード（Vercel向け）を削除する
3. [ ] WorkerにCustom Domain `lism-css.com`を追加する（Worker向けDNSレコードと証明書はCloudflareが自動作成する）
4. [ ] `https://lism-css.com/`が証明書エラーなく表示されることを確認する（証明書発行に時間がかかる場合がある）
5. [ ] wwwの扱いを現状に合わせて再現する（Redirect Rulesで`www`→`lism-css.com`へリダイレクトする場合、www用にプロキシ済み（オレンジ雲）のDNSレコードが必要）
6. [ ] Vercel側のドメイン割り当てを解除する（**プロジェクトはロールバック用に残す**）
7. [ ] `wrangler.jsonc`に`"workers_dev": false`を追記する軽微PR（PR 2）をdevへマージし、リリースフローでmainへ反映してworkers.dev routeを無効化する（重複コンテンツのインデックス防止）
   - ダッシュボードだけで無効化すると次回のWranglerデプロイで再有効化されるため、必ず設定ファイルで行う
   - プレビューURLはPhase 1で`"preview_urls": true`を明示済みのため無効化されない（`preview_urls`未指定だと`workers_dev`に連動して無効化される）

### Phase 5: 事後確認・監視（1〜2週間）

- [ ] 本番URLでPhase 2のチェックリストを再実施（スモークテストを`--base=https://lism-css.com`で実行＋目視確認）
- [ ] Search Consoleでsitemap再取得・インデックスエラーを監視（ドメイン不変のためプロパティ再登録は不要）

### Phase 6: クリーンアップ（安定確認後 → PR 3）

- [ ] `apps/docs/vercel.ts`を削除
- [ ] `apps/docs/src/config/redirects.ts`の`vercelRedirects`/`VercelRedirect`型を削除（`_redirects`に一本化）
- [ ] `documents/docs-md.md`の`vercel.json`セクション（「## 5.」）を`_headers`ベースの記述に更新
- [ ] `apps/docs/scripts/generate-lastmod-map.ts`冒頭コメントの「Vercel等のCI環境では〜」の文言を更新
- [ ] ルート`.gitignore`の`.vercel`（43-44行目付近）を削除
- [ ] Vercelプロジェクトを削除

### PR構成

PRは3つ（いずれもdevターゲット・時系列順に番号を振る）：

- **PR 1**: Phase 1のファイル追加（`wrangler.jsonc`・`_redirects`・`_headers`・`.gitignore`・`scripts/smoke-test.ts`）。Phase 2のローカル検証を済ませてから提出する。Phase 2で`.md`のContent-Type不足が判明した場合は、フォールバックWorker（`worker/index.ts`+`wrangler.jsonc`の`run_worker_first`）もこのPRに含める
- **PR 2**: `wrangler.jsonc`への`"workers_dev": false`追記（1行のみの軽微PR）。本番切り替え（Phase 4）のタイミングでmainへ反映する必要があるため、PR 1には含めず分離する
- **PR 3**: Phase 6のクリーンアップ（Phase 5の安定確認後）

Phase 0・3・5はダッシュボード・確認作業でコード変更なし。

## 設計判断の根拠

- **Cloudflare Workers（Pagesではなく）を採用**：Cloudflare公式が新規プロジェクトにはWorkersを推奨しており、Astro公式のCloudflareアダプター（v13以降）もPagesサポートを削除済みのため
- **`@astrojs/cloudflare`アダプターは導入しない**：完全な静的サイトでSSRがないため不要。`wrangler.jsonc`で`dist`を指定するだけでよい
- **`.md`の`Content-Type`を`_headers`に書かない**：`_headers`はパスパターン式のため、存在しない`.md` URLの404レスポンスにも`text/markdown`が付いてしまい、#506と同じ不整合が再発する。方針は次の2段構え：
  1. Cloudflareのデフォルト挙動で実在する`.md`に適切なContent-Type（charset付き）が付くならそれで完了（#506も自然に解消）
  2. 不足していた場合は、`run_worker_first`の小さなWorkerコードで「ASSETSに実在するか判定してから」Content-Typeを付与する
- **`X-Robots-Tag: noindex`は`_headers`のパスパターンのままでよい**：存在しないURLの404に付いても実害がないため
- **`_redirects`のcase-sensitivity問題は実測のみで対応**：Cloudflareの`_redirects`がcase-sensitiveかは公式ドキュメントに明記がない。ただし小文字版（Astro側`astroRedirects`）とcamelCase版（`_redirects`側）の宛先が同一のため、どちらの挙動でも結果は正しい。Phase 2で両casingを実測して確認する
- **workers.dev無効化とプレビューURL維持は`wrangler.jsonc`で両立させる**：プレビューURLは`preview_urls`未指定だと`workers_dev`設定に連動して無効化される（公式明記）。また、workers.devをダッシュボードだけで無効化しても次回のWranglerデプロイで再有効化される（公式明記）。そのため`preview_urls: true`をPhase 1から明示し、`workers_dev: false`はPhase 4で設定ファイルに追記する
- **プレビューURLのnoindexは`_headers`のホスト付きルールで付与する**：Vercelと違い、Cloudflareはプレビュー環境に自動でnoindexを付けない。公式ドキュメント記載の例（`https://:version.:subdomain.workers.dev/*`）をそのまま使い、workers.devホスト上のHTML・`.md`全体をnoindexにする
- **小文字URLのリダイレクトは現行どおりmeta refreshのまま**：`astroRedirects`はAstroの静的ビルドで「HTTP 200+meta refreshページ（noindex・canonical付き）」として出力されており（`dist/docs/primitives/l--fluidcols/index.html`で確認済み）、現行Vercel本番でも301ではない。今回の移行は挙動維持が原則のため変えない。76件を`_redirects`へ移して本物の301にする改善は考えられるが、移行とは独立した変更のためスコープ外とする（やるなら別Issue）
- **PR分割は3つ（Phase 1 / Phase 4 / Phase 6）**：間のPhaseはダッシュボード作業のため。PR 2（`workers_dev: false`）を分けるのは本番切り替えのタイミングでmainへ反映する必要があるため、PR 3（クリーンアップ）を分けるのは安定確認（Phase 5）を挟んでからロールバック手段（`vercel.ts`）を消すため

## 未決事項・要確認・事前準備

- Phase 0の棚卸し結果待ち：Vercel管理画面の環境変数 / Node.jsバージョン / wwwの扱い / プレビューの挙動（すべて未確認）
- `lism-css.com`のDNSゾーンがCloudflareアカウントにあるか（未確認）
- Cloudflareが`.md`拡張子に付けるデフォルトContent-Type（charset有無含む・Phase 2で実測）
- `/*.md`のような「splat+拡張子」パターンの動作（公式ドキュメントにsplatは「全文字に貪欲マッチ」と記載があるため深い階層でも動く想定。Phase 2で念のため実測し、万一動かない場合は「`.md`のContent-Type不足時のフォールバック設計」のWorkerで代替する）
- Workers Buildsでのpnpm workspaceビルドの成立（Phase 3で確認。必要ならビルドコマンドにinstallを明示）
- `.cache/og/`（OG画像ビルドキャッシュ）がWorkers Buildsで永続化されず、ビルド時間が伸びる可能性（初回デプロイで許容範囲か確認）

## 失敗時の対応・ロールバック

Vercelプロジェクトを残しているため（削除はPhase 6まで行わない）、DNSをVercel向けに戻せばロールバックできる。ただしCustom DomainはCloudflareゾーン上にWorker向けDNSレコードを作成しているため、「Vercelにドメインを再割り当てするだけ」では戻らない。以下の順序で戻す：

1. WorkerからCustom Domain `lism-css.com`を削除する
2. CloudflareのDNS設定を開き、Worker向けの管理レコードが残っていないか確認する。残っていれば手動で削除する（Custom Domain削除時にDNSレコードが自動削除されるかは公式ドキュメントに明記がないため、「外れている」前提で進めない）
3. Phase 0で控えた記録どおりに、Vercel向けDNSレコード（apex・www。タイプ・値・Proxy状態も記録どおりに）を復元する
4. Vercelプロジェクトにドメインが割り当てられていることを確認する（Phase 4の手順6で解除済みなら再割り当てする）
5. `https://lism-css.com/`がVercel配信でHTTPSエラーなく表示されることを確認する

注意：Custom Domain削除時、自動発行されたAdvanced Certificateは**自動では削除されない**（公式明記）。残っていても動作上の実害はないが、恒久的にVercelへ戻す判断をした場合はダッシュボードから手動削除する。

## 受容済みリスク・対象外（やらないこと）

- **Cloudflare Pagesへの移行はしない**：新規はWorkersが公式推奨のため
- **`@astrojs/cloudflare`アダプターは導入しない**：静的サイトのため不要
- **テンプレートプレビュー（`templates.lism-css.com`、Cloudflare Pages）のWorkers移行はしない**：今回のスコープ外。別途判断する
- **`astroRedirects`（小文字URL等・76件）の`_redirects`移行（301化）はしない**：現行Vercel本番と同じmeta refresh挙動を維持する。移行とは独立した改善のためスコープ外（やるなら別Issue）
- **存在しないURLの404に`X-Robots-Tag: noindex`が付くことは受容**：実害がないため
- 作業中、環境変数の値・アカウント情報・シークレット類をリポジトリやIssue/PRに記載しない（設定はCloudflare/Vercelの管理画面上でのみ扱う）

## 完了条件

- Phase 2・3・4の各チェックリストがすべて通っている
- 本番URL（`lism-css.com`）で：表示・検索・リダイレクト（camelCase=301 / 小文字=現行同等のmeta refresh）・404・`.md`ヘッダー・OG画像キャッシュがVercel時代と同等以上
- workers.devホスト上のURL（プレビューURL含む）のHTML・`.md`に`X-Robots-Tag: noindex`が付いている
- `/naming.md`等の存在しない`.md` URLがHTML 404で返り`text/markdown`が付かない（#506クローズ可能）
- Search Consoleで1〜2週間インデックスエラーが増えていない
- Phase 6完了時点でリポジトリからVercel痕跡（`vercel.ts`・`vercelRedirects`・`.gitignore`の`.vercel`）が消えている
