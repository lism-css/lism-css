import { describe, expectTypeOf, it } from 'vitest';
import type { TokenProps, InternalTokenProps } from './TokenProps';

describe('TokenProps', () => {
	it('fz にはトークン値または任意の文字列を設定できる', () => {
		expectTypeOf<TokenProps['fz']>().toEqualTypeOf<
			'root' | 'base' | '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'l' | 'm' | 's' | 'xs' | '2xs' | (string & {}) | undefined
		>();
	});

	it('lh にはトークン値または任意の文字列を設定できる', () => {
		expectTypeOf<TokenProps['lh']>().toEqualTypeOf<'base' | 'xs' | 's' | 'l' | (string & {}) | undefined>();
	});

	it('bdrs にはトークン値または任意の文字列を設定できる', () => {
		expectTypeOf<TokenProps['bdrs']>().toEqualTypeOf<
			'5' | '10' | '20' | '30' | '40' | '50' | '99' | 'inner' | (string & {}) | undefined
		>();
	});

	it('space はオブジェクト形式なので TokenProps に含まれない', () => {
		// @ts-expect-error space は TokenProps に存在しない
		type _SpaceType = TokenProps['space'];
	});

	it('c はオブジェクト形式なので TokenProps に含まれない', () => {
		// @ts-expect-error c は TokenProps に存在しない
		type _CType = TokenProps['c'];
	});

	it('palette はオブジェクト形式なので TokenProps に含まれない', () => {
		// @ts-expect-error palette は TokenProps に存在しない
		type _PaletteType = TokenProps['palette'];
	});

	it('任意の文字列値を設定できる', () => {
		const props: TokenProps = {
			fz: 'custom-size',
			lh: '1.5',
			bdrs: '100px',
		};
		expectTypeOf(props).toExtend<TokenProps>();
	});

	it('トークン値を設定できる', () => {
		const props: TokenProps = {
			fz: 'xl',
			lh: 'base',
			bdrs: '10',
			fw: 'bold',
			ff: 'mono',
		};
		expectTypeOf(props).toExtend<TokenProps>();
	});
});

describe('InternalTokenProps', () => {
	it('space には values のトークン値または任意の文字列を設定できる', () => {
		expectTypeOf<InternalTokenProps['space']>().toEqualTypeOf<
			'5' | '10' | '15' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | (string & {}) | undefined
		>();
	});

	it('c には values のトークン値または任意の文字列を設定できる', () => {
		expectTypeOf<InternalTokenProps['c']>().toEqualTypeOf<
			'base' | 'base-2' | 'text' | 'text-2' | 'divider' | 'link' | 'brand' | 'accent' | (string & {}) | undefined
		>();
	});

	it('palette には values のトークン値または任意の文字列を設定できる', () => {
		expectTypeOf<InternalTokenProps['palette']>().toEqualTypeOf<
			| 'red'
			| 'blue'
			| 'green'
			| 'yellow'
			| 'purple'
			| 'orange'
			| 'pink'
			| 'gray'
			| 'white'
			| 'black'
			| 'keycolor'
			| (string & {})
			| undefined
		>();
	});

	it('fz は配列形式なので InternalTokenProps に含まれない', () => {
		// @ts-expect-error fz は InternalTokenProps に存在しない
		type _FzType = InternalTokenProps['fz'];
	});

	it('トークン値を設定できる', () => {
		const props: InternalTokenProps = {
			space: '20',
			c: 'text',
			palette: 'blue',
		};
		expectTypeOf(props).toExtend<InternalTokenProps>();
	});

	it('任意の文字列値を設定できる', () => {
		const props: InternalTokenProps = {
			space: 'custom',
			c: 'custom-color',
			palette: 'custom-palette',
		};
		expectTypeOf(props).toExtend<InternalTokenProps>();
	});
});
