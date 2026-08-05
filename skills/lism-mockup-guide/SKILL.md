---
name: lism-mockup-guide
description: 'Lism Mockupを使って画面モックアップを作成するための実装ガイド。@lism-css/mockupのデータディレクトリ（pages/*.jsx|tsx・tokens.json・mockup.config.json）として作成・編集し、lism-mockup init→実装→lism-mockup checkの自己検証ワークフローと、ページID・import許可リスト・トークン上書きのデータ契約に従う。マークアップの書き方自体はlism-css-guideを併用する。lism-mockup / @lism-css/mockup / 画面モックアップの作成・修正で使う。'
---

# Lism Mockup 実装ガイド（@lism-css/mockup）

Lism Mockupを使って画面モックアップを作成するための実装ガイドです。画面モックアップは`@lism-css/mockup`の**データディレクトリ**（1画面=1ファイルの`pages/`＋小さな設定ファイル）として組みます。プレビューアプリ（ビューア）はCLIに同梱されており、モックアップ側にビルド設定や`package.json`は不要です。このスキルが扱うのは「モックアップとしてどんなファイルを置けるか（データ契約）」と「initからcheckまでのワークフロー」だけです。

> **前提（必須）: `lism-css-guide`を併用する。**
> このスキルは`lism-css-guide`が同じ階層に導入されていることを前提にします。マークアップ自体の書き方 — Primitive選定・トークン照合・Property Class・レスポンシブ設計 — はすべて`lism-css-guide`の実装フローに従ってください。無い場合は、`lism-cli skill add`（引数なしで全スキル一括導入）での追加をユーザーに案内してください。guideなしで、推測だけでモックアップを書かないでください。

> **バージョン情報:** このガイドは`@lism-css/mockup@0.1.0`時点の情報に基づきます。

## 役割分担

- **このスキル**: データ契約（ファイル構成・スキーマ・import規則）と、init→実装→check→devのワークフロー
- **`lism-css-guide`**: マークアップの書き方すべて。実行レベル判定・実装前チェック・提出前セルフチェックはguideの手順をそのまま実行する（[`../lism-css-guide/SKILL.md`](../lism-css-guide/SKILL.md)）
- **契約の正本**: `lism-mockup init`が生成する`README.md`（契約説明書）。このスキルの要約と食い違う場合は生成物側を優先する

## コマンド

| コマンド | 用途 |
| --- | --- |
| `npx @lism-css/mockup init [dir]` | ひな形＋契約説明書の生成（初手） |
| `npx @lism-css/mockup check [dir]` | 非対話の検証。エージェントの自己確認はこれを使う |
| `npx @lism-css/mockup dev [dir]` | devサーバー起動（常駐）。人間のブラウザ確認用 |

`[dir]`省略時はカレントディレクトリ。ローカルにインストール済みならbin名`lism-mockup`でも実行できる。Node要件は`^20.19.0 || >=22.12.0`。

## ワークフロー（厳守）

1. **init**: データディレクトリがまだ無ければ、必ず`npx @lism-css/mockup init <dir>`から始める。既にデータディレクトリがある場合はinitを実行せず、既存の生成物を読む
   - initは生成予定のファイルと衝突すると無変更で非0終了する（生成対象と無関係な既存ファイルは妨げにならない）。`--force`は衝突ファイルを上書きするオプションなので、ユーザーの明示的な指示なしに使わない
2. **契約確認**: 生成された`README.md`（契約説明書）を必ず読む。サンプルページ（`pages/`）の構成を踏襲し、新しい構造を発明しない
3. **実装**: `pages/*.jsx|tsx`を書く。ここからは`lism-css-guide`の実装フロー（実行レベル判定→実装前チェック→実装→提出前セルフチェック）に従う
4. **自己検証**: `npx @lism-css/mockup check <dir>`を実行する。**checkが非0で終了する間は、完成と報告してはいけない。** エラーには対象ファイルと原因が表示されるので、修正して再実行する
5. **ブラウザ確認**: devサーバーは終了しない常駐プロセス。**フォアグラウンドで起動して終了を待ってはいけない。** バックグラウンドで起動するか、ユーザーに起動してもらう。見た目・render結果の確認はユーザーの役割
6. **完了報告**: checkが通ったことを報告する。checkはrender時エラー（後述）を検出しないため、`dev`でのブラウザ目視確認の依頼を報告に含める

## データ契約（要約）

データディレクトリの構成:

```
mockup/
├── mockup.config.json      # 必須 — schemaVersion＋追加import＋表示メタデータ
├── tokens.json             # 任意 — デザイントークンの上書き
├── tokens.dark.json        # 任意 — ダーク時の値（initでは生成されない）
└── pages/                  # 必須 — 1ファイル=1画面（最低1ページ）
    ├── landing.jsx
    ├── components.jsx      # 予約ID — 共通部品の一覧（手で維持するページ）
    └── admin/
        ├── settings.jsx
        └── settings.css  # ページ付随CSS（settings.jsxが相対importする）
```

