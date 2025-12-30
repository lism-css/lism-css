/**
 * Astroファイル用の型宣言
 *
 * TypeScriptは標準で.astroファイルを認識しないため、
 * `export { default } from './Foo.astro'` のようなインポートで
 * 「モジュールが見つからない」エラー（TS2307）が発生する。
 *
 * この宣言により、.astroファイルをモジュールとして認識させ、
 * デフォルトエクスポートとしてコンポーネントを持つことをTypeScriptに伝える。
 */
declare module '*.astro' {
	const Component: (props: Record<string, unknown>) => unknown;
	export default Component;
}
