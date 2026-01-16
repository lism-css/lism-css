import { describe, expectTypeOf, it } from 'vitest';
import type { PropValueTypes, PropKeys, AllPropTypes } from './PropValueTypes';

describe('PropValueTypes', () => {
	it('fs には presets の値を設定できる', () => {
		expectTypeOf<PropValueTypes['fs']>().toEqualTypeOf<'italic' | (string & {}) | undefined>();
	});

	it('fz には token の値（TOKENS.fz）を設定できる', () => {
		// token: 'fz' → TOKENS.fz の値
		expectTypeOf<PropValueTypes['fz']>().toEqualTypeOf<
			'root' | 'base' | '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'l' | 'm' | 's' | 'xs' | '2xs' | (string & {}) | undefined
		>();
	});

	it('mx には presets と token（space）の値を設定できる', () => {
		// presets: ['auto', '0']
		// token: 'space' → TOKENS.space.values の値
		expectTypeOf<PropValueTypes['mx']>().toEqualTypeOf<
			'auto' | '0' | '5' | '10' | '15' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | (string & {}) | undefined
		>();
	});

	it('m には presets と token（space）の値を設定できる', () => {
		expectTypeOf<PropValueTypes['m']>().toEqualTypeOf<
			'auto' | '0' | '5' | '10' | '15' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | (string & {}) | undefined
		>();
	});

	it('d には presets と utils の値を設定できる', () => {
		expectTypeOf<PropValueTypes['d']>().toEqualTypeOf<
			'none' | 'block' | 'in-flex' | (string & {}) | undefined
		>();
	});

	it('td には utils のキーを設定できる', () => {
		expectTypeOf<PropValueTypes['td']>().toEqualTypeOf<'none' | (string & {}) | undefined>();
	});

	it('pos には presets と utils の値を設定できる', () => {
		expectTypeOf<PropValueTypes['pos']>().toEqualTypeOf<
			'static' | 'fixed' | 'sticky' | 'rel' | 'abs' | (string & {}) | undefined
		>();
	});

	it('ai には presets と utils の値を設定できる', () => {
		// presets: [...PLACE_PRESETS, 'stretch'] → 'start' | 'center' | 'end' | 'stretch'
		// utils: { 'flex-s': 'flex-start', 'flex-e': 'flex-end' }
		expectTypeOf<PropValueTypes['ai']>().toEqualTypeOf<
			'start' | 'center' | 'end' | 'stretch' | 'flex-s' | 'flex-e' | (string & {}) | undefined
		>();
	});

	it('bdrs には presets と token（bdrs）の値を設定できる', () => {
		// presets: ['0']
		// token: 'bdrs' → TOKENS.bdrs の値
		expectTypeOf<PropValueTypes['bdrs']>().toEqualTypeOf<
			'0' | '5' | '10' | '20' | '30' | '40' | '50' | '99' | 'inner' | (string & {}) | undefined
		>();
	});

	it('presets も utils も token もないプロパティは含まれない', () => {
		// bg は presets/utils/token がないので PropValueTypes に含まれない
		// @ts-expect-error bg は PropValueTypes に存在しない
		type _BgType = PropValueTypes['bg'];
	});

	it('プリセット値を設定できる', () => {
		const props: PropValueTypes = {
			fs: 'italic',
			mx: 'auto',
			d: 'none',
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

describe('PropKeys', () => {
	it('PROPS のすべてのキーが含まれる', () => {
		// いくつかのキーをチェック
		type ShouldInclude = 'fs' | 'mx' | 'd' | 'bg' | 'p' | 'm' | 'g' | 'ai' | 'jc';
		expectTypeOf<ShouldInclude>().toExtend<PropKeys>();
	});
});

describe('AllPropTypes', () => {
	it('PROPS のすべてのプロパティを持つ', () => {
		const props: AllPropTypes = {
			fs: 'italic',
			mx: '20px',
			d: 'flex',
			bg: 'red',
			p: '10px',
		};
		expectTypeOf(props).toExtend<AllPropTypes>();
	});
});
