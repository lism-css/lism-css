基準日: 2026-09-17・265c68166

# Astro 7 へアップグレードし、dev の FOUC を根本対応する（#580）

状態: PR1 実装済み（ブランチ `fix/580-upgrade-astro-7`）。PR2 は未着手

ユーザー判断が要る未決事項は無い。PR2 の Callout 変換方式だけは着手時の spike で確定する。

PR1 からの引き継ぎ（2026-09-18）:

- `dist` 比較は `apps/site/scripts/compare-dist.mjs` を使う（`node scripts/compare-dist.mjs <baseDist> <newDist>`）。PR2 の比較基準は PR1 マージ後の `dev` のビルド。
- Astro 7 由来で受容済みの差分（`docs/decisions.md` 2026-09-18 参照）: スコープ属性のハッシュ、タグ間の空白の有無、CSS 関数引数の空白、インライン JS の minify 結果、生成アセットのハッシュ名、`index.*.css` → `astro.*.css` のチャンク名。
- `disableServerTreeshake` は削除済み。Rolldown では有無で時間が変わらなかった。

## ゴールと対象範囲

- `apps/site` の Astro を 6.4.8 から 7.3.x へ上げ、dev サーバーのコールドスタートでページ用 CSS が `<head>` に出力される状態にする（#580 の本題）。
- `@lism-css/plugin` の peerDependencies を Astro 7 / Vite 8 まで広げて公開し直す。
- Markdown / MDX 処理を Sätteri へ切り替え、`hov.mdx` のリンク用空要素を見出し ID へ置き換える（#580 の「Sätteri への移行」節）。

対象外:

- `templates/*` の Astro テンプレート 5 つ（`lp/astro`・`minimal/astro`・`blog/astro/{personal,minimal,techlog}`、いずれも astro `^6.4.8`）。`apps/site` の更新後に別 issue で追いかける（2026-09-18 決定）。サイトで分かったこと（Rust コンパイラ・`compressHTML`・tree-shaking の結果）を引き継いで進める。
- `compressHTML: 'jsx'`（Astro 7 の新既定）の採用検討。本プランでは v6 挙動を維持する。
- `prettier-plugin-astro` 1.0.0 への更新。メジャー更新でフォーマット差分が出る可能性があるため（未確認）、Astro 7 で 0.14.1 が壊れない限り別途扱う。
- `apps/site` のさらなるビルド時間短縮（#624 の残課題）。ただし本プランで before / after は計測する。

## 背景・確認済みの前提

#580 の調査で、dev の FOUC は Astro 6 の dev サーバー内部の不具合 2 件（`containsHead` メタデータがコールドスタートで伝播しない、MDX 内の Astro コンポーネントだけ head 出力ゲートが文書順より先に評価される）の組み合わせと判明している。Astro 7 では runnable dev 環境がリクエスト時にモジュールグラフを走査する方式へ再設計されており、6.x へのバックポートは無い。issue 本文は `apps/docs` 表記と「最新 7.2.9」のままなので、着手時に `apps/site` と現行バージョンへ更新する。

基準日時点で確認済みの事実:

