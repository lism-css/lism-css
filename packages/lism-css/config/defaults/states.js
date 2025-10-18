export default {
	isContainer: {
		className: 'is--container',
		preset: ['s', 'm', 'l'],
		presetClass: '-container',
		customVar: '--content-size',
		tokenKey: 'sz',
	},
	isFlow: {
		className: 'is--flow',
		preset: ['s', 'm'],
		presetClass: '-flow',
		customVar: '--flow-gap',
		tokenKey: 'space',
	},
	isLayer: 'is--layer',
	isVertical: 'is--vertical',
	isLinkBox: 'is--linkBox',

	isWide: 'is--wide',
	isFullwide: 'is--fullwide',
	isOverwide: 'is--overwide',
	hasGutter: 'has--gutter',

	// set class
	setClickExpand: 'set--clickExpand',
	setTransition: 'set--transition',
	setHover: 'set--hover',
	setScrollSnap: 'set--scrollSnap',
	setPlain: 'set--plain',
	setShadow: 'set--shadow',
};
