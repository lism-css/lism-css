# lism.config.js メモ

`lism.config.js`は、Lism CSSのユーザー設定をまとめるプロジェクトルートの設定ファイル。
CSS出力、React/Astroコンポーネントの実行時設定、`lism ui`系CLI設定を同じファイルに同居できる。


## できること

主なトップレベルキー:

| キー | 役割 |
|------|------|
| `props` | `p`/`ta`/`filter`など、Lism propsが出力するクラス・CSSプロパティ・utility値を追加/上書きする |
| `tokens` | `space`/`lts`/`color`など、トークンを`{ key: value }`の値マップで定義/上書きする。CSS変数の値出力・ユーティリティ生成・props受理を1か所でまかなう |
| `traits` | `isHoge`→`is--hoge`のような真偽値class propを追加する |
| `breakpoints` | `xs`/`xl`などの有効化や、BPサイズを上書きする |
| `isFullMode` | コンポーネント側のprops設定も`full.css`寄りにする |
| `defaultImportant` | Property Classにデフォルトで`!important`を付与する（Sassの`$default_important`相当のビルド時設定） |
| `cli` | `lism ui add`などの出力先設定。旧`lism-ui.json`の後継 |

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

  cli: {
    framework: 'react',
    componentsDir: 'src/components/ui',
    helperDir: 'src/components/ui/_helper',
  },
};
```

`.js`/`.mjs`が対象。現状`lism.config.ts`は未対応。


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


## `lism-css build`

`lism-css build`は`packages/plugin`（`@lism-css/plugin`）が提供するbinコマンド。
`packages/plugin/package.json`の`bin`で`lism-css`→`./bin/cli.mjs`に紐づいている。

```bash
npx lism-css build
pnpm exec lism-css build
```

このコマンドはプロジェクトルートの`lism.config.js`を直接読み、config反映済みCSSを生成する。
そのため、CSSを事前生成するだけならVite/Astroプラグインは不要。
`--full`を付けると`full.css`/`full_no_layer.css`も生成対象になる。


## 他バンドラ / SCSS-source 構成

Vite/Astro以外のビルド構成向けの入口も`@lism-css/plugin`が提供する。

- `@lism-css/plugin/webpack`の`withLismWebpack(config, opts)`: webpack主導バンドラ（`@wordpress/scripts`等）向けの汎用プリミティブ。`{ css, config, typegen, watch }`で挙動を切り替える（`css:false`でCSS事前生成・CSS aliasをno-op、`config:true`で`lism-css/config.js`をユーザー設定へalias、`watch:true`で`lism.config.js`を`fileDependencies`へ登録）。WP/テーマ固有ロジックは持たず消費側の責務とする。
- `@lism-css/plugin/builder`の`generateLismScss({ projectRoot, outDir? })`: 自前SCSSビルド構成向けに、config適用済みsettingのbridgeを`_lism-config.gen.scss`・`lism-setting.scss`（既定outDir=`<projectRoot>/.lism-css/scss`）へ生成する。消費側は`loadPaths:['.lism-css/scss']`+`NodePackageImporter`で、`@use 'lism-setting'`→`@use 'pkg:lism-css/scss/main_no_layer'`の順に読む（settingをconfig付きで先にロードする必要があるため順序依存）。


## 処理フロー

1. Vite/Astro起動時に、プロジェクトルートから`lism.config.js`→`lism.config.mjs`の順で探す。
   `configPath`指定時はそのファイルだけを見る。
2. `lism-css/config.js`をユーザーの`lism.config.js`へaliasする。
   これでReact/Astroコンポーネント側の`CONFIG`もユーザー設定を読む。
3. CSSビルド側も同じ設定を読む。
   マージ順は`defaultConfig`→`lism.config.js`。`full.css`用は`defaultConfig`→`full preset`→`lism.config.js`。
4. `isFullMode:true`の場合、`main.css`系で使う設定もfull preset適用済みに寄せる。
5. `import 'lism-css/main.css'`などのCSS importをViteプラグインが捕捉し、設定反映済みCSSをその場でコンパイルして返す。
   `node_modules`内は書き換えず、一時ディレクトリへSCSSを複製して生成SCSS（`_prop-config.gen.scss`/`_tokens.gen.scss`）だけ差し替える。
6. `breakpoints`で`xs`/`xl`などが有効なら、`lism-env.d.ts`を自動生成して型側にも反映する。
   生成対象は主にbreakpointsで、props/tokens全体の型拡張までは追従しない。
7. `purge:true`時は、設定反映済みの`full.css`からknown selectorを作る。
   configで追加したクラスもpurge対象として扱える。


## 注意点

- `props`や`tokens`内のオブジェクトはdeep mergeされる。`tokens`の各トークンは`{ key: value }`の値マップなので、既存キーを残したまま個別キーを追加/上書きできる。
  既定キーを丸ごと別オブジェクトへ差し替えたい場合のみ`lism-css/default-config`をimportしてspreadする（例: `tokens: { lts: { ...tokens.lts, '2xl': '.5em' } }`）。
- `tokens`は単一の情報源。`tokens: { lts: { '2xl': '.5em' } }`と書くだけで、
  `:root { --lts--2xl: .5em }`の出力・ユーティリティ生成（`-lts:2xl`）・ランタイムTOKENS登録（props受理）がまとめて反映される（既定値の上書きも可能）。
  変数名はトークン形式に従う（既定→`--{token}--{key}` / `space`→`--s{key}` / `color`・`palette`→`--{key}`）。
- 値に`'-'`を指定したキーはカタログ登録のみで`:root`宣言を出力しない（実値は手書きSCSS側。主に`color`/`palette`で使う）。`'-'`以外の値を与えれば、その値が`:root`へ出力される。
- `traits`はclass出力の追加であり、対応するスタイルは別途必要。
- `isFullMode:true`は`full.css`相当のスタイルが読み込まれる前提。デフォルトCSSだけだと、出力classに対応するCSSが不足する可能性がある。
- `defaultImportant:true`はCSS生成時にSassの`$default_important`へ反映されるビルド時設定。CSSを再生成しないと反映されず、ランタイム注入（`window._LISM_CSS_CONFIG_`）では切り替えられない。素のSass利用で`@use 'lism-css/scss/setting' with ($default_important: ...)`と明示指定した場合は、そちらが`lism.config.js`の値より優先される。
- 統合入口は`@lism-css/plugin/vite`/`@lism-css/plugin/astro`の`lismCss()`。
