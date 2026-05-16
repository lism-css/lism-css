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
pnpm --filter lism-docs screenshot:templates -- --target=blog/astro/simple
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
| `shots[].name` | string | — | 出力ファイル名のベース。`screenshots/{name}.png` で保存 |
| `shots[].path` | string | — | サーバールートからのパス |

新しいテンプレを追加するときは、このファイルを置けば自動的に撮影対象に組み込まれる。


## ファイル構成

```
templates/
  minimal/astro/
    screenshots.config.json         # 撮影対象URL定義
    screenshots/
      top.png                       # 公開用サムネイル（Git管理、本物の画像）
      _baseline/                    # 比較用ベースライン（Git管理、CDNランダム画像はグレー差し替え）
        top.png
      _diff/                        # 差分画像（Git管理外）
      _temp/                        # 比較時の一時ファイル（自動削除）
```

`screenshots/` 直下の `*.png` のみが公開用サムネ。apps/docs から `import.meta.glob('@templates/*/*/screenshots/*.png')` 相当（実際は相対パス）で取得する際は、アンダースコア接頭辞の `_baseline/` などのサブディレクトリは glob パターンで自然に除外される。


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


## スクリプト

[`apps/docs/scripts/template-screenshots.ts`](../apps/docs/scripts/template-screenshots.ts) に本体がある。

- `templates/` 以下を再帰的に走査し、`screenshots.config.json` を持つディレクトリを撮影対象として収集
- 各テンプレについて `pnpm --filter <name> build` → `pnpm --filter <name> preview --port <port>` で起動
- Playwright（headless chromium）で `shots` を順次撮影
- compare モードでは pixelmatch でベースラインと比較し、しきい値（既定 0.01%）以下なら「変更なし」とみなす
- **CDN ランダム画像（`cdn.lism-css.com/random/img*` および `cdn.lism-css.com/img/random*`）の扱い** — baseline 撮影時（`force` / `compare` / `update` の baseline 用ページ）は 1x1 グレーに差し替えてから撮影する（pixelmatch 比較を安定させるため）。公開用サムネ撮影（`new` / `force` / `update` の public 用ページ）は本物の画像のまま撮影する。
