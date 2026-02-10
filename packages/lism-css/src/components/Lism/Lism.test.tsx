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

			test('lh="1" を指定できる', () => {
				render(
					<Lism lh='1' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-lh:1');
			});

			test('lts（letter-spacing）トークン値を指定できる', () => {
				render(
					<Lism lts='l' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-lts:l');
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

			test('ta="left" を指定できる', () => {
				render(
					<Lism ta='left' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ta:left');
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

			test('td（text-decoration）を指定できる', () => {
				render(
					<Lism td='none' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-td:none');
			});

			test('tt（text-transform）を指定できる', () => {
				render(
					<Lism tt='upper' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-tt:upper');
			});
		});

		describe('Spacing', () => {
			describe('Padding', () => {
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

				test('pt, pb を指定できる（インラインスタイル）', () => {
					render(
						<Lism pt='15' pb='25' data-testid='lism'>
							test
						</Lism>
					);
					const element = screen.getByTestId('lism');
					// pt, pb は値を含むクラスではなく、ブレイクポイント用クラスとして処理される
					expect(element).toHaveClass('-pt');
					expect(element).toHaveClass('-pb');
				});

				test('pl, pr を指定できる（インラインスタイル）', () => {
					render(
						<Lism pl='10' pr='20' data-testid='lism'>
							test
						</Lism>
					);
					const element = screen.getByTestId('lism');
					// pl, pr は値を含むクラスではなく、ブレイクポイント用クラスとして処理される
					expect(element).toHaveClass('-pl');
					expect(element).toHaveClass('-pr');
				});
			});

			describe('Margin', () => {
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

				test('my にトークン値を指定できる', () => {
					render(
						<Lism my='20' data-testid='lism'>
							test
						</Lism>
					);
					const element = screen.getByTestId('lism');
					expect(element).toHaveClass('-my:20');
				});

				test('mt, mb を指定できる（インラインスタイル）', () => {
					render(
						<Lism mt='10' mb='20' data-testid='lism'>
							test
						</Lism>
					);
					const element = screen.getByTestId('lism');
					// mt, mb は値を含むクラスではなく、ブレイクポイント用クラスとして処理される
					expect(element).toHaveClass('-mt');
					expect(element).toHaveClass('-mb');
				});

				test('ml, mr を指定できる（インラインスタイル）', () => {
					render(
						<Lism ml='auto' mr='auto' data-testid='lism'>
							test
						</Lism>
					);
					const element = screen.getByTestId('lism');
					// ml, mr は値を含むクラスではなく、ブレイクポイント用クラスとして処理される
					expect(element).toHaveClass('-ml');
					expect(element).toHaveClass('-mr');
				});
			});

			describe('Gap', () => {
				test('g（gap）トークン値を指定できる', () => {
					render(
						<Lism g='20' data-testid='lism'>
							test
						</Lism>
					);
					const element = screen.getByTestId('lism');
					expect(element).toHaveClass('-g:20');
				});

				test('g="inherit" を指定できる', () => {
					render(
						<Lism g='inherit' data-testid='lism'>
							test
						</Lism>
					);
					const element = screen.getByTestId('lism');
					expect(element).toHaveClass('-g:inherit');
				});
			});
		});

		describe('Display', () => {
			test('d="none" を指定できる', () => {
				render(
					<Lism d='none' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-d:none');
			});

			test('d="block" を指定できる', () => {
				render(
					<Lism d='block' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-d:block');
			});

			test('d="in-flex" を指定できる', () => {
				render(
					<Lism d='in-flex' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-d:in-flex');
			});

			test('v（visibility）を指定できる', () => {
				render(
					<Lism v='hidden' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-v:hidden');
			});

			test('ar（aspect-ratio）を指定できる', () => {
				render(
					<Lism ar='16/9' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ar:16/9');
			});

			test('ar="1/1" を指定できる', () => {
				render(
					<Lism ar='1/1' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ar:1/1');
			});
		});

		describe('Position', () => {
			test('pos="relative" を指定できる', () => {
				render(
					<Lism pos='relative' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-pos:rel');
			});

			test('pos="absolute" を指定できる', () => {
				render(
					<Lism pos='absolute' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-pos:abs');
			});

			test('pos="fixed" を指定できる', () => {
				render(
					<Lism pos='fixed' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-pos:fixed');
			});

			test('pos="sticky" を指定できる', () => {
				render(
					<Lism pos='sticky' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-pos:sticky');
			});

			test('t, l, r, b を指定できる', () => {
				render(
					<Lism t='0' l='0' r='0' b='0' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-t:0');
				expect(element).toHaveClass('-l:0');
				expect(element).toHaveClass('-r:0');
				expect(element).toHaveClass('-b:0');
			});

			test('t="50%" を指定できる', () => {
				render(
					<Lism t='50%' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-t:50%');
			});

			test('z（z-index）を指定できる', () => {
				render(
					<Lism z='1' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-z:1');
			});

			test('i（inset）を指定できる', () => {
				render(
					<Lism i='0' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-i:0');
			});
		});

		describe('Flexbox', () => {
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

			test('ai="start" を指定できる', () => {
				render(
					<Lism ai='start' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ai:start');
			});

			test('jc="between" を指定できる', () => {
				render(
					<Lism jc='between' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-jc:between');
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

			test('fxd（flex-direction）を指定できる', () => {
				render(
					<Lism fxd='col' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fxd:col');
			});

			test('fxd="row-r" を指定できる', () => {
				render(
					<Lism fxd='row-r' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fxd:row-r');
			});

			test('fx（flex）を指定できる', () => {
				render(
					<Lism fx='1' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fx:1');
			});

			test('fxsh（flex-shrink）を指定できる', () => {
				render(
					<Lism fxsh='0' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fxsh:0');
			});

			test('fxg（flex-grow）を指定できる', () => {
				render(
					<Lism fxg='1' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-fxg:1');
			});

			test('aslf（align-self）を指定できる', () => {
				render(
					<Lism aslf='center' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-aslf:center');
			});

			test('jslf（justify-self）を指定できる', () => {
				render(
					<Lism jslf='center' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-jslf:center');
			});
		});

		describe('Grid', () => {
			test('gtc（grid-template-columns）を指定できる', () => {
				render(
					<Lism gtc='subgrid' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-gtc:subgrid');
			});

			test('gtr（grid-template-rows）を指定できる', () => {
				render(
					<Lism gtr='subgrid' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-gtr:subgrid');
			});

			test('gaf（grid-auto-flow）を指定できる', () => {
				render(
					<Lism gaf='col' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-gaf:col');
			});

			test('ga（grid-area）を指定できる', () => {
				render(
					<Lism ga='1/1' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ga:1/1');
			});

			test('gc（grid-column）を指定できる', () => {
				render(
					<Lism gc='1/-1' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-gc:1/-1');
			});

			test('gr（grid-row）を指定できる', () => {
				render(
					<Lism gr='1/-1' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-gr:1/-1');
			});
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

			test('w="fit" ユーティリティを指定できる', () => {
				render(
					<Lism w='fit' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-w:fit');
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

			test('max-w（max-width）を指定できる', () => {
				render(
					<Lism max-w='100%' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-max-w:100%');
			});

			test('max-h（max-height）を指定できる', () => {
				render(
					<Lism max-h='100%' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-max-h:100%');
			});

			test('min-w（min-width）を指定できる', () => {
				render(
					<Lism min-w='100%' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-min-w:100%');
			});

			test('min-h（min-height）を指定できる', () => {
				render(
					<Lism min-h='100%' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-min-h:100%');
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

			test('ov="auto" を指定できる', () => {
				render(
					<Lism ov='auto' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ov:auto');
			});

			test('ov-x（overflow-x）を指定できる', () => {
				render(
					<Lism ov-x='scroll' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ov-x:scroll');
			});

			test('ov-y（overflow-y）を指定できる', () => {
				render(
					<Lism ov-y='clip' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ov-y:clip');
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

			test('c="brand" を指定できる', () => {
				render(
					<Lism c='brand' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-c:brand');
			});

			test('c="accent" を指定できる', () => {
				render(
					<Lism c='accent' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-c:accent');
			});

			test('c="inherit" を指定できる', () => {
				render(
					<Lism c='inherit' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-c:inherit');
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

			test('bgc="base-2" を指定できる', () => {
				render(
					<Lism bgc='base-2' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bgc:base-2');
			});

			test('bgc="transparent" を指定できる', () => {
				render(
					<Lism bgc='transparent' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bgc:transparent');
			});

			test('bdc（border-color）を指定できる', () => {
				render(
					<Lism bdc='brand' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bdc:brand');
			});
		});

		describe('Border', () => {
			test('bd（border）を指定できる', () => {
				render(
					<Lism bd data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bd');
			});

			test('bd="none" を指定できる', () => {
				render(
					<Lism bd='none' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bd:none');
			});

			test('bds（border-style）を指定できる', () => {
				render(
					<Lism bds='dashed' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-bds:dashed');
			});
		});

		describe('Other CSS', () => {
			test('isolation を指定できる', () => {
				render(
					<Lism isolation='isolate' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-isolation:isolate');
			});

			test('whspace（white-space）を指定できる', () => {
				render(
					<Lism whspace='nowrap' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-whspace:nowrap');
			});

			test('ovwrap（overflow-wrap）を指定できる', () => {
				render(
					<Lism ovwrap='any' data-testid='lism'>
						test
					</Lism>
				);
				const element = screen.getByTestId('lism');
				expect(element).toHaveClass('-ovwrap:any');
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
			expect(element).toHaveClass('-m:10');
			expect(element).toHaveClass('-m_sm');
			expect(element).toHaveClass('-m_md');
		});

		test('d にレスポンシブ値を指定できる', () => {
			render(
				<Lism d={{ base: 'none', md: 'block' }} data-testid='lism'>
					test
				</Lism>
			);
			const element = screen.getByTestId('lism');
			expect(element).toHaveClass('-d:none');
			expect(element).toHaveClass('-d_md');
		});
	});
});