| 項目 | 確認結果 |
| --- | --- |
| 更新先バージョン | astro 7.3.2（2026-09-08 公開）、`@astrojs/mdx` 8.0.1、`@astrojs/react` 6.0.5、`@astrojs/markdown-remark` 7.3.1、`@astrojs/markdown-satteri` 0.4.1（satteri ^0.10.3 を内包）、`@astrojs/sitemap` 3.7.4、`astro-expressive-code` 0.44.2。いずれも `pnpm-workspace.yaml` の `minimumReleaseAge`（7 日）を満たす |
| Node | astro 7 の engines は node >=22.12.0。`.node-version` は `22` で、CI（`.github/workflows/deploy.yml`）も `node-version-file` で同じものを使う |
| Rust コンパイラ | `.astro` 全件（site 224・lism-ui 39・lism-css の `packages/astro` 32・templates 105）を `@astrojs/compiler-rs` 0.4 で変換してエラー・警告ゼロ |
| 廃止 API | `src/fetch.ts`、`@astrojs/db`、`astro:transitions` の内部定数、`getContainerRenderer()` の旧 import パスはいずれも未使用。`experimental` フラグも未使用 |
| `@astrojs/mdx` 8 | MDX の処理を `markdown.processor` へ委譲する方式に変更。`unified()` のままなら remark / rehype プラグインは従来どおり効く。`satteri()` に切り替えると MDX（`apps/site/src/content` の 177 ファイル）も Sätteri を通る。`unified()` を使う場合は `@astrojs/markdown-remark` ^7.3.0 が必要（`@astrojs/mdx` 8 では optional peer なので Sätteri 移行後は外せる） |
| Expressive Code | 0.44 で Astro 7 と Sätteri に対応。`satteri()` 検出時は rehype ではなく Sätteri HAST プラグインとして動く。設定変更は不要 |
| 統合フック | `astro:build:done` の `pages` / `dir` / `logger`、`astro:config:done` の `buildOutput`、`astro:build:start`、`astro:config:setup` の `updateConfig({ vite: { plugins } })` は Astro 7 でも存続。`docs-md` 統合と plugin の `builder/astro.ts`・`purge/astro.ts` はそのまま使える |
| Vite 8 | `build.rollupOptions` は `build.rolldownOptions` へ自動変換。廃止フック（`resolveImportMeta` 等）は未使用。`server.moduleGraph` と `server.ws.send` は移行ガイドの廃止対象に無い（`astro.config.ts` の `watchLismCoreDistCss` と plugin の `builder/dynamic-css.ts`・`builder/vite-config-alias.ts` が使用） |
| `compressHTML` | 既定が `'jsx'`（インライン要素間の空白を JSX 規則で除去）に変更。`true` で v6 の挙動 |
| vitest | 4.1 は Vite 8 対応済み |
| `lism-cli create` | テンプレートの `workspace:*` は生成時に npm の dist-tag `latest` へ置換される（`packages/lism-cli` の `rewriteWorkspaceDeps`。到達不能時はビルド時に焼き込んだ版へフォールバック）。plugin の peer を広げれば Astro 6 のテンプレートにも Astro 7 の利用者にも同じ公開版が使える |
| Sätteri | `features.directive: true` で `:::name` / `::name` / `:name` を remark-directive と同じ定義でパースするが、描画はプラグイン任せで既定の mdast→hast 変換は directive ノードを捨てる。`features.headingAttributes: true` で `## 見出し {#id}` が MDX でも使え、`{...}` が有効な JS 式でない場合だけ属性として読む。プラグインは `defineMdastPlugin` / `defineHastPlugin` で定義し、`mdastPlugins` / `hastPlugins` に渡す。HAST 側はタグ名の `filter` 付き。`ctx.sourceFormat === 'mdx'` で MDX だけに適用するファクトリも書ける |

現行の Markdown パイプライン（`apps/site/astro.config.ts` の `markdown.processor: unified(...)`）:

- remark: `remark-directive` → `remarkDirectiveHandler`（`apps/site/src/lib/remark-directive.ts`）。`:::type` を `<Callout type>` の `mdxJsxFlowElement` に変換し、`::title[...]` を `div.c--docsNote_title` にする。対応 type は alert / point / tip / warning / check / help / note / info。未使用の `:name` textDirective は「1:2」のような文字列の誤変換を防ぐため元のテキストに戻す。`:::` は content の 98 ファイルで使用
- rehype: `rehype-external-links`（`target="_blank"`、`rel="noopener noreferrer"`）→ `rehypeBlockquoteCite`（`-- 出典` 付き blockquote を `figure.b--blockquote` + `figcaption` へ）→ `rehypeWrapTable`（`table` を `div.-ov-x:auto` で包む）
- `docs-md` 統合（`apps/site/src/integrations/docs-md/`）はビルド済み HTML を `rehype-parse` / `rehype-remark` / `remark-stringify` で Markdown 化する独立パイプラインで、`markdown.processor` の影響を受けない。ただし `rehype-callouts.ts` は Callout の出力 HTML（`div.c--docsNote` と `c--docsNote_title`）に依存する

## 実装プラン

PR は 2 つに分ける。どちらも `dev` から切り、`dev` へ向ける。

### PR1: Astro 7 化（`unified()` 維持）

1. 依存更新。`$package-management` スキルに従う。
   - `apps/site`: astro `^7.3.2`、`@astrojs/mdx` `^8.0.1`、`@astrojs/react` `^6.0.5`、`@astrojs/markdown-remark` `^7.3.1`、`@astrojs/sitemap` `^3.7.4`、`astro-expressive-code` と `@expressive-code/plugin-line-numbers` `^0.44.2`、`@astrojs/check` `^0.9.10`
   - `packages/plugin`: peerDependencies を astro `^6.0.0 || ^7.0.0`、vite `^6.0.0 || ^7.0.0 || ^8.0.0` に広げる。devDependencies の astro / vite も 7 / 8 に上げる（`unplugin-dts` の peer は vite >=3 と rolldown を含む）。`packages/plugin` のビルドとテストが Vite 8 で通ることを確認する
   - `packages/lism-css`・`packages/lism-ui` の devDependencies の astro（`^6.4.8`）は据え置く。両パッケージの `.astro` は利用側の Astro でコンパイルされ、Rust コンパイラで検証済み
   - `pnpm-workspace.yaml` の overrides（`vite@>=7 <7.3.5`、`astro/tsup` 向けの esbuild）が Astro 7 の依存ツリーでも必要か確認し、不要なら整理する
   - `templates/*` と `packages/lism-cli` は触らない