### pages/

- 1ファイル=1画面。**propsを取らないReactコンポーネントをdefault export**する
- **ページID** = `pages/`からの相対パスから拡張子を除いたもの（`pages/admin/settings.jsx` → `admin/settings`）。サブディレクトリ可
- 画面はファイルシステムから自動発見される。**ファイルを置くだけでよく、configへの登録は不要**
- `.jsx` / `.tsx`の両方が使えるが、**型チェックは行われない**（型は剥がされるだけ）。同名の`.jsx`と`.tsx`の併存はID衝突エラー
- `useState`等のローカルUI状態とイベントハンドラは書いてよい。**API通信・認証・永続化・業務ロジックは書かない**（モックアップは画面の絵であり、アプリではない）
- ページ付随のCSS・画像は相対importで置ける。CSSに書くのは擬似要素・子孫セレクタ・属性状態などProperty Class / Propsで表せない宣言だけ（判断は`lism-css-guide`の`property-class.md`）。`c--*`のCSSは`@layer lism-component`内に置く

### mockup.config.json（必須）

```json
{
  "schemaVersion": 2,
  "title": "Acme Console Mockup",
  "imports": ["lucide-react"],
  "pages": {
    "landing": { "label": "Landing", "category": "Marketing", "order": 10 }
  }
}
```

- `schemaVersion`は必須で`2`
- `title`は任意。`imports`は追加でimportを許可するパッケージ（後述）。`pages`は表示メタデータ（`label` / `category` / `order`）の上書きのみで、並び順の既定はページIDの辞書順
- **`components`は予約ページID**（後述）。ビューアが「UI Parts」という名前でサイドバーの「Viewer」グループに固定表示するため、ここにエントリを書く必要はない（`label` / `category` / `order`はいずれも無視される）
- **実在しないページIDの参照はエラー**（消し忘れ・タイポのシグナル）。未知のトップレベルキーもエラー

### tokens.json（任意）

lism.config互換の`tokens`オブジェクト（`lism.config.js`の`tokens`に書く形と同じ）:

```json
{
  "color": { "brand": "#2f6f5e", "success": "oklch(62% 0.14 152)" },
  "space": { "60": "calc(var(--s-unit) * 12)" }
}
```

- トップレベルはLism CSSに実在するトークングループ（`color` / `space` / `fz` / `bdrs` / `bxsh`など）のみ
- **新キーを追加できるのは`color`だけ。** 他のグループは既存キーの値上書きのみ
- 違反は警告にならない。`check`と`dev`の起動時は非0終了し、`dev`起動後の監視中に違反へ変わった場合はサーバー継続のままターミナルとブラウザへエラーが表示される
- どのトークンを使う・上書きするかの判断は`lism-css-guide`の`tokens.md`に従う

**colorの新キーにはProperty Classが生成されない。** 例えば`canvas`を追加しても`-bgc:canvas`というクラスは存在しない（書いてもCSSが無い）。新キーの色は次のどちらかで使う:

```jsx
<Group bgc="canvas">…</Group>   {/* props経由 → var(--canvas)に変換される */}
```

```css
.c--saveStatus::before { background-color: var(--success); }  /* CSS内はvar()直書き */
```

### tokens.dark.json（任意）

ダーク時の値だけを書くファイル。形式は`tokens.json`と同じで、**ファイルの有無＝ダーク対応の有無**（`init`では生成されないので、必要になったら自分で作る）。

- 書けるのは**ライト側がCSS変数として実際に持っているトークンの上書きだけ**。基準はマージ後のライト（Lismデフォルト＋`tokens.json`が追加したキー）なので、`tokens.json`に書いていない`color.base` / `color.text`もダークだけで指定できる
- **新キーの追加は不可**（`color`の例外はダークには適用されない）。ライト側が実値を持たないキー（`lh.*` / `bdrs.inner` / `flow.s` / `palette.keycolor`など）もエラー。ただし`tokens.json`で実値を与えていれば上書きできる
- グループの制限は無い（`color` / `palette` / `space` / `fz` / `bxsh` / `vars`など全て）。違反は`tokens.json`と同じくエラー
- 値は`.set--dark`クラスの中に出力される（`:root.set--dark`ではない）。**ページ全体でも一部でも、`className="set--dark"`を付けた箱の中だけダークになる**
- `@media (prefers-color-scheme: dark)`は出力されない。OS設定への追従やモード切替UIが要る場合はページ側で用意する
- `vars`（`--L`等）を上書きすると、それを参照しているライト側トークン（`palette.*` / `space.*` / `fz.*`など）も同じ`.set--dark`ブロックへ自動で再宣言される（`var()`は宣言した要素で解決されるため）

