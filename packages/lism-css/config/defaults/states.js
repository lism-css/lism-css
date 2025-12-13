import getSvgUrl from '../helper/getSvgUrl.js';
// import minifyHtml from '../helper/minifyHtml.js';

export default {
	isContainer: {
		className: 'is--container',
		preset: ['s', 'm', 'l'],
		presetClass: '-container',
		customVar: '--contentSz',
		tokenKey: 'sz',
	},
	isLayer: 'is--layer',
	isLinkBox: 'is--linkBox',
	isSide: 'is--side',
	isSkipFlow: 'is--skipFlow',
	hasGutter: 'has--gutter',

	// set class

	setShadow: 'set-shadow',
	setHov: 'set-hov',
	setTransition: 'set-transition',
	setSnap: 'set-snap',
	setMask: {
		// 'set-mask',
		className: 'set-mask',
		setStyles: (propVal) => {
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
	setPlain: 'set-plain',
	// setRevert: 'set-revert',
	setInnerRs: 'set-innerRs',
};
