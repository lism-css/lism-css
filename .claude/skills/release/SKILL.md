---
name: release
description: パッケージのリリースノートを生成し、タグ付け・GitHubリリースを作成する
disable-model-invocation: true
argument-hint: <package> [version]
---

# Release Notes Generator

指定されたパッケージのリリースノートを生成し、タグ付け・GitHubリリースを作成する。

## 引数

- `$0`: パッケージ識別子（`lism-css` または `lism-ui`）
- `$1`: 新バージョン（省略時は package.json から取得）

## パッケージマッピング

| 識別子 | npm パッケージ名 | ディレクトリ | タグプレフィックス |
|---|---|---|---|
| `lism-css` | `lism-css` | `packages/lism-css/` | `lism-css@v` |
| `lism-ui` | `@lism-css/ui` | `packages/lism-ui/` | `lism-ui@v` |

## 現在の状態

- 現在のブランチ: !`git branch --show-current`
- 既存タグ: !`git tag --list --sort=-version:refname | head -20`
- lism-css の現在バージョン: !`node -p "require('./packages/lism-css/package.json').version"`
- lism-ui の現在バージョン: !`node -p "require('./packages/lism-ui/package.json').version"`

## 手順

### 0. ブランチの確認と切り替え

- 現在のブランチを確認する
- **main ブランチ以外にいる場合**、ユーザーに「main に切り替えて実行しますか？」と確認する
- ユーザーが承認したら `git checkout main && git pull origin main` で main の最新状態にする
- ユーザーが現在のブランチで続行を希望する場合はそのまま進める

### 1. パッケージとバージョンの特定

- `$0` から対象パッケージを特定する。不明な場合はユーザーに確認する
- バージョンが未指定（`$1` が空）の場合、対応する package.json の version を使用する
- タグ名: `{タグプレフィックス}{バージョン}`（例: `lism-css@v0.10.0`）

### 1.5. 最新コミットの検証

- main（または現在のブランチ）の HEAD コミットの変更内容を `git show --stat HEAD` で確認する
- 対象パッケージの `package.json` が変更に含まれていない場合、ユーザーに警告する:
  - 「最新コミットに {パッケージ名} の package.json の変更が含まれていません。バージョン更新が済んでいない可能性があります。続行しますか？」
- ユーザーが中断を選んだ場合、処理を停止する

### 2. 前回タグの特定

- 既存タグから、同じタグプレフィックスを持つ直前のタグを探す
- 前回タグがない場合は、リポジトリの最初のコミットからの全履歴を対象とする

### 3. 変更の分析

前回タグ（または最初のコミット）〜 HEAD 間で `git log --oneline` と `git diff --stat` を取得する。

**パッケージの振り分けルール（変更ファイルのパスで判定）:**

- `packages/lism-css/` → lism-css
- `packages/lism-ui/` → lism-ui
- `apps/docs/` → Documentation（両パッケージ共通）
- その他（ルート設定ファイル等）→ Other

対象パッケージに関連する変更を中心にリリースノートを構成する。Documentation や Other のうち関連するものも含めてよい。

### 4. リリースノートの生成

以下のフォーマットで日本語のリリースノートを生成する:

```markdown
## What's Changed

### Features
- 変更内容の説明 (コミットハッシュ短縮形)

### Bug Fixes
- 変更内容の説明 (コミットハッシュ短縮形)

### Documentation
- 変更内容の説明 (コミットハッシュ短縮形)

### Other
- 変更内容の説明 (コミットハッシュ短縮形)
```

**分類ルール:**

- `feat` プレフィックス、または新機能追加 → Features
- `fix` プレフィックス、またはバグ修正 → Bug Fixes
- `docs` プレフィックス → Documentation
- `chore`, `refactor`, `style`, `perf`, `ci`, `build` → Other

空のカテゴリは省略する。コミットメッセージが日本語の場合はそのまま使用する。

### 5. ユーザーに確認

生成したリリースノートを表示し、以下を確認する:

- タグ名
- リリースノートの内容
- 続行してよいかの許可

ユーザーが内容を修正したい場合は、指示に従って調整する。

### 6. タグ付けと GitHub リリースの作成

ユーザーの承認後、以下を順番に実行する:

1. `git tag {タグ名}` でタグを作成
2. `git push origin {タグ名}` でタグをプッシュ
3. `gh release create {タグ名} --title "{タグ名}" --notes "{リリースノート}"` で GitHub リリースを作成

各ステップの実行前にユーザーの確認を取ること。
