# apps/docs から apps/docs-new へ引っ越しするための手順

> **重要:** docs 内のファイルは編集・削除しないこと。docs-new へコピーしてもってくる。

---

## MDX ファイル移行時の変換ルール

### 1. パスエイリアスの変換

docs では `~/` を使用しているが、docs-new では `@/` を使用する。

```diff
- import { Preview } from '~/components';
+ import { Preview } from '@/components/mdx';
```

### 2. Frontmatter の変換

#### sidebar の書き方

docs の `sidebar: order:` 形式は docs-new では動作しない。`order:` に変換する。

```diff
  ---
  title: 'ページタイトル'
  description: '...'
- sidebar:
-   order: 50
+ order: 50
  ---
```

#### 必須/任意フィールド

```yaml
---
title: 'ページタイトル'      # 必須
description: '...'           # 必須
navtitle: 'サイドバー用'     # 任意（省略時は title を使用）
order: 1                     # 任意（サイドバーの表示順序）
draft: false                 # 任意（下書きフラグ）
---
```

### 3. Callout / Note の変換

| docs の記法 | docs-new での変換 |
|------------|------------------|
| `<Callout type="check">...</Callout>` | `:::check ... :::` |
| `<Callout type="warning">...</Callout>` | `:::warning ... :::` |
| `<Note title="タイトル" type="warning">...</Note>` | `:::warning ::title[タイトル] ... :::` |

変換後は `import { Callout } from '...'` の行を削除する。

### 4. グローバルコンポーネント

以下のコンポーネントは mdx 内で import 不要で使用可能:

- `Preview`, `PreviewArea`, `PreviewTitle`, `PreviewCode`, `PreviewFrame`
- `HelpText`, `IconBadge`, `Reference`, `MemoBadge`, `PropBadge`
- `ImportPackage`, `EmbedCode`, `ImportSource`
- `Callout`, `LinkCard`, `InnerLink`

---

## 残りの作業

### MDX ファイルの移行

- [x] `css/` ディレクトリ ✅
- [x] `modules/` ディレクトリ ✅
- [x] `components/` ディレクトリ ✅
- [ ] 他のディレクトリ（必要に応じて）

### sidebar.ts の更新

移行したディレクトリを `src/config/sidebar.ts` に追加する。

```typescript
// 例: modules のサブディレクトリを追加
{
  label: 'State Modules',
  dir: 'modules/state',
},
{
  label: 'Layout Modules',
  dir: 'modules/layout',
},
```

### その他

- [ ] トップページのコンテンツ作成
- [ ] 不要なタグ関連コードの削除（必要に応じて）


docs/ に変えたい
