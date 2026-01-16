import { describe, expectTypeOf, it } from 'vitest';
import type { Responsive, MakeResponsive } from './ResponsiveProps';

describe('Responsive', () => {
	it('単一値を受け付ける', () => {
		const value: Responsive<'s' | 'm' | 'l'> = 'm';
		expectTypeOf(value).toMatchTypeOf<Responsive<'s' | 'm' | 'l'>>();
	});

	it('配列形式を受け付ける', () => {
		const value: Responsive<'s' | 'm' | 'l'> = ['s', 'm', 'l'];
		expectTypeOf(value).toMatchTypeOf<Responsive<'s' | 'm' | 'l'>>();
	});

	it('ブレイクポイントオブジェクトを受け付ける', () => {
		const value: Responsive<'s' | 'm' | 'l'> = { base: 's', md: 'l' };
		expectTypeOf(value).toMatchTypeOf<Responsive<'s' | 'm' | 'l'>>();
	});

	it('全てのブレイクポイントキーを使用できる', () => {
		const value: Responsive<string> = {
			base: 'base-value',
			sm: 'sm-value',
			md: 'md-value',
			lg: 'lg-value',
			xl: 'xl-value',
		};
		expectTypeOf(value).toMatchTypeOf<Responsive<string>>();
	});

	it('number 型でも動作する', () => {
		const single: Responsive<number> = 10;
		const array: Responsive<number> = [10, 20, 30];
		const object: Responsive<number> = { base: 10, md: 20 };

		expectTypeOf(single).toMatchTypeOf<Responsive<number>>();
		expectTypeOf(array).toMatchTypeOf<Responsive<number>>();
		expectTypeOf(object).toMatchTypeOf<Responsive<number>>();
	});

	it('boolean 型でも動作する', () => {
		const single: Responsive<boolean> = true;
		const array: Responsive<boolean> = [true, false, true];
		const object: Responsive<boolean> = { base: true, md: false };

		expectTypeOf(single).toMatchTypeOf<Responsive<boolean>>();
		expectTypeOf(array).toMatchTypeOf<Responsive<boolean>>();
		expectTypeOf(object).toMatchTypeOf<Responsive<boolean>>();
	});

	it('配列は最大5要素まで許可される', () => {
		const one: Responsive<string> = ['a'];
		const two: Responsive<string> = ['a', 'b'];
		const three: Responsive<string> = ['a', 'b', 'c'];
		const four: Responsive<string> = ['a', 'b', 'c', 'd'];
		const five: Responsive<string> = ['a', 'b', 'c', 'd', 'e'];

		expectTypeOf(one).toMatchTypeOf<Responsive<string>>();
		expectTypeOf(two).toMatchTypeOf<Responsive<string>>();
		expectTypeOf(three).toMatchTypeOf<Responsive<string>>();
		expectTypeOf(four).toMatchTypeOf<Responsive<string>>();
		expectTypeOf(five).toMatchTypeOf<Responsive<string>>();
	});

	it('6要素以上の配列は型エラーになる', () => {
		// @ts-expect-error 6要素以上は許可されない
		const six: Responsive<string> = ['a', 'b', 'c', 'd', 'e', 'f'];
		expectTypeOf(six).toMatchTypeOf<Responsive<string>>();
	});
});

describe('MakeResponsive', () => {
	type OriginalProps = {
		fz: 's' | 'm' | 'l';
		color: string;
		spacing: number;
	};

	type ResponsiveProps = MakeResponsive<OriginalProps>;

	it('各プロパティが optional になる', () => {
		const props: ResponsiveProps = {};
		expectTypeOf(props).toMatchTypeOf<ResponsiveProps>();
	});

	it('各プロパティに単一値を設定できる', () => {
		const props: ResponsiveProps = {
			fz: 'm',
			color: 'red',
			spacing: 10,
		};
		expectTypeOf(props).toMatchTypeOf<ResponsiveProps>();
	});

	it('各プロパティに配列形式を設定できる', () => {
		const props: ResponsiveProps = {
			fz: ['s', 'm', 'l'],
			color: ['red', 'blue'],
			spacing: [10, 20, 30],
		};
		expectTypeOf(props).toMatchTypeOf<ResponsiveProps>();
	});

	it('各プロパティにブレイクポイントオブジェクトを設定できる', () => {
		const props: ResponsiveProps = {
			fz: { base: 's', md: 'l' },
			color: { base: 'red', lg: 'blue' },
			spacing: { base: 10, sm: 15, md: 20 },
		};
		expectTypeOf(props).toMatchTypeOf<ResponsiveProps>();
	});

	it('混在した形式を設定できる', () => {
		const props: ResponsiveProps = {
			fz: 'm', // 単一値
			color: ['red', 'blue'], // 配列
			spacing: { base: 10, md: 20 }, // オブジェクト
		};
		expectTypeOf(props).toMatchTypeOf<ResponsiveProps>();
	});
});
