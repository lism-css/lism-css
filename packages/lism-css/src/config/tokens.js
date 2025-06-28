// const spacingTokens = ['0', '5', '10', '15', '20', '30', '40', '50'];

export default {
	// p: ['box', 'box:s', 'box:l'],
	fz: [
		'root',
		'base',
		'5xl',
		'4xl',
		'3xl',
		'2xl',
		'xl',
		'l',
		'm',
		's',
		'xs',
		'2xs',
		// 'fluid',
		// 'fluid:s',
		// 'fluid:l',
	],
	// lh: ['10', '20', '30', '40', '50', '60', '70', '80', '90'],
	lh: ['base', '2xs', 'xs', 's', 'l', 'xl', '2xl'],
	lts: ['base', '2xs', 'xs', 's', 'l', 'xl', '2xl'], //['-3', '-2', '-1', '0', '1', '2', '3', '4', '5', '6', '7'],
	ff: ['base', 'accent', 'mono'],
	// fw: ['thin', 'light', 'normal', 'medium', 'bold', 'heavy'],
	fw: ['light', 'normal', 'bold'],
	op: ['low', 'mid', 'high'],
	bdrs: ['5', '10', '20', '30', '40', '50', '60', '70', '80', '99'],
	bxsh: ['5', '10', '20', '30', '40', '50', '60'],

	// size:['container', 'container:s', 'container:l'],
	contentSize: ['min', 'xs', 's', 'm', 'l', 'xl'], // --size-xxx トークン
	flow: ['xs', 's', 'm', 'l', 'xl'], // getFlowDataで使う
	size: [],

	// --変数化できるキーワード
	color: ['base', 'base-2', 'base-3', 'text', 'text-2', 'text-3', 'divider', 'link', 'divider-2', 'main', 'accent', 'accent-2', 'accent-3'],
	palette: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray', 'white', 'black', 'keycolor'],
	// filter: ['blur', 'blur:s', 'blur:l', 'darken', 'lighten'],
};
