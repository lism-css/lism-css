import { describe, expectTypeOf, it } from 'vitest';
import type { LimitedArray, WithArbitraryString, ArrayElement, ObjectValuesElement } from './utils';

describe('LimitedArray', () => {
	it('最大3要素の配列型を生成できる', () => {
		type Max3 = LimitedArray<string, 3>;

		const one: Max3 = ['a'];
		const two: Max3 = ['a', 'b'];
		const three: Max3 = ['a', 'b', 'c'];

		expectTypeOf(one).toMatchTypeOf<Max3>();
		expectTypeOf(two).toMatchTypeOf<Max3>();
		expectTypeOf(three).toMatchTypeOf<Max3>();
	});

	it('上限を超える配列は型エラーになる', () => {
		type Max3 = LimitedArray<string, 3>;

		// @ts-expect-error 4要素以上は許可されない
		const four: Max3 = ['a', 'b', 'c', 'd'];
		expectTypeOf(four).toMatchTypeOf<Max3>();
	});

	it('number 型でも動作する', () => {
		type Max2Numbers = LimitedArray<number, 2>;

		const one: Max2Numbers = [1];
		const two: Max2Numbers = [1, 2];

		expectTypeOf(one).toMatchTypeOf<Max2Numbers>();
		expectTypeOf(two).toMatchTypeOf<Max2Numbers>();
	});

	it('union 型でも動作する', () => {
		type Max2Union = LimitedArray<'a' | 'b' | 'c', 2>;

		const one: Max2Union = ['a'];
		const two: Max2Union = ['a', 'b'];
		const mixed: Max2Union = ['a', 'c'];

		expectTypeOf(one).toMatchTypeOf<Max2Union>();
		expectTypeOf(two).toMatchTypeOf<Max2Union>();
		expectTypeOf(mixed).toMatchTypeOf<Max2Union>();
	});
});

describe('WithArbitraryString', () => {
	it('リテラル型を維持しつつ任意の文字列も受け付ける', () => {
		type Size = WithArbitraryString<'s' | 'm' | 'l'>;

		const preset: Size = 's';
		const custom: Size = 'custom-value';

		expectTypeOf(preset).toMatchTypeOf<Size>();
		expectTypeOf(custom).toMatchTypeOf<Size>();
	});

	it('リテラル型がサジェストされる（型チェック）', () => {
		type Size = WithArbitraryString<'s' | 'm' | 'l'>;

		// 's' | 'm' | 'l' | (string & {}) になる
		expectTypeOf<Size>().toMatchTypeOf<'s' | 'm' | 'l' | (string & {})>();
	});
});

describe('ArrayElement', () => {
	it('readonly 配列から要素の型を抽出できる', () => {
		type Element = ArrayElement<readonly ['a', 'b', 'c']>;
		expectTypeOf<Element>().toEqualTypeOf<'a' | 'b' | 'c'>();
	});

	it('通常の配列からも要素の型を抽出できる', () => {
		type Element = ArrayElement<string[]>;
		expectTypeOf<Element>().toEqualTypeOf<string>();
	});

	it('配列でない型は never になる', () => {
		type NotArray = ArrayElement<string>;
		expectTypeOf<NotArray>().toEqualTypeOf<never>();
	});
});

describe('ObjectValuesElement', () => {
	it('values プロパティから要素の型を抽出できる', () => {
		type Element = ObjectValuesElement<{ values: readonly ['a', 'b', 'c'] }>;
		expectTypeOf<Element>().toEqualTypeOf<'a' | 'b' | 'c'>();
	});

	it('values プロパティがないオブジェクトは never になる', () => {
		type NoValues = ObjectValuesElement<{ other: string }>;
		expectTypeOf<NoValues>().toEqualTypeOf<never>();
	});

	it('他のプロパティがあっても values から抽出できる', () => {
		type Element = ObjectValuesElement<{ pre: string; values: readonly ['x', 'y'] }>;
		expectTypeOf<Element>().toEqualTypeOf<'x' | 'y'>();
	});
});
