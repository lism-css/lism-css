# apps/docs から apps/docs-new へ引っ越しするための手順

> **重要:** docs 内のファイルは編集・削除しないこと。docs-new へコピーしてもってくる。

---

## 背景

- docs-new は別のブログサイトで使用していたテンプレート
- 基本的な機能は全て docs-new 側で実装済み
- 主に `.mdx` ファイルの引っ越しとなる

---

## 作業手順

### フェーズ 1: 環境整備（docs-new の準備）

#### 1-1. 不要なフィールド・コードを削除
- [x] `content/config.ts` の `tags` フィールド → optional 化 ✅
- [x] `content/config.ts` の `date` フィールド → optional 化 ✅
- [ ] 各 mdx 内の `tags` frontmatter → 削除（必要に応じて）
- [ ] `PostCard.astro` など UI コンポーネントのタグ参照 → 削除（必要に応じて）
- [x] `/pages/tags/` ディレクトリ → **既に削除済み** ✅

#### 1-2. ワンカラム用の汎用レイアウトを作成
- [x] `SimpleLayout.astro` を新規作成 ✅
- [x] ヘッダー・フッターは共通、サイドバーなしのワンカラム構成 ✅
- [x] トップページや特殊ページで使用可能 ✅

#### 1-3. トップページの変更
- [ ] 現状の新着投稿リストを削除
- [ ] フレームワークドキュメント向けのコンテンツを配置

---

### フェーズ 2: Preview 系コンポーネントの移植

#### 2-1. docs から Preview 系コンポーネントを丸ごとコピー
以下を `docs-new/src/components/Preview/` へコピー:
- [x] `Preview.astro` ✅
- [x] `PreviewArea.astro` ✅
- [x] `PreviewCode.astro` ✅
- [x] `PreviewTitle.astro` ✅
- [x] `PreviewFrame.astro` ✅
- [x] `index.js` ✅
- [x] Preview 用の SCSS スタイル追加 ✅
- [x] テーマ変数（`--lsdoc-*`）追加 ✅

#### 2-2. mdx グローバルコンポーネントに追加
- [x] `src/components/mdx/index.ts` に Preview 系を追加 ✅
- [x] mdx 内で import 不要で使えるようにする ✅

---

### フェーズ 3: Callout / Note の変換ルール

| docs の記法 | docs-new での変換 |
|------------|------------------|
| `<Callout type="check">...</Callout>` | `:::check ... :::` |
| `<Callout type="warning">...</Callout>` | `:::warning ... :::` |
| `<Note title="タイトル" type="warning">...</Note>` | `:::warning ::title[タイトル] ... :::` |

---

### フェーズ 4: テスト移行（overview, getting-started のみ）

#### 4-1. frontmatter の調整
docs-new の schema に合わせて以下を追加:
```yaml
---
title: 'Overview'
navtitle: 'Overview'  # サイドバー用（省略可）
description: '...'
order: 1  # サイドバーの表示順序
draft: false
---
```

#### 4-2. コンテンツの変換
- [x] `<Callout>` → `:::type ... :::` に変換 ✅
- [x] `<Note>` → `:::type ::title[...] ... :::` に変換 ✅
- [x] Preview 系はそのまま維持（グローバルコンポーネントとして使用）✅
- [x] import 文の整理（Preview 系の import を削除）✅

#### 4-3. 動作確認
- [x] `pnpm dev` でローカルサーバー起動 ✅
- [x] overview, getting-started ページが正しく表示されるか確認 ✅

---

### フェーズ 5: 静的ページの移植

以下を構造ごとそのままコピー:
- [x] `docs/src/pages/demo/` → `docs-new/src/pages/demo/` ✅
- [x] `docs/src/pages/templates/` → `docs-new/src/pages/templates/` ✅
- [x] `docs/src/pages/page-layout/` → `docs-new/src/pages/page-layout/` ✅
- [x] `DemoPageLayout.astro` を新規作成 ✅
- [x] `ex/` コンポーネント（Button等）をコピー ✅
- [x] import パスを `~/` から `@/` に変換 ✅

---

### フェーズ 6: sidebar 設定の更新

- [x] `docs-new/src/config/sidebar.ts` → 既存設定で overview, getting-started が表示される ✅
- [ ] 残りの記事を移行後に sidebar 設定を更新

---

## 作業の優先順位

1. **フェーズ 1-2**: ワンカラムレイアウト作成 ✅ 完了
2. **フェーズ 2**: Preview 系コンポーネント移植 ✅ 完了
3. **フェーズ 4**: テスト移行（overview, getting-started）✅ 完了
4. **フェーズ 5**: 静的ページ移植 ✅ 完了
5. **フェーズ 1-1**: タグ関連削除（部分的に完了）
6. **フェーズ 6**: sidebar 設定（基本設定済み）

---

## 完了した作業まとめ

### 作成したファイル
- `src/layouts/SimpleLayout.astro` - ワンカラムレイアウト
- `src/layouts/DemoPageLayout.astro` - デモページ用レイアウト
- `src/components/Preview/` - Preview 系コンポーネント一式
- `src/components/ex/` - Button, Badge 等のUIコンポーネント
- `src/styles/_preview.scss` - Preview 用スタイル
- `src/content/ja/overview.mdx` - 移行済み
- `src/content/ja/getting-started.mdx` - 移行済み

### 変更したファイル
- `src/content/config.ts` - date, tags を optional 化
- `src/styles/_theme.scss` - Preview 用 CSS 変数追加
- `src/styles/main.scss` - preview.scss を追加
- `src/components/mdx/index.ts` - Preview 系を export
- `src/components/ui/PostNavigation.astro` - date が undefined の場合のエラー修正
- `package.json` - @phosphor-icons/react を追加
- `astro.config.ts` - ポート番号を 4000 に設定

### コピーしたディレクトリ
- `src/pages/demo/`
- `src/pages/templates/`
- `src/pages/page-layout/`

---

## 次のステップ

1. 残りの `.mdx` ファイルを `src/content/ja/` へ移行
2. Callout/Note を `:::` 記法に変換
3. sidebar.ts を更新して全記事をナビゲーションに追加
4. トップページのコンテンツを作成
