# パターン スクリーンショット

パターンページのサムネイル撮影と、レイアウト差分検出の仕組みについて。


## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `pnpm screenshot:patterns:new` | 新規パターンのスクリーンショットを撮影（既存はスキップ） |
| `pnpm screenshot:patterns:force` | 全パターンのスクリーンショットを再撮影 |
| `pnpm screenshot:patterns:compare` | ベースラインと比較（初回はベースライン生成） |
| `pnpm screenshot:patterns:compare --threshold 0.5` | 差分率しきい値を変更（デフォルト: 0.01%） |
| `pnpm screenshot:patterns:update` | 差分があったパターンのベースラインとサムネイルを更新 |

`screenshot:patterns:new` / `screenshot:patterns:force` / `screenshot:patterns:compare` はビルドを含む。`screenshot:patterns:update` は既存の dist を使用する。
ルートからも同名コマンド（`pnpm screenshot:patterns:*`）で実行でき、`apps/docs` 側に委譲される。

### パターンの絞り込み

`screenshot:patterns:new` / `screenshot:patterns:force` / `screenshot:patterns:compare` で、カテゴリやパターンを指定して対象を絞り込める。

```bash
pnpm screenshot:patterns:new cta              # カテゴリ指定
pnpm screenshot:patterns:new cta/cta001       # パターン指定
pnpm screenshot:patterns:new cta section      # 複数指定
pnpm screenshot:patterns:compare cta          # 比較対象の絞り込み
```


## サムネイル撮影（screenshot:patterns:new / screenshot:patterns:force）

Playwright で各パターンのプレビューページを撮影し、`public/screenshots/patterns/` に保存する。
サイト上のパターン一覧ページがこれをサムネイルとして表示する。

```
pnpm screenshot:patterns:new      # 新規のみ
pnpm screenshot:patterns:force    # 全て再撮影
```


## レイアウト比較（screenshot:patterns:compare）

CDN のランダム画像をグレーのプレースホルダーに差し替えた上で撮影し、ベースライン画像とピクセル比較してレイアウトの差分を検出する。

### 初回（ベースライン生成）

```
pnpm screenshot:patterns:compare
```

`_screenshots/baseline/` にベースライン画像が生成される。これを Git にコミットしておく。

### 2回目以降（比較）

```
pnpm screenshot:patterns:compare
```

ベースラインと比較し、差分があるパターンを通知する。差分画像は `_screenshots/diff/` に出力される。


## ベースライン更新（screenshot:patterns:update）

```
pnpm screenshot:patterns:update
```

`_screenshots/diff/` にある差分パターンを対象に、以下の2つを同時に更新する:

1. **比較用ベースライン** (`_screenshots/baseline/`) — グレー差し替え画像で再撮影
2. **公開用サムネイル** (`public/screenshots/patterns/`) — 本番画像で再撮影

更新後、`_screenshots/diff/` と `_screenshots/temp/` は自動で削除される。


## 運用フロー

1. **CSS やパターンを変更した**
   - `pnpm screenshot:patterns:compare` で意図しないレイアウト崩れがないか確認
2. **差分が意図通り**
   - `pnpm screenshot:patterns:update` でベースラインとサムネイルを更新 → コミット
3. **サムネイルだけ再撮影したい場合**
   - `pnpm screenshot:patterns:force` でサイト表示用のサムネイルを再撮影 → コミット
4. **新しいパターンを追加した**
   - `pnpm screenshot:patterns:new` で新規のサムネイルを撮影
   - `pnpm screenshot:patterns:compare` でベースラインに追加される


## ファイル構成

```
apps/docs/
  scripts/
    generate-screenshots.ts    # サムネイル撮影スクリプト
    compare-screenshots.ts     # 比較スクリプト
    update-screenshots.ts      # 差分パターンの更新スクリプト
  public/
    screenshots/patterns/     # サイト表示用サムネイル（Git管理）
  _screenshots/
    baseline/                  # 比較用ベースライン（Git管理）
    diff/                      # 差分画像の出力先（Git管理外）
    temp/                      # 比較時の一時ファイル（自動削除）
```
