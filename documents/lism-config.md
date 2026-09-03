# lism.config.js メモ

`lism.config.js`は、Lism CSSのユーザー設定をまとめるプロジェクトルートの設定ファイル。
CSS出力、React/Astroコンポーネントの実行時設定、`lism-cli ui`系CLI設定を同じファイルに同居できる。
この文書で言う`full.css`は、既定では一部のpropにしか無いブレークポイント対応をほぼ全propへ広げた全部入りビルド（`config/presets/props-full.ts`のfull preset）。`main.css`は既定のprops設定で出力したもの。


## できること

主なトップレベルキー:

| キー | 役割 |
| --- | --- |
| `props` | `p`/`ta`/`filter`など、Lism propsが出力するクラス・CSSプロパティ・utility値を追加/上書きする |
| `tokens` | `space`/`lts`/`color`など、トークンを`{ key: value }`の値マップで定義/上書きする。CSS変数の値出力・ユーティリティ生成・props受理を1か所でまかなう |
| `traits` | `isHoge`→`is--hoge`のような真偽値class propを追加する |
| `breakpoints` | `xs`/`xl`などの有効化や、BPサイズを上書きする |
| `isFullMode` | コンポーネント側のprops設定も`full.css`寄りにする |
| `defaultImportant` | Property Classにデフォルトで`!important`を付与する（Sassの`$default_important`相当のビルド時設定） |
| `ui` | `lism-cli ui add`などの出力先設定。旧`cli`キーも互換読込される（deprecation警告あり） |

```js
// lism.config.js
import DEFAULT_CONFIG from 'lism-css/default-config';

const { props } = DEFAULT_CONFIG;

export default {
  breakpoints: {
    xs: '360px',
    xl: '1440px',
  },

  props: {
    // 既存propへutilityを追加
    p: { utils: { box: '2em' } },

    // 配列はマージではなく置き換えなので、既存値を残すならspreadする
    ta: { presets: [...props.ta.presets, 'justify'] },

    // 新規propを追加
    filter: {
      prop: 'filter',
      utils: { blur: 'blur(3px)' },
      bp: ['md', 'lg'],
    },
  },

  // トークンは { key: value } の値マップで定義する。
  // :root への値出力 + ユーティリティ生成 + props 受理を1か所でまかなう。
  tokens: {
    lts: { '2xl': '.5em' }, // → :root { --lts--2xl: .5em } + .-lts:2xl
    space: { '90': '6rem' }, // → --s90
    color: { success: 'oklch(0.6 0.15 150)' }, // → --success
  },

  traits: {
    isHoge: 'is--hoge',
  },

  ui: {
    framework: 'react',
    dir: 'src/components/ui', // helper は常に {dir}/_helper に配置される
  },
};
```

`.ts`/`.mjs`/`.js`が対象（`lism.config.ts`→`lism.config.mjs`→`lism.config.js`の順で探索し、最初に見つかったものを読む）。

### 型サポート（`lism-css/config-types`）

設定ファイルの執筆時に型チェック・補完を効かせるには、`lism-css/config-types`の`LismConfig`型を使う。
`.ts`は`satisfies LismConfig`、`.js`はJSDoc`@type`を付ける。ジェネリクスの`defineConfig`ヘルパーは提供しない（`satisfies`が literal 保持・typo検出・エラーメッセージすべてで優れるため）。

```ts
// lism.config.ts
import type { LismConfig } from 'lism-css/config-types';
export default { /* ... */ } satisfies LismConfig;
```

```js
// lism.config.js
/** @type {import('lism-css/config-types').LismConfig} */
export default { /* ... */ };
```

- `LismConfig`/`PropConfig`/`BreakpointKey`を公開。`config/types.ts`が実体で、副作用のある`config/index.ts`には依存しない。
- ビルド時生成物の`lism-env.d.ts`（コンポーネント側のprop/trait解禁）とは別レイヤー。
- `PropConfig`は`@lism-css/plugin`のSCSS直列化（`serialize.ts`）でも同じ型をre-exportして共有する（型の二重管理を解消）。


## プラグインは必要か

結論:

- `props`/`tokens`/`traits`の上書きをReact/Astroコンポーネント側に効かせたいなら必要。
- Vite/AstroのCSS importで、`lism.config.js`反映済みCSSをその場で出したい場合も必要。
- `lism-css build`などでCSSを事前生成するだけなら、Vite/Astroプラグイン登録は不要。ただしコマンド提供元として`@lism-css/plugin`は必要。

理由は、コンポーネント側の設定読込が`lism-css/config.js`をimportする構造になっていて、ユーザープロジェクトの`lism.config.js`へ差し替えるにはaliasプラグインが必要なため。
また、通常の`import 'lism-css/main.css'`だけではパッケージ同梱のCSSを読むので、Vite/Astro中でconfig反映済みCSSへ差し替える場合も動的CSSビルドプラグインが必要になる。

