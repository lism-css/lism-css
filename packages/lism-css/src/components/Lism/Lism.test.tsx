import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Lism from './Lism';

afterEach(() => {
	cleanup();
});

describe('Lism', () => {
	describe('基本動作', () => {
		test('デフォルトでdiv要素としてレンダリングされる', () => {
			render(<Lism data-testid="lism">test</Lism>);
			const element = screen.getByTestId('lism');
			expect(element.tagName).toBe('DIV');
		});

		test('as propで要素を変更できる', () => {
			render(
				<Lism as="span" data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element.tagName).toBe('SPAN');
		});

		test('tag propで要素を変更できる', () => {
			render(
				<Lism tag="section" data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element.tagName).toBe('SECTION');
		});

		test('asがtagより優先される', () => {
			render(
				<Lism as="article" tag="section" data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element.tagName).toBe('ARTICLE');
		});
	});

	describe('HTML属性', () => {
		test('as="a"の場合、href属性を受け取れる', () => {
			render(
				<Lism as="a" href="/path" data-testid="lism">
					link
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveAttribute('href', '/path');
		});
	});

	describe('LismProps', () => {
		test('Lism固有のpropsがclassNameやstyleに変換される', () => {
			render(
				<Lism m="16px" p="8px" data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
		});
	});

	describe('StateProps', () => {
		test('isContainerがクラス名に変換される', () => {
			render(
				<Lism isContainer data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('is--container');
		});

		test('isWrapperがクラス名に変換される', () => {
			render(
				<Lism isWrapper data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('is--wrapper');
		});

		test('isWrapper="s"がクラス名に変換される', () => {
			render(
				<Lism isWrapper="s" data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('is--wrapper');
			expect(element).toHaveClass('-content:s');
		});
	});
});
