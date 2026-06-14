/**
 * props 設定を SCSS の `$props` マップ文字列へ直列化する純粋関数群。
 *
 * 旧 `bin/build-config.js` のロジックを移植し、ファイル書き出し（副作用）を分離した。
 * 返り値は `@use 'lism:prop-config'` 経由で sass importer がそのまま注入できる SCSS 文字列。
 * bin CLI（ファイル出力）と Vite プラグイン（メモリ注入）の双方がこの直列化結果を共有する。
 */
import getMaybeTokenValue from '../lib/getMaybeTokenValue';

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
    const tokenValues = TOKENS[token];
    if (Array.isArray(tokenValues)) {
      presets.push(...(tokenValues as TokenValue[]));
    } else if (tokenValues && typeof tokenValues === 'object') {
      presets.push(...((tokenValues as { values?: TokenValue[] }).values || []));
    }
  }

  // presets が定義されている場合
  if (presets.length > 0) {
    presets.forEach((preset) => {
      utilities[preset] = getMaybeTokenValue(token, preset, TOKENS as Parameters<typeof getMaybeTokenValue>[2]);
    });
  }

  // utils が定義されている場合
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

  // 出力する CSS がない場合
  if (!hasUtilities && !bp) {
    return '';
  }

  let scss = `  '${propKey}': (\n`;
  if (isVar) {
    scss += `    prop: '--${propKey}',\n`;
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
      // 数値（0 / 1）
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
  const { tokens: TOKENS, props: PROPS } = CONFIG;

  let scssContent = '$props: (\n';

  const entries = Object.entries(PROPS);
  entries.forEach(([propKey, propConfig], index) => {
    const propContent = generatePropScss(propKey, propConfig, TOKENS);
    if (!propContent) return;
    scssContent += propContent;

    // 最後の要素でない場合は改行を追加
    if (index < entries.length - 1) {
      scssContent += '\n';
    }
  });

  scssContent += '\n);\n';

  return scssContent;
}
