import { describe, test, expect } from 'vitest';
import getMaybeTokenValue from './getMaybeTokenValue';

describe('getMaybeTokenValue', () => {
	describe('基本的な動作', () => {
		test('tokenKey が文字列でない場合、値をそのまま返す', () => {
			const TOKENS = {};
			expect(getMaybeTokenValue(null, 'value', TOKENS)).toBe('value');
			expect(getMaybeTokenValue(undefined, 'value', TOKENS)).toBe('value');
			expect(getMaybeTokenValue(123, 'value', TOKENS)).toBe('value');
		});

		test('TOKENS に tokenKey が存在しない場合、値をそのまま返す', () => {
			const TOKENS = { foo: new Set(['bar']) };
			expect(getMaybeTokenValue('notfound', 'value', TOKENS)).toBe('value');
		});
	});

	describe('Set 形式の tokenValues', () => {
		test('値が Set に含まれる場合、CSS変数を返す', () => {
			const TOKENS = {
				space: new Set(['10', '20', '30']),
			};
			expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('var(--space--10)');
			expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--space--20)');
		});

		test('値が Set に含まれない場合、値をそのまま返す', () => {
			const TOKENS = {
				space: new Set(['10', '20']),
			};
			expect(getMaybeTokenValue('space', '40', TOKENS)).toBe('40');
		});

		test('数値は文字列化してから判定される', () => {
			const TOKENS = {
				size: new Set(['10', '20', '30']),
			};
			expect(getMaybeTokenValue('size', 10, TOKENS)).toBe('var(--size--10)');
			expect(getMaybeTokenValue('size', 20, TOKENS)).toBe('var(--size--20)');
		});

		test('マイナスの値は n プレフィックスに変換される', () => {
			const TOKENS = {
				margin: new Set(['-10', '-20']),
			};
			expect(getMaybeTokenValue('margin', '-10', TOKENS)).toBe('var(--margin--n10)');
			expect(getMaybeTokenValue('margin', '-20', TOKENS)).toBe('var(--margin--n20)');
		});

		test('マイナスの数値も n プレフィックスに変換される', () => {
			const TOKENS = {
				margin: new Set(['-10', '-20']),
			};
			expect(getMaybeTokenValue('margin', -10, TOKENS)).toBe('var(--margin--n10)');
			expect(getMaybeTokenValue('margin', -20, TOKENS)).toBe('var(--margin--n20)');
		});
	});

	describe('Array 形式の tokenValues', () => {
		test('値が配列に含まれる場合、CSS変数を返す', () => {
			const TOKENS = {
				space: ['10', '20', '30'],
			};
			expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('var(--space--10)');
			expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--space--20)');
		});

		test('値が配列に含まれない場合、値をそのまま返す', () => {
			const TOKENS = {
				space: ['10', '20'],
			};
			expect(getMaybeTokenValue('space', '40', TOKENS)).toBe('40');
		});

		test('数値は文字列化してから判定される', () => {
			const TOKENS = {
				size: ['10', '20', '30'],
			};
			expect(getMaybeTokenValue('size', 10, TOKENS)).toBe('var(--size--10)');
			expect(getMaybeTokenValue('size', 20, TOKENS)).toBe('var(--size--20)');
		});

		test('マイナスの値は n プレフィックスに変換される', () => {
			const TOKENS = {
				margin: ['-10', '-20'],
			};
			expect(getMaybeTokenValue('margin', '-10', TOKENS)).toBe('var(--margin--n10)');
			expect(getMaybeTokenValue('margin', '-20', TOKENS)).toBe('var(--margin--n20)');
		});
	});

	describe('Object 形式の tokenValues', () => {
		test('pre と values を持つオブジェクト形式（Set）', () => {
			const TOKENS = {
				custom: {
					pre: '--my-',
					values: new Set(['foo', 'bar']),
				},
			};
			expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(--my-foo)');
			expect(getMaybeTokenValue('custom', 'bar', TOKENS)).toBe('var(--my-bar)');
		});

		test('pre と values を持つオブジェクト形式（Array）', () => {
			const TOKENS = {
				custom: {
					pre: '--my-',
					values: ['foo', 'bar'],
				},
			};
			expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(--my-foo)');
			expect(getMaybeTokenValue('custom', 'bar', TOKENS)).toBe('var(--my-bar)');
		});

		test('values に含まれない場合、値をそのまま返す', () => {
			const TOKENS = {
				custom: {
					pre: '--my-',
					values: new Set(['foo']),
				},
			};
			expect(getMaybeTokenValue('custom', 'baz', TOKENS)).toBe('baz');
		});

		test('pre が空文字列の場合', () => {
			const TOKENS = {
				custom: {
					pre: '',
					values: new Set(['foo']),
				},
			};
			expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(foo)');
		});

		test('pre が undefined の場合（デフォルト値を使用）', () => {
			const TOKENS = {
				custom: {
					values: new Set(['foo']),
				},
			};
			expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('var(foo)');
		});

		test('values が undefined の場合（デフォルト値を使用）', () => {
			const TOKENS = {
				custom: {
					pre: '--my-',
				},
			};
			expect(getMaybeTokenValue('custom', 'foo', TOKENS)).toBe('foo');
		});
	});

	describe('color トークンの特殊処理', () => {
		test('color は c トークンから検索を試みる', () => {
			const TOKENS = {
				c: new Set(['red', 'blue']),
			};
			expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('var(--c--red)');
			expect(getMaybeTokenValue('color', 'blue', TOKENS)).toBe('var(--c--blue)');
		});

		test('c に見つからない場合は palette から検索を試みる', () => {
			const TOKENS = {
				c: new Set(['red']),
				palette: new Set(['primary', 'secondary']),
			};
			expect(getMaybeTokenValue('color', 'primary', TOKENS)).toBe('var(--palette--primary)');
			expect(getMaybeTokenValue('color', 'secondary', TOKENS)).toBe(
				'var(--palette--secondary)'
			);
		});

		test('c が優先される', () => {
			const TOKENS = {
				c: new Set(['red']),
				palette: new Set(['red', 'blue']),
			};
			// 'red' は c にも palette にも存在するが、c が優先される
			expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('var(--c--red)');
		});

		test('c にも palette にも見つからない場合、値をそのまま返す', () => {
			const TOKENS = {
				c: new Set(['red']),
				palette: new Set(['primary']),
			};
			expect(getMaybeTokenValue('color', 'green', TOKENS)).toBe('green');
		});

		test('c も palette も存在しない場合、値をそのまま返す', () => {
			const TOKENS = {};
			expect(getMaybeTokenValue('color', 'red', TOKENS)).toBe('red');
		});
	});

	describe('Set と Array で同じ結果を返す', () => {
		test('同じ値のリストで同じ結果になる', () => {
			const values = ['10', '20', '30'];
			const TOKENS_SET = { space: new Set(values) };
			const TOKENS_ARRAY = { space: values };

			expect(getMaybeTokenValue('space', '10', TOKENS_SET)).toBe(
				getMaybeTokenValue('space', '10', TOKENS_ARRAY)
			);
			expect(getMaybeTokenValue('space', '20', TOKENS_SET)).toBe(
				getMaybeTokenValue('space', '20', TOKENS_ARRAY)
			);
			expect(getMaybeTokenValue('space', '40', TOKENS_SET)).toBe(
				getMaybeTokenValue('space', '40', TOKENS_ARRAY)
			);
		});
	});

	describe('エッジケース', () => {
		test('空文字列の値', () => {
			const TOKENS = {
				space: new Set(['']),
			};
			expect(getMaybeTokenValue('space', '', TOKENS)).toBe('var(--space--)');
		});

		test('0 の値', () => {
			const TOKENS = {
				space: new Set(['0']),
			};
			expect(getMaybeTokenValue('space', 0, TOKENS)).toBe('var(--space--0)');
			expect(getMaybeTokenValue('space', '0', TOKENS)).toBe('var(--space--0)');
		});

		test('浮動小数点数', () => {
			const TOKENS = {
				size: new Set(['1.5', '2.5']),
			};
			expect(getMaybeTokenValue('size', 1.5, TOKENS)).toBe('var(--size--1.5)');
			expect(getMaybeTokenValue('size', 2.5, TOKENS)).toBe('var(--size--2.5)');
		});

		test('特殊文字を含む値', () => {
			const TOKENS = {
				custom: new Set(['foo-bar', 'baz_qux']),
			};
			expect(getMaybeTokenValue('custom', 'foo-bar', TOKENS)).toBe('var(--custom--foo-bar)');
			expect(getMaybeTokenValue('custom', 'baz_qux', TOKENS)).toBe('var(--custom--baz_qux)');
		});

		test('マイナスで始まるが負の数値ではない値', () => {
			const TOKENS = {
				custom: new Set(['-webkit-fill-available']),
			};
			expect(getMaybeTokenValue('custom', '-webkit-fill-available', TOKENS)).toBe(
				'var(--custom--nwebkit-fill-available)'
			);
		});

		test('空の TOKENS オブジェクト', () => {
			const TOKENS = {};
			expect(getMaybeTokenValue('space', '10', TOKENS)).toBe('10');
		});

		test('大量のトークン値', () => {
			const values = new Set(Array.from({ length: 100 }, (_, i) => `${i}`));
			const TOKENS = { size: values };
			expect(getMaybeTokenValue('size', '50', TOKENS)).toBe('var(--size--50)');
			expect(getMaybeTokenValue('size', '99', TOKENS)).toBe('var(--size--99)');
		});
	});

	describe('実際の使用例', () => {
		test('スペーストークン', () => {
			const TOKENS = {
				space: new Set(['0', '10', '20', '30', '40', '50']),
			};
			expect(getMaybeTokenValue('space', '20', TOKENS)).toBe('var(--space--20)');
			expect(getMaybeTokenValue('space', '100', TOKENS)).toBe('100');
		});

		test('カラートークン（c と palette の組み合わせ）', () => {
			const TOKENS = {
				c: new Set(['black', 'white', 'gray']),
				palette: new Set(['primary', 'secondary', 'accent']),
			};
			expect(getMaybeTokenValue('color', 'black', TOKENS)).toBe('var(--c--black)');
			expect(getMaybeTokenValue('color', 'primary', TOKENS)).toBe('var(--palette--primary)');
			expect(getMaybeTokenValue('color', 'custom', TOKENS)).toBe('custom');
		});

		test('フォントサイズトークン（負の値を含む）', () => {
			const TOKENS = {
				fz: new Set(['-2', '-1', '0', '1', '2', '3']),
			};
			expect(getMaybeTokenValue('fz', '-2', TOKENS)).toBe('var(--fz--n2)');
			expect(getMaybeTokenValue('fz', '0', TOKENS)).toBe('var(--fz--0)');
			expect(getMaybeTokenValue('fz', '2', TOKENS)).toBe('var(--fz--2)');
		});

		test('カスタムプレフィックスを持つトークン', () => {
			const TOKENS = {
				radius: {
					pre: '--radius--',
					values: new Set(['sm', 'md', 'lg', 'full']),
				},
			};
			expect(getMaybeTokenValue('radius', 'sm', TOKENS)).toBe('var(--radius--sm)');
			expect(getMaybeTokenValue('radius', 'full', TOKENS)).toBe('var(--radius--full)');
			expect(getMaybeTokenValue('radius', 'custom', TOKENS)).toBe('custom');
		});
	});
});
