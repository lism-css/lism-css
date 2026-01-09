/**
 * ShapeDivider コンポーネントの共通プロパティ処理
 * @param {string} [props.viewBox] - SVG の viewBox
 * @param {boolean} [props.isAnimation] - アニメーションを有効にするか
 * @param {boolean} [props.isEmpty] - シェイプを非表示にしてスペーサーとして使用
 * @param {number} [props.level=5] - シェイプの高さレベル
 * @param {string} [props.stretch] - 水平方向の引き伸ばし量
 * @param {string} [props.offset] - 水平方向のオフセット
 * @param {string} [props.flip] - X/Y/XY で反転方向を指定
 */
export default function getProps({
	viewBox,
	isAnimation,
	isEmpty,
	level = 5,
	stretch,
	offset,
	flip,
	style = {},
	...props
}) {
	// level が 0 の場合は非表示
	if (level === 0) return null;

	// CSS変数をセット
	const computedStyle = { ...style };
	computedStyle['--level'] = level || null;
	computedStyle['--_inner-offset'] = offset || null;
	computedStyle['--_inner-stretch'] = stretch || null;

	return {
		lismClass: 'c--shapeDivider',
		'max-sz': 'full',
		'data-flip': flip || null,
		'aria-hidden': 'true',
		style: computedStyle,
		// SVG用のprops
		viewBox,
		isAnimation,
		isEmpty,
		// その他のprops
		...props,
	};
}
