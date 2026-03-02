import { describe, expectTypeOf, it } from 'vitest';
import type { PropValueTypes, ResponsivePropValueTypes, NonResponsivePropValueTypes } from './PropValueTypes';
import type { Responsive } from './ResponsiveProps';

describe('PropValueTypes', () => {
	it('fs には presets の値を設定できる', () => {
		expectTypeOf<PropValueTypes['fs']>().toEqualTypeOf<'italic' | (string & {}) | number | boolean | null | undefined>();
	});

	it('fz には token の値（TOKENS.fz）を設定できる（レスポンシブ対応）', () => {
		// token: 'fz' → TOKENS.fz の値
		// bp: 1 なので Responsive でラップされる
		expectTypeOf<PropValueTypes['fz']>().toEqualTypeOf<
			Responsive<
				| 'root'
				| 'base'
				| '5xl'
				| '4xl'
				| '3xl'
				| '2xl'
				| 'xl'
				| 'l'
				| 'm'
				| 's'
				| 'xs'
				| '2xs'
				| (string & {})
				| number
				| boolean
				| null
				| undefined
			>
		>();
	});

	it('mx には presets と token（space）の値を設定できる（レスポンシブ対応）', () => {
		// presets: ['auto', '0']
		// token: 'space' → TOKENS.space.values の値
		// bp: 1 なので Responsive でラップされる
		expectTypeOf<PropValueTypes['mx']>().toEqualTypeOf<
			Responsive<
				| 'auto'
				| '0'
				| '5'
				| '10'
				| '15'
				| '20'
				| '30'
				| '40'
				| '50'
				| '60'
				| '70'
				| '80'
				| (string & {})
				| number
				| boolean
				| null
				| undefined
			>
		>();
	});

	it('m には presets と token（space）の値を設定できる（レスポンシブ対応）', () => {
		// bp: 1 なので Responsive でラップされる
		expectTypeOf<PropValueTypes['m']>().toEqualTypeOf<
			Responsive<
				| 'auto'
				| '0'
				| '5'
				| '10'
				| '15'
				| '20'
				| '30'
				| '40'
				| '50'
				| '60'
				| '70'
				| '80'
				| (string & {})
				| number
				| boolean
				| null
				| undefined
			>
		>();
	});

	it('d には presets と utils の値を設定できる（レスポンシブ対応）', () => {
		// bp: 1 なので Responsive でラップされる
		expectTypeOf<PropValueTypes['d']>().toEqualTypeOf<
			Responsive<'none' | 'block' | 'in-flex' | (string & {}) | number | boolean | null | undefined>
		>();
	});

	it('td には utils のキーを設定できる', () => {
		expectTypeOf<PropValueTypes['td']>().toEqualTypeOf<'none' | (string & {}) | number | boolean | null | undefined>();
	});

	it('pos には presets と utils の値を設定できる', () => {
		expectTypeOf<PropValueTypes['pos']>().toEqualTypeOf<
			'static' | 'fixed' | 'sticky' | 'rel' | 'abs' | (string & {}) | number | boolean | null | undefined
		>();
	});

	it('ai には presets と utils の値を設定できる（レスポンシブ対応）', () => {
		// presets: [...PLACE_PRESETS, 'stretch'] → 'start' | 'center' | 'end' | 'stretch'
		// utils: { 'flex-s': 'flex-start', 'flex-e': 'flex-end' }
		// bp: 1 なので Responsive でラップされる
		expectTypeOf<PropValueTypes['ai']>().toEqualTypeOf<
			Responsive<'start' | 'center' | 'end' | 'stretch' | 'flex-s' | 'flex-e' | (string & {}) | number | boolean | null | undefined>
		>();
	});

	it('bdrs には presets と token（bdrs）の値を設定できる（レスポンシブ対応）', () => {
		// presets: ['0']
		// token: 'bdrs' → TOKENS.bdrs の値
		// bp: 1 なので Responsive でラップされる
		expectTypeOf<PropValueTypes['bdrs']>().toEqualTypeOf<
			Responsive<'0' | '5' | '10' | '20' | '30' | '40' | '50' | '99' | 'inner' | (string & {}) | number | boolean | null | undefined>
		>();
	});

	it('presets も utils も token もないプロパティは string | number | boolean 型で含まれる', () => {
		// bg は presets/utils/token がないが、PropValueTypes に含まれる（string | number | boolean フォールバック）
		// bg は bp: 1 なので Responsive でラップされる
		expectTypeOf<PropValueTypes['bg']>().toEqualTypeOf<Responsive<string | number | boolean | undefined>>();
	});

	it('プリセット値を設定できる', () => {
		const props: PropValueTypes = {
			fs: 'italic',
			mx: 'auto',
			d: 'none',
		};
		expectTypeOf(props).toExtend<PropValueTypes>();
	});

	it('boolean 値（true）を設定できる（ユーティリティクラスのみ付与）', () => {
		const props: PropValueTypes = {
			bg: true,
			fs: true,
			d: true,
		};
		expectTypeOf(props).toExtend<PropValueTypes>();
	});

	it('トークン値を設定できる', () => {
		const props: PropValueTypes = {
			fz: 'xl',
			mx: '20',
			bdrs: '10',
		};
		expectTypeOf(props).toExtend<PropValueTypes>();
	});

	it('任意の文字列値を設定できる', () => {
		const props: PropValueTypes = {
			fs: 'oblique',
			mx: '20px',
			d: 'grid',
		};
		expectTypeOf(props).toExtend<PropValueTypes>();
	});
});

