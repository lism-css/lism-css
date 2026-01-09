/**
 * NavMenu コンポーネントの共通プロパティ処理
 */
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';

/**
 * NavMenu.Root のプロパティを処理
 * @param {object} props - コンポーネントのプロパティ
 * @param {string} [props.hovC] - ホバー時のテキストカラー（--hov-c として出力）
 * @param {string} [props.hovBgc] - ホバー時の背景カラー（--hov-bgc として出力）
 * @param {string} [props.itemP] - 各アイテムのパディング（--_item-p として出力）
 * @param {object} [props.style] - スタイルオブジェクト
 */
export function getRootProps({ hovC, hovBgc, itemP, style = {}, ...props }) {
	const computedStyle = { ...style };

	if (hovBgc) computedStyle['--hov-bgc'] = getMaybeCssVar(hovBgc, 'color');
	if (hovC) computedStyle['--hov-c'] = getMaybeCssVar(hovC, 'color');
	if (itemP) computedStyle['--_item-p'] = getMaybeCssVar(itemP, 'space');

	return {
		lismClass: 'c--navMenu',
		tag: 'ul',
		style: computedStyle,
		...props,
	};
}

/**
 * NavMenu.Nest のプロパティを処理
 */
export function getNestProps(props) {
	return {
		lismClass: 'c--navMenu_nest',
		tag: 'ul',
		'px-s': '20',
		...props,
	};
}

/**
 * NavMenu.Item のプロパティを処理
 */
export function getItemProps(props) {
	return {
		lismClass: 'c--navMenu_item',
		tag: 'li',
		...props,
	};
}

/**
 * NavMenu.Link のプロパティを処理
 * @param {string} [props.href] - リンク先URL。指定時は a タグになる
 * @param {string} [props.tag='span'] - HTML タグ
 */
export function getLinkProps({ href, tag = 'span', ...props }) {
	return {
		lismClass: 'c--navMenu_link',
		tag: href ? 'a' : tag,
		href,
		c: 'inherit',
		...props,
	};
}
