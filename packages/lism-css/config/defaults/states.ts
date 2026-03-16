import getSvgUrl from '../helper/getSvgUrl.js';
// import minifyHtml from '../helper/minifyHtml.js';

export default {
	isContainer: 'is--container',
	isWrapper: {
		className: 'is--wrapper',
		preset: ['s', 'l'],
		presetClass: '-content',
		customVar: '--contentSize',
		tokenKey: 'sz',
	},
	isLayer: 'is--layer',
	isLinkBox: 'is--linkBox',
	isSide: 'is--side',
	isSkipFlow: 'is--skipFlow',
	isVertical: 'is--vertical',
	setGutter: 'set--gutter',

	// set class
	setShadow: 'set--shadow',
	setHov: 'set--hov',
	setTransition: 'set--transition',
	setMask: {
		// 'set--mask',
		className: 'set--mask',
		setStyles: (propVal: string) => {
			// minify化
			// propVal = minifyHtml(propVal);
			let imgUrl = propVal;
			if (imgUrl.startsWith('<svg')) {
				imgUrl = getSvgUrl(propVal, 'base64');
			}
			return {
				'--maskImg': imgUrl,
			};
		},
	},
	setPlain: 'set--plain',
	// setRevert: 'set--revert',
	setInnerRs: 'set--innerRs',
} as const;
