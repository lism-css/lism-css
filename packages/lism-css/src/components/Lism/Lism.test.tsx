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

	describe('レスポンシブ対応', () => {
		test('配列形式でレスポンシブ値を指定できる', () => {
			render(
				<Lism fz={['s', 'm', 'l']} data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
			// 配列形式の場合、ベース値とブレイクポイント用クラスが設定される
			expect(element).toHaveClass('-fz:s');
			expect(element).toHaveClass('-fz_sm');
			expect(element).toHaveClass('-fz_md');
		});

		test('オブジェクト形式でレスポンシブ値を指定できる', () => {
			render(
				<Lism fz={{ base: 's', md: 'l' }} data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
			expect(element).toHaveClass('-fz:s');
			expect(element).toHaveClass('-fz_md');
		});

		test('単一値を指定できる', () => {
			render(
				<Lism fz="l" data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('-fz:l');
		});

		test('p にレスポンシブ配列を指定できる', () => {
			render(
				<Lism p={['10', '20', '30']} data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
			expect(element).toHaveClass('-p:10');
			expect(element).toHaveClass('-p_sm');
			expect(element).toHaveClass('-p_md');
		});

		test('m にオブジェクト形式を指定できる', () => {
			render(
				<Lism m={{ base: '10', sm: '20', md: '30' }} data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
			expect(element).toHaveClass('-m:10');
			expect(element).toHaveClass('-m_sm');
			expect(element).toHaveClass('-m_md');
		});

		test('g（gap）にレスポンシブ値を指定できる', () => {
			render(
				<Lism g={['10', '20']} data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
		});
	});

	describe('数値・真偽値の処理', () => {
		test('数値を指定できる', () => {
			render(
				<Lism p={20} data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
		});

		test('真偽値を指定できる', () => {
			render(
				<Lism w={true} data-testid="lism">
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
		});
	});
});
