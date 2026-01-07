import { describe, test, expect } from 'vitest';
import getMaybeCssVar, { getMaybeSpaceVar, getMaybeColorVar } from './getMaybeCssVar';

describe('getMaybeCssVar', () => {
	describe('基本的な動作', () => {
		test('tokenKey が指定されていない場合、値をそのまま返す', () => {
			expect(getMaybeCssVar('test', null)).toBe('test');
			expect(getMaybeCssVar('test', undefined)).toBe('test');
			expect(getMaybeCssVar('test', '')).toBe('test');
		});

		test('tokenKey が false の場合、値をそのまま返す', () => {
			expect(getMaybeCssVar('test', false)).toBe('test');
		});
	});

	describe('space トークンの処理', () => {
		test('space トークンの場合、getMaybeSpaceVar が呼ばれる', () => {
			expect(getMaybeCssVar('10', 'space')).toBe('var(--s10)');
			expect(getMaybeCssVar(20, 'space')).toBe('var(--s20)');
			expect(getMaybeCssVar('0', 'space')).toBe('0');
		});
	});

	describe('color トークンの処理', () => {
		test('color トークンの場合、getMaybeColorVar が呼ばれる', () => {
			expect(getMaybeCssVar('base', 'color')).toBe('var(--base)');
			expect(getMaybeCssVar('red', 'color')).toBe('var(--red)');
		});

		test('color-mix 記法が処理される', () => {
			expect(getMaybeCssVar('red:50%', 'color')).toContain('color-mix');
			expect(getMaybeCssVar('red:blue:30%', 'color')).toContain('color-mix');
		});
	});

	describe('bxsh トークンの処理', () => {
		test('bxsh で 0 の場合は none を返す', () => {
			expect(getMaybeCssVar('0', 'bxsh')).toBe('none');
			expect(getMaybeCssVar(0, 'bxsh')).toBe('none');
		});

		test('bxsh で 0 以外の値の場合はトークン変換', () => {
			expect(getMaybeCssVar('10', 'bxsh')).toBe('var(--bxsh--10)');
			expect(getMaybeCssVar('20', 'bxsh')).toBe('var(--bxsh--20)');
		});
	});

	describe('その他のトークンの処理', () => {
		test('fz トークンは getMaybeTokenValue で処理される', () => {
			expect(getMaybeCssVar('xl', 'fz')).toBe('var(--fz--xl)');
			expect(getMaybeCssVar('base', 'fz')).toBe('var(--fz--base)');
		});

		test('bdrs トークンは getMaybeTokenValue で処理される', () => {
			expect(getMaybeCssVar('10', 'bdrs')).toBe('var(--bdrs--10)');
			expect(getMaybeCssVar('99', 'bdrs')).toBe('var(--bdrs--99)');
		});
	});
});

describe('getMaybeSpaceVar', () => {
	describe('0 の処理', () => {
		test('0 は "0" を返す（文字列）', () => {
			expect(getMaybeSpaceVar(0)).toBe('0');
			expect(getMaybeSpaceVar('0')).toBe('0');
		});
	});

	describe('数値の処理', () => {
		test('数値は var(--s{数値}) に変換される', () => {
			expect(getMaybeSpaceVar(10)).toBe('var(--s10)');
			expect(getMaybeSpaceVar(20)).toBe('var(--s20)');
			expect(getMaybeSpaceVar(100)).toBe('var(--s100)');
		});

		test('負の数値も変換される', () => {
			expect(getMaybeSpaceVar(-10)).toBe('var(--s-10)');
			expect(getMaybeSpaceVar(-20)).toBe('var(--s-20)');
		});
	});

	describe('数値文字列の処理', () => {
		test('数値文字列は var(--s{値}) に変換される', () => {
			expect(getMaybeSpaceVar('10')).toBe('var(--s10)');
			expect(getMaybeSpaceVar('20')).toBe('var(--s20)');
			expect(getMaybeSpaceVar('100')).toBe('var(--s100)');
		});

		test('負の数値文字列も変換される', () => {
			expect(getMaybeSpaceVar('-10')).toBe('var(--s-10)');
			expect(getMaybeSpaceVar('-20')).toBe('var(--s-20)');
		});
	});

	describe('スペース区切り値の処理', () => {
		test('スペース区切りで複数の数値が指定された場合、それぞれ変換される', () => {
			expect(getMaybeSpaceVar('10 20')).toBe('var(--s10) var(--s20)');
			expect(getMaybeSpaceVar('10 20 30')).toBe('var(--s10) var(--s20) var(--s30)');
			expect(getMaybeSpaceVar('0 10 20 30')).toBe('0 var(--s10) var(--s20) var(--s30)');
		});

		test('スペース区切りに数値以外が混在する場合も処理される', () => {
			expect(getMaybeSpaceVar('10 auto')).toBe('var(--s10) auto');
			expect(getMaybeSpaceVar('auto 20')).toBe('auto var(--s20)');
		});

		test('calc() が含まれる場合、変換しない', () => {
			expect(getMaybeSpaceVar('calc(10px + 20px)')).toBe('calc(10px + 20px)');
			expect(getMaybeSpaceVar('10 calc(1em + 10px)')).toBe('10 calc(1em + 10px)');
		});

		test('var() が含まれる場合、変換しない', () => {
			expect(getMaybeSpaceVar('var(--custom)')).toBe('var(--custom)');
			expect(getMaybeSpaceVar('10 var(--custom)')).toBe('10 var(--custom)');
		});

		test('カンマが含まれる場合、変換しない', () => {
			expect(getMaybeSpaceVar('10, 20')).toBe('10, 20');
		});
	});

	describe('その他の値の処理', () => {
		test('CSS単位付きの値はそのまま返す', () => {
			expect(getMaybeSpaceVar('1rem')).toBe('1rem');
			expect(getMaybeSpaceVar('10px')).toBe('10px');
			expect(getMaybeSpaceVar('2em')).toBe('2em');
		});

		test('キーワード値はそのまま返す', () => {
			expect(getMaybeSpaceVar('auto')).toBe('auto');
			expect(getMaybeSpaceVar('inherit')).toBe('inherit');
		});
	});

	describe('浮動小数点数の処理', () => {
		test('浮動小数点数も変換される', () => {
			expect(getMaybeSpaceVar(1.5)).toBe('var(--s1.5)');
			expect(getMaybeSpaceVar(2.25)).toBe('var(--s2.25)');
		});

		test('浮動小数点数の文字列も変換される', () => {
			// isNumStr は !isNaN(Number(val)) で判定しているため、浮動小数点文字列もtrueになる
			expect(getMaybeSpaceVar('1.5')).toBe('var(--s1.5)');
			expect(getMaybeSpaceVar('2.25')).toBe('var(--s2.25)');
		});
	});
});

