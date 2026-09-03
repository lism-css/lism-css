# Lism CLI ガイド（運営者向け）

この文書が持つもの: `lism-cli` / `create-lism` の運営手順（既定 ref・build・publish・publish 前チェック）と、`templates/` の規約・言語判定・プレビューデプロイ。
持たないもの: ユーザー向けの使い方（[packages/lism-cli/README.md](../packages/lism-cli/README.md) と [apps/docs の installation](../apps/docs/src/content/ja/installation.mdx)）、テンプレのスクショ撮影（[template-screenshots.md](./template-screenshots.md)）。


## 構成

| パッケージ | bin | 役割 |
| --- | --- | --- |
| `lism-cli` | `lism-cli` | 本体（`create` / `init` / `ui` / `skill` / `mockup`）。`init` は `lism.config.js` のひな形を生成する（既存の `lism.config.*` があれば何もしない。`--ui-framework` / `--ui-dir` で `ui:` セクションの値を先渡しでき、指定が無ければ対話で聞く）。`mockup` は `@lism-css/mockup` の案内表示のみ |
| `create-lism` | `create-lism` | `pnpm create lism` 用ラッパー。`lism-cli` を **bundle で内包**（runtime 依存ナシ） |

配信元は GitHub の `lism-css/lism-css` リポジトリ。コンポーネント本体・helper・skill・テンプレは giget（`github:lism-css/lism-css/...`）で取得し、UI カタログ（`packages/lism-ui/registry-index.json`）だけは raw GitHub へ直接 fetch する（`commands/ui/fetcher.ts` の `fetchCatalog`）。


## 🚨 既定 ref（最重要）

`packages/lism-cli/src/constants.ts` の `DEFAULT_UI_REF` / `DEFAULT_SKILL_REF` / `DEFAULT_TEMPLATES_REF` は **ブランチに関係なく常に `'main'`**。dev / main のマージで切り替えない。

- dev 側の変更を試すときは、コマンドの `--ref dev` で都度指定する（`create` / `ui add` / `ui list` / `skill add` / `skill check` / `skill update`）。
- `--ref` が切り替えるのは取得するファイルの場所だけ。CLI が認識する skill 一覧（`SKILL_NAMES`）とテンプレ一覧（`TEMPLATES`）は実行している CLI 本体に焼き込まれているため、dev 側で追加した skill / テンプレを試すには dev の CLI をローカルビルドする。
- 検証目的の beta publish でも定数を PR ブランチに変えないこと。ブランチ削除で公開済み CLI が壊れる。


## build / publish

```bash
nr build:cli    # cli → create-lism の順（^build 依存で順序保証）
nr publish:cli  # build → lism-cli publish → create-lism publish
```

- `lism-cli` と `create-lism` は **同じバージョンで一緒に** publish する
- `lism-cli create` で生成されるプロジェクトの `workspace:*` は npm レジストリの dist-tag `latest` を実行時に解決して `^x.y.z` へ置換される。レジストリ到達不可時だけ、tsup の `define` で埋め込んだ `LISM_PACKAGE_VERSIONS` にフォールバックする
- `packages/lism-ui/registry-index.json` は **commit 対象**。コンポーネント増減時は `pnpm --filter @lism-css/ui build` で再生成して commit する
- 検証目的の beta publish でも `DEFAULT_*_REF` を PR ブランチに固定しないこと（壊れる）。検証時は CLI 側の `--ref` フラグで都度指定する


## テンプレ運用メモ

`templates/` 配下のテンプレートは `lism-cli create` の配信元。SSOT は `templates/manifest.ts` の `TEMPLATES` 配列で、`packages/lism-cli/src/commands/create.ts` から import される。テンプレ追加・編集時の運用ルール：

