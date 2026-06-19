// tsup の `define` で置換される。未バンドル実行時は unknown をフォールバックとして返す。
declare const __LISM_CSS_VERSION__: string | undefined;
declare const __LISM_PACKAGE_VERSIONS__: Record<string, string> | undefined;
declare const __CLI_VERSION__: string | undefined;

/** このビルド時点での `lism-css` パッケージのバージョン（`^{VERSION}` への書き換えに使用） */
export const LISM_CSS_VERSION: string = typeof __LISM_CSS_VERSION__ !== 'undefined' && __LISM_CSS_VERSION__ ? __LISM_CSS_VERSION__ : 'unknown';

/** このビルド時点での公開 Lism パッケージごとのバージョン（`workspace:*` の書き換えに使用） */
export const LISM_PACKAGE_VERSIONS: Record<string, string> =
  typeof __LISM_PACKAGE_VERSIONS__ !== 'undefined' && __LISM_PACKAGE_VERSIONS__
    ? __LISM_PACKAGE_VERSIONS__
    : {
        'lism-css': LISM_CSS_VERSION,
      };

/** このビルド時点での `lism-cli` 自身のバージョン（`lism --version` で出力） */
export const CLI_VERSION: string = typeof __CLI_VERSION__ !== 'undefined' && __CLI_VERSION__ ? __CLI_VERSION__ : 'unknown';
