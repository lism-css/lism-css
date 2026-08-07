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
├── tokens.dark.json        # 任意（ダーク時の値）
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
- `.tsx`も使えますが、**型は削除されるだけでチェックされません**。型安全性が必要な場合は自分で`tsc`を実行してください（[型チェック](#型チェック)を参照）。

ページを書く時の決まりは次の通りです。

- `useState`やイベントハンドラは書いて構いません。
- API通信・認証・永続化・業務ロジックは対象外です。
- ページはただのJSXであり、通常のコード実行と変わりません。サンドボックスはないため、**信頼できるモックアップだけを実行してください**。

### `mockup.config.json`

必須です。スキーマバージョン・追加importの宣言・表示用メタデータだけを持ちます。

```json
{
  "schemaVersion": 2,
  "title": "Lism Mockup",
  "imports": ["lucide-react"],
  "pages": {
    "landing": { "label": "Landing", "category": "Marketing", "order": 10 },
    "admin/dashboard": { "label": "Dashboard", "category": "Admin", "order": 20 }
  }
}
```

| キー | 必須 | 説明 |
| --- | --- | --- |
| `schemaVersion` | はい | `2`である必要があります。他のどの処理よりも先に検証されます。 |
| `title` | いいえ | ビューアに表示されます。 |
| `imports` | いいえ | ページが追加でimportできるパッケージ。[import](#import)を参照。 |
| `pages` | いいえ | ページIDごとの`label` / `category` / `order`。 |

- 既定の並び順は`order`の昇順、次にページIDの辞書順です。既定のラベルはページIDです。
- `components`は**予約ページID**です。ビューアが自身の画面と並べて「UI Parts」という名前で固定表示し、ギャラリーには出しません。ここにエントリを書く必要はなく、`label` / `category` / `order`のいずれを書いても無視されます。
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

### `tokens.dark.json`

任意です。ダークモード時の値だけを書きます。形式は`tokens.json`と同じlism.config互換の`tokens`オブジェクトで、**このファイルの有無がダーク対応の有無**です。置かなければダーク用のCSSは一切出力されません。

```json
{
  "color": {
    "base": "oklch(24% 0.015 152)",
    "text": "oklch(92% 0.01 152)",
    "canvas": "oklch(20% 0.015 152)"
  }
}
```

ここに書いた値は`.set--dark`というクラスの中で宣言されます。`:root.set--dark`ではないため、ページ全体・ページの一部・任意の箱のどこにでも`className="set--dark"`を付けるだけで、その中だけダークの値が効きます。

```jsx
<Group className="set--dark" bgc="base" c="text">…</Group>
```

`@media (prefers-color-scheme: dark)`は出力しません。OSの設定に追従させたい場合は、モックアップ側のCSSで`.set--dark`を当てる条件を自分で書いてください。ビューアはカラーモードの切り替えUIを持たないため、切り替えて見せたい場合もページ側で用意します。

ルール：

| ルール | 詳細 |
| --- | --- |
| 上書きできるのはライトが持つトークンのみ | 対象は**ライト側が実際にCSS変数として持っているトークン**だけです。判定の基準はマージ後のライト側、つまりLism CSSのデフォルトトークンと`tokens.json`が追加したキーの両方です。`tokens.json`に書いていない`color.base`や`color.text`も、ダークだけで指定できます。 |
| 新規キーは追加できない | `tokens.json`が`color`にだけ認めている新規キーの追加は、ダーク側には適用されません。ライトに存在しないキーはエラーです。 |
| CSS変数を持たないキーは対象外 | ライト側が実値を持たないキー（`lh.*`・`bdrs.inner`・`flow.s`・`palette.keycolor`など）は上書きできず、エラーになります。ただし`tokens.json`でそのキーに実値を与えていれば上書きできます。 |
| グループの制限はない | `color`・`palette`・`space`・`fz`・`bxsh`・`vars`など、ライト側と同じグループをすべて上書きできます。 |
| 違反はエラー | `tokens.json`と同じく、`dev`と`check`のどちらも非0で終了します。 |

**`vars`を上書きすると、それを参照しているトークンも一緒に再宣言されます。** 例えば`vars`の`--L`をダークで変えると、`--L`を参照して組み立てられているライト側のトークン（`palette.*`・`space.*`・`fz.*`・`hl.*`など）も、同じ`.set--dark`ブロックへ自動的に再宣言されます。CSSカスタムプロパティの`var()`は宣言した要素の計算値を作る時点で解決されるため、`.set--dark { --L: 70% }`と書くだけでは`:root`で確定済みの`--red: oklch(var(--L) …)`が変わらないからです。参照の連鎖も追いかけるので、多段の依存も漏れなく再宣言されます。

ビューアのトークン一覧（`?view=tokens`）には、ダークで値が変わるグループの**直後**に`color (dark)`のようなセクションが増えます（目次にも並びます）。そこに並ぶのは`.set--dark`ブロックが定義しているトークン、つまり明示的に指定したものと、依存で再宣言されたものです。セクションの中身は`.set--dark`スコープの箱の中で描画されるため、影やベース色に近いスワッチもダーク文脈のまま確認できます。なお、ダークセクションの行に`Custom` / `New`のバッジは出ません（定義上すべてライトからの差分であるためです）。

`lism-mockup init`のひな形にこのファイルは含まれません。ダーク対応が必要になった時点で自分で作成してください。

### import

ページからimportできるのは、許可リストにあるものだけです。bare specifierは各パッケージの実際の`exports`マップと照合されるため、パッケージが公開していないパスは、バンドラーで失敗する前の段階で拒否されます。

**標準パッケージ**は設定なしで使えます。

| パッケージ | 備考 |
| --- | --- |
| `react`・`react-dom` | `react/jsx-runtime`を含みます。 |
| `lism-css` | `lism-css/react`、`lism-css/lib/*`など。 |
| `@lism-css/ui` | ルートexportはありません。`@lism-css/ui/react/<Component>`を使ってください。 |

これらは`@lism-css/mockup`が持つコピーへ解決されます。そのためデータディレクトリが独自の`node_modules`を持つ必要はなく、親ディレクトリに置かれた`react`がこれらを覆い隠すこともありません。

**追加パッケージ**は`mockup.config.json`の`imports`で明示的に許可します。

```json
{ "schemaVersion": 2, "imports": ["lucide-react", "some-ui-library"] }
```

- 書けるのはパッケージ名だけです（`"lucide-react"`は可、`"lucide-react/icons"`は不可）。どのサブパスをimportできるかは、これまで通りパッケージ自身の`exports`マップで決まります。
- 対象パッケージは、データディレクトリを含むプロジェクトにインストールしてください。宣言だけしてインストールされていない場合、bundleを始める前に`dev`・`check`が停止します。
- `lucide-react`だけは例外で、インストールは不要です（`@lism-css/mockup`が提供しているため、`init`直後の状態がそのまま動きます）。ただし`imports`への記載は必要です。提供する内容は[CLIが提供する`lucide-react`](#cliが提供するlucide-react)を参照してください。
- 標準パッケージを`imports`に書くとエラーになります。常時許可されているためです。
- `dev`は起動時に一度だけ許可リストを作ります。`imports`を編集したら再起動してください。

相対importは**データディレクトリ内で解決される**必要があり、対象は次のいずれかです。

`.jsx` `.tsx` `.css` `.png` `.jpg` `.jpeg` `.gif` `.svg` `.webp`

それ以外は契約違反として明示的に拒否されます。絶対パス、`/@fs/`パス、`../`によるデータディレクトリ外への脱出、`node_modules`の中へ入る相対パス（パッケージは`imports`に宣言してパッケージ名でimportしてください）、許可リスト外のbare importが該当します。クエリ（`?raw`・`?url`）が付く場合は、クエリより前のパスが検査されます。

### CLIが提供する`lucide-react`

本物の`lucide-react`はアイコンのモジュール群で45MBあり、npx実行のたびにダウンロードされてしまいます。そこで`@lism-css/mockup`は、アイコンの実データだけを持つ[`@iconify-json/lucide`](https://www.npmjs.com/package/@iconify-json/lucide)（約570KB）からモジュールを組み立て、`lucide-react`をそこへ解決します。importの書き方は変わらず、使っていないアイコンがbundleから落ちる点も同じです。

そのモジュールがルートからexportするものは次の通りです。

| export | 提供 | 備考 |
| --- | --- | --- |
| アイコンコンポーネント | あり | 全アイコンを`Bell`と`BellIcon`の両方の書き方で提供します。lucide自身のエイリアス（`Sidebar`など）も含みます。 |
| `Icon` | あり | 渡された`iconNode`のデータを描画する汎用コンポーネントです。 |
| `createLucideIcon` | あり | `iconNode`のデータからアイコンコンポーネントを作ります。 |
| `icons` | **なし** | 全アイコンのレコードです。参照した時点で約1,800個すべてがbundleへ入り、このモジュールの目的そのものが無くなるため提供しません。必要なアイコンを名前でimportしてください。 |

サブパス（`lucide-react/icons/bell`・`lucide-react/dynamic`）も使えません。`icons`とサブパスはどちらも`check`が「何が無いのか」を示す契約エラーとして報告するため、気づかないまま進むことはありません。

描画結果はlucide-react 0.577.0と属性レベルで一致します（`lucide lucide-<name>`のclass名を含みます）。

## 型チェック

`check`はページの型検査を行いません。`.tsx`は型を削除して変換するだけで、検証はしません。自分で`tsc`を実行する場合は少し準備が必要です。データディレクトリは依存関係を持たず、ページがimportするパッケージはビルド時に`@lism-css/mockup`の中から供給されるため、そのままではコンパイラが見つけられないからです。

データディレクトリを含むプロジェクトへ、ページがimportするパッケージとコンパイラをインストールしてください。

```bash
pnpm add -D typescript @types/react lism-css @lism-css/ui @lism-css/mockup
```

`lucide-react`だけはこの方法が使えません。CLIが生成しているため、そのようなパッケージはディスク上に存在しないからです。代わりに`@lism-css/mockup`が型定義を同梱しているので、tsconfigからそのファイルを参照してください。

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "noEmit": true,
    "strict": true
  },
  "files": ["node_modules/@lism-css/mockup/types/lucide-react.d.ts"],
  "include": ["mockup/**/*"]
}
```

`include`ではなく`files`を使うのは、TypeScriptが既定で`node_modules`を`include`の対象から外すためです。

この型定義はモジュール本体と同じアイコンデータから生成しています。そのため宣言されている内容は、モックアップが実際にimportできるものと一致します（`icons`とサブパスは、`check`で落ちるのと同じ理由で型検査でも落ちます）。型のために本物の`lucide-react`をインストールすると、この一致が崩れます（モックアップでは使えないexportまで型上は通ってしまうため）。

## `check`が保証する範囲

`check`は`dev`と同じ発見・検証・importのルールを通るため、両者の結果が食い違うことはありません。検証するのは次の3つです。

1. `mockup.config.json`・`tokens.json`・`tokens.dark.json`のスキーマ（`schemaVersion`を含む）
2. 上で説明したimport境界
3. 全ページがbundleできること（構文エラー・未解決のimport・変換エラーを、対象ファイルと理由つきで報告します）

ダーク宣言がある場合は、出力に`dark tokens: N override(s)`の行が増えます。

**renderは一切行いません。** 次は`check`の対象外です。

- default exportがReactコンポーネントでない
- 初回render中に投げられる例外
- ブラウザAPIに依存するもの、および画面が実際にどう見えるか

これらの確認には`dev`と、ブラウザを見る人間が必要です。`check`は「このモックアップは整形式でビルドできる」を意味するものであり、「このモックアップが正しい」を意味するものではありません。

## devサーバー

`lism-mockup dev`は、localhostにバインドしたVite devサーバーを起動し、同梱のビューアを配信します。公開するのはデータディレクトリ・ビューア・このパッケージ自身の`node_modules`だけです。ページ・`mockup.config.json`・`tokens.json`・`tokens.dark.json`が変更されるとリロードします。

終了しないプロセスであるため、エージェントはバックグラウンドで起動するかユーザーにコマンドを渡し、自身の検証には`check`を使ってください。

## License

MIT
