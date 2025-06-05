import TOKENS from './tokens';
const SPACE_PRESETS = ['0', '5', '10', '20', '30', '40', '50', '60', '70', '80'];
const auto = { auto: 'a' };
/* 
memo: 
	ユーティリティクラス化されない時の挙動パターン
		1.  .-prop: かつ --prop ( ほとんどこれ )
		2.  普通のstyleとして出力するだけ ( alignSelf など ) → style をもつ
		3.  --prop のみ出力.( --keycol や --bdc など ) →  style をもつ


禁止パターン: 
	styleを持っていて BP:1 
*/

const places = {
	center: 'c',
	start: 's',
	end: 'e',
	'flex-start': 'fs',
	'flex-end': 'fe',
};

const selfPlaces = {
	center: 'c',
	start: 's',
	end: 'e',
	stretch: 'str',
};

const trblUtils = { '0%': '0', '50%': '50%', '100%': '100%' };

export default {
	// size
	w: { utils: { 'fit-content': 'fit' }, presets: ['100%'], converter: 'size' },
	h: {
		utils: { 'fit-content': 'fit' },
		presets: ['100%', '100lvh', '100svh'],
		converter: 'size',
	},
	maxW: { style: 'maxWidth', presets: ['100%'], converter: 'size' },
	maxH: { style: 'maxHeight', presets: ['100%'], converter: 'size' },
	minW: { style: 'minWidth', presets: ['100%'], converter: 'size' },
	minH: { style: 'minHeight', presets: ['100%', '100lvh', '100svh'], converter: 'size' },
	is: { style: 'inline-size', converter: 'size' },
	bs: { style: 'block-size', converter: 'size' },
	maxIs: { style: 'maxInlineSize', converter: 'size' },
	maxBs: { style: 'maxBlockSize', converter: 'size' },
	minIs: { style: 'minInlineSize', converter: 'size' },
	minBs: { style: 'minBlockSize', converter: 'size' },

	// is: inline-size, bs: block-size, maxI, maxB, minIs, minBs
	c: {
		presets: [
			'inherit',
			'base',
			'text',
			'text-2',
			// 'keycol',
			'mix',
			'main',
			'accent',
			// 'black',
			// 'white',
		],
		converter: 'color',
	},
	bgc: {
		presets: [
			'inherit',
			'main',
			'accent',
			'base',
			'base-2',
			'base-3',
			'text',
			// 'keycol',
			'mix',
			// 'black',
			// 'white',
		],
		converter: 'color',
	},
	keycol: { style: '--keycol', converter: 'color' },

	bd: {
		style: 'border',
		utils: {
			none: 'n',
			inherit: 'inherit',
			left: 'l',
			right: 'r',
			top: 't',
			bottom: 'b',
			inline: 'x',
			block: 'y',
			'inline-start': 'is',
			'inline-end': 'ie',
			'block-start': 'bs',
			'block-end': 'be',
		},
	},
	bdw: { style: '--bdw' }, // --bdw のみ
	bds: { style: '--bds' }, // --bds のみ
	bdc: {
		style: '--bdc',
		utils: { transparent: 't' },
		presets: [
			'inherit',
			'main',
			'accent',
			'mix',
			'divider',
			// 'keycol',
			'mix',
		],
		converter: 'color',
	},

	// boxcolor: { _presets: TOKENS.palette, style: '--keycol', converter: 'color' },
	bg: { utils: { none: 'n' } },
	bgi: { style: 'backgroundImage' },
	bgr: { style: 'backgroundRepeat', utils: { n: 'no-repeat' } },
	bgp: { style: 'backgroundPosition', utils: { center: 'c' } },
	bgsz: { style: 'backgroundSize', utils: { cover: 'cv', contain: 'ct' } },
	// bga: { style: 'backgroundAttachment' },
	// bgo: { style: 'backgroundOrigin' },
	// bcp: { style: 'backgroundClip' },
	// bbm: { style: 'backgroundBlendMode' },

	// mask: { map: 1 },

	// Typography
	f: { style: 'font', presets: ['inherit'] },
	fz: { presets: TOKENS.fz, converter: 'fz' },
	lh: { presets: ['1', ...TOKENS.lh], style: 'lineHeight' },
	fw: {
		style: 'fontWeight',
		presets: TOKENS.fw,
	},
	ff: { style: 'fontFamily', presets: ['base', 'accent', 'mono'], converter: 1 },
	fs: { style: 'fontStyle', utils: { italic: 'i' } },
	lts: { style: 'letterSpacing', presets: TOKENS.lts },
	ta: { style: 'textAlign', utils: { center: 'c', left: 'l', right: 'r' } },
	td: { style: 'textDecoration', utils: { underline: 'u', none: 'n' } },
	whs: { style: 'whiteSpace', utils: { nowrap: 'nw' } },
	// tsh: { style: 'textShadow' },
	// ovw: { style: 'overflowWrap', utils: { anywhere: 'any' } },

	// others
	bdrs: { presets: ['inner', '0', ...TOKENS.bdrs], converter: 'bdrs' },
	bxsh: { presets: ['0', ...TOKENS.bxsh], converter: 'bxsh' },
	// shColor: { converter: 'color', style: '--sh-color' },

	// transition
	trs: { style: 'transition' },
	// trsdu: { style: '--trsdu' },
	// trsp: { style: '--trsp' },
	// trspt: {
	// 	style: '--trspt',
	// 	// utils: { 'ease-in': 'in', 'ease-out': 'out', 'ease-in-out': 'in-out', linear: 'linear' },
	// },

	//display
	d: {
		utils: {
			none: 'n',
			block: 'b',
			flex: 'f',
			grid: 'g',
			inline: 'i',
			'inline-flex': 'if',
			'inline-grid': 'ig',
			'inline-block': 'ib',
		},
	},
	op: {
		style: 'opacity',
		presets: [...TOKENS.op, '0'],
		converter: 1,
	}, // op
	v: { style: 'visibility', utils: { hidden: 'h', visible: 'v' } },
	ov: { style: 'overflow', utils: { scroll: 's', hidden: 'h', auto: 'a', clip: 'c' } },
	ovx: { style: 'overflowX', utils: { scroll: 's', hidden: 'h', auto: 'a', clip: 'c' } },
	ovy: { style: 'overflowY', utils: { scroll: 's', hidden: 'h', auto: 'a', clip: 'c' } },
	// overflow-clip-margin → safariで使えない
	ar: {
		// style:'aspectRatio',
		presets: [
			// '21/9',
			'16/9',
			// '4/3',
			'3/2',
			// '2/1',
			'1/1',
			'ogp',
			'gold',
			// 'silver',
			// 'bronze',

			// 'cinema',
		],
	},

	pos: {
		style: 'position',
		utils: {
			relative: 'r',
			absolute: 'a',
			static: 's',
			fixed: 'f',
			sticky: 'sticky',
		},
	},
	z: { style: 'zIndex', presets: ['-1', '0', '1', '2', '99'] },
	i: { style: 'inset', utils: { '0%': '0' }, converter: 'space' },
	t: { style: 'top', utils: trblUtils, converter: 'space' },
	l: { style: 'left', utils: trblUtils, converter: 'space' },
	r: { style: 'right', utils: trblUtils, converter: 'space' },
	b: { style: 'bottom', utils: trblUtils, converter: 'space' },

	// isolation
	// flip: {},

	// Spacing
	p: {
		presets: SPACE_PRESETS, //[...SPACE_PRESETS, ...TOKENS.p],
		converter: 'space',
		// {x, y, t, b, l, r, is, bs } でも指定可能にする
		objProcessor: (d) => `p${d}`,
	},
	px: { presets: SPACE_PRESETS, converter: 'space' },
	py: { presets: SPACE_PRESETS, converter: 'space' },
	pl: { presets: [], converter: 'space' },
	pr: { presets: [], converter: 'space' },
	pt: { presets: [], converter: 'space' },
	pb: { presets: [], converter: 'space' },
	// inline,block
	pis: { presets: SPACE_PRESETS, converter: 'space' },
	pbs: { presets: SPACE_PRESETS, converter: 'space' },
	// pie: { converter: 'space' },
	// pbe: { converter: 'space' },
	// pinln, pblck
	// pse: paddingOption,
	// pbe: paddingOption,
	m: {
		utils: auto,
		presets: SPACE_PRESETS,
		converter: 'space',
		// {x, y, t, b, l, r, is, bs } でも指定可能にする
		objProcessor: (d) => `m${d}`,
	},
	mx: { utils: auto, converter: 'space' },
	my: { utils: auto, converter: 'space' },
	ml: { utils: auto, converter: 'space' },
	mr: { utils: auto, converter: 'space' },
	mt: { utils: auto, converter: 'space' },
	mb: { utils: auto, converter: 'space' },
	mis: { presets: SPACE_PRESETS, utils: auto, converter: 'space' },
	mbs: { presets: SPACE_PRESETS, utils: auto, converter: 'space' },
	// mib: { converter: 'space' },
	// mbe: { converter: 'space' },
	// me: marginOption,
	// mbe: marginOption,
	g: {
		presets: ['inherit', ...SPACE_PRESETS],
		converter: 'space',
	},
	rowg: { converter: 'space' },
	colg: { converter: 'space' },
	cols: { style: '--cols' },
	rows: { style: '--rows' },

	pi: { style: 'placeItems' },
	pc: { style: 'placeContent' },
	ai: { style: 'alignItems', utils: { ...places, stretch: 'str' } },
	ac: { style: 'alignContent', utils: { ...places, 'space-between': 'sb' } },
	ji: { style: 'justifyItems', utils: { ...places, stretch: 'str' } },
	jc: { style: 'justifyContent', utils: { ...places, 'space-between': 'sb' } },
	aslf: { style: 'alignSelf', utilKey: 'aslf', utils: selfPlaces },
	jslf: { style: 'justifySelf', utilKey: 'jslf', utils: selfPlaces },
	pslf: { style: 'placeSelf', utilKey: 'pslf', utils: selfPlaces },
	ord: { style: 'order', utilKey: 'ord', presets: ['0', '-1', '1'] },

	// flex-item
	fx: { style: 'flex', utils: { '1 1 0': '1' } },
	fxg: { name: 'fxg', presets: ['0', '1'] },
	fxsh: { name: 'fxsh', presets: ['0', '1'] },
	fxb: { name: 'fxb' },

	// mask: { map: 1 },
	// flex: { map: 1 },
	// grid: { map: 1 },
	// flexItem: { map: 1 },
	// gridItem: { map: 1 },
	// css: { map: 1 },
};