- **`templates/` 配下の各テンプレート（階層は問わず）の `package.json` には必ず `"private": true` を付ける**（npm への誤公開防止）。テンプレのディレクトリ階層は種類によって異なる（2階層: `templates/minimal/astro/`、3階層: `templates/blog/astro/minimal/` 等）。`scripts/check-templates-private.mjs` は `package.json` が見つかるまで再帰的に降下してチェックするため、階層の深さを問わず検出できる。
- **`base-overlay` 型の overlay 側には `package.json` を置かない**。CLI は base の `package.json` を採用し、overlay は差分ファイルのみ上書きする想定。overlay 側に置くと merge 後の `name` 書き換え対象が二重化し、`workspace:*` 置換のロジックも崩れる。共通化したい設定は base に集約する。
- **`templates/lp/html/_generated/`**（未実装・#375 で追加予定）: 追加された場合は手編集禁止。`static-html` 型テンプレの配信元として、source（別ディレクトリ）からの生成物を置く前提のディレクトリになる予定。手で編集すると次回再生成で消えるため、修正は generator 側で行うこと。
- **`single-project-variant` 型**（例: `templates/lp/astro/`）は単一プロジェクトに `src/pages/{variant}/` を並べる構成。CLI 抽出時に選択 variant の `index.astro` を `src/pages/index.astro` に持ち上げ、他 variant ディレクトリを削除する。variant 追加時は `src/pages/{variant}/index.astro` を作り、`TEMPLATES` に新 slug を追加する。
- **CLI の表示言語**: `--lang <ja|en>` は全サブコマンド共通のグローバルオプション（`createProgram.ts`）。未指定時は `LC_ALL` / `LANG` → macOS の `defaults read -g AppleLanguages` → `Intl` のロケールの順に `ja` かどうかを見て、どれにも当たらなければ `en`（`i18n.ts` の `detectLang`）。macOS は OS が日本語でもターミナルの `LANG` が英語のことがあるため `AppleLanguages` も見る。`create` だけは下記の決定順で生成言語を確定し、それを表示言語にも使う。
- **言語の決定順（`lism-cli create` / `create-lism` 共通）**: まず生成言語を確定してから処理を進める。`--lang <ja|en>` が明示されていればそれを使い、未指定なら**対話端末（TTY）では他のどの選択よりも先に言語選択プロンプト（`English / 日本語` の固定表示）を出す**。非対話端末（CI・パイプ等）は `en` にフォールバック。確定した言語は CLI 表示言語と「生成テンプレ本体の言語（overlay）」の両方に使う。
- **言語別 overlay（`project` 型の `langOverlays`）**: 上で確定した言語に対応する overlay があれば、base 取得後に差分をマージして生成テンプレ本体を多言語化する。配置は base 内の `.lang/{lang}/`（例: `blog/astro/minimal/.lang/en/`）に**差分ファイルのみ**を置き、`manifest.ts` の `langOverlays` に `{ en: 'blog/astro/minimal/.lang/en' }` のように登録する。現状 `en` overlay を持つのは `blog-astro-minimal` / `blog-astro-personal` / `blog-astro-techlog` の 3 つ。base 言語（多くは `ja`）は `sourcePath` 自体が対応言語なので overlay を用意しない。生成物に画面文言をハードコードせず `siteConfig.uiText` 等へ集約しておくと overlay 差分が小さく済む（コメントや開発者向けのビルド時エラー文言は対象外）。`.lang/` は配布不要ディレクトリとして生成プロジェクトから自動削除される（`screenshots/` と同じ扱い）。ローカルで言語版の見た目を確認したい時は `nr build:template:en <pkg>`（`.lang/en` を一時的に src へマージして build → src を復元）→ `nr preview:template <pkg>` の順で、`lism-cli create --lang en` 相当の生成結果をプレビューできる。
- **言語別 variant（`single-project-variant` 型）**: LP のように文章量が多くデザインごと差し替えたいテンプレートは、overlay（差分マージ）ではなく `src/pages/{lang}/{variant}/`（必要に応じて `src/components/{lang}/{variant}/` 等も）の**完全コピー**として言語版を同梱する。`--lang en` 等で `src/pages/{lang}/{variant}/index.astro` があればそれを抽出元の variant に使い、無ければ base（`{variant}`）へ自動フォールバックする（`manifest.ts` 側の追加定義は不要）。抽出時に他 variant と `en/` ディレクトリごと掃除され、選択 variant のみのクリーンなプロジェクトになる。`Layout.astro` は `lang` prop（既定 `ja`）を受け取り、en 版ページは `<Layout title lang="en">` で `<html lang>` を切り替える。現状 `en` 版を持つのは `lp-astro-corporate` / `lp-astro-interior`。ローカルでは `nr build:template lp-astro` で ja と `/en/{variant}/`（例 `/en/corporate/`）が同時にビルドされ、`nr preview:template lp-astro` で確認できる。
- **テンプレプレビューのデプロイ（`templates.lism-css.com`）**: Cloudflare Pages へ wrangler で配信する。`nr deploy:templates` は `build:templates`（core / ui をビルドし、`scripts/build-previews.mjs` で全テンプレを `.preview/merged` へ集約）のあと Pages プロジェクト `lism-templates` へ deploy する。`nr deploy:template <pkg>` は 1 テンプレだけをビルドし、`scripts/write-noindex-headers.mjs` で `_headers`（noindex）を dist に書いてから Pages プロジェクト `lism-<pkg>` へ deploy する。


## publish 前チェック

- [ ] `constants.ts` の 3 つの ref が `'main'`
- [ ] `registry-index.json` が最新
- [ ] `nr lint` / `nr typecheck` / `nr test`
- [ ] `node packages/lism-cli/bin/lism-cli.mjs --help` でコマンド体系を目視確認