describe('getMaybeColorVar', () => {
	describe('基本的なカラートークン変換', () => {
		test('c トークンの値が変換される', () => {
			expect(getMaybeColorVar('base')).toBe('var(--base)');
			expect(getMaybeColorVar('text')).toBe('var(--text)');
			expect(getMaybeColorVar('link')).toBe('var(--link)');
		});

		test('palette トークンの値が変換される', () => {
			expect(getMaybeColorVar('red')).toBe('var(--red)');
			expect(getMaybeColorVar('blue')).toBe('var(--blue)');
			expect(getMaybeColorVar('green')).toBe('var(--green)');
		});

		test('トークンに存在しない値はそのまま返される', () => {
			expect(getMaybeColorVar('#ff0000')).toBe('#ff0000');
			expect(getMaybeColorVar('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
			expect(getMaybeColorVar('custom')).toBe('custom');
		});
	});

	describe('color-mix 記法（2色混合）', () => {
		test('COLOR1:COLOR2:ALPHA% 形式で color-mix が生成される', () => {
			const result = getMaybeColorVar('red:blue:50%');
			expect(result).toContain('color-mix');
			expect(result).toContain('in srgb');
			expect(result).toContain('var(--red)');
			expect(result).toContain('var(--blue)');
			expect(result).toContain('50%');
		});

		test('トークンに存在しないカラーでも処理される', () => {
			const result = getMaybeColorVar('custom1:custom2:30%');
			expect(result).toContain('color-mix');
			expect(result).toContain('custom1');
			expect(result).toContain('custom2');
			expect(result).toContain('30%');
		});

		test('c と palette の混合も処理される', () => {
			const result = getMaybeColorVar('base:red:70%');
			expect(result).toContain('var(--base)');
			expect(result).toContain('var(--red)');
			expect(result).toContain('70%');
		});
	});

	describe('color-mix 記法（透明度指定）', () => {
		test('COLOR:ALPHA% 形式で color-mix が生成される', () => {
			const result = getMaybeColorVar('red:50%');
			expect(result).toContain('color-mix');
			expect(result).toContain('in srgb');
			expect(result).toContain('var(--red)');
			expect(result).toContain('50%');
			expect(result).toContain('transparent');
		});

		test('異なる透明度で処理される', () => {
			const result1 = getMaybeColorVar('blue:25%');
			const result2 = getMaybeColorVar('blue:75%');
			expect(result1).toContain('25%');
			expect(result2).toContain('75%');
		});

		test('c トークンの値でも処理される', () => {
			const result = getMaybeColorVar('base:80%');
			expect(result).toContain('var(--base)');
			expect(result).toContain('80%');
			expect(result).toContain('transparent');
		});
	});

	describe('エッジケース', () => {
		test('% で終わるが : が含まれない場合はそのまま返す', () => {
			expect(getMaybeColorVar('50%')).toBe('50%');
			expect(getMaybeColorVar('100%')).toBe('100%');
		});

		test('コロンが4つ以上の場合は color-mix として処理されない', () => {
			const result = getMaybeColorVar('a:b:c:d:50%');
			expect(result).toBe('a:b:c:d:50%');
		});

		test('% で終わらないコロン区切りの値はそのまま返す', () => {
			expect(getMaybeColorVar('red:blue')).toBe('red:blue');
			expect(getMaybeColorVar('red:blue:green')).toBe('red:blue:green');
		});

		test('空文字列はそのまま返す', () => {
			expect(getMaybeColorVar('')).toBe('');
		});
	});
});
