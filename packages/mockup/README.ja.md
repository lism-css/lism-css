# @lism-css/mockup

[English](./README.md) | [日本語](./README.ja.md)

[Lism CSS](https://lism-css.com)で画面モックアップを作成・検証・プレビューするためのCLIです。

モックアップは**データファイル**として組み立てます。用意するのは1画面につき1つのコンポーネントファイルと、小さな設定ファイル、そして任意のトークン上書きファイルだけです。プレビューアプリ（**ビューア**）はこのパッケージに同梱されているため、モックアップのディレクトリにバンドラーも`package.json`も依存関係も必要ありません。

[Zenn CLI](https://zenn.dev/zenn/articles/zenn-cli-guide)が記事に対して行っているのと同じ分担です。アプリはCLI側が持ち、利用者はコンテンツだけを持ちます。

## 動作要件

Node.js `^20.19.0 || >=22.12.0`

## 使い方

インストール不要で実行できます。

```bash
npx @lism-css/mockup init ./mockup    # データディレクトリのひな形を生成
npx @lism-css/mockup check ./mockup   # 検証する（非対話）
npx @lism-css/mockup dev ./mockup     # プレビューサーバーを起動
```

ローカルにインストールした場合は、bin名`lism-mockup`で実行できます。

```bash
pnpm add -D @lism-css/mockup
npx lism-mockup dev ./mockup
```

| コマンド | 動作 |
| --- | --- |
| `lism-mockup init [dir]` | サンプルページ・`tokens.json`・`mockup.config.json`・契約説明書を`dir`へ生成します。既存ファイルと衝突する場合、`--force`を付けない限り何も書き換えません。 |
| `lism-mockup dev [dir]` | 画面をブラウザで閲覧するためのプレビュー用devサーバーを起動します。終了しない常駐プロセスで、人間が確認するためのものです。 |
| `lism-mockup check [dir]` | ディレクトリを検証し、違反があれば非0で終了します。エージェントやCIが使うためのものです。 |

`[dir]`を省略するとカレントディレクトリが対象になります。

### AIエージェント向け

1. まず`lism-mockup init <dir>`を実行し、生成された`README.md`を読んでください。
2. マークアップの書き方自体は[`lism-css-guide`](https://github.com/lism-css/lism-css/tree/main/skills)スキル（`npx lism-cli skill add`で導入）に従ってください。このパッケージが定めるのは**どんなファイルを置けるか**で、**Lism CSSをどう書くか**はスキル側が定めます。
3. 自分の作業は`lism-mockup check`で検証してください。**`check`が失敗している間は、モックアップを完成と報告しないでください。**
4. `lism-mockup dev`は終了しません。バックグラウンドで起動するか、ユーザーに起動してもらってください。ブラウザでの確認はユーザーの役割です（[`check`が保証する範囲](#checkが保証する範囲)を参照）。

## データ契約

データディレクトリの構成は次の通りです。

```
mockup/
├── mockup.config.json      # 必須
├── tokens.json             # 任意
└── pages/                  # 必須（最低1ページ）
    ├── landing.jsx
    └── admin/
        ├── dashboard.jsx
        ├── settings.jsx
        └── settings.css
```

### `pages/`

`pages/`配下の`.jsx` / `.tsx`ファイルが、それぞれ1画面になります。

- ファイルは**propsを取らないReactコンポーネント**を`export default`してください。
- **ページID** = `pages/`からの相対パスから拡張子を除いたものです（`pages/admin/dashboard.jsx`なら`admin/dashboard`）。サブディレクトリも使えます。このIDが`mockup.config.json`とビューアのURLの参照先になるため、共有したリンクが画面の発見順に左右されることはありません。
- 画面はファイルシステムから自動的に発見されます。ファイルを置くだけでよく、登録作業はありません（だからこそconfigの記述が実態とずれることがありません）。
- 同じIDになるファイルが2つある場合（`foo.jsx`と`foo.tsx`）はID衝突となり、`dev`と`check`が停止します。
- `.jsx` / `.tsx`以外のファイル（例えば同じ場所に置いた`.css`）は画面ではありません。ページ側からimportして使ってください。
- `.tsx`も使えますが、**型は削除されるだけでチェックされません**。型安全性が必要な場合は自分で`tsc`を実行してください。

ページを書く時の決まりは次の通りです。

- `useState`やイベントハンドラは書いて構いません。
- API通信・認証・永続化・業務ロジックは対象外です。
- ページはただのJSXであり、通常のコード実行と変わりません。サンドボックスはないため、**信頼できるモックアップだけを実行してください**。

### `mockup.config.json`

必須です。スキーマバージョンと表示用メタデータだけを持ちます。

```json
{
  "schemaVersion": 1,
  "title": "Acme Console Mockup",
  "pages": {
    "landing": { "label": "Landing", "category": "Marketing", "order": 10 },
    "admin/dashboard": { "label": "Dashboard", "category": "Admin", "order": 20 }
  }
}
```

| キー | 必須 | 説明 |
| --- | --- | --- |
| `schemaVersion` | はい | `1`である必要があります。他のどの処理よりも先に検証されます。 |
| `title` | いいえ | ビューアに表示されます。 |
| `pages` | いいえ | ページIDごとの`label` / `category` / `order`。 |

- 既定の並び順は`order`の昇順、次にページIDの辞書順です。既定のラベルはページIDです。
- 実在しないページIDを指す`pages`エントリは、警告ではなく契約違反です。自動発見が正本である以上、残っているエントリはタイポか消し忘れを意味します。
- 未知のトップレベルキーは拒否されます。将来の項目追加は必ず`schemaVersion`の更新を伴います。

### `tokens.json`

任意です。lism.config互換の`tokens`オブジェクト、つまり`lism.config.js`の`tokens`に書くものと同じ形式です。

```json
{
  "color": {
    "brand": "#2f6f5e",
    "accent": "#e0653f",
    "success": "oklch(62% 0.14 152)",
    "canvas": "oklch(98% 0.012 152)"
  },
  "space": {
    "60": "calc(var(--s-unit) * 12)"
  }
}
```

ルール：

| ルール | 詳細 |
| --- | --- |
| 既知のグループのみ | トップレベルのキーは、Lism CSSが定義するトークングループ（`color`・`space`・`fz`・`bdrs`・`bxsh`・`lts`など）である必要があります。 |
| 新規キーを追加できるのは`color`のみ | `color`にはプロジェクト固有の意味を持つ色を追加できます。他のグループは既存キーの値の上書きだけを受け付けます。 |
| 値 | `string`または`number`（`calc()`や`var()`を含む、有効なCSS値）。 |
| 違反はエラー | `dev`と`check`のどちらも非0で終了します。トークンの問題が警告へ格下げされることはありません。そうでなければ`check`の成功が意味を持たなくなるためです。 |

**制約 — 新しいcolorキーにはProperty Classが生成されません。** `-bgc:brand`のようなProperty Classは組み込みのトークンセットから生成されるため、自分で追加したキー（例えば`success`）はCSS変数を持ちますがクラスは持ちません。コンポーネントのpropsか、変数を直接使ってください。

```jsx
<Group bgc="canvas">…</Group>     {/* → class="-bgc" style="--bgc: var(--canvas)" */}
<Icon as={Check} c="success" />
```

```css
.c--saveStatus::before { background-color: var(--success); }
```

`className="-bgc:canvas"`と書いても、対応するCSSが存在しないクラスになるだけです。

### import

ページからimportできるのは、固定の許可リストにあるものだけです。bare specifierは各パッケージの実際の`exports`マップと照合されるため、パッケージが公開していないパスは、バンドラーで失敗する前の段階で拒否されます。

| パッケージ | 備考 |
| --- | --- |
| `react`・`react-dom` | `react/jsx-runtime`を含みます。 |
| `lism-css` | `lism-css/react`、`lism-css/lib/*`など。 |
| `@lism-css/ui` | ルートexportはありません。`@lism-css/ui/react/<Component>`を使ってください。 |
| `lucide-react` | アイコン。 |

これらは`@lism-css/mockup`が持つコピーへ解決されます。そのためデータディレクトリが独自の`node_modules`を持つ必要はなく、親ディレクトリに置かれた`react`がこれらを覆い隠すこともありません。

相対importは**データディレクトリ内で解決される**必要があり、対象は次のいずれかです。

`.jsx` `.tsx` `.css` `.png` `.jpg` `.jpeg` `.gif` `.svg` `.webp`

それ以外は契約違反として明示的に拒否されます。絶対パス、`/@fs/`パス、`../`によるデータディレクトリ外への脱出、許可リスト外のbare importが該当します。クエリ（`?raw`・`?url`）が付く場合は、クエリより前のパスが検査されます。

## `check`が保証する範囲

`check`は`dev`と同じ発見・検証・importのルールを通るため、両者の結果が食い違うことはありません。検証するのは次の3つです。

1. `mockup.config.json`と`tokens.json`のスキーマ（`schemaVersion`を含む）
2. 上で説明したimport境界
3. 全ページがbundleできること（構文エラー・未解決のimport・変換エラーを、対象ファイルと理由つきで報告します）

**renderは一切行いません。** 次は`check`の対象外です。

- default exportがReactコンポーネントでない
- 初回render中に投げられる例外
- ブラウザAPIに依存するもの、および画面が実際にどう見えるか

これらの確認には`dev`と、ブラウザを見る人間が必要です。`check`は「このモックアップは整形式でビルドできる」を意味するものであり、「このモックアップが正しい」を意味するものではありません。

## devサーバー

`lism-mockup dev`は、localhostにバインドしたVite devサーバーを起動し、同梱のビューアを配信します。公開するのはデータディレクトリ・ビューア・このパッケージ自身の`node_modules`だけです。ページ・`mockup.config.json`・`tokens.json`が変更されるとリロードします。

終了しないプロセスであるため、エージェントはバックグラウンドで起動するかユーザーにコマンドを渡し、自身の検証には`check`を使ってください。

## License

MIT
