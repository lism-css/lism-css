// import minifyHtml from './minifyHtml.js';

/**
 * svgをcssの image url に変換
 */
const getSvgUrl = (svg, encode = '') => {
	if (!svg) return '';

	// minify化
	// svg = minifyHtml(svg);

	if ('base64' === encode) {
		// memo: btoa() だけだとマルチバイト文字が入った時にエラーになる。
		// encodeURIComponent() でそれを回避できるがそれだとSVGとして描画できず、 unescape() と組み合わせることで期待する動作になった。 see: https://www.softel.co.jp/blogs/tech/archives/4133
		// svg = window.btoa(unescape(encodeURIComponent(svg)));

		// memo: Buffer 使えば非推奨な関数を使わなくてもいい see: https://hackersheet.com/naopoyo/sheets/bvtrkwt
		svg = Buffer.from(svg).toString('base64');
		return `url(data:image/svg+xml;base64,${svg})`;
	}

	// シングルクォートをダブルクォートに変換
	svg = svg.replace(/'/g, '"');
	// カラーコードの先頭の # → %23 に置換
	svg = svg.replace(/="#/g, '="%23');
	return `url('data:image/svg+xml,${svg}')`;
};
export default getSvgUrl;
