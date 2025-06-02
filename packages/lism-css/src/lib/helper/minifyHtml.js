/**
 * html文字列をminify
 */
const minifyHtml = (html) => {
	if (!html) return '';

	// 改行先に削除
	html = html.replace(/\r?\n/g, '');

	// タブ → スペース
	html = html.replace(/\t/g, ' ');

	// 複数のスペースを１つに
	html = html.replace(/\s\s+/g, ' ');

	// タグとタグの間のスペースを削除
	html = html.replace(/> </g, '><');

	return html;
};

export default minifyHtml;