describe('ResponsivePropValueTypes', () => {
	it('bp: 1 が設定されているプロパティのみが含まれる', () => {
		type Props = ResponsivePropValueTypes;

		// bp: 1 が設定されているプロパティ（レスポンシブ対応）
		type FzExists = 'fz' extends keyof Props ? true : false;
		type DExists = 'd' extends keyof Props ? true : false;
		type WExists = 'w' extends keyof Props ? true : false;
		type HExists = 'h' extends keyof Props ? true : false;
		type ArExists = 'ar' extends keyof Props ? true : false;

		expectTypeOf<FzExists>().toEqualTypeOf<true>();
		expectTypeOf<DExists>().toEqualTypeOf<true>();
		expectTypeOf<WExists>().toEqualTypeOf<true>();
		expectTypeOf<HExists>().toEqualTypeOf<true>();
		expectTypeOf<ArExists>().toEqualTypeOf<true>();

		// bp: 1 が設定されていないプロパティ（含まれないはず）
		type FwExists = 'fw' extends keyof Props ? true : false;
		type FfExists = 'ff' extends keyof Props ? true : false;
		type FsExists = 'fs' extends keyof Props ? true : false;
		type TaExists = 'ta' extends keyof Props ? true : false;

		expectTypeOf<FwExists>().toEqualTypeOf<false>();
		expectTypeOf<FfExists>().toEqualTypeOf<false>();
		expectTypeOf<FsExists>().toEqualTypeOf<false>();
		expectTypeOf<TaExists>().toEqualTypeOf<false>();
	});

	it('fz プロパティの値の型を検証', () => {
		type Props = ResponsivePropValueTypes;
		type FzProp = Props['fz'];

		// fz は bp: 1 なので ResponsivePropValueTypes に含まれる
		// ResponsivePropValueTypes 自体は単一値のみを受け付ける
		expectTypeOf<FzProp>().toEqualTypeOf<
			| 'root'
			| 'base'
			| '5xl'
			| '4xl'
			| '3xl'
			| '2xl'
			| 'xl'
			| 'l'
			| 'm'
			| 's'
			| 'xs'
			| '2xs'
			| (string & {})
			| number
			| boolean
			| null
			| undefined
		>();
	});

	it('d プロパティの値の型を検証', () => {
		type Props = ResponsivePropValueTypes;
		type DProp = Props['d'];

		expectTypeOf<DProp>().toEqualTypeOf<'none' | 'block' | 'in-flex' | (string & {}) | number | boolean | null | undefined>();
	});
});

describe('NonResponsivePropValueTypes', () => {
	it('bp: 1 が設定されていないプロパティのみが含まれる', () => {
		type Props = NonResponsivePropValueTypes;

		// bp: 1 が設定されていないプロパティ（レスポンシブ非対応）
		type FwExists = 'fw' extends keyof Props ? true : false;
		type FfExists = 'ff' extends keyof Props ? true : false;
		type FsExists = 'fs' extends keyof Props ? true : false;
		type TaExists = 'ta' extends keyof Props ? true : false;

		expectTypeOf<FwExists>().toEqualTypeOf<true>();
		expectTypeOf<FfExists>().toEqualTypeOf<true>();
		expectTypeOf<FsExists>().toEqualTypeOf<true>();
		expectTypeOf<TaExists>().toEqualTypeOf<true>();

		// bp: 1 が設定されているプロパティ（含まれないはず）
		type FzExists = 'fz' extends keyof Props ? true : false;
		type DExists = 'd' extends keyof Props ? true : false;
		type WExists = 'w' extends keyof Props ? true : false;
		type HExists = 'h' extends keyof Props ? true : false;
		type ArExists = 'ar' extends keyof Props ? true : false;

		expectTypeOf<FzExists>().toEqualTypeOf<false>();
		expectTypeOf<DExists>().toEqualTypeOf<false>();
		expectTypeOf<WExists>().toEqualTypeOf<false>();
		expectTypeOf<HExists>().toEqualTypeOf<false>();
		expectTypeOf<ArExists>().toEqualTypeOf<false>();
	});

	it('fw プロパティの値の型を検証', () => {
		// fw は bp未設定なので NonResponsivePropValueTypes に含まれる
		// fw のtoken値は TOKENS.fw = ['thin', 'light', 'normal', 'medium', 'bold', 'black']
		expectTypeOf<NonResponsivePropValueTypes['fw']>().toEqualTypeOf<
			'thin' | 'light' | 'normal' | 'medium' | 'bold' | 'black' | (string & {}) | number | boolean | null | undefined
		>();
	});

	it('fs プロパティの値の型を検証', () => {
		// fs は bp未設定なので NonResponsivePropValueTypes に含まれる
		expectTypeOf<NonResponsivePropValueTypes['fs']>().toEqualTypeOf<'italic' | (string & {}) | number | boolean | null | undefined>();
	});
});
