import { describe, expectTypeOf, it } from 'vitest';
import type { PropValueTypes, PropKeys, AllPropTypes } from './PropValueTypes';

describe('PropValueTypes', () => {
	it('fs には presets の値を設定できる', () => {
		expectTypeOf<PropValueTypes['fs']>().toEqualTypeOf<'italic' | (string & {}) | undefined>();
	});

	it('mx には presets の値を設定できる', () => {
		expectTypeOf<PropValueTypes['mx']>().toEqualTypeOf<'auto' | '0' | (string & {}) | undefined>();
	});

	it('m には presets の値を設定できる', () => {
		expectTypeOf<PropValueTypes['m']>().toEqualTypeOf<'auto' | '0' | (string & {}) | undefined>();
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

	it('presets も utils もないプロパティは含まれない', () => {
		// bg は presets/utils がないので PropValueTypes に含まれない
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
