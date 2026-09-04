基準日: 2026-09-03・コミット105422df

# パターン スクリーンショット

`apps/docs`のパターンページのサムネイル撮影と、レイアウト差分検出の仕組み。テンプレ側は[template-screenshots.md](./template-screenshots.md)。


## コマンド

ルートからも同名コマンドで実行でき、`apps/docs`側に委譲される。

| コマンド | 処理 |
| --- | --- |
| `pnpm screenshot:patterns:new` | ビルド後、Playwrightで新規パターンだけ撮影し`public/screenshots/patterns/`へ保存（既存はスキップ）。サイトのパターン一覧がこれをサムネイルに使う |
| `pnpm screenshot:patterns:force` | ビルド後、全パターンのサムネイルを再撮影 |
| `pnpm screenshot:patterns:compare` | ビルド後、CDNのランダム画像をグレーに差し替えて撮影し、`_screenshots/baseline/`とピクセル比較。初回はベースラインを生成する（コミットする）。差分画像は`_screenshots/diff/`へ出力 |
| `pnpm screenshot:patterns:compare --threshold 0.5` | 差分率のしきい値を変更（既定0.01%） |
| `pnpm screenshot:patterns:update` | ビルドせず既存distを使い、`_screenshots/diff/`にある差分パターンのベースライン（グレー差し替え）と公開用サムネ（本番画像）を再撮影。完了後に`diff/`と`temp/`を削除 |

### 絞り込み

`new` / `force` / `compare`はカテゴリやパターンで対象を絞れる。

```bash
pnpm screenshot:patterns:new cta              # カテゴリ
pnpm screenshot:patterns:new cta/cta001       # パターン
pnpm screenshot:patterns:new cta section      # 複数
pnpm screenshot:patterns:compare cta
```

### 言語（ja / en）

プレビューは`ja`（既定）と`en`の2言語。`generate-screenshots.ts` / `compare-screenshots.ts`は`--lang=en` / `--lang=ja`で絞れる（省略時は全言語）。`update-screenshots.ts`に`--lang`は無く、`_screenshots/diff/`配下に`en/`があるかで対象言語を判定する。

```bash
# apps/docs で実行
npx tsx scripts/generate-screenshots.ts --lang=en
npx tsx scripts/compare-screenshots.ts cta/cta001 --lang=ja
```

保存先は`ja`がプレフィックスなし、`en`が`en/`サブディレクトリ（公開用サムネもベースラインも同じ規則）。`en`の撮影URLは末尾に`/en/`が付く（`/preview/patterns/cta/cta001/en/`）。


## 運用フロー

1. CSSやパターンを変更した: `compare`で意図しない崩れがないか確認する。
2. 差分が意図どおり: `update`でベースラインとサムネを更新してコミットする。
3. サムネだけ撮り直したい: `force`してコミットする。
4. パターンを追加した: `new`でサムネを撮影し、`compare`でベースラインに追加する。


## ファイル構成

```
apps/docs/
  scripts/
    generate-screenshots.ts    # 撮影（new / force）
    compare-screenshots.ts     # 比較
    update-screenshots.ts      # 差分パターンの更新
  public/screenshots/patterns/ # 公開用サムネ（Git管理）
    cta/cta001.png             #   ja
    en/cta/cta001.png          #   en
  _screenshots/
    baseline/                  # 比較用ベースライン（Git管理）。言語構成は上と同じ
    diff/                      # 差分画像（Git管理外）。言語構成は上と同じ
    temp/                      # 比較時の一時ファイル（自動削除）
```