2. `apps/site/astro.config.ts`
   - `compressHTML: true` を追加し、v6 の空白処理を維持する理由をコメントに残す
   - `disableServerTreeshake` は環境名（`prerender` / `ssr`）と `rollupOptions.treeshake` の Rolldown への変換を実ビルドで確認する。プラグイン有無で `astro build` の SSR コンパイル時間（ビルドログの工程ごとの所要時間。#624 のコメントの「SSR コンパイル」「静的ルート生成」に対応）を比較し、差が誤差程度なら削除する。残す場合はコメントの「Astro のメジャー更新時は再確認」を Astro 7 で確認済みの内容に更新する
   - `ignore-underscore-prefix`（`resolveId` で external 化）と `watchLismCoreDistCss` は変更不要の見込み。ビルドと dev で動作確認する
   - plugin の dev 動作（`lism.config` 変更時の CSS 再生成と full-reload。`builder/dynamic-css.ts` の `moduleGraph` 操作）も `nr dev:site` で確認する
3. 検証
   - `nr build`・`nr lint`・`nr typecheck`・`nr test` を通す。`packages/plugin` のテストも含む
   - `dist` 比較: `dev` ブランチのビルドと PR1 のビルドを全件 diff する。Tabs の UUID と Preview の `demo-*` クラス名はビルドごとにランダムなので、正規化してから比べる。#624 でも同じ比較をしたが手順はリポジトリに残っていないので、正規化して diff するスクリプトを実装時に用意する（`apps/site/scripts/` に置くか使い捨てにするかは実装時に判断）。ランダム ID 以外の差分は一覧化して分類する。Rust コンパイラは CSS の色表記や URL の引用符を変え得ると公式移行ガイド（CSS output differences）に明記されており、Vite 8 でもアセットのハッシュが変わるため、「差分がランダム ID だけ」は合格条件にしない。本文・DOM 構造・CSS の意味・リンク先が保たれていることを合格条件とし、同値の表記差とハッシュ差は根拠付きで受容する。それ以外の差分は `compressHTML`・Rust コンパイラ・`@astrojs/mdx` 8 のどれ由来かを切り分ける
   - FOUC: `nr dev:site` をコールドスタートし、レイアウトファイルを一切 touch せずに `/docs/half-leading/` を取得し、Astro / Vite が注入する `<style>`（dev では `data-vite-dev-id` 属性付き）の位置を数える。`</head>` より前に全件、body に 0 件であること。`Preview.astro` が `css` 指定時に本文へ出す `<style set:html>` は意図したインライン CSS なので数えない。`/docs/tokens/` など MDX 内で Astro コンポーネントを使うページも数ページ確認する。各ページは dev サーバーを起動し直して最初のリクエストで取得し、コールドスタート条件を保つ。Astro 6 では head 0 件 / body 23 件だった
   - ビルド時間: マージ後の GitHub Actions（`deploy.yml`）の `build:site` と SSR コンパイルの時間を #624 の表と並べて記録する。ローカルでも `astro build` の時間を before / after で取る
   - Pagefind・OG 画像・sitemap の lastmod・`docs-md` の出力は `dist` 比較でまとめて確認する
4. 文書
   - issue #580 本文の `apps/docs` を `apps/site` に、バージョン表記を現行に更新する
   - `docs/decisions.md` に「`compressHTML` は `true` で v6 挙動を維持」と `disableServerTreeshake` の要否の結論を 1 エントリで記録する
5. マージ後に plugin をリリースする。`/release plugin {バージョン}`（peer の拡大なので minor）で version 更新・changelog・タグを作る。npm への公開（`nr publish:plugin`）はユーザーが手動で行う。`apps/site` は `workspace:*` なので公開を待たずに動く

### PR2: Sätteri 移行と `hov.mdx` の見出し ID

PR1 のマージ後に着手する。着手時に「未決事項」の spike を先に済ませ、Callout の変換方式を確定してから本実装に入る。