export const CONTEXT_PROPS = {
	grid: {
		gd: {},
		gt: { style: 'gridTemplate' },
		gtc: { presets: ['subgrid'] },
		gtr: { presets: ['subgrid'] },
		gta: {},
		gaf: {
			utils: { row: 'r', column: 'c' },
			_style: 'gridAutoFlow',
		},
		gac: { _style: 'gridAutoColumns' },
		gar: { _style: 'gridAutoRows' },

		// autoFlow, autoRows, autoCols
	},
	gridItem: {
		// item
		ga: { presets: 1, utils: { '1/1': '1' } }, // grid-area
		gc: { presets: 1 }, // grid-column
		gcs: { presets: 1, style: 'gridColumnStart' },
		gce: { presets: 1, style: 'gridColumnEnd' },
		gr: { presets: 1 }, // grid-row
		grs: { presets: 1, style: 'gridRowStart' },
		gre: { presets: 1, style: 'gridRowEnd' },
		// ...itemProps,
	},

	flex: {
		fxf: { style: 'flex-flow' },
		// nowrap → Emmet は n だが、nw にしている. (whs と揃えている)
		fxw: { utils: { wrap: 'w', nowrap: 'nw' } },
		fxd: { utils: { column: 'c', row: 'r', 'column-reverse': 'cr', 'row-reverse': 'rr' } },
	},

	// fx: {
	// 	g,sh,b
	// }

	// flexItem: {
	// 	fx: { style: 'flex', utils: { '1 1 0': '1' } },
	// 	fxg: { name: 'fxg', presets: ['0', '1'] },
	// 	fxsh: { name: 'fxsh', presets: ['0', '1'] },
	// 	fxb: { name: 'fxb' },
	// },

	// transform: {
	// 	// transform
	// 	transformOrigin: { style: 1, utilKey: 'trfo', utils: 'origin' },
	// 	translate: { style: 1, utils: 1, utilKey: 'trslt' },
	// 	rotate: { style: 1, utils: 1 },
	// 	scale: { style: 1 },
	// },

	radii: {
		tl: { style: 'borderTopLeftRadius', utilKey: 'bdtlrs', converter: 'bdrs' },
		tr: { style: 'borderTopRightRadius', utilKey: 'bdtrrs', converter: 'bdrs' },
		bl: { style: 'borderBottomLeftRadius', utilKey: 'bdblrs', converter: 'bdrs' },
		br: { style: 'borderBottomRightRadius', utilKey: 'bdbrrs', converter: 'bdrs' },
		ss: { style: 'borderStartStartRadius', utilKey: 'bdssrs', converter: 'bdrs' },
		se: { style: 'borderStartEndRadius', utilKey: 'bdsers', converter: 'bdrs' },
		es: { style: 'borderEndStartRadius', utilKey: 'bdesrs', converter: 'bdrs' },
		ee: { style: 'borderEndEndRadius', utilKey: 'bdeers', converter: 'bdrs' },
	},

	// borders: {
	// 	l: { style: 'borderLeft', utilKey: 'bdl' },
	// 	r: { style: 'borderRight', utilKey: 'bdr' },
	// 	t: { style: 'borderTop', utilKey: 'bdt' },
	// 	b: { style: 'borderBottom', utilKey: 'bdb' },
	// 	is: { style: 'borderInlineStart', utilKey: 'bdis' },
	// 	bs: { style: 'borderBlockStart', utilKey: 'bdbs' },
	// 	ie: { style: 'borderInlineEnd', utilKey: 'bdie' },
	// 	be: { style: 'borderBlockEnd', utilKey: 'bdbe' },
	// },
	insets: {
		is: {
			style: 'insetInlineStart',
			utilKey: 'iis',
			converter: 'space',
		},
		ie: {
			style: 'insetInlineEnd',
			utilKey: 'iie',
			converter: 'space',
		},
		bs: {
			style: 'insetBlockStart',
			utilKey: 'ibs',
			converter: 'space',
		},
		be: {
			style: 'insetBlockEnd',
			utilKey: 'ibe',
			converter: 'space',
		},
	},

	mask: {},

	css: {
		// transform系
		translate: {
			style: 1,
			utilKey: 'trslt',
			utils: {
				'-50% -50%': '-50XY',
				'-50%': '-50X',
				'-50% 0': '-50X',
				'0 -50%': '-50Y',
			},
		},
		rotate: {
			style: 1,
			utils: { '45deg': '45', '-45deg': '-45', '90deg': '90', '-90deg': '-90' },
		},
		scale: {
			style: 1,
			utils: {
				'-1 1': '-X',
				'1 -1': '-Y',
				'-1 -1': '-XY',
			},
		},

		// Memo: その他、コアの処理このcssに入り得るものは以下の通り.(将来的に何か処理を追加するかもしれないもの)
		// transform,
		// transformOrigin,
		// clipPath: { style: 1 }, // cpp ?
		// objectFit: { style: 1, utilKey: 'obf', utils: { cover: 'cv', contain: 'cn' } },
		// objectPosition: { style: 1 },
		// filter: { style: 1 }, // fltr?
		// backdropFilter: { style: 1, presets:[] },
	},

	// hov: { c, bgc, bdc, bxsh },
};
