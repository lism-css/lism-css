/**
 * isVar: 1 → クラス出力はせずstyle属性での変数出力のみ (--bdw, --keycolor など)
 * bp: 0 → Prop-valユーティリティクラス化されなければ、style属性で出力するだけ。
 * bp: 1 → .-prop と --prop の セットがベースにあり、.-prop_bp と .--prop_bp で ブレイクポイント指定できる。
 *       .-prop{propaty:var(--prop)} が基本で、ユーティリティクラスは .-prop:val{propaty:value} となる。
 *
 * ↓コンポーネント処理で使用される
 * tokenClass: 1 → 対応するトークン値がそのまま全てユーティリティクラス化されるもの。
 * shorthands: → コンポーネント側で短く書くための設定
 *
 * ↓SCSS出力で使用される
 * alwaysVar: 1 → .-prop,[class*=-prop:] {propaty:var(--prop)} で、ユーティリティクラス時も常に変数管理となる。
 * overwriteBaseVar: 1 → ブレイクポイントクラスで --prop: var(--prop_$bp) がセットされ、常にベース変数の --prop で値が取得できるようになる。
 * important: 1 → !important を付けて最終的に出力する
 */

const PLACE_PRESETS = ['start', 'center', 'end'];
const PLACE_UTILS = { 'flex-s': 'flex-start', 'flex-e': 'flex-end' };
const PLACE_SHORTHANDS = { s: 'start', e: 'end', c: 'center', fs: 'flex-s', fe: 'flex-e' };