### import規則

bare importは許可リストのパッケージのみ。次の標準パッケージは設定不要で常に使え、CLI側のnode_modulesで解決される（ユーザープロジェクトへ依存を追加する必要はない）。

| パッケージ | 例 |
| --- | --- |
| `react` / `react-dom` | `import { useState } from 'react'` |
| `lism-css` | `import { Stack, Group } from 'lism-css/react'` |
| `@lism-css/ui` | `import { Button } from '@lism-css/ui/react/Button'` |

それ以外のパッケージは`mockup.config.json`の`imports`に**パッケージ名だけ**を書いて許可する（`"lucide-react"`は可、`"lucide-react/icons"`は不可）。

- 宣言したパッケージは、データディレクトリを含むプロジェクト側にインストールする。未インストールならbundle前に停止する
- `lucide-react`はCLI同梱のためインストール不要。ただし`imports`への記載は必要（`init`が生成する設定には最初から入っている）
- 標準パッケージを`imports`に書くとエラーになる（常時許可されているため）
- `dev`は起動時に一度だけ許可リストを作る。`imports`を編集したら`dev`を再起動する
- **`@lism-css/ui`にルートexportは無い。** 必ず`@lism-css/ui/react/<Component>`から個別importする
- 許可リスト内でも、パッケージが実際にexportしているパスのみ許可（存在しないサブパスは拒否される）
- 相対importはデータディレクトリ内で完結させ、対象は`.jsx` / `.tsx` / `.css` / 画像（`.png` / `.jpg` / `.jpeg` / `.gif` / `.svg` / `.webp`）のみ
- 絶対パス・`/@fs/`パス・`../`によるデータディレクトリ外への脱出・許可外のbare importは契約違反としてエラーになる

## checkの保証範囲

`check`は`dev`と同じ発見・検証・import規則を通るため、両者の結果は食い違わない。保証するのは次の3点。

1. `mockup.config.json` / `tokens.json` / `tokens.dark.json`のスキーマ（`schemaVersion`含む）
2. import境界（上記の規則）
3. 全ページのbundle成功（構文エラー・未解決import・変換エラーを対象ファイルと原因つきで報告）

**renderは実行しない。** 次はcheckでは検出できず、`dev`での人間のブラウザ確認に委ねる:

- default exportがReactコンポーネントでない
- 初回render中の例外・ブラウザAPI依存のエラー
- 画面の見た目が意図通りか

「check成功」は「モックアップが整形式でビルドできる」であり「画面が正しい」ではない。逆に、**checkが失敗しているモックアップを完成と報告することは禁止。**

## モックアップ特有の注意

- **Astroプロジェクト向けのモックアップでもReact（`.jsx` / `.tsx`）で書く。** モックアップの目的は「デザインと、それを実装するクラス・コンポーネントが把握できること」であり、import文を実プロジェクトと厳密に揃える必要はない
- **ビューアにカラーモードの切替UIは無い。** ダーク確認は`tokens.dark.json`＋`className="set--dark"`で行い、切替UIが要る場合はモックのページ側に作る。色をトークンで書いていればそのまま両モードを確認できる（直書き色を避けるのは`lism-css-guide`の通常ルール通り）
- **ビューアの既定表示はギャラリー。** 予約ID`components`を除く各ページがiframeカードでカテゴリごとに並び、カードをクリックするとそのページの単体表示になる。サイドバーは「Viewer」グループ（Design tokens → UI Parts → All pages）から始まり、その下にカテゴリ別のページが並ぶ。「All pages」でギャラリーへ戻れる。「Design tokens」は`tokens.json`とLismデフォルトをマージしたトークン一覧をビューアが自動生成する。`tokens.dark.json`がある場合は、ダークで値が変わるグループの直後に`color (dark)`のようなセクションが増え、`.set--dark`スコープの中で描画される。サイドバーのページ名は、ギャラリー表示中でも常に単体表示で開く
- **モック内で定義した共通部品の一覧は自動生成できない。** そのため`init`のひな形には`pages/components.jsx`（ボタン・フォーム部品・バッジ・カードなど、そのモックで使う部品を並べたページ）が含まれる。共通部品を追加したらこのページの一覧にも載せる。`components`は予約IDで、ビューアはこれを「UI Parts」という固定の名前で「Viewer」グループに表示し、カテゴリ別の一覧とギャラリーからは除外する。一覧が不要ならファイルごと削除してよい（別の名前にすると普通の画面として扱われる）
- ページはただのJSX（任意コード実行）でサンドボックスは無い。信頼できるモックアップだけを実行する

## このスキルファイル自身のアップデート方法

ユーザーがスキル更新を依頼した場合は、`lism-cli skill add`または`lism-cli skill update`を案内してください。最新を確認したい場合は、GitHubリポジトリの`skills/lism-mockup-guide`を確認してください。
