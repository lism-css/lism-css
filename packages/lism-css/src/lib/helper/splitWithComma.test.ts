import { describe, test, expect } from 'vitest';
import splitWithComma from './splitWithComma';

describe('splitWithComma', () => {
	describe('文字列の処理', () => {
		test('カンマ区切りの文字列を配列に分割', () => {
			expect(splitWithComma('foo,bar,baz')).toEqual(['foo', 'bar', 'baz']);
		});

		test('カンマとスペースで区切られた文字列を分割してトリム', () => {
			expect(splitWithComma('foo, bar, baz')).toEqual(['foo', 'bar', 'baz']);
		});

		test('前後にスペースがある要素をトリム', () => {
			expect(splitWithComma('  foo  ,  bar  ,  baz  ')).toEqual(['foo', 'bar', 'baz']);
		});

		test('単一の文字列（カンマなし）', () => {
			expect(splitWithComma('foo')).toEqual(['foo']);
		});

		test('空文字列は空要素の配列を返す', () => {
			expect(splitWithComma('')).toEqual(['']);
		});

		test('カンマのみの文字列', () => {
			expect(splitWithComma(',')).toEqual(['', '']);
		});

		test('連続したカンマ', () => {
			expect(splitWithComma('foo,,bar')).toEqual(['foo', '', 'bar']);
		});

		test('先頭・末尾のカンマ', () => {
			expect(splitWithComma(',foo,bar,')).toEqual(['', 'foo', 'bar', '']);
		});

		test('スペースのみの要素は空文字列になる', () => {
			expect(splitWithComma('foo,   ,bar')).toEqual(['foo', '', 'bar']);
		});
	});

	describe('配列の処理', () => {
		test('配列をそのまま返す', () => {
			const input = ['foo', 'bar', 'baz'];
			const result = splitWithComma(input);
			expect(result).toEqual(['foo', 'bar', 'baz']);
			expect(result).toBe(input); // 同じ参照
		});

		test('空配列をそのまま返す', () => {
			const input: string[] = [];
			const result = splitWithComma(input);
			expect(result).toEqual([]);
			expect(result).toBe(input);
		});

		test('配列の要素はトリムされない（文字列の場合のみトリム）', () => {
			const input = ['  foo  ', '  bar  '];
			expect(splitWithComma(input)).toBe(input);
			expect(splitWithComma(input)).toEqual(['  foo  ', '  bar  ']);
		});
	});

	describe('その他の型の処理', () => {
		test('null は空配列を返す', () => {
			expect(splitWithComma(null)).toEqual([]);
		});

		test('undefined は空配列を返す', () => {
			expect(splitWithComma(undefined)).toEqual([]);
		});

		test('数値は空配列を返す', () => {
			expect(splitWithComma(123)).toEqual([]);
		});

		test('オブジェクトは空配列を返す', () => {
			expect(splitWithComma({ foo: 'bar' })).toEqual([]);
		});

		test('真偽値は空配列を返す', () => {
			expect(splitWithComma(true)).toEqual([]);
			expect(splitWithComma(false)).toEqual([]);
		});
	});

	describe('特殊なケース', () => {
		test('数値を含む文字列', () => {
			expect(splitWithComma('1,2,3')).toEqual(['1', '2', '3']);
		});

		test('特殊文字を含む文字列', () => {
			expect(splitWithComma('foo-bar,baz_qux,test:hover')).toEqual([
				'foo-bar',
				'baz_qux',
				'test:hover',
			]);
		});

		test('日本語を含む文字列', () => {
			expect(splitWithComma('赤,青,黄')).toEqual(['赤', '青', '黄']);
		});

		test('非常に長い文字列', () => {
			const long = 'a'.repeat(1000);
			const input = `${long},${long}`;
			expect(splitWithComma(input)).toEqual([long, long]);
		});

		test('大量の要素', () => {
			const elements = Array(100)
				.fill(0)
				.map((_, i) => `item${i}`);
			const input = elements.join(',');
			expect(splitWithComma(input)).toEqual(elements);
		});

		test('空白とカンマの複雑な組み合わせ', () => {
			expect(splitWithComma(' , foo , , bar , ')).toEqual(['', 'foo', '', 'bar', '']);
		});
	});

	describe('実際の使用例', () => {
		test('CSS クラス名のリスト', () => {
			expect(splitWithComma('btn, btn-primary, active')).toEqual([
				'btn',
				'btn-primary',
				'active',
			]);
		});

		test('タグのリスト', () => {
			expect(splitWithComma('javascript, typescript, react')).toEqual([
				'javascript',
				'typescript',
				'react',
			]);
		});

		test('カラーコードのリスト', () => {
			expect(splitWithComma('#ff0000, #00ff00, #0000ff')).toEqual([
				'#ff0000',
				'#00ff00',
				'#0000ff',
			]);
		});
	});
});

