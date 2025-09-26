// const spacingTokens = ['0', '5', '10', '15', '20', '30', '40', '50'];

export default {
	fz: new Set(['root', 'base', '5xl', '4xl', '3xl', '2xl', 'xl', 'l', 'm', 's', 'xs', '2xs']),
	lh: new Set(['base', '2xs', 'xs', 's', 'l', 'xl', '2xl']),
	lts: new Set(['base', '2xs', 'xs', 's', 'l', 'xl', '2xl']), //['-3', '-2', '-1', '0', '1', '2', '3', '4', '5', '6', '7'],
	ff: new Set(['base', 'accent', 'mono']),
	fw: new Set(['light', 'normal', 'bold']),
	op: new Set(['low', 'mid', 'high']),
	bdrs: new Set(['5', '10', '20', '30', '40', '50', '60', '70', '80', '99']),
	bxsh: new Set(['5', '10', '20', '30', '40', '50', '60']),
	flow: new Set(['xs', 's', 'm', 'l', 'xl']), // getFlowDataで使う
	size: new Set(['min', 'xs', 's', 'm', 'l', 'xl']), // --size-xxx トークン

	// --変数化できるキーワード
	color: new Set([
		'base',
		'base-2',
		// 'base-3',
		'text',
		'text-2',
		// 'text-3',
		'line',
		'link',
		'main',
		'accent',
	]),
	palette: new Set(['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray', 'white', 'black', 'keycolor']),
	// filter: ['blur', 'blur:s', 'blur:l', 'darken', 'lighten'],
};
