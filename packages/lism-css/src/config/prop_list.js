import TOKENS from './tokens';
const SPACE_PRESETS = ['0', '5', '10', '20', '30', '40', '50', '60', '70', '80'];
const auto = { auto: 'a' };
/* 
Memo: 
	ユーティリティクラス化されない時の挙動パターン
		1.  .-prop: かつ --prop ( ほとんどこれ )
		2.  普通のstyleとして出力するだけ ( alignSelf など ) → style をもつ
		3.  --prop のみ出力.( --keycolor や --bdc など ) →  style をもつ


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

/* 
Memo: 
	utils: Propクラスとして出力する値（{value:classKeyname}）
	presets: Propクラスとして出力するキーワード値（そのままクラス化）
	token: トークン変換するための関数処理を指定するためのキーワード文字列
	style: -{prop}:{val}クラスとして出力されない場合にstyleに渡す時のプロパティ名。この指定がなければ、 -{prop} クラスが出力される。

*/
const PROPS = {
	// size
	w: { utils: { 'fit-content': 'fit' }, presets: ['100%'], token: 'size' },
	h: {
		utils: { 'fit-content': 'fit' },
		presets: ['100%', '100lvh', '100svh'],
		token: 'size',
	},
	maxW: { presets: ['100%'], token: 'size' },
	maxH: { presets: ['100%'], token: 'size' },
	minW: { presets: ['100%'], token: 'size' },
	minH: { presets: ['100%', '100lvh', '100svh'], token: 'size' },
	isz: { style: 'inline-size', token: 'size' },
	bsz: { style: 'block-size', token: 'size' },
	maxIsz: { style: 'maxInlineSize', token: 'size' },
	maxBsz: { style: 'maxBlockSize', token: 'size' },
	minIsz: { style: 'minInlineSize', token: 'size' },
	minBsz: { style: 'minBlockSize', token: 'size' },

	// is: inline-size, bs: block-size, maxI, maxB, minIsz, minBsz
	c: {
		presets: [
			'inherit',
			'base',
			'text',
			'text-2',
			// 'keycolor',
			'mix',
			'main',
			'accent',
			// 'black',
			// 'white',
		],
		token: 'color',
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
			// 'keycolor',
			'mix',
			// 'black',
			// 'white',
		],
		token: 'color',
	},
	keycolor: { style: '--keycolor', token: 'color' },

	bd: {
		style: 'border',
		utils: {
			none: 'n',
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
	bdw: { isVar: 1 }, // --bdw のみ
	bds: {
		isVar: 1,
		utils: {
			dashed: 'ds',
			dotted: 'dt',
			double: 'db',
		},
	}, // --bds のみ
	bdc: {
		isVar: 1,
		utils: { transparent: 't' },
		presets: [
			'inherit',
			'main',
			'accent',
			'mix',
			'divider',
			// 'keycolor',
			'mix',
		],
		token: 'color',
	},

	// boxcolor: { _presets: TOKENS.palette, style: '--keycolor', token: 'color' },
	bg: { utils: { none: 'n' } },
	bgi: {},
	bgr: { style: 'backgroundRepeat', utils: { n: 'no-repeat' } },
	bgp: { style: 'backgroundPosition', utils: { center: 'c' } },
	bgsz: { style: 'backgroundSize', utils: { cover: 'cv', contain: 'ct' } },
	bgcp: { style: 'backgroundClip', presets: ['text'] },
	bga: { style: 'backgroundAttachment' },
	bgo: { style: 'backgroundOrigin' },
	bgbm: { style: 'backgroundBlendMode' },

	// mask
	msk: {},
	// mski: { style: 'maskImage' },
	// mskbd: { style: 'maskBorder' },
	// msktyp: { style: 'maskType' },
	// mskclp: { style: 'maskClip' },
	// mskcmp: { style: 'maskComposite' },
	// mskmd: { style: 'maskMode' },
	// msko: { style: 'maskOrigin' },
	// mskp: { style: 'maskPosition' },
	// mskr: { style: 'maskRepeat' },
	// msksz: { style: 'maskSize' },

	// Typography
	f: { style: 'font', presets: ['inherit'] },
	fz: { presets: TOKENS.fz, token: 'fz' },
	lh: { style: 'lineHeight', presets: ['1', ...TOKENS.lh] },
	fw: {
		style: 'fontWeight',
		presets: [...TOKENS.fw, '100', '200', '300', '400', '500', '600', '700', '800', '900'],
	},
	ff: { style: 'fontFamily', presets: ['base', 'accent', 'mono'], token: 'ff' },
	fs: { style: 'fontStyle', utils: { italic: 'i' } },
	lts: { style: 'letterSpacing', presets: TOKENS.lts },
	ta: { style: 'textAlign', utils: { center: 'c', left: 'l', right: 'r' } },
	td: { style: 'textDecoration', utils: { underline: 'u', none: 'n' } },
	// tsh: { style: 'textShadow' },
	// whs: { style: 'whiteSpace', utils: { nowrap: 'nw' } },
	// ovw: { style: 'overflowWrap', utils: { anywhere: 'any' } },

	// shadow
	bxsh: { presets: ['0', ...TOKENS.bxsh], token: 'bxsh' },

	// radius
	bdrs: { presets: ['0', ...TOKENS.bdrs], token: 'bdrs' },
	// bdtlrs: { style: 'borderTopLeftRadius', token: 'bdrs' },
	// bdtrrs: { style: 'borderTopRightRadius', token: 'bdrs' },
	// bdblrs: { style: 'borderBottomLeftRadius', token: 'bdrs' },
	// bdbrrs: { style: 'borderBottomRightRadius', token: 'bdrs' },
	// bdssrs: { style: 'borderStartStartRadius', token: 'bdrs' },
	// bdsers: { style: 'borderStartEndRadius', token: 'bdrs' },
	// bdesrs: { style: 'borderEndStartRadius', token: 'bdrs' },
	// bdeers: { style: 'borderEndEndRadius', token: 'bdrs' },

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
		token: 'op',
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
			// 'gold',
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
	// iso: { style: 'isolation', utils: { isolate: 'i' } },
	t: { style: 'top', utils: trblUtils, token: 'space' },
	l: { style: 'left', utils: trblUtils, token: 'space' },
	r: { style: 'right', utils: trblUtils, token: 'space' },
	b: { style: 'bottom', utils: trblUtils, token: 'space' },
	i: { style: 'inset', utils: { '0%': '0' }, token: 'space' },
	// iis: { style: 'insetInlineStart', token: 'space' },
	// iie: { style: 'insetInlineEnd', token: 'space' },
	// ibs: { style: 'insetBlockStart', token: 'space' },
	// ibe: { style: 'insetBlockEnd', token: 'space' },

	// isolation
	// flip: {},

	// Spacing
	p: {
		presets: SPACE_PRESETS, //[...SPACE_PRESETS, ...TOKENS.p],
		token: 'space',
		// {x, y, t, b, l, r, is, bs } でも指定可能にする
		// objProcessor: (d) => ({ prop: `p${d}`, context: null }),
	},
	px: { presets: SPACE_PRESETS, token: 'space' },
	py: { presets: SPACE_PRESETS, token: 'space' },
	pl: { presets: [], token: 'space' },
	pr: { presets: [], token: 'space' },
	pt: { presets: [], token: 'space' },
	pb: { presets: [], token: 'space' },
	// inline,block
	pis: { presets: SPACE_PRESETS, token: 'space' },
	pbs: { presets: SPACE_PRESETS, token: 'space' },
	pie: { style: 'paddingInlineEnd', token: 'space' },
	pbe: { style: 'paddingInlineStart', token: 'space' },
	// pinln, pblck
	// pse: paddingOption,
	// pbe: paddingOption,
	m: {
		utils: auto,
		presets: SPACE_PRESETS,
		token: 'space',
		// {x, y, t, b, l, r, is, bs } でも指定可能にする
		// objProcessor: (d) => ({ prop: `m${d}`, context: null }),
	},
	mx: { utils: auto, token: 'space' },
	my: { utils: auto, token: 'space' },
	ml: { utils: auto, token: 'space' },
	mr: { utils: auto, token: 'space' },
	mt: { utils: auto, token: 'space' },
	mb: { utils: auto, token: 'space' },
	mis: { presets: SPACE_PRESETS, utils: auto, token: 'space' },
	mbs: { presets: SPACE_PRESETS, utils: auto, token: 'space' },
	mie: { style: 'marginInlineEnd', token: 'space' },
	mbe: { style: 'marginInlineStart', token: 'space' },
	// me: marginOption,
	// mbe: marginOption,
	g: {
		presets: ['inherit', ...SPACE_PRESETS],
		token: 'space',
	},
	gx: { token: 'space' }, // colg
	gy: { token: 'space' }, // rowg
	cols: { isVar: 1 },
	rows: { isVar: 1 },

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

	// flex
	fxf: { style: 'flex-flow' },
	fxw: { utils: { wrap: 'w', nowrap: 'n' } },
	fxd: { utils: { column: 'c', row: 'r', 'column-reverse': 'cr', 'row-reverse': 'rr' } },

	// flex-item
	fx: { utils: { '1 1 0': '1' } },
	fxg: { style: 'flexGrow', presets: ['0', '1'] },
	fxsh: { style: 'flexShrink', presets: ['0', '1'] },
	fxb: {},

	// grid
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

	// grid-item
	ga: { utils: { '1/1': '1', '1 / 1': '1' } }, // grid-area
	gc: { presets: ['1/-1'], utils: { '1 / -1': '1/-1' } }, // grid-column
	gr: { presets: ['1/-1'], utils: { '1 / -1': '1/-1' } }, // grid-row
	gcs: { style: 'gridColumnStart' },
	gce: { style: 'gridColumnEnd' },
	grs: { style: 'gridRowStart' },
	gre: { style: 'gridRowEnd' },

	// transform系
	// trf: { style: 'transform' },
	// trfo: { style: 'transformOrigin' },
	trnslt: {
		style: 'translate',
		utils: {
			'-50% -50%': '-50XY',
			'-50%': '-50X',
			'-50% 0': '-50X',
			'0 -50%': '-50Y',
		},
	},
	//rtt
	rotate: {
		style: 'rotate',
		utils: { '45deg': '45', '-45deg': '-45', '90deg': '90', '-90deg': '-90' },
	},
	//scl
	scale: {
		style: 'scale',
		utils: {
			'-1 1': '-X',
			'1 -1': '-Y',
			'-1 -1': '-XY',
		},
	},

	// float
	// fl: { style: 'float', utils: { left: 'l', right: 'r' } },
	// cl: { style: 'clear', utils: { left: 'l', right: 'r', both: 'b' } },

	// object-fit
	// objf: { style: 'objectFit', utils: { cover: 'cv', contain: 'cn' } },
	// objp: { style: 'objectPosition' },

	// filter
	// fltr: { style: 'filter' }, // fltr?
	// bdfltr: { style: 'backdropFilter' }, // bdfltr?
};

// PROPS の presets を Set に変換しておく
Object.keys(PROPS).forEach((key) => {
	if (PROPS[key].presets) {
		PROPS[key].presets = new Set(PROPS[key].presets);
	}
});

export default PROPS;
