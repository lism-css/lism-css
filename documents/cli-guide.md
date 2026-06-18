# Lism CLI ガイド（運営者向け）

ユーザー向けの使い方は [packages/lism-cli/README.md](../packages/lism-cli/README.md) と [apps/docs](../apps/docs/src/content/ja/installation.mdx) を見る。
ここは運営観点の差分メモ。


## 構成

| パッケージ | bin | 役割 |
|---|---|---|
| `lism-cli` | `lism` | 本体（`create` / `ui` / `skill`） |
| `create-lism` | `create-lism` | `pnpm create lism` 用ラッパー。`lism-cli` を **bundle で内包**（runtime 依存ナシ） |

配信元はすべて giget で `github:lism-css/lism-css/...` から直 fetch（旧 HTTP Registry / `cli.lism-css.com` は廃止）。


## 🚨 ref 切り替え（最重要）

`packages/lism-cli/src/constants.ts` の以下 3 つはブランチに合わせて手動切替:

| 定数 | dev | main |
|---|---|---|
| `DEFAULT_UI_REF` | `'dev'` | `'main'` |
| `DEFAULT_SKILL_REF` | `'dev'` | `'main'` |
| `DEFAULT_TEMPLATES_REF` | `'dev'` | `'main'` |

**dev / main マージ前に必ず grep して値を揃える。** 検証用 PR ブランチを指したまま publish すると、ブランチ削除で CLI が壊れる。


## build / publish

```bash
nr build:cli    # cli → create-lism の順（^build 依存で順序保証）
nr publish:cli  # build → lism-cli publish → create-lism publish
```

- `lism-cli` と `create-lism` は **同じバージョンで一緒に** publish する
- `lism create` で生成されるプロジェクトの `workspace:*` は npm レジストリの dist-tag `latest` を実行時に解決して `^x.y.z` へ置換される。レジストリ到達不可時だけ、tsup の `define` で埋め込んだ `LISM_PACKAGE_VERSIONS` にフォールバックする
- `packages/lism-ui/registry-index.json` は **commit 対象**。コンポーネント増減時は `pnpm --filter @lism-css/ui build` で再生成して commit する
- 検証目的の beta publish でも `DEFAULT_*_REF` を PR ブランチに固定しないこと（壊れる）。検証時は CLI 側の `--ref` フラグで都度指定する


## テンプレ運用メモ

`templates/` 配下のテンプレートは `lism create` の配信元。SSOT は `templates/manifest.ts` の `TEMPLATES` 配列で、`packages/lism-cli/src/commands/create.ts` から import される。テンプレ追加・編集時の運用ルール：

- **`templates/*/*` の `package.json` には必ず `"private": true` を付ける**（npm への誤公開防止）。`scripts/check-templates-private.mjs` で CI チェック済み。
- **`base-overlay` 型の overlay 側には `package.json` を置かない**。CLI は base の `package.json` を採用し、overlay は差分ファイルのみ上書きする想定。overlay 側に置くと merge 後の `name` 書き換え対象が二重化し、`workspace:*` 置換のロジックも崩れる。共通化したい設定は base に集約する。
- **`templates/lp/html/_generated/` 配下は手編集禁止**（※ `static-html` 型テンプレの実配信は #375 で追加予定）。`static-html` 型テンプレの配信元として、source（別ディレクトリ）からの生成物を置く前提のディレクトリ。手で編集すると次回再生成で消える。修正は generator 側で行う。
- **`single-project-variant` 型**（例: `templates/lp/astro/`）は単一プロジェクトに `src/pages/{variant}/` を並べる構成。CLI 抽出時に選択 variant の `index.astro` を `src/pages/index.astro` に持ち上げ、他 variant ディレクトリを削除する。variant 追加時は `src/pages/{variant}/index.astro` を作り、`TEMPLATES` に新 slug を追加する。
- **言語の決定順（`lism create` / `create-lism` 共通）**: まず生成言語を確定してから処理を進める。`--lang <ja|en>` が明示されていればそれを使い、未指定なら**対話端末（TTY）では他のどの選択よりも先に言語選択プロンプト（`English / 日本語` の固定表示）を出す**。非対話端末（CI・パイプ等）は `en` にフォールバック。確定した言語は CLI 表示言語と「生成テンプレ本体の言語（overlay）」の両方に使う。
- **言語別 overlay（`project` 型の `langOverlays`）**: 上で確定した言語に対応する overlay があれば、base 取得後に差分をマージして生成テンプレ本体を多言語化する。配置は base 内の `.lang/{lang}/`（例: `blog/astro/minimal/.lang/en/`）に**差分ファイルのみ**を置き、`manifest.ts` の `langOverlays` に `{ en: 'blog/astro/minimal/.lang/en' }` のように登録する。現状 `en` overlay を持つのは `blog-astro-minimal` / `blog-astro-personal` / `blog-astro-techlog` の 3 つ。base 言語（多くは `ja`）は `sourcePath` 自体が対応言語なので overlay を用意しない。生成物に画面文言をハードコードせず `siteConfig.uiText` 等へ集約しておくと overlay 差分が小さく済む（コメントや開発者向けのビルド時エラー文言は対象外）。`.lang/` は配布不要ディレクトリとして生成プロジェクトから自動削除される（`screenshots/` と同じ扱い）。ローカルで言語版の見た目を確認したい時は `nr build:template:en <pkg>`（`.lang/en` を一時的に src へマージして build → src を復元）→ `nr preview:template <pkg>` の順で、`lism create --lang en` 相当の生成結果をプレビューできる。
- **言語別 variant（`single-project-variant` 型）**: LP のように文章量が多くデザインごと差し替えたいテンプレートは、overlay（差分マージ）ではなく `src/pages/{lang}/{variant}/`（必要に応じて `src/components/{lang}/{variant}/` 等も）の**完全コピー**として言語版を同梱する。`--lang en` 等で `src/pages/{lang}/{variant}/index.astro` があればそれを抽出元の variant に使い、無ければ base（`{variant}`）へ自動フォールバックする（`manifest.ts` 側の追加定義は不要）。抽出時に他 variant と `en/` ディレクトリごと掃除され、選択 variant のみのクリーンなプロジェクトになる。`Layout.astro` は `lang` prop（既定 `ja`）を受け取り、en 版ページは `<Layout title lang="en">` で `<html lang>` を切り替える。現状 `en` 版を持つのは `lp-astro-corporate` / `lp-astro-interior`。ローカルでは `nr build:template lp-astro` で ja と `/en/{variant}/`（例 `/en/corporate/`）が同時にビルドされ、`nr preview:template lp-astro` で確認できる。


## publish 前チェック

- [ ] `constants.ts` の 3 つの ref が `'main'`
- [ ] `registry-index.json` が最新
- [ ] `nr lint` / `nr typecheck` / `nr test`
- [ ] `node packages/lism-cli/bin/lism.mjs --help` でコマンド体系を目視確認


## 関連 PR

| PR | 内容 |
|---|---|
| #290 | `lism` / `create-lism` 統合、`skills/` 直下移動、`lism.config.js` 統合、react/astro 階層除去 |
| #293 | `create-lism` を bundle 自己完結型へ |
| #294 | UI 配信を giget 直 fetch へ移行、`apps/cli` 廃止 |