export default {
	f: { prop: 'font', presets: ['inherit'] },
	fz: { prop: 'fontSize', token: 'fz', tokenClass: 1, bp: 1, alwaysVar: 1 },
	fw: { prop: 'fontWeight', token: 'fw', tokenClass: 1 },
	ff: { prop: 'fontFamily', token: 'ff', tokenClass: 1 },
	fs: { prop: 'fontStyle', presets: ['italic'], shorthands: { i: 'italic' } },
	lh: { prop: 'lineHeight', presets: ['1'], token: 'lh', tokenClass: 1, bp: 1, alwaysVar: 1 },
	lts: { prop: 'letterSpacing', token: 'lts', tokenClass: 1 },
	ta: { prop: 'textAlign', presets: ['center', 'left', 'right'] },
	td: { prop: 'textDecoration', utils: { under: 'underline', none: 'none' } },
	// tt: { prop: 'textTransform', utils: { upper: 'uppercase', lower: 'lowercase' } },
	// te: { prop: 'textEmphasis', presets: ['filled'] },
	// tsh: { prop: 'textShadow' },

	d: {
		prop: 'display',
		presets: ['none', 'block'],
		utils: { 'in-flex': 'inline-flex' },
		bp: 1,
	},
	o: { prop: 'opacity', presets: ['0'], token: 'o', tokenClass: 1 },
	v: { prop: 'visibility', presets: ['hidden'] },
	ov: { prop: 'overflow', presets: ['hidden', 'auto', 'clip'] },
	'ov-x': { prop: 'overflowX', presets: ['clip', 'auto', 'scroll'] },
	'ov-y': { prop: 'overflowY', presets: ['clip', 'auto', 'scroll'] },
	// overflow-clip-margin → safariで使えない
	ar: {
		prop: 'aspectRatio',
		presets: ['21/9', '16/9', '3/2', '1/1'], // 4/3, 2/1
		token: 'ar',
		tokenClass: 1,
		bp: 1,
	},

	// size
	w: { prop: 'width', utils: { fit: 'fit-content' }, presets: ['100%'], token: 'sz', bp: 1 },
	h: { prop: 'height', presets: ['100%'], token: 'sz', bp: 1 },
	'min-w': { prop: 'minWidth', presets: ['100%'], token: 'sz', bp: 1 },
	'max-w': { prop: 'maxWidth', presets: ['100%'], token: 'sz', bp: 1 },
	'min-h': { prop: 'minHeight', presets: ['100%'], token: 'sz', bp: 1 },
	'max-h': { prop: 'maxHeight', presets: ['100%'], token: 'sz', bp: 1 },

	sz: { prop: 'inlineSize', token: 'sz' },
	'min-sz': { prop: 'minInlineSize', token: 'sz' },
	'max-sz': {
		prop: 'maxInlineSize',
		token: 'sz',
		tokenClass: 1,
		exUtility: {
			min: '',
			full: '',
			outer: '',
		},
	},
	ysz: { prop: 'blockSize', token: 'sz' },
	'min-ysz': { prop: 'minBlockSize', token: 'sz' },
	'max-ysz': { prop: 'maxBlockSize', token: 'sz' },

	// bg
	bg: { prop: 'background', bp: 1 },
	bgi: { prop: 'backgroundImage' },
	bgr: { prop: 'backgroundRepeat', utils: { no: 'no-repeat' } },
	bgp: { prop: 'backgroundPosition', presets: ['center'] },
	bgsz: { prop: 'backgroundSize', presets: ['cover', 'contain'] },
	bga: { prop: 'backgroundAttachment' }, // fixed
	bgo: { prop: 'backgroundOrigin' }, // border, padding, content
	bgblend: { prop: 'backgroundBlendMode' },
	bgclip: {
		prop: 'backgroundClip',
		presets: ['text'],
	},
	bgc: {
		prop: 'backgroundColor',
		presets: ['base', 'base-2', 'text', 'inherit', 'main', 'accent'],
		utils: { trsp: 'transparent' },
		token: 'color',
		exUtility: { inherit: { 'background-color': 'inherit' } },
		alwaysVar: 1,
	},

	c: {
		// Note: bg系（bgclip）より後にくるように。
		prop: 'color',
		presets: ['base', 'text', 'text-2', 'main', 'accent', 'inherit'],
		utils: { trsp: 'transparent' },
		// tt
		token: 'color',
		exUtility: {
			inherit: { color: 'inherit' }, // --c ではなく color で出力したい
			// mix: {'--_c1:currentColor;--_c2:transparent;--c:color-mix(in srgb, var(--_c1) var(--_mix-c, 50%), var(--_c2))'},
		},
		alwaysVar: 1,
	},
	keycolor: { isVar: 1, token: 'color' },
	bd: { prop: 'border', presets: ['none'] },
	bds: { isVar: 1, presets: ['dashed', 'dotted', 'double'] },
	bdc: {
		isVar: 1,
		presets: ['main', 'accent', 'line', 'inherit'],
		utils: { trsp: 'transparent' },
		token: 'color',
	},
	bdw: { isVar: 1, bp: 1 }, // --bdw のみ
	'bd-x': { prop: 'borderInline' },
	'bd-y': { prop: 'borderBlock' },
	'bd-x-s': { prop: 'borderInlineStart' },
	'bd-x-e': { prop: 'borderInlineEnd' },
	'bd-y-s': { prop: 'borderBlockStart' },
	'bd-y-e': { prop: 'borderBlockEnd' },
	'bd-t': { prop: 'borderTop' },
	'bd-b': { prop: 'borderBottom' },
	'bd-l': { prop: 'borderLeft' },
	'bd-r': { prop: 'borderRight' },

	bdrs: {
		prop: 'borderRadius',
		presets: ['0'],
		token: 'bdrs',
		tokenClass: 1,
		bp: 1,
		alwaysVar: 1,
		overwriteBaseVar: 1,
	},
	'bdrs-tl': { prop: 'borderTopLeftRadius', token: 'bdrs' },
	'bdrs-tr': { prop: 'borderTopRightRadius', token: 'bdrs' },
	'bdrs-br': { prop: 'borderBottomRightRadius', token: 'bdrs' },
	'bdrs-bl': { prop: 'borderBottomLeftRadius', token: 'bdrs' },
	'bdrs-ss': { prop: 'borderStartStartRadius', token: 'bdrs' },
	'bdrs-se': { prop: 'borderStartEndRadius', token: 'bdrs' },
	'bdrs-es': { prop: 'borderEndStartRadius', token: 'bdrs' },
	'bdrs-ee': { prop: 'borderEndEndRadius', token: 'bdrs' },

	bxsh: { prop: 'boxShadow', utils: { 0: 'none' }, token: 'bxsh', tokenClass: 1, bp: 1, alwaysVar: 1 },

	// position
	pos: {
		prop: 'position',
		presets: ['static', 'fixed', 'sticky'],
		utils: { rel: 'relative', abs: 'absolute' },
	},
	z: { prop: 'zIndex', presets: ['-1', '0', '1', '99'] },
	t: { prop: 'top', utils: { 0: '0%' }, presets: ['50%', '100%'], token: 'space' },
	l: { prop: 'left', utils: { 0: '0%' }, presets: ['50%', '100%'], token: 'space' },
	r: { prop: 'right', utils: { 0: '0%' }, presets: ['50%', '100%'], token: 'space' },
	b: { prop: 'bottom', utils: { 0: '0%' }, presets: ['50%', '100%'], token: 'space' },
	i: { prop: 'inset', utils: { 0: '0%' }, token: 'space' },
	'i-x': { prop: 'insetInline', token: 'space' },
	'i-y': { prop: 'insetBlock', token: 'space' },
	'i-x-s': { prop: 'insetInlineStart', token: 'space' },
	'i-x-e': { prop: 'insetInlineEnd', token: 'space' },
	'i-y-s': { prop: 'insetBlockStart', token: 'space' },
	'i-y-e': { prop: 'insetBlockEnd', token: 'space' },

	// space
	p: {
		prop: 'padding',
		presets: ['0'],
		token: 'space',
		tokenClass: 1,
		alwaysVar: 1,
		overwriteBaseVar: 1,
		bp: 1,
	},
	px: { prop: 'paddingInline', presets: ['0'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	py: { prop: 'paddingBlock', presets: ['0'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	'px-s': { prop: 'paddingInlineStart', token: 'space', bp: 1 },
	'px-e': { prop: 'paddingInlineEnd', token: 'space', bp: 1 },
	'py-s': { prop: 'paddingBlockStart', token: 'space', bp: 1 },
	'py-e': { prop: 'paddingBlockEnd', token: 'space', bp: 1 },
	pl: { prop: 'paddingLeft', token: 'space', bp: 1 },
	pr: { prop: 'paddingRight', token: 'space', bp: 1 },
	pt: { prop: 'paddingTop', token: 'space', bp: 1 },
	pb: { prop: 'paddingBottom', token: 'space', bp: 1 },
	m: {
		prop: 'margin',
		presets: ['auto', '0'],
		token: 'space',
		tokenClass: 1,
		alwaysVar: 1,
		overwriteBaseVar: 1,
		bp: 1,
	},
	mx: { prop: 'marginInline', presets: ['auto', '0'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	my: { prop: 'marginBlock', presets: ['auto', '0'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	'mx-s': { prop: 'marginInlineStart', presets: ['auto'], token: 'space', bp: 1 },
	'mx-e': { prop: 'marginInlineEnd', presets: ['auto'], token: 'space', bp: 1 },
	'my-s': { prop: 'marginBlockStart', token: 'space', bp: 1, presets: ['auto', '0'], tokenClass: 1 },
	'my-e': { prop: 'marginInlineEnd', presets: ['auto'], token: 'space', bp: 1 },
	ml: { prop: 'marginLeft', token: 'space', bp: 1 },
	mr: { prop: 'marginRight', token: 'space', bp: 1 },
	mt: { prop: 'marginTop', token: 'space', bp: 1 },
	mb: { prop: 'marginBottom', token: 'space', bp: 1 },

	g: {
		prop: 'gap',
		presets: ['0', 'inherit'],
		exUtility: { inherit: { gap: 'inherit' } },
		token: 'space',
		tokenClass: 1,
		alwaysVar: 1,
		overwriteBaseVar: 1,
		bp: 1,
	},
	'g-x': { prop: 'columnGap', token: 'space', bp: 1 },
	'g-y': { prop: 'rowGap', token: 'space', bp: 1 },
	cols: { isVar: 1, bp: 1 },
	rows: { isVar: 1, bp: 1 },

	// flex
	fxf: { prop: 'flexFlow' },
	fxw: { prop: 'flexWrap', presets: ['wrap'], bp: 1 },
	fxd: { prop: 'flexDirection', utils: { col: 'column', 'col-r': 'column-reverse', 'row-r': 'row-reverse' }, bp: 1 },
	fx: { prop: 'flex', presets: ['1'], bp: 1 },
	fxg: { prop: 'flexGrow', presets: ['1'] },
	fxsh: { prop: 'flexShrink', presets: ['0'] },
	fxb: { prop: 'flexBasis', bp: 1 },

	// grid
	// gd: { prop: 'grid' },
	gt: {
		prop: 'gridTemplate',
		presets: ['repeat'],
		exUtility: {
			repeat: {
				'grid-template': 'repeat(var(--rows,1), 1fr) / repeat(var(--cols,1), 1fr)',
			},
		},
		bp: 1,
	},
	gta: { prop: 'gridTemplateAreas', bp: 1 },
	gtc: {
		prop: 'gridTemplateColumns',
		presets: ['subgrid', 'liquid'],
		exUtility: {
			// repeat: { '--cols': '1', '--gtc': 'repeat(var(--cols), 1fr)' },
			liquid: { '--cols': 'var(--sz--min)', '--gtc': 'repeat(auto-fill, minmax(min(var(--cols), 100%), 1fr))' },
		},
		bp: 1,
	},
	gtr: {
		prop: 'gridTemplateRows',
		presets: ['subgrid'],
		// exUtility: { repeat: { '--rows': '1', '--gtr': 'repeat(var(--rows), 1fr)' } },
		bp: 1,
	},
	gaf: { prop: 'gridAutoFlow', utils: { row: 'row', col: 'column' }, bp: 1 }, //dense
	gac: { prop: 'gridAutoColumns' },
	gar: { prop: 'gridAutoRows' },

	// grid item
	ga: { prop: 'gridArea', utils: { '1/1': '1 / 1' }, bp: 1 },
	gc: { prop: 'gridColumn', utils: { '1/-1': '1 / -1' }, bp: 1 },
	gr: { prop: 'gridRow', utils: { '1/-1': '1 / -1' }, bp: 1 },
	gcs: { prop: 'gridColumnStart' },
	gce: { prop: 'gridColumnEnd' },
	grs: { prop: 'gridRowStart' },
	gre: { prop: 'gridRowEnd' },

	// places
	// -(ai|ac|ji|jc|aslf|jslf):   /    -$1:
	ai: {
		prop: 'alignItems',
		presets: [...PLACE_PRESETS, 'stretch'],
		utils: PLACE_UTILS,
		shorthands: PLACE_SHORTHANDS,
		bp: 1,
	},
	ac: {
		prop: 'alignContent',
		presets: PLACE_PRESETS,
		utils: { ...PLACE_UTILS, between: 'space-between' },
		shorthands: PLACE_SHORTHANDS,
		bp: 1,
	},
	ji: {
		prop: 'justifyItems',
		presets: [...PLACE_PRESETS, 'stretch'],
		utils: PLACE_UTILS,
		shorthands: PLACE_SHORTHANDS,
		bp: 1,
	},
	jc: {
		prop: 'justifyContent',
		presets: PLACE_PRESETS,
		utils: { ...PLACE_UTILS, between: 'space-between' },
		shorthands: PLACE_SHORTHANDS,
		bp: 1,
	},
	aslf: {
		prop: 'alignSelf',
		presets: [...PLACE_PRESETS, 'stretch'],
		shorthands: PLACE_SHORTHANDS,
	},
	jslf: {
		prop: 'justifySelf',
		presets: [...PLACE_PRESETS, 'stretch'],
		shorthands: PLACE_SHORTHANDS,
	},
	pi: { prop: 'placeItems' },
	pc: { prop: 'placeContent' },
	pslf: { prop: 'placeSelf' },
	order: { prop: 'order', presets: ['0', '-1', '1'] },

	// transform
	translate: {
		prop: 'translate',
		utils: {
			'-50X': '-50% 0',
			'-50Y': '0 -50%',
			'-50XY': '-50% -50%',
		},
	},
	//rtt
	rotate: {
		prop: 'rotate',
		utils: {
			[`45`]: '45deg',
			'-45': '-45deg',
			[`90`]: '90deg',
			'-90': '-90deg',
			// '180': '180deg',
		},
	},
	//scl
	scale: {
		prop: 'scale',
		utils: {
			'-X': '-1 1',
			'-Y': '1 -1',
			'-XY': '-1 -1',
		},
	},

	// others
	// msk: { prop: 'mask', bp: 1 },
	ovw: { prop: 'overflowWrap', utils: { any: 'anywhere' } },
	whitespace: { prop: 'whiteSpace', presets: ['nowrap'] },
	// wordbreak: { prop: 'wordBreak', utils: { keep: 'keep-all', all: 'break-all' } },
	writing: { prop: 'writingMode', token: 'writing', tokenClass: 1, bp: 1 },
	float: { prop: 'float', presets: ['left', 'right'] },
	clear: { prop: 'clear', presets: ['both'] },
	isolation: { prop: 'isolation', presets: ['isolate'] },

	// transition
	duration: { isVar: 1 },
	delay: { isVar: 1 },
	ease: { isVar: 1 },
};
