/**
 * props 設定を SCSS の `$props` マップ文字列へ直列化する純粋関数群。
 *
 * 旧 `bin/build-config.js` のロジックを移植し、ファイル書き出し（副作用）を分離した。
 * 返り値は生成 SCSS（`_prop-config.gen.scss` 等）として書き出され、`@use './prop-config.gen'` で読まれる SCSS 文字列。
 * パッケージ自身のビルドと Vite プラグイン（一時ディレクトリ複製）の双方がこの直列化結果を共有する。
 */
import getMaybeTokenValue from '../lib/getMaybeTokenValue';
import getTokenVarName from '../lib/getTokenVarName';
import { TOKEN_SCOPE } from '../../config/defaults/token-scope';

type TokenValue = string | number;
type Tokens = Record<string, unknown>;

export interface PropConfig {
  prop?: string;
  bp?: number | string[];
  isVar?: number;
  alwaysVar?: number;
  important?: number;
  utils?: Record<string, TokenValue>;
  presets?: TokenValue[];
  token?: string;
  tokenClass?: number;
  exUtility?: Record<string, Record<string, string>>;
}

export interface BuildConfig {
  tokens: Tokens;
  props: Record<string, PropConfig>;
  /**
   * ブレイクポイント定義。`'480px'` 等のサイズ文字列、または 0（無効）。
   * lism.config.js で差分上書きでき、xs/xl はサイズを与えるだけで有効化できる。
   */
  breakpoints?: Record<string, string | number>;
  /**
   * trait（is--* / has--*）定義。prop 名 → クラス名。CSS 出力（SCSS 直列化）には使わず、
   * 型生成で「追加 trait の広告」に参照する。
   */
  traits?: Record<string, string>;
}

/**
 * ユーティリティ値を生成する。
 */
function generateUtilities(propConfig: PropConfig, TOKENS: Tokens): Record<string, string> {
  const { utils = {}, presets: basePresets = [], token = '', tokenClass = 0 } = propConfig;

  // config 側の配列はマージ後も参照共有されているため、複製してから使う。
  // （直接 push すると、同一プロセスで複数回ビルドした時に presets が重複する）
  const presets = [...basePresets];
  const utilities: Record<string, string> = {};

  // token をクラス化するのであれば presets へ追加
  if (token && tokenClass === 1) {
    const tokenCatalog = TOKENS[token];
    if (Array.isArray(tokenCatalog)) {
      presets.push(...(tokenCatalog as TokenValue[]));
    } else if (tokenCatalog && typeof tokenCatalog === 'object') {
      // '-' センチネル（実値は手書き SCSS）もカタログ上は有効なので、キー一覧を presets 化する。
      presets.push(...Object.keys(tokenCatalog));
    }
  }

  if (presets.length > 0) {
    presets.forEach((preset) => {
      utilities[preset] = getMaybeTokenValue(token, preset, TOKENS as Parameters<typeof getMaybeTokenValue>[2]);
    });
  }

  if (utils) {
    Object.entries(utils).forEach(([key, value]) => {
      utilities[key] = String(value);
    });
  }

  return utilities;
}

/**
 * 1つのプロパティ設定を SCSS のマップエントリ文字列へ変換する。
 */
