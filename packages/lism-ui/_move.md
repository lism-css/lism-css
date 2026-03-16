# lism-ui コンポーネント移行ガイドライン

このドキュメントでは、`apps/docs/src/components/ex/` 配下のコンポーネントを `packages/lism-ui` へ移行する際の手順と注意点をまとめます。

---

## 1. ディレクトリ構成

新しいコンポーネントは以下の構造で作成します：

```
src/components/
└── ComponentName/
    ├── _style.css          # コンポーネント専用スタイル
    ├── getProps.ts         # (任意) プロパティ処理ロジック
    ├── presets.ts          # (任意) プリセット設定
    ├── react/
    │   ├── ComponentName.jsx   # React コンポーネント
    │   └── index.js            # エクスポート
    └── astro/
        ├── ComponentName.astro # Astro コンポーネント
        └── index.js            # エクスポート
```

### ファイルの役割

| ファイル | 必須 | 説明 |
|---------|------|------|
| `_style.css` | ◯ | コンポーネント固有のスタイル |
| `react/ComponentName.jsx` | ◯ | React 版コンポーネント |
| `react/index.js` | ◯ | React 版エクスポート |
| `astro/ComponentName.astro` | ◯ | Astro 版コンポーネント |
| `astro/index.js` | ◯ | Astro 版エクスポート |
| `getProps.ts` | △ | 複雑なプロパティ処理がある場合 |
| `presets.ts` | △ | type による切り替えがある場合 |

---

## 2. インポートパターン

### React コンポーネント

```jsx
import { Lism, Flex, Grid, Flow } from 'lism-css/react';
import '../_style.css';

export default function ComponentName(props) {
    return (
        <Lism lismClass='c--component' {...props} />
    );
}
```

### Astro コンポーネント

```astro
---
import { Lism, Flex, Grid, Flow } from 'lism-css/astro';
import '../_style.css';

const props = Astro.props;
---

<Lism lismClass='c--component' {...props}>
    <slot />
</Lism>
```

---

## 3. スタイル定義規則

### 基本ルール

1. **レイヤー**: `@layer lism.modules { }` 内に定義
2. **命名規則**: コンポーネントクラスは `c--` プレフィックス
3. **サブ要素**: `c--component_element` 形式（アンダースコア区切り）
4. **バリアント**: `c--component--variant` 形式（ダブルハイフン区切り）

### スタイル例

```css
@layer lism.modules {
    /* メインコンポーネント */
    .c--component {
        /* CSS 変数の定義 */
        --_local-var: value;
        
        /* スタイル */
        display: grid;
    }

    /* バリアント */
    .c--component--variant {
        --_local-var: modified-value;
    }

    /* サブ要素 */
    .c--component_child {
        /* ... */
    }
}

/* NOTE: @layer 外に配置が必要なスタイル（セレクタの詳細度調整など） */
[data-attr='value'] .c--component_child {
    /* ... */
}
```

---

## 4. プロパティ処理パターン

### シンプルなコンポーネント（Button, Badge）

CSS 変数として受け取りたいプロパティは `_propConfig` で指定：

```jsx
const _propConfig = {
    c: { isVar: 1 },     // color を --c として出力
    bgc: { isVar: 1 },   // background-color を --bgc として出力
};

return (
    <Lism lismClass='c--component' _propConfig={_propConfig} {...props} />
);
```

### 複雑なコンポーネント（Alert, Callout）

`getProps.ts` と `presets.ts` を作成し、ロジックを分離：

```typescript
// getProps.ts
import PRESETS from './presets';

export default function getComponentProps({ type, ...props }) {
    const presetData = type ? PRESETS[type] : null;
    
    return {
        lismClass: 'c--component',
        // プリセットからの値
        someValue: presetData?.someValue || 'default',
        // その他のプロパティ
        ...props,
    };
}
```

---

## 5. エクスポート設定

移行完了後、以下のファイルを更新：

### `src/components/react.ts`

```typescript
export { default as ComponentName } from './ComponentName/react';
```

### `src/components/astro.ts`

```typescript
export { default as ComponentName } from './ComponentName/astro';
```

### `src/style.scss`

```scss
@use './components/ComponentName/_style.css' as componentname;
```

---

## 6. ドキュメント・参照の更新

移行後、docs 内で古いコンポーネントを参照しているファイルを更新する必要があります。

### 6.1 参照箇所の検索

```bash
# ex/ComponentName を参照しているファイルを検索
grep -r "ex/ComponentName" apps/docs/
```

### 6.2 インポートの更新

**変更前（古い参照）:**
```jsx
import ComponentName from '@/components/ex/ComponentName';
```

**変更後（新しい参照）:**
```jsx
import { ComponentName } from '@lism-css/ui/react';
// または Astro の場合
import { ComponentName } from '@lism-css/ui/astro';
```

### 6.3 古いファイルの削除

参照の更新が完了したら、古いコンポーネントファイルを削除します：

```bash
# ファイルを削除
rm apps/docs/src/components/ex/ComponentName/index.jsx
rm apps/docs/src/components/ex/ComponentName/style.css

# 空のディレクトリを削除
rmdir apps/docs/src/components/ex/ComponentName
```

---

## 7. 移行チェックリスト

### lism-ui パッケージ側

- [ ] ディレクトリ構造を作成
- [ ] `_style.css` を移行・調整
  - [ ] `@layer lism.modules` で囲む
  - [ ] クラス名が `c--` プレフィックスになっている
- [ ] React コンポーネントを作成
  - [ ] `lism-css/react` からインポート
  - [ ] `lismClass` を適切に設定
  - [ ] プロパティのデフォルト値を設定
- [ ] Astro コンポーネントを作成
  - [ ] `lism-css/astro` からインポート
  - [ ] `<slot />` を使用
- [ ] index.js ファイルを作成
- [ ] `react.ts` と `astro.ts` にエクスポートを追加
- [ ] `style.scss` にスタイルの import を追加

### docs 側

- [ ] `ex/ComponentName` の参照箇所を検索
- [ ] インポートを `@lism-css/ui/react` または `@lism-css/ui/astro` に更新
- [ ] 古いコンポーネントファイルを削除
- [ ] 空のディレクトリを削除

---

## 8. Chat コンポーネント移行メモ

### 元ファイル（削除済み）

- ~~`apps/docs/src/components/ex/Chat/index.jsx`~~
- ~~`apps/docs/src/components/ex/Chat/style.css`~~

### 移行先

- `packages/lism-ui/src/components/Chat/`

### 更新したドキュメント

- `apps/docs/src/content/ja/ui/Chat.mdx`
  - インポートを `@lism-css/ui/react` に変更

### 注意点

1. **依存コンポーネント**: `Lism`, `Flow`, `Grid`, `Frame`, `Decorator` を使用
2. **スタイル調整**: 元のスタイルは既に `@layer lism.modules` を使用しているため、大きな変更は不要
3. **data 属性**: `data-chat-dir` はそのまま維持
4. **variant**: `speak`, `think` の2種類のバリアントあり
5. **keycolor**: カラーボックス (`u--cbox`) を使用した色管理

### プロパティ一覧

| プロパティ | デフォルト値 | 説明 |
|-----------|-------------|------|
| `variant` | `'speak'` | チャットスタイル（speak/think） |
| `direction` | `'start'` | 吹き出しの方向（start/end） |
| `name` | - | 発言者名 |
| `avatar` | - | アバター画像URL |
| `keycolor` | `'gray'` | キーカラー |
| `flow` | `'s'` | コンテンツのフロー間隔 |
