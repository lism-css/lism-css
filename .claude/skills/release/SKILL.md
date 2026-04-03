---
name: release
description: パッケージのリリースノートを生成し、タグ付け・GitHubリリースを作成する
disable-model-invocation: true
argument-hint: <package> <version>
---

# Release

指定されたパッケージのバージョン更新・タグ付け・リリースノート生成・GitHub リリース作成までを一貫して行う。
npm publish とデプロイはユーザーが手動で行う。

## 引数

- `$0`: パッケージ識別子（`lism-css` または `lism-ui`）
- `$1`: リリースバージョン（例: `0.10.0`）

## パッケージマッピング

| 識別子 | npm パッケージ名 | ディレクトリ | タグプレフィックス | publish コマンド |
|---|---|---|---|---|
| `lism-css` | `lism-css` | `packages/lism-css/` | `lism-css@v` | `nr publish:core` |
| `lism-ui` | `@lism-css/ui` | `packages/lism-ui/` | `lism-ui@v` | `nr publish:ui` |

## 現在の状態

- 現在のブランチ: !`git branch --show-current`
- 既存タグ: !`git tag --list --sort=-version:refname | head -20`
- lism-css の現在バージョン: !`node -p "require('./packages/lism-css/package.json').version"`
- lism-ui の現在バージョン: !`node -p "require('./packages/lism-ui/package.json').version"`

## 手順

### 1. dev ブランチの確認

- 現在のブランチが dev であることを確認する
- dev 以外にいる場合、ユーザーに警告し「dev に切り替えますか？」と確認する
- `git pull origin dev` で最新状態にする
- 引数（`$0`, `$1`）が不足している場合はユーザーに確認する

### 2. バージョン更新

- 対象パッケージの `package.json` の version を確認する
- 引数で指定されたバージョン（`$1`）と異なる場合:
  - `package.json` の `"version"` フィールドを更新する
  - `git add` → `git commit -m "chore: {パッケージ識別子} v{バージョン}"`
  - ユーザーにpushしていいか確認 → `git push origin dev`
- すでに一致している場合はスキップする

### 3. npm publish（ユーザー手動）

ユーザーに以下を案内し、完了を待つ:

```
pnpm publish を実行してください:
  {対応する publish コマンド}

完了したら教えてください。
```

### 4. デプロイ（ユーザー手動）

ユーザーに以下を案内し、完了を待つ:

```
デプロイを実行してください:
  nr deploy

完了したら教えてください。
```

### 5. main ブランチに切り替え

publish とデプロイの完了をユーザーが確認した後:

- `git checkout main && git pull origin main` で main の最新状態にする

### 6. 前回タグの特定

- 既存タグから、同じタグプレフィックスを持つ直前のタグを探す
- 前回タグがない場合は、リポジトリの最初のコミットからの全履歴を対象とする

### 7. 変更の分析

前回タグ（または最初のコミット）〜 main の HEAD 間で `git log --oneline` と `git diff --stat` を取得する。

**パッケージの振り分けルール（変更ファイルのパスで判定）:**

- `packages/lism-css/` → lism-css
- `packages/lism-ui/` → lism-ui
- `apps/docs/` → Documentation（両パッケージ共通）
- その他（ルート設定ファイル等）→ Other

対象パッケージに関連する変更を中心にリリースノートを構成する。
ドキュメントサイト（`apps/docs/`）のみに関する変更（docs修正、ドキュメント同期など）はリリースノートに含めない。パッケージのコード変更を伴うコミットのみを対象とする。

### 8. リリースノートの生成

以下のフォーマットで日本語のリリースノートを生成する:

```markdown
## What's Changed

### Features
- 変更内容の説明 (コミットハッシュ短縮形)

### Bug Fixes
- 変更内容の説明 (コミットハッシュ短縮形)

### Other
- 変更内容の説明 (コミットハッシュ短縮形)
```

**分類ルール:**

- `feat` プレフィックス、または新機能追加 → Features
- `fix` プレフィックス、またはバグ修正 → Bug Fixes
- `docs` プレフィックス → ドキュメントのみの変更は除外する
- `chore`, `refactor`, `style`, `perf`, `ci`, `build` → Other

空のカテゴリは省略する。コミットメッセージが日本語の場合はそのまま使用する。

### 9. ユーザーに確認

生成したリリースノートを表示し、以下を確認する:

- タグ名: `{タグプレフィックス}{バージョン}`
- リリースノートの内容
- 続行してよいかの許可

ユーザーが内容を修正したい場合は、指示に従って調整する。

### 10. タグ付けと GitHub リリースの作成

ユーザーの承認後、以下を順番に実行する:

1. `git tag {タグ名}` でタグを作成（main の HEAD に付与される）
2. `git push origin {タグ名}` でタグをプッシュ
3. `gh release create {タグ名} --title "{タグ名}" --notes "{リリースノート}"` で GitHub リリースを作成

完了後、元のブランチ（dev）に戻る。