推奨入口:

```js
// vite.config.js
import { defineConfig } from 'vite';
import { lismCss } from '@lism-css/plugin/vite';

export default defineConfig({
  plugins: [...lismCss()],
});
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { lismCss } from '@lism-css/plugin/astro';

export default defineConfig({
  integrations: [...lismCss()],
});
```

purgeを使わない場合は各エントリの`lismCss()`を引数なしで使えばよい。`purge:true`は未使用Lismクラスの削除まで行いたいときだけ指定する。

```js
lismCss(); // config反映、型生成、動的CSSビルド
lismCss({ purge: true }); // 上記 + purge
```

`purge`にはオブジェクトも渡せる（`purge: { safelist, known, report }`。`packages/plugin/src/purge/options.ts`の`LismPurgeOptions`）。purgeが使用中と判定できないクラス（実行時に組み立てる動的クラス等）は削除されるので、`safelist`（文字列・正規表現・判定関数の配列）に載せて残す。`known`は「削除してよいLismセレクタのカタログ」で、未指定ならconfig反映済みの`full.css`から生成したものを使う。purgeだけを単体で使う入口として`@lism-css/plugin/purge/vite`の`lismPurge()`と`@lism-css/plugin/purge/astro`の`lismPurgeAstro()`もある。


## `lism-css build`

`lism-css build`は`packages/plugin`（`@lism-css/plugin`）が提供するbinコマンド。
`packages/plugin/package.json`の`bin`で`lism-css`→`./bin/cli.mjs`に紐づいている。

```bash
npx lism-css build
pnpm exec lism-css build
```

このコマンドはプロジェクトルートの設定ファイルを探索順（`.ts`→`.mjs`→`.js`）で直接読み、config反映済みCSSを生成する。
そのため、CSSを事前生成するだけならVite/Astroプラグインは不要。
`--full`を付けると`full.css`/`full_no_layer.css`も生成対象になる。

出力先はインストール済み`lism-css`パッケージの`dist/css`（`node_modules/lism-css/dist/css`。`builder/paths.ts`の`cssDistDir`）で、同梱のCSSを直接上書きする。出力先を変えるオプションは無い。

- 上書きするので、プラグイン無しの`import 'lism-css/main.css'`でも生成後のCSSが読まれる。これが狙い。
- `node_modules`を入れ直すと生成物は消える。インストール後に毎回`lism-css build`を実行する運用にする。
- 処理フロー5の「`node_modules`内は書き換えない」はSCSSソースの話で、CSSの出力先には当てはまらない。


## 他バンドラ / SCSS-source 構成

Vite/Astro以外のビルド構成向けの入口も`@lism-css/plugin`が提供する。

- `@lism-css/plugin/webpack`の`withLismWebpack(config, opts)`: webpack主導バンドラ（`@wordpress/scripts`等）向けの汎用プリミティブ。`{ css, config, typegen, watch }`で挙動を切り替える（`css:false`でCSS事前生成・CSS aliasをno-op、`config:true`で`lism-css/config.js`をユーザー設定へalias、`watch:true`で`lism.config.js`を`fileDependencies`へ登録）。WP/テーマ固有ロジックは持たず消費側の責務とする。
- `@lism-css/plugin/next`の`withLism(nextConfig, opts)`: Next.js（16以降）向けの統合エントリ。Next.jsにはVite/Astroのようなbare CSS importをオンザフライで横取りする口が無いため、config反映済みCSSを`<projectRoot>/.lism-css/css/*`へ事前生成し、`lism-css/<entry>.css`をその生成物へaliasで差し替える方式を取る。Turbopackが主経路（`turbopack.resolveAlias`にproject-relativeパスで注入）、`next dev --webpack`/`next build --webpack`のfallback用にwebpack `resolve.alias`へも絶対パスで同等aliasを注入する。`lism-css/config.js`のユーザー設定alias、`lism-env.d.ts`生成（`opts.typegen`、既定true）も併せて行う。返り値は`(phase, ctx) => config`の非同期config関数で、`next.config`の default exportへ`export default withLism(nextConfig, opts)`のように渡す。devフェーズでは`lism.config.js`の変更を`fs.watch`ベースで監視し、変更時にCSS/型を再生成する。
- `@lism-css/plugin/builder`の`generateLismScss({ projectRoot, outDir? })`: 自前SCSSビルド構成向けに、config適用済みsettingのbridgeを`_lism-config.gen.scss`・`lism-setting.scss`（既定outDir=`<projectRoot>/.lism-css/scss`）へ生成する。消費側は`loadPaths:['.lism-css/scss']`+`NodePackageImporter`で、`@use 'lism-setting'`→`@use 'pkg:lism-css/scss/main_no_layer'`の順に読む（settingをconfig付きで先にロードする必要があるため順序依存）。


