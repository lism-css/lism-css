import { describe, test, expect } from 'vitest';
import isNumStr from './isNumStr';

describe('isNumStr', () => {
	test('数値を示す文字列の場合、trueを返す', () => {
		expect(isNumStr('0')).toBe(true);
		expect(isNumStr('10')).toBe(true);
		expect(isNumStr('123')).toBe(true);
		expect(isNumStr('-5')).toBe(true);
		expect(isNumStr('3.14')).toBe(true);
		expect(isNumStr('-0.5')).toBe(true);
	});

	test('数値ではない文字列の場合、falseを返す', () => {
		expect(isNumStr('abc')).toBe(false);
		expect(isNumStr('10px')).toBe(false);
		expect(isNumStr('hello')).toBe(false);
		expect(isNumStr('1.2.3')).toBe(false);
	});

	test('空文字列の場合、trueを返す（Number("")は0になるため）', () => {
		expect(isNumStr('')).toBe(true);
	});

	test('文字列以外の型の場合、falseを返す', () => {
		expect(isNumStr(123)).toBe(false);
		expect(isNumStr(0)).toBe(false);
		expect(isNumStr(null)).toBe(false);
		expect(isNumStr(undefined)).toBe(false);
		expect(isNumStr(true)).toBe(false);
		expect(isNumStr(false)).toBe(false);
		expect(isNumStr({})).toBe(false);
		expect(isNumStr([])).toBe(false);
	});

	test('特殊な数値文字列の場合の挙動', () => {
		expect(isNumStr('Infinity')).toBe(true);
		expect(isNumStr('-Infinity')).toBe(true);
		expect(isNumStr('NaN')).toBe(false);
	});

	test('空白を含む文字列の場合', () => {
		expect(isNumStr('  ')).toBe(true); // Number("  ")は0になる
		expect(isNumStr(' 10 ')).toBe(true); // Number(" 10 ")は10になる
		expect(isNumStr('1 0')).toBe(false); // スペースが間にある場合
	});
});