1. 依存: `apps/site` に `@astrojs/markdown-satteri` `^0.4.1` を追加する。プラグイン定義の `defineMdastPlugin` / `defineHastPlugin` は Astro のガイドでは `satteri` パッケージから import しているので、`@astrojs/markdown-satteri` が再エクスポートしていなければ `satteri` も直接依存に追加する。移植完了後に `@astrojs/markdown-remark`（`@astrojs/mdx` 8 の optional peer）・`remark-directive`・`mdast-util-directive`・`rehype-external-links` を `apps/site` から外す。`unified`・`rehype-parse`・`rehype-remark`・`remark-gfm`・`remark-stringify`・`unist-util-visit` は `docs-md` 統合が使うので残す
2. `apps/site/astro.config.ts` の `markdown.processor` を `satteri({ features: { directive: true, headingAttributes: true }, mdastPlugins: [...], hastPlugins: [...] })` に置き換える（`satteri` の import 元とオプション名は Astro の Markdown ガイドで確認済み）。既定で有効な `gfm` はそのまま。`@astrojs/mdx` は `extendMarkdownConfig` 既定 `true` のままにして、MDX にも同じプロセッサを使う
3. プラグインを `apps/site/src/lib/satteri/` に移植する（既存の 3 ファイルは削除）。既存の 3 ファイルにテストは無いので、入出力の対応表を vitest のテストとして追加し、移植前後で同じ HTML になることを確かめる
   - `directive-callout`（MDAST）: `containerDirective` のうち対応 type を Callout に変換し、`::title` を `div.c--docsNote_title` にする。未使用の `textDirective` を元テキストへ戻す処理も移す（Sätteri の `directive` は 3 種まとめて有効になるため）。Callout の出し方は spike の結果で決める（未決事項を参照）
   - `blockquote-cite`（HAST、`filter: ['blockquote']`）: 既存ロジックをそのまま移す。訪問中ノードを `figure` に置き換える手段（戻り値で置換できるか、`ctx.parent()` 経由で親の children を書き換えるか）は spike で確認する
   - `wrap-table`（HAST、`filter: ['table']`）: `div.-ov-x:auto` で包む。包んだ後の `table` を再訪問して二重に包まないことを確認する
   - `external-links`（HAST、`filter: ['a']`）: `rehype-external-links` の既定判定（絶対 URL とプロトコル相対 URL）と同じ条件で `target` / `rel` を付ける。content にサイト自身への絶対 URL リンクは無いので、外部リンクだけ `dist` 比較で揃えればよい
4. `hov.mdx`（ja / en）
   - `## -hov:in:{preset}` の見出しに `{#set--hov}`、ja「トランジションを設定する方法」/ en「Configuring transitions」の見出しに `{#has--transition}` を付ける
   - `c--scrollTarget` の空 div（各ファイル 2 箇所）を削除する
   - 見出し一覧・目次（`render(entry).headings` から `generateToc` で生成）に指定 ID が反映されることを確認する。リンク元は目次のほか、ja / en の `set-class.mdx`・`trait-class.mdx`・`ui/Tabs.mdx` が `/docs/property-class/hov#set--hov` と `#has--transition` を参照している。どちらからも scroll-padding を考慮した位置へ移動することを確認する。この位置確認はブラウザ実機が要るので、実装者が勝手に行わずユーザーに依頼する
5. 検証
   - PR1 のビルドとの `dist` 全件比較。想定される差分は hov ページの見出し ID と空 div の削除だけ。それ以外の差分（空白・属性順・エンティティ等 Sätteri 由来のもの）は一覧化し、表示に影響しないことを確認したうえで受容するか、プラグインで揃える
   - `docs-md` の出力（llms.txt と各 `.md`）が変わらないこと。Callout の HTML 構造が変わる場合は `rehype-callouts.ts` も追従する
   - MDX 本文中の Astro / React コンポーネント（`<Preview>` 等）と Expressive Code のコードブロックが Sätteri 経由でも従来どおり描画されること（`dist` 比較に含まれる）
   - `nr build`・`nr lint`・`nr typecheck`・`nr test`
6. `docs/decisions.md` に Sätteri 採用を記録する

## 設計判断の根拠

