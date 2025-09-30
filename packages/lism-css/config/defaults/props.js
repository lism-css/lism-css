/**
 * isVar: 1 → クラス出力はせずstyle属性での変数出力のみ (--bdw, --keycolor など)
 * bp: 0 → Prop-valユーティリティクラス化されなければ、style属性で出力するだけ。
 * bp: 1 → .-prop と --prop の セットがベースにあり、.-prop_bp と .--prop_bp で ブレイクポイント指定できる。
 *       .-prop{propaty:var(--prop)} が基本で、ユーティリティクラスは .-prop:val{propaty:value} となる。
 *
 * ↓コンポーネント処理で使用される
 * tokenClass: 1 → 対応するトークン値がそのまま全てユーティリティクラス化されるもの。
 *
 * ↓SCSS出力で使用される
 * alwaysVar: 1 → .-prop,[class*=-prop:] {propaty:var(--prop)} で、ユーティリティクラス時も常に変数管理となる。
 * overwriteBaseVar: 1 → ブレイクポイントクラスで --prop: var(--prop_$bp) がセットされ、常にベース変数の --prop で値が取得できるようになる。
 * skipSCSS: 1 → scssのオート生成をスキップ（少し複雑で手動で記述するもの）
 * important: 1 → !important を付けて最終的に出力する
 */
