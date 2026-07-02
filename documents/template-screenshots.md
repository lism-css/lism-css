# テンプレート スクリーンショット

`templates/` 配下の各プロジェクトテンプレについて、プレビューサーバーを起動して自動で撮影する仕組み。

撮影対象URLは各テンプレ配下の `screenshots.config.json` に宣言する。テンプレ追加時にスクリプト本体を変更する必要はない。

> パターン（`apps/docs` 内のセクション集）側は [`pattern-screenshots.md`](./pattern-screenshots.md) を参照。


## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `pnpm screenshot:templates` | 各テンプレを build → preview し、新規ぶんのみ撮影（公開用のみ） |
| `pnpm screenshot:templates:force` | 全テンプレを再撮影。公開用＋ baseline の両方を上書き |
| `pnpm screenshot:templates:compare` | ベースラインと比較（初回はベースライン生成） |
| `pnpm screenshot:templates:update` | 差分テンプレのベースラインと公開用画像を更新 |

ルート（リポジトリ直下）で実行する。内部的に `pnpm --filter lism-docs ...` を呼び出す。

### 対象を絞り込む

slug でも相対パスでも指定できる。

```bash
pnpm --filter lism-docs screenshot:templates -- --target=minimal-astro
pnpm --filter lism-docs screenshot:templates -- --target=blog/astro/minimal
pnpm --filter lism-docs screenshot:templates -- --compare --target=lp-astro
```

### ビルドをスキップ

既存の `dist/` を使う場合（例: 直前にビルドした直後など）:

```bash
pnpm --filter lism-docs screenshot:templates -- --no-build
```


## meta 宣言（screenshots.config.json）

各テンプレ直下にこのファイルを置くことで、撮影対象として認識される。

```json
{
  "command": "preview",
  "port": 4321,
  "waitAfterLoad": 500,
  "shots": [
    { "name": "top", "path": "/" },
    { "name": "about", "path": "/about/" }
  ]
}
```

| プロパティ | 型 | 既定値 | 説明 |
|----------|---|------|------|
| `command` | `'preview' \| 'dev'` | `'preview'` | 起動コマンド。`preview` の場合は事前にビルドが実行される |
| `port` | number | — | プレビューサーバーのポート（テンプレごとに重複しないよう調整） |
| `waitAfterLoad` | number | `500` | ページ読み込み後の待機ms |
| `shots[].name` | string | — | 出力ファイル名のベース。`screenshots/{name}.png` で保存。`/` を含めるとサブディレクトリに出力される（例: `en/top` → `screenshots/en/top.png`） |
| `shots[].path` | string | — | サーバールートからのパス |
| `langShots` | `Record<string, ShotDef[]>` | — | 言語別 overlay（`.lang/<lang>/`）をマージして撮影する shots。`{ en: [...] }` 形式。`screenshots/<lang>/{name}.png` に保存される（詳細は後述） |

新しいテンプレを追加するときは、このファイルを置けば自動的に撮影対象に組み込まれる。


## 英語版（en）スクショ

テンプレの英語版（`lism-cli create --lang en` 相当）は、テンプレの言語対応方式によって撮り方が分かれる。いずれも出力先は **`screenshots/en/`** に揃える。

### LP（言語別 variant 方式）— `shots` に追記するだけ

`lp/astro` の en ページ（`/en/`, `/en/corporate/`, `/en/interior/`）は**通常 build に含まれる実ルート**。`shots` に en パスを追記すれば、ja と**同じ 1 回の build/preview でまとめて撮影**できる（スクリプト改修・再ビルド不要）。

```jsonc
"shots": [
  { "name": "top",          "path": "/" },
  { "name": "corporate",    "path": "/corporate/" },
  { "name": "interior",     "path": "/interior/" },
  { "name": "en/top",       "path": "/en/" },
  { "name": "en/corporate", "path": "/en/corporate/" },
  { "name": "en/interior",  "path": "/en/interior/" }
]
```

→ `name` に `/` を含めると `screenshots/en/corporate.png` のようにサブディレクトリへ保存される。

### blog（overlay 方式）— `langShots` で再ビルド撮影

blog の en は overlay 方式（`.lang/en` を src へマージ）のため、**通常 build には出てこず、en ページは ja と同じ path（`/`, `/posts/...`）に重なる**。そこで `langShots` を使う。

