import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Layer from './Layer';

afterEach(() => {
	cleanup();
});

describe('Layer', () => {
	test('isLayer クラスが付与される', () => {
		render(<Layer data-testid='layer' />);
		const element = screen.getByTestId('layer');
		expect(element).toHaveClass('is--layer');
	});

	test('filter props が backdropFilter スタイルに変換される', () => {
		render(<Layer contrast='1.1' sepia='0.4' grayscale='0.4' data-testid='layer' />);
		const element = screen.getByTestId('layer');
		expect(element.style.backdropFilter).toBe('contrast(1.1) grayscale(0.4) sepia(0.4)');
	});

	test('blur が backdropFilter に変換される', () => {
		render(<Layer blur='5px' data-testid='layer' />);
		const element = screen.getByTestId('layer');
		expect(element.style.backdropFilter).toBe('blur(5px)');
	});

	test('filter props が DOM に残らない', () => {
		render(<Layer blur='5px' data-testid='layer' />);
		const element = screen.getByTestId('layer');
		expect(element.getAttribute('blur')).toBeNull();
	});

	test('Lism の props も受け取れる', () => {
		render(<Layer p='20' data-testid='layer' />);
		const element = screen.getByTestId('layer');
		expect(element).toHaveClass('-p:20');
	});

	test('as で要素を変更できる', () => {
		render(<Layer as='section' data-testid='layer' />);
		const element = screen.getByTestId('layer');
		expect(element.tagName).toBe('SECTION');
	});

	test('as="a" で href を受け取れる', () => {
		render(<Layer as='a' href='https://example.com' data-testid='layer' />);
		const element = screen.getByTestId('layer');
		expect(element.tagName).toBe('A');
		expect(element.getAttribute('href')).toBe('https://example.com');
	});
});
