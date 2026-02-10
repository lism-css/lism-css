import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Lism from './Lism';

afterEach(() => {
	cleanup();
});

describe('Lism', () => {
	describe('基本動作', () => {
		test('デフォルトでdiv要素としてレンダリングされる', () => {
			render(<Lism data-testid='lism'>test</Lism>);
			const element = screen.getByTestId('lism');
			expect(element.tagName).toBe('DIV');
		});

		test('as propで要素を変更できる', () => {
			render(
				<Lism as='span' data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element.tagName).toBe('SPAN');
		});

		test('tag propで要素を変更できる', () => {
			render(
				<Lism tag='section' data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element.tagName).toBe('SECTION');
		});

		test('asがtagより優先される', () => {
			render(
				<Lism as='article' tag='section' data-testid='lism'>
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
				<Lism as='a' href='/path' data-testid='lism'>
					link
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveAttribute('href', '/path');
		});
	});

	describe('LismProps', () => {
		describe('Typography', () => {
			test('fz（font-size）トークン値を指定できる', () => {
				render(
					<Lism fz='xl' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fz:xl');
			});

			test('fw（font-weight）トークン値を指定できる', () => {
				render(
					<Lism fw='bold' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fw:bold');
			});

			test('ff（font-family）トークン値を指定できる', () => {
				render(
					<Lism ff='mono' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ff:mono');
			});

			test('lh（line-height）トークン値を指定できる', () => {
				render(
					<Lism lh='s' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-lh:s');
			});

			test('ta（text-align）を指定できる', () => {
				render(
					<Lism ta='center' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ta:center');
			});

			test('fs（font-style）を指定できる', () => {
				render(
					<Lism fs='italic' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fs:italic');
			});
		});

		describe('Spacing', () => {
			test('p（padding）トークン値を指定できる', () => {
				render(
					<Lism p='20' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-p:20');
			});

			test('px, py を指定できる', () => {
				render(
					<Lism px='20' py='10' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-px:20');
				expect(element).toHaveClass('-py:10');
			});

			test('m（margin）トークン値を指定できる', () => {
				render(
					<Lism m='30' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-m:30');
			});

			test('mx="auto" を指定できる', () => {
				render(
					<Lism mx='auto' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-mx:auto');
			});

			test('g（gap）トークン値を指定できる', () => {
				render(
					<Lism g='20' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-g:20');
			});
		});

		test('d="none" を指定できる', () => {
			render(
				<Lism d='none' data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('-d:none');
		});

		test('pos（position）を指定できる', () => {
			render(
				<Lism pos='relative' data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('-pos:rel');
		});

		test('ai, jc（flexbox alignment）を指定できる', () => {
			render(
				<Lism d='flex' ai='center' jc='center' data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('-ai:center');
			expect(element).toHaveClass('-jc:center');
		});

		test('fxw（flex-wrap）を指定できる', () => {
			render(
				<Lism d='flex' fxw='wrap' data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('-fxw:wrap');
		});

		describe('Sizing', () => {
			test('w（width）を指定できる', () => {
				render(
					<Lism w='100%' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-w:100%');
			});

			test('h（height）を指定できる', () => {
				render(
					<Lism h='100%' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-h:100%');
			});

			test('w="fit" ユーティリティを指定できる', () => {
				render(
					<Lism w='fit' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-w:fit');
			});
		});

		describe('Decoration', () => {
			test('bdrs（border-radius）トークン値を指定できる', () => {
				render(
					<Lism bdrs='20' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bdrs:20');
			});

			test('bxsh（box-shadow）トークン値を指定できる', () => {
				render(
					<Lism bxsh='20' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bxsh:20');
			});

			test('ov（overflow）を指定できる', () => {
				render(
					<Lism ov='hidden' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ov:hidden');
			});

			test('o（opacity）トークン値を指定できる', () => {
				render(
					<Lism o='-20' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-o:-20');
			});
		});

		describe('Color', () => {
			test('c（color）プリセット値を指定できる', () => {
				render(
					<Lism c='text' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-c:text');
			});

			test('bgc（background-color）を指定できる', () => {
				render(
					<Lism bgc='base' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bgc:base');
			});
		});

		describe('複合プロパティ', () => {
			test('複数のプロパティを同時に指定できる', () => {
				render(
					<Lism fz='l' fw='bold' p='20' m='10' bdrs='10' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fz:l');
				expect(element).toHaveClass('-fw:bold');
				expect(element).toHaveClass('-p:20');
				expect(element).toHaveClass('-m:10');
				expect(element).toHaveClass('-bdrs:10');
			});
		});
	});

	describe('StateProps', () => {
		test('isContainerがクラス名に変換される', () => {
			render(
				<Lism isContainer data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('is--container');
		});

		test('isWrapperがクラス名に変換される', () => {
			render(
				<Lism isWrapper data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('is--wrapper');
		});

		test('isWrapper="s"がクラス名に変換される', () => {
			render(
				<Lism isWrapper='s' data-testid='lism'>
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
				<Lism fz={['s', 'm', 'l']} data-testid='lism'>
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
				<Lism fz={{ base: 's', md: 'l' }} data-testid='lism'>
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
				<Lism fz='l' data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('-fz:l');
		});

		test('p にレスポンシブ配列を指定できる', () => {
			render(
				<Lism p={['10', '20', '30']} data-testid='lism'>
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
				<Lism m={{ base: '10', sm: '20', md: '30' }} data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toBeInTheDocument();
			expect(element).toHaveClass('-m:10');
			expect(element).toHaveClass('-m_sm');
			expect(element).toHaveClass('-m_md');
		});
	});
});
