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
- [ ] `content/config.ts` の `tags` フィールド → 削除 or optional 化
- [ ] `content/config.ts` の `date` フィールド → 削除 or optional 化
- [ ] 各 mdx 内の `tags` frontmatter → 削除
- [ ] `PostCard.astro` など UI コンポーネントのタグ参照 → 削除
- [ ] `/pages/tags/` ディレクトリ → **既に削除済み** ✅

#### 1-2. ワンカラム用の汎用レイアウトを作成
- [ ] `SimpleLayout.astro`（仮称）を新規作成
- [ ] ヘッダー・フッターは共通、サイドバーなしのワンカラム構成
- [ ] トップページや特殊ページで使用

#### 1-3. トップページの変更
- [ ] 現状の新着投稿リストを削除
- [ ] フレームワークドキュメント向けのコンテンツを配置

---

### フェーズ 2: Preview 系コンポーネントの移植

#### 2-1. docs から Preview 系コンポーネントを丸ごとコピー
以下を `docs-new/src/components/Preview/` へコピー:
- [ ] `Preview.astro`
- [ ] `PreviewArea.astro`
- [ ] `PreviewCode.astro`
- [ ] `PreviewTitle.astro`
- [ ] `PreviewFrame.astro`
- [ ] `index.js`

#### 2-2. mdx グローバルコンポーネントに追加
- [ ] `src/components/mdx/index.ts` に Preview 系を追加
- [ ] mdx 内で import 不要で使えるようにする

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
- [ ] `<Callout>` → `:::type ... :::` に変換
- [ ] `<Note>` → `:::type ::title[...] ... :::` に変換
- [ ] Preview 系はそのまま維持（グローバルコンポーネントとして使用）
- [ ] import 文の整理（Preview 系の import を削除）

#### 4-3. 動作確認
- [ ] `pnpm dev` でローカルサーバー起動
- [ ] overview, getting-started ページが正しく表示されるか確認

---

### フェーズ 5: 静的ページの移植

以下を構造ごとそのままコピー:
- [ ] `docs/src/pages/demo/` → `docs-new/src/pages/demo/`
- [ ] `docs/src/pages/templates/` → `docs-new/src/pages/templates/`
- [ ] `docs/src/pages/page-layout/` → `docs-new/src/pages/page-layout/`
- [ ] 必要なレイアウト（`DemoPageLayout.astro` など）もコピー

---

### フェーズ 6: sidebar 設定の更新

- [ ] `docs-new/src/config/sidebar.ts` を更新
- [ ] 移行した記事がナビゲーションに表示されるように設定

---

## 作業の優先順位

1. **フェーズ 1-2**: ワンカラムレイアウト作成
2. **フェーズ 2**: Preview 系コンポーネント移植
3. **フェーズ 4**: テスト移行（overview, getting-started）
4. **フェーズ 1-1**: タグ関連削除（優先度低め）
5. **フェーズ 5**: 静的ページ移植
6. **フェーズ 6**: sidebar 設定