function generatePropScss(propKey: string, propConfig: PropConfig, TOKENS: Tokens): string {
  const { prop = '', bp, isVar, alwaysVar, important } = propConfig;

  const utilities = generateUtilities(propConfig, TOKENS);
  const hasUtilities = Object.keys(utilities).length > 0;

  if (!hasUtilities && !bp) {
    return '';
  }

  let scss = `  '${propKey}': (\n`;
  if (isVar) {
    scss += `    prop: '${prop || `--${propKey}`}',\n`;
  } else {
    // propName を prop-name に変換（キャメルケースをケバブケースに変換）
    scss += `    prop: '${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}',\n`;
  }

  if (hasUtilities) {
    const exs = propConfig.exUtility || null;

    scss += `    utilities: (\n`;
    Object.entries(utilities).forEach(([utilKey, value]) => {
      // キーに特殊文字が含まれる場合はエスケープ(/,%, : の前に \\ をつける(最終的にscss側の処理で \ ひとつになるようにここでは \\ ))
      const escapedKey = utilKey.replace(/\//g, '\\\\/').replace(/%/g, '\\\\%').replace(/:/g, '\\\\:');

      // exUtility としても定義されている場合はスキップ
      if (undefined === exs?.[utilKey]) {
        scss += `      '${escapedKey}': '${value}',\n`;
      }
    });
    scss += `    ),\n`;

    if (exs) {
      scss += `    exUtility: (\n`;

      for (const [exKey, exProps] of Object.entries(exs)) {
        if (typeof exProps === 'object') {
          scss += `      '${exKey}': (\n`;
          for (const _prop in exProps) {
            if (exProps[_prop]) {
              scss += `        '${_prop}': '${exProps[_prop]}',\n`;
            }
          }
          scss += `      ),\n`;
        }
      }
      scss += `    ),\n`;
    }
  }

  if (bp !== undefined) {
    if (Array.isArray(bp)) {
      // リスト形式（出力する BP の明示指定）を SCSS リストへ直列化: ['sm','md'] → ('sm', 'md')
      // 1要素でも SCSS にリストとして解釈させるため末尾カンマを付与する: ['sm'] → ('sm',)
      const items = bp.map((b) => `'${b}'`).join(', ');
      scss += `    bp: (${items}${bp.length === 1 ? ',' : ''}),\n`;
    } else if (typeof bp === 'number') {
      scss += `    bp: ${bp},\n`;
    } else {
      throw new TypeError(`[lism-css] prop "${propKey}": bp must be 0, 1, or an array of breakpoint names. Received ${JSON.stringify(bp)}.`);
    }
  }
  if (isVar !== undefined) {
    scss += `    isVar: ${isVar},\n`;
  }
  if (alwaysVar !== undefined) {
    scss += `    alwaysVar: ${alwaysVar},\n`;
  }
  if (important !== undefined) {
    scss += `    important: ${important},\n`;
  }

  scss += `  ),`;

  return scss;
}

/**
 * CONFIG（マージ済み・Set 化前）から `$props: ( ... );` の SCSS 文字列を生成する。
 * 旧 `buildConfig()` の純粋部分（ファイル書き出しを除いたもの）。
 */
export function serializePropConfig(CONFIG: BuildConfig): string {
  const { props: PROPS } = CONFIG;
  // tokens は値付きフラットマップ。tokenClass:1 のユーティリティ生成はこのキー集合から導出する。
  const TOKENS = CONFIG.tokens;

  let scssContent = '$props: (\n';

  const entries = Object.entries(PROPS);
  entries.forEach(([propKey, propConfig], index) => {
    const propContent = generatePropScss(propKey, propConfig, TOKENS);
    if (!propContent) return;
    scssContent += propContent;

    if (index < entries.length - 1) {
      scssContent += '\n';
    }
  });

  scssContent += '\n);\n';

  return scssContent;
}

/**
 * CONFIG の breakpoints を SCSS の `$breakpoints: ( ... );` 文字列へ直列化する。
 *
 * サイズ文字列（`'480px'` 等）はクォートし、0（無効）は数値のまま出力する。
 * breakpoints 未定義時も `$breakpoints: ();` を出力し、`_setting.scss` の `props.$breakpoints`
 * 参照が常に解決できるようにする（未定義メンバ参照による sass エラーの防止）。
 */
export function serializeBreakpoints(CONFIG: BuildConfig): string {
  const entries = CONFIG.breakpoints ? Object.entries(CONFIG.breakpoints) : [];
  if (entries.length === 0) return '$breakpoints: ();\n';

  let scss = '$breakpoints: (\n';
  entries.forEach(([key, value]) => {
    const serialized = typeof value === 'number' ? value : `'${value}'`;
    scss += `  '${key}': ${serialized},\n`;
  });
  scss += ');\n';
  return scss;
}

/**
 * `_prop-config.gen.scss` に書き出す完全な SCSS（`$props` + `$breakpoints`）を生成する。
 * `_setting.scss` が両方を `@use './prop-config.gen'` 経由で読み、config を CSS 出力の情報源にする。
 */
export function serializeConfigScss(CONFIG: BuildConfig): string {
  return `${serializePropConfig(CONFIG)}\n${serializeBreakpoints(CONFIG)}`;
}

/**
 * CONFIG.tokens（値付きフラットマップ）を `:root { ... }` の CSS 宣言文字列へ直列化し、
 * `base/tokens/_tokens.gen.scss` として書き出す。
 *
 * - 変数名は getTokenVarName で導出する（規則は [[token-var-prefix]]）。
 * - 値が `'-'`（センチネル）または空のキーは出力しない（カタログ登録のみ・実値は手書き SCSS）。
 * - TOKEN_SCOPE 登録トークンは `:root` ではなく `:root, .{scope} { ... }` で出力する（詳細は [[token-scope]]）。
 *
 * 出力する宣言が無くても `:root {}` を返し、同梱デフォルトと生成物の体裁を一致させる。
 */
export function serializeTokens(CONFIG: BuildConfig): string {
  const { tokens = {} } = CONFIG;

  const rootDecls: string[] = [];
  // スコープ別（`:root, .set--*`）の宣言。挿入順 = tokens のキー順を保つ。
  const scopedDecls = new Map<string, string[]>();

  for (const [tokenKey, valueMap] of Object.entries(tokens)) {
    if (!valueMap || typeof valueMap !== 'object' || Array.isArray(valueMap)) continue;
    const scope = TOKEN_SCOPE[tokenKey as keyof typeof TOKEN_SCOPE];
    for (const [key, value] of Object.entries(valueMap as Record<string, TokenValue>)) {
      if (value === '-' || value === '' || value == null) continue;
      const decl = `  ${getTokenVarName(tokenKey, key)}: ${value};`;
      if (scope) {
        const list = scopedDecls.get(scope);
        if (list) list.push(decl);
        else scopedDecls.set(scope, [decl]);
      } else {
        rootDecls.push(decl);
      }
    }
  }

  let scss = rootDecls.length ? `:root {\n${rootDecls.join('\n')}\n}\n` : ':root {\n}\n';
  // セレクタは prettier に合わせ1行1セレクタで出力する。
  for (const [scope, decls] of scopedDecls) {
    scss += `:root,\n.${scope} {\n${decls.join('\n')}\n}\n`;
  }
  return scss;
}