```jsonc
"shots": [
  { "name": "top",  "path": "/" },
  { "name": "post", "path": "/posts/first-blog/" }
],
"langShots": {
  "en": [
    { "name": "top",  "path": "/" },
    { "name": "post", "path": "/posts/first-blog/" }
  ]
}
```

`langShots.en` がある場合、スクリプトは通常撮影に続けて **`build:template:en <pkg>`（`.lang/en` を一時的に src へマージして再ビルド → src 復元）** を行い、同じ path を撮影して `screenshots/en/{name}.png` に保存する。`name` は en サブディレクトリからの相対なので `/` 接頭辞は不要。

> overlay 再ビルドは `--no-build` でもスキップされない（dist を en で上書きする必要があるため）。`new` モードでは `screenshots/en/` が既に揃っていれば再ビルドごとスキップする。

### docs / 一覧側の参照

- **docs テンプレカード**: `apps/docs/src/config/templates.ts` の `getThumb(tpl, lang)` が、en 表示時に `screenshots/en/{variant|top}.png` を優先し、未撮影なら ja スクショにフォールバックする。
- **LP en 一覧**（`templates/lp/astro/src/pages/en/index.astro`）: en スクショ撮影後、サムネ import を `../../../screenshots/en/*.png` に差し替えると en 版サムネで表示できる。


## ファイル構成

```
templates/
  blog/astro/minimal/
    screenshots.config.json         # 撮影対象URL定義（shots / langShots）
    screenshots/
      top.png                       # 公開用サムネイル（Git管理、本物の画像）
      post.png
      en/                           # 言語別（en）サムネイル
        top.png
        post.png
      _baseline/                    # 比較用ベースライン（Git管理、CDNランダム画像はグレー差し替え）
        top.png
        en/top.png                  #   言語別 baseline も en/ 配下
      _diff/                        # 差分画像（Git管理外）
      _temp/                        # 比較時の一時ファイル（自動削除）
```

`screenshots/` 配下の `*.png`（`en/` などの言語別サブディレクトリ含む）が公開用サムネ。apps/docs からは `import.meta.glob('.../screenshots/**/*.png')` 相当（実際は相対パス）で取得し、アンダースコア接頭辞の `_baseline/` `_diff/` `_temp/` は glob の除外パターンで弾く。


## 運用フロー

1. **テンプレを変更した**
   - `pnpm screenshot:templates:compare` で意図しないレイアウト崩れがないか確認
2. **差分が意図通り**
   - `pnpm screenshot:templates:update` でベースライン＆公開用画像を更新 → コミット
3. **新しいテンプレを追加した**
   - 直下に `screenshots.config.json` を作成
   - `pnpm screenshot:templates` で新規分を撮影 → コミット
4. **すべて撮り直したい**
   - `pnpm screenshot:templates:force`
5. **英語版（en）スクショを用意したい**
   - LP は `shots` に `en/*`、blog は `langShots.en` を追加（[英語版（en）スクショ](#英語版en-スクショ)参照）
   - `pnpm screenshot:templates` で新規分（`screenshots/en/`）を撮影 → コミット
   - blog は overlay 再ビルドが走るため LP より時間がかかる
   - 撮影後、LP en 一覧のサムネ import を `screenshots/en/*` に差し替えるとカードが en 版になる


## スクリプト

[`apps/docs/scripts/template-screenshots.ts`](../apps/docs/scripts/template-screenshots.ts) に本体がある。

- `templates/` 以下を再帰的に走査し、`screenshots.config.json` を持つディレクトリを撮影対象として収集
- 各テンプレについて `pnpm --filter <name> build` → `pnpm --filter <name> preview --port <port>` で起動
- Playwright（headless chromium）で `shots` を順次撮影
- `langShots` があるテンプレは、通常撮影に続けて `node scripts/build-template-lang.mjs <pkg> <lang>`（= `nr build:template:en`）で overlay を再ビルド → preview 起動 → 撮影し、`screenshots/<lang>/` に保存
- compare モードでは pixelmatch でベースラインと比較し、しきい値（既定 0.01%）以下なら「変更なし」とみなす
- **CDN ランダム画像（`cdn.lism-css.com/random/img*` および `cdn.lism-css.com/img/random*`）の扱い** — baseline 撮影時（`force` / `compare` / `update` の baseline 用ページ）は 1x1 グレーに差し替えてから撮影する（pixelmatch 比較を安定させるため）。公開用サムネ撮影（`new` / `force` / `update` の public 用ページ）は本物の画像のまま撮影する。