## 処理フロー

1. Vite/Astro起動時に、プロジェクトルートから`lism.config.ts`→`lism.config.mjs`→`lism.config.js`の順で探す。
   `configPath`指定時はそのファイルだけを見る。
2. `lism-css/config.js`をユーザーの`lism.config.js`へaliasする。
   これでReact/Astroコンポーネント側の`CONFIG`もユーザー設定を読む。
3. CSSビルド側も同じ設定を読む。
   マージ順は`defaultConfig`→`lism.config.js`。`full.css`用は`defaultConfig`→`full preset`→`lism.config.js`。
4. `isFullMode:true`の場合、`main.css`系で使う設定もfull preset適用済みに寄せる。
5. `import 'lism-css/main.css'`などのCSS importをViteプラグインが捕捉し、設定反映済みCSSをその場でコンパイルして返す。
   `node_modules`内は書き換えず、一時ディレクトリへSCSSを複製して生成SCSS（`_prop-config.gen.scss`/`_tokens.gen.scss`）だけ差し替える。
6. `breakpoints`の追加BP、`props`/`traits`の追加キー、`isFullMode`、既定propが参照するtokensへの追加キーのいずれかがあれば、`lism-env.d.ts`を自動生成して型側にも反映する（`generateLismEnvDts`）。
   反映対象はbreakpoints・追加props・追加traits・isFullMode・既定propの値リテラルの5種類。最後の1つは、`tokens.space`にキーを足すと`p`など`space`を参照するpropの値の型にそのキーが加わる、という形で効く。`tokens`だけ変えても`.d.ts`が生成・更新されるのはこのため。
7. `purge:true`時は、設定反映済みの`full.css`からknown selectorを作る。
   configで追加したクラスもpurge対象として扱える。


## 注意点

- `props`や`tokens`内のオブジェクトはdeep mergeされる。`tokens`の各トークンは`{ key: value }`の値マップなので、既存キーを残したまま個別キーを追加/上書きできる。
  既定キーを丸ごと別オブジェクトへ差し替えたい場合のみ`lism-css/default-config`をimportしてspreadする（例: `tokens: { lts: { ...tokens.lts, '2xl': '.5em' } }`）。
- `tokens`は単一の情報源。`tokens: { lts: { '2xl': '.5em' } }`と書くだけで、
  `:root { --lts--2xl: .5em }`の出力・ユーティリティ生成（`-lts:2xl`）・ランタイムTOKENS登録（props受理）がまとめて反映される（既定値の上書きも可能）。
  変数名はトークン形式に従う（既定→`--{token}--{key}` / `space`→`--s{key}` / `color`・`palette`→`--{key}` / `vars`→キーそのまま）。
- `tokens.vars`は`--L`/`--C`/`--fz-mol`/`--hl-unit`/`--s-unit`の構造変数。他トークンの計算式から参照される出力専用グループで、propsからは参照されない（ユーティリティ生成・prop受理・型導出の対象外）。既存キーの値を上書きする用途に限り、新規キーの追加は想定していない（`:root`には出るが、どこからも参照されない）。
- `space`と`bxsh`の変数は`:root`単独ではなく`:root, .set--s`／`:root, .set--bxsh`のセレクタで宣言される（`config/defaults/token-scope.ts`の`TOKEN_SCOPE`）。`.set--s`で余白単位をem化する、`.set--bxsh`で影色を差し替える等、クラスで構造変数を上書きしたときに派生値を再計算させるため。出力CSSに`:root`以外のセレクタが並ぶのは正常。
- 値に`'-'`を指定したキーはカタログ登録のみで`:root`宣言を出力しない（`palette.keycolor`のようにCSS変数を持たないもの、`bdrs.inner`や`flow.s`のように実値を手書きSCSS側へ置くもの）。`'-'`以外の値を与えれば、その値が`:root`へ出力される。
- `traits`はclass出力の追加であり、対応するスタイルは別途必要。
- `isFullMode:true`は`full.css`相当のスタイルが読み込まれる前提。デフォルトCSSだけだと、出力classに対応するCSSが不足する可能性がある。
- `defaultImportant:true`はCSS生成時にSassの`$default_important`へ反映されるビルド時設定。CSSを再生成しないと反映されず、ランタイム注入（`window._LISM_CSS_CONFIG_`）では切り替えられない。素のSass利用で`@use 'lism-css/scss/setting' with ($default_important: ...)`と明示指定した場合は、そちらが`lism.config.js`の値より優先される。`main_no_layer`/`full_no_layer`は`$layer_mode: 0`から常に`!important`を付与する（`_mixin.scss`の`resolve_important`）ため、この設定も`props`の個別`important`も`@layer`ありビルドにだけ効く。
- 統合入口は`@lism-css/plugin/vite`/`@lism-css/plugin/astro`の`lismCss()`。
