# Release

指定されたパッケージのバージョン更新・タグ付け・リリースノート生成・GitHub リリース作成までを一貫して行う。
npm publish とデプロイはユーザーが手動で行う。

## 引数

`$ARGUMENTS` をスペース区切りで解釈する:

- 第1引数: パッケージ識別子（`lism-css` または `lism-ui`）
- 第2引数: リリースバージョン（例: `0.10.0`）

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
- 引数（パッケージ識別子、バージョン）が不足している場合はユーザーに確認する

### 2. バージョン更新

- 対象パッケージの `package.json` の version を確認する
- 引数で指定されたバージョンと異なる場合:
  - `package.json` の `"version"` フィールドを更新する
  - `git add` → `git commit -m "chore: {パッケージ識別子} v{バージョン}"`
  - ユーザーにpushしていいか確認 → `git push origin dev`
- すでに一致している場合はスキップする

### 3. 前回タグの特定

- 既存タグから、同じタグプレフィックスを持つ直前のタグを探す
- 前回タグがない場合は、リポジトリの最初のコミットからの全履歴を対象とする

### 4. 変更の分析

前回タグ（または最初のコミット）〜 dev の HEAD 間で `git log --oneline` と `git diff --stat` を取得する。

**パッケージの振り分けルール（変更ファイルのパスで判定）:**

- `packages/lism-css/` → lism-css
- `packages/lism-ui/` → lism-ui
- `apps/docs/` → Documentation（両パッケージ共通）
- その他（ルート設定ファイル等）→ Other

対象パッケージに関連する変更を中心にリリースノートを構成する。
ドキュメントサイト（`apps/docs/`）のみに関する変更（docs修正、ドキュメント同期など）はリリースノートに含めない。パッケージのコード変更を伴うコミットのみを対象とする。

### 5. リリースノートと changelog の生成

#### 5-A. GitHub リリースノート

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

#### 5-B. changelog エントリ

リリースノートの内容をもとに、changelog.mdx 用の簡潔なエントリを日本語・英語の両方で生成する。

**フォーマット:**

```markdown
## v.{バージョン} (YYYY.MM.DD)

- 変更内容の簡潔な説明
- ...
```

- リリースノートのカテゴリ分け（Features / Bug Fixes 等）は不要。フラットな箇条書きにまとめる
- コミットハッシュは含めない
- 大きな変更がある場合は、箇条書きの下にサブセクション（`###`）やテーブルで補足してもよい（既存の changelog エントリのスタイルを参考にする）
- 日付は `YYYY.MM.DD` 形式で、当日の日付を使用する

### 6. ユーザーに確認

生成したリリースノートと changelog エントリ（ja/en）を表示し、以下を確認する:

- タグ名: `{タグプレフィックス}{バージョン}`
- GitHub リリースノートの内容
- changelog エントリの内容（日本語・英語）
- 続行してよいかの許可

ユーザーが内容を修正したい場合は、指示に従って調整する。

### 6.5. ドキュメント内のバージョン番号更新（lism-css リリース時のみ）

対象パッケージが `lism-css` の場合、`apps/docs/` 配下で `lism-css@` を含むファイルを検索し、CDN リンク等に含まれるバージョン番号を新バージョンに更新する。

**手順:**
1. `apps/docs/` 配下で `lism-css@` を検索し、該当箇所を特定する（changelog.mdx は除外）
2. `lism-css@{旧バージョン}` → `lism-css@{新バージョン}` に置換する

旧バージョンは、ステップ2で確認した更新前の `package.json` の version 値を使用する。

この変更はステップ7の changelog 更新と同じコミットに含める。

### 7. changelog.mdx の更新

ユーザーの承認後、以下のファイルにエントリを追記する:

- `apps/docs/src/content/ja/changelog.mdx`
- `apps/docs/src/content/en/changelog.mdx`

**追記位置:** 既存の最新エントリ（最初の `## v.` 見出し）の直前に挿入する。

追記後:
1. `git add apps/docs/src/content/ja/changelog.mdx apps/docs/src/content/en/changelog.mdx`
2. `git commit -m "docs: v{バージョン} changelog 追記"`
3. ユーザーにpushしていいか確認 → `git push origin dev`

### 8. npm publish（ユーザー手動）

ユーザーに以下を案内し、完了を待つ:

```
pnpm publish を実行してください:
  {対応する publish コマンド}

完了したら教えてください。
```

### 9. デプロイ（ユーザー手動）

ユーザーに以下を案内し、完了を待つ:

```
デプロイを実行してください:
  nr deploy

完了したら教えてください。
```

### 10. main ブランチに切り替え

publish とデプロイの完了をユーザーが確認した後:

- `git checkout main && git pull origin main` で main の最新状態にする

### 11. タグ付けと GitHub リリースの作成

以下を順番に実行する:

1. `git tag {タグ名}` でタグを作成（main の HEAD に付与される）
2. `git push origin {タグ名}` でタグをプッシュ
3. `gh release create {タグ名} --title "{タグ名}" --notes "{リリースノート}"` で GitHub リリースを作成

完了後、元のブランチ（dev）に戻る。