export default {
	f: { prop: 'font', presets: ['inherit'] },
	fz: { prop: 'fontSize', token: 'fz', tokenClass: 1, bp: 1, alwaysVar: 1 },
	lh: { prop: 'lineHeight', presets: ['1'], token: 'lh', tokenClass: 1, bp: 1, alwaysVar: 1 },
	fw: {
		prop: 'fontWeight',
		presets: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
		token: 'fw',
		tokenClass: 1,
	},
	ff: { prop: 'fontFamily', token: 'ff', tokenClass: 1 },
	fs: { prop: 'fontStyle', utils: { i: 'italic' } },
	lts: { prop: 'letterSpacing', token: 'lts', tokenClass: 1 },
	ta: { prop: 'textAlign', utils: { c: 'center', l: 'left', r: 'right' } },
	td: { prop: 'textDecoration', utils: { u: 'underline', n: 'none' } },

	// size
	w: { prop: 'width', utils: { fit: 'fit-content' }, presets: ['100%'], token: 'size', bp: 1 },
	h: { prop: 'height', utils: { fit: 'fit-content' }, presets: ['100%'], token: 'size', bp: 1 },
	maxW: { prop: 'maxWidth', presets: ['100%'], token: 'size', bp: 1 },
	maxH: { prop: 'maxHeight', presets: ['100%'], token: 'size', bp: 1 },
	minW: { prop: 'minWidth', presets: ['100%'], token: 'size', bp: 1 },
	minH: { prop: 'minHeight', presets: ['100%'], token: 'size', bp: 1 },
	isz: { prop: 'inlineSize', token: 'size' },
	bsz: { prop: 'blockSize', token: 'size' },
	maxIsz: { prop: 'maxInlineSize', token: 'size' },
	maxBsz: { prop: 'maxBlockSize', token: 'size' },
	minIsz: { prop: 'minInlineSize', token: 'size' },
	minBsz: { prop: 'minBlockSize', token: 'size' },

	// bg
	bg: { prop: 'background', utils: { none: 'n' }, bp: 1 },
	bgi: { prop: 'backgroundImage', bp: 1 },
	bgr: { prop: 'backgroundRepeat', utils: { n: 'no-repeat' } },
	bgp: { prop: 'backgroundPosition', utils: { c: 'center' } },
	bgsz: { prop: 'backgroundSize', utils: { cv: 'cover', ct: 'contain' } },
	bga: { prop: 'backgroundAttachment' },
	bgo: { prop: 'backgroundOrigin' },
	bgbm: { prop: 'backgroundBlendMode' },
	bgcp: {
		prop: 'backgroundClip',
		presets: ['text'],
		exUtility: {
			text: {
				color: 'transparent',
				'background-clip': 'text',
			},
		},
	},
	bgc: {
		prop: 'backgroundColor',
		presets: ['base', 'base-2', 'text', 'inherit', 'main', 'accent'],
		token: 'color',
		exUtility: {
			inherit: { 'background-color': 'inherit' }, // --c ではなく color で出力したい
		},
		alwaysVar: 1,
	},

	c: {
		// Note: bg系（bgcp）より後にくるように。
		prop: 'color',
		presets: ['base', 'text', 'text-2', 'main', 'accent', 'inherit'],
		token: 'color',
		exUtility: {
			inherit: { color: 'inherit' }, // --c ではなく color で出力したい
			// mix: {
			// 	'--_c1': 'currentColor',
			// 	'--_c2': 'transparent',
			// 	'--c': 'color-mix(in srgb, var(--_c1) var(--_mix-c, 50%), var(--_c2))',
			// },
		},
		alwaysVar: 1,
	},
	keycolor: { isVar: 1, token: 'color' },
	bd: {
		prop: 'border',
		skipSCSS: 1,
		utils: {
			none: 'none',
			x: 'x',
			y: 'block',
			is: 'inline-start',
			ie: 'ie',
			bs: 'block-start',
			be: 'block-end',
			l: 'left',
			r: 'right',
			t: 'top',
			b: 'bottom',
		},
	},
	bds: { isVar: 1, utils: { ds: 'dashed', dt: 'dotted', db: 'double' } },
	bdc: {
		isVar: 1,
		presets: ['inherit', 'main', 'accent', 'line'],
		token: 'color',
	},
	bdw: { isVar: 1, bp: 1 }, // --bdw のみ

	d: {
		prop: 'display',
		utils: {
			n: 'none',
			b: 'block',
			f: 'flex',
			g: 'grid',
			i: 'inline',
			if: 'inline-flex',
			ib: 'inline-block',
		},
		bp: 1,
	},

	op: { prop: 'opacity', presets: ['0'], token: 'op', tokenClass: 1 },
	v: { prop: 'visibility', utils: { h: 'hidden', v: 'visible' } },
	ov: { prop: 'overflow', utils: { h: 'hidden', a: 'auto', c: 'clip', s: 'scroll' } },
	ovx: { prop: 'overflowX', utils: { h: 'hidden', a: 'auto', c: 'clip', s: 'scroll' } },
	ovy: { prop: 'overflowY', utils: { h: 'hidden', a: 'auto', c: 'clip', s: 'scroll' } },
	// overflow-clip-margin → safariで使えない
	ar: {
		prop: 'aspectRatio',
		presets: ['16/9', '3/2', '1/1', 'ogp'], // 4/3, 2/1
		bp: 1,
	},

	bxsh: { prop: 'boxShadow', utils: { 0: 'none' }, token: 'bxsh', tokenClass: 1, bp: 1, alwaysVar: 1 },
	bdrs: {
		prop: 'borderRadius',
		presets: ['0'],
		token: 'bdrs',
		tokenClass: 1,
		bp: 1,
		alwaysVar: 1,
		overwriteBaseVar: 1,
	},

	// position
	pos: {
		prop: 'position',
		utils: {
			r: 'relative',
			a: 'absolute',
			s: 'static',
			f: 'fixed',
			sti: 'sticky',
		},
	},
	z: { prop: 'zIndex', presets: ['-1', '0', '1', '2', '99'] },
	t: { prop: 'top', utils: { 0: '0%' }, presets: ['50%', '100%'], token: 'space' },
	l: { prop: 'left', utils: { 0: '0%' }, presets: ['50%', '100%'], token: 'space' },
	r: { prop: 'right', utils: { 0: '0%' }, presets: ['50%', '100%'], token: 'space' },
	b: { prop: 'bottom', utils: { 0: '0%' }, presets: ['50%', '100%'], token: 'space' },
	i: { prop: 'inset', utils: { 0: '0%' }, token: 'space' },
	// iso: { prop: 'isolation', utils: { isolate: 'i' } },

	// space
	p: {
		prop: 'padding',
		token: 'space',
		tokenClass: 1,
		alwaysVar: 1,
		overwriteBaseVar: 1,
		bp: 1,
	},
	px: { prop: 'paddingInline', token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	py: { prop: 'paddingBlock', token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	pis: { prop: 'paddingInlineStart', token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	pbs: { prop: 'paddingBlockStart', token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	pie: { prop: 'paddingInlineEnd', token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	pbe: { prop: 'paddingInlineStart', token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	pl: { prop: 'paddingLeft', token: 'space' },
	pr: { prop: 'paddingRight', token: 'space' },
	pt: { prop: 'paddingTop', token: 'space' },
	pb: { prop: 'paddingBottom', token: 'space' },
	m: {
		prop: 'margin',
		presets: ['auto'],
		token: 'space',
		tokenClass: 1,
		alwaysVar: 1,
		overwriteBaseVar: 1,
		bp: 1,
	},
	mx: { prop: 'marginInline', presets: ['auto'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	my: { prop: 'marginBlock', presets: ['auto'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	mis: { prop: 'marginInlineStart', presets: ['auto'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	mbs: { prop: 'marginBlockStart', presets: ['auto'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	mie: { prop: 'marginInlineEnd', presets: ['auto'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	mbe: { prop: 'marginInlineStart', presets: ['auto'], token: 'space', tokenClass: 1, alwaysVar: 1, bp: 1 },
	ml: { prop: 'marginLeft', token: 'space' },
	mr: { prop: 'marginRight', token: 'space' },
	mt: { prop: 'marginTop', token: 'space' },
	mb: { prop: 'marginBottom', token: 'space' },

	g: {
		prop: 'gap',
		token: 'space',
		tokenClass: 1,
		alwaysVar: 1,
		overwriteBaseVar: 1,
		bp: 1,
	},
	gx: { prop: 'columnGap', token: 'space', bp: 1 },
	gy: { prop: 'rowGap', token: 'space', bp: 1 },
	cols: { isVar: 1, bp: 1 },
	rows: { isVar: 1, bp: 1 },

	// flex
	fxf: { prop: 'flexFlow' },
	fxw: {
		prop: 'flexWrap',
		bp: 1,
		utils: { w: 'wrap', n: 'nowrap' },
	},
	fxd: {
		prop: 'flexDirection',
		bp: 1,
		utils: { c: 'column', cr: 'column-reverse', r: 'row', rr: 'row-reverse' },
	},
	fx: { prop: 'flex', bp: 1, presets: ['1'] },
	fxg: { prop: 'flexGrow', presets: ['1'] },
	fxsh: { prop: 'flexShrink', presets: ['0'] },
	fxb: { prop: 'flexBasis', bp: 1 },

	// grid
	// gd: { prop: 'grid' },
	gt: { prop: 'gridTemplate' },
	gta: { prop: 'gridTemplateAreas', bp: 1 },
	gtc: { prop: 'gridTemplateColumns', presets: ['subgrid'], bp: 1 },
	gtr: { prop: 'gridTemplateRows', presets: ['subgrid'], bp: 1 },
	gaf: { prop: 'gridAutoFlow', bp: 1 }, // utils: { r: 'row', c: 'col' }, //dense
	gac: { prop: 'gridAutoColumns', bp: 1 },
	gar: { prop: 'gridAutoRows', bp: 1 },

	// grid item
	ga: { prop: 'gridArea', bp: 1, presets: ['1/1'] },
	gc: { prop: 'gridColumn', bp: 1, presets: ['1/-1'] },
	gr: { prop: 'gridRow', bp: 1, presets: ['1/-1'] },
	gcs: { prop: 'gridColumnStart' },
	gce: { prop: 'gridColumnEnd' },
	grs: { prop: 'gridRowStart' },
	gre: { prop: 'gridRowEnd' },

	// places
	ai: {
		prop: 'alignItems',
		bp: 1,
		utils: { c: 'center', s: 'start', e: 'end', 'fx-s': 'flex-start', 'fx-e': 'flex-end', stretch: 'stretch' },
	},
	ac: {
		prop: 'alignContent',
		bp: 1,
		utils: { c: 'center', s: 'start', e: 'end', 'fx-s': 'flex-start', 'fx-e': 'flex-end', between: 'space-between' },
	},
	ji: {
		prop: 'justifyItems',
		bp: 1,
		utils: { c: 'center', s: 'start', e: 'end', 'fx-s': 'flex-start', 'fx-e': 'flex-end', stretch: 'stretch' },
	},
	jc: {
		prop: 'justifyContent',
		bp: 1,
		utils: { c: 'center', s: 'start', e: 'end', 'fx-s': 'flex-start', 'fx-e': 'flex-end', between: 'space-between' },
	},
	aslf: {
		prop: 'alignSelf',
		utils: { c: 'center', s: 'start', e: 'end', stretch: 'stretch' },
	},
	jslf: {
		prop: 'justifySelf',
		utils: { c: 'center', s: 'start', e: 'end', stretch: 'stretch' },
	},
	pi: { prop: 'placeItems' },
	pc: { prop: 'placeContent' },
	pslf: { prop: 'placeSelf' },
	ord: { prop: 'order', presets: ['0', '-1', '1'] },

	// transition
	trs: { prop: 'transition', skipSCSS: 1 },
	// trsdu: { prop: '--trsdu' },
	// trsp: { prop: '--trsp' },
	// trspt: {
	// 	prop: '--trspt',
	// 	// utils: { 'ease-in': 'in', 'ease-out': 'out', 'ease-in-out': 'in-out', linear: 'linear' },
	// },

	// transform
	trnslt: {
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
	msk: { prop: 'mask', bp: 1 },
	whs: { prop: 'whiteSpace', utils: { nw: 'nowrap' } },
	ovw: { prop: 'overflowWrap', utils: { any: 'anywhere' } },
	fl: { prop: 'float', utils: { l: 'left', r: 'right' } },
	cl: { prop: 'clear', utils: { b: 'both' } },
};
