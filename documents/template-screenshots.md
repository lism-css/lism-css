# テンプレート スクリーンショット

テンプレートページのサムネイル撮影と、レイアウト差分検出の仕組みについて。


## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `pnpm screenshot:new` | 新規テンプレートのスクリーンショットを撮影（既存はスキップ） |
| `pnpm screenshot:force` | 全テンプレートのスクリーンショットを再撮影 |
| `pnpm screenshot:compare` | ベースラインと比較（初回はベースライン生成） |
| `pnpm screenshot:compare --threshold 0.5` | 差分率しきい値を変更（デフォルト: 0.01%） |
| `pnpm screenshot:update` | 差分があったテンプレートのベースラインとサムネイルを更新 |

`screenshot:new` / `screenshot:force` / `screenshot:compare` はビルドを含む。`screenshot:update` は既存の dist を使用する。
全コマンドとも `apps/docs` ディレクトリで実行する。

### テンプレートの絞り込み

`screenshot:new` / `screenshot:force` / `screenshot:compare` で、カテゴリやテンプレートを指定して対象を絞り込める。

```bash
pnpm screenshot:new cta              # カテゴリ指定
pnpm screenshot:new cta/cta001       # テンプレート指定
pnpm screenshot:new cta section      # 複数指定
pnpm screenshot:compare cta          # 比較対象の絞り込み
```


## サムネイル撮影（screenshot:new / screenshot:force）

Playwright で各テンプレートのプレビューページを撮影し、`public/screenshots/templates/` に保存する。
サイト上のテンプレート一覧ページがこれをサムネイルとして表示する。

```
pnpm screenshot:new      # 新規のみ
pnpm screenshot:force    # 全て再撮影
```


## レイアウト比較（screenshot:compare）

CDN のランダム画像をグレーのプレースホルダーに差し替えた上で撮影し、ベースライン画像とピクセル比較してレイアウトの差分を検出する。

### 初回（ベースライン生成）

```
pnpm screenshot:compare
```

`_screenshots/baseline/` にベースライン画像が生成される。これを Git にコミットしておく。

### 2回目以降（比較）

```
pnpm screenshot:compare
```

ベースラインと比較し、差分があるテンプレートを通知する。差分画像は `_screenshots/diff/` に出力される。


## ベースライン更新（screenshot:update）

```
pnpm screenshot:update
```

`_screenshots/diff/` にある差分テンプレートを対象に、以下の2つを同時に更新する:

1. **比較用ベースライン** (`_screenshots/baseline/`) — グレー差し替え画像で再撮影
2. **公開用サムネイル** (`public/screenshots/templates/`) — 本番画像で再撮影

更新後、`_screenshots/diff/` と `_screenshots/temp/` は自動で削除される。


## 運用フロー

1. **CSS やテンプレートを変更した**
   - `pnpm screenshot:compare` で意図しないレイアウト崩れがないか確認
2. **差分が意図通り**
   - `pnpm screenshot:update` でベースラインとサムネイルを更新 → コミット
3. **サムネイルだけ再撮影したい場合**
   - `pnpm screenshot:force` でサイト表示用のサムネイルを再撮影 → コミット
4. **新しいテンプレートを追加した**
   - `pnpm screenshot:new` で新規のサムネイルを撮影
   - `pnpm screenshot:compare` でベースラインに追加される


## ファイル構成

```
apps/docs/
  scripts/
    generate-screenshots.ts    # サムネイル撮影スクリプト
    compare-screenshots.ts     # 比較スクリプト
    update-screenshots.ts      # 差分テンプレートの更新スクリプト
  public/
    screenshots/templates/     # サイト表示用サムネイル（Git管理）
  _screenshots/
    baseline/                  # 比較用ベースライン（Git管理）
    diff/                      # 差分画像の出力先（Git管理外）
    temp/                      # 比較時の一時ファイル（自動削除）
```