- PR を 2 つに分ける。PR1 は依存更新と設定 2 箇所の機械的な変更で、#580 の本題（FOUC）とビルド時間の検証まで単独で完結する。PR2 は Markdown パイプラインの書き換えで、Sätteri のプラグイン API に未確認点が残る。切り戻し単位を分けたい
- `compressHTML: true` にする。593 ページの出力を変えずに Astro 7 由来の差分を切り分けるため。`'jsx'` の採用は効果と差分を別途見てから決める
- Sätteri 移行は #580 の方針どおり実施する。`@astrojs/mdx` 8 が MDX もプロセッサへ委譲するため、Sätteri なら `hov.mdx` の見出し ID 指定が成立し、Expressive Code も自動で追従する。`unified()` のまま見出し ID だけ別手段で付ける案は、`c--scrollTarget` 空要素と同じ位置ずれ問題が残るので採らない
- 移植先を `apps/site/src/lib/satteri/` にまとめる。`apps/site/src/lib/` 直下の remark / rehype ファイルは Sätteri へ置き換えるので残さない
- templates は同時に上げず、`apps/site` の後で別 issue にする。テンプレートの Astro を 7 にすると `lism-cli create` の生成物とスクリーンショットが変わり、確認範囲がサイトの外へ広がる。サイトの更新で得た知見を先に固めてから進める方が手戻りが少ない
- 却下: dev 限定で `<head>` に CSS を直接流し込む対症療法（issue の案 A / B）。Astro 7 で原因側が直るため不要
- 却下: `hov.mdx` のアンカーを以前の `u--srOnly` 要素へ戻す案。absolute 配置が外側のスクロール領域を広げ、目次クリック時に外側までスクロールする原因になる（issue に記載）
- 却下: `disableServerTreeshake` を無条件に残す。Rolldown で tree-shaking のコストが変わるため、計測してから決める

## 未決事項・要確認・事前準備

PR2 着手時に spike で確定すること:

- Callout 変換方式。次の順で試し、最初に成立したものを採る
  1. MDAST プラグインが MDX モードで `mdxJsxFlowElement`（`<Callout type>`）を返せるか。可能なら `Callout.astro` をそのまま使う
  2. 不可なら、HAST プラグインで `Callout.astro` の出力相当の要素（`div.c--docsNote` とアイコン）を組み立てる。その場合はプリセット（色・アイコン）の定義を `Callout.astro` と共有する場所へ移し、二重管理にしない。Sätteri の既定変換は directive ノードを捨てるため、MDAST 側で type・title・本文を HAST へ引き継ぐ手段と、`Callout.astro` の scoped CSS を HAST 生成要素へ当てる方法も spike の成立条件に含める
  3. どちらも難しければ、98 ファイルの `:::` を `<Callout>` の直書きへ置き換える案を検討する（最終手段。issue で合意してから）

PR1 着手時に確認すること:

- `@astrojs/check` 0.9.10 と `prettier-plugin-astro` 0.14.1 が Astro 7 で動くか。`nr typecheck`・`nr lint`・format で確認し、壊れる場合だけ更新する
- モノレポ内で Astro 6（lism-css / lism-ui の devDependencies）と 7 が共存するため、`apps/site` で `astro --version` が 7 系を返し、`lism-css/astro` と `@lism-css/ui` の `.astro` コンポーネントが site 側の Astro 7 でビルドされること

PR2 着手時に確認すること:

- Sätteri HAST プラグインで訪問中ノードを別ノードに置き換える方法（戻り値か `ctx.parent()` か）
- `features.directive` の `:name` textDirective が remark-directive と同じ範囲でマッチするか。同じなら復元処理をそのまま移す
- Expressive Code 0.44.2 が `@astrojs/markdown-satteri` 0.4.1（satteri 0.10 系）で動くか。changelog の記載は「Sätteri v0.9 対応」まで
- `render(entry).headings` が Sätteri でも同じ形（`depth` / `slug` / `text`）で返り、指定 ID が `slug` に反映されるか
- `syntaxHighlight` 既定（`@astrojs/markdown-satteri` は `@astrojs/prism` を内包）が Expressive Code と二重に効かないこと

事前準備:

- ローカルの Node が 22.12 以上であること
- `dist` 比較のため、着手前に `dev` ブランチのビルド成果物を取っておく

## 完了条件

PR1:

- dev サーバー起動直後に `/docs/half-leading/` 等を取得して、Astro / Vite が注入する CSS が全件 `<head>` に出力され body に出ないこと（`Preview.astro` の意図したインライン `<style>` は除く）
- `nr build`・`nr lint`・`nr typecheck`・`nr test` が通り、`dist` の差分がランダム ID と、根拠付きで受容した同値の表記差・ハッシュ差だけであること
- `@lism-css/plugin` の peer が Astro 7 / Vite 8 を含む版で公開されていること
- ビルド時間の before / after が #624 に記録されていること

PR2:

- 日英の本文・Callout（8 type と `::title`）・コード表示・表・外部リンク・blockquote の出典・MDX 内の Astro / React コンポーネント・`docs-md` 出力が従来どおりであること
- 日英の hover ページで `#set--hov` / `#has--transition` へのリンクが維持され、見出しと目次の ID が一致し、空要素によるアンカー位置のずれが無いこと

完了時に本プランを削除する。
