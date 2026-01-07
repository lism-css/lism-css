import { assertType, describe, it } from 'vitest';
import type { StateProps } from './StateProps';

describe('StateProps', () => {
	describe('文字列形式のステートは boolean を受け入れる', () => {
		it('isContainer', () => {
			assertType<StateProps>({ isContainer: true });
			assertType<StateProps>({ isContainer: false });
		});

		it('その他のステート', () => {
			assertType<StateProps>({ isLayer: true });
			assertType<StateProps>({ isLinkBox: true });
			assertType<StateProps>({ isSide: true });
			assertType<StateProps>({ isSkipFlow: true });
			assertType<StateProps>({ isVertical: true });
			assertType<StateProps>({ hasGutter: true });
			assertType<StateProps>({ setShadow: true });
			assertType<StateProps>({ setHov: true });
			assertType<StateProps>({ setTransition: true });
			assertType<StateProps>({ setSnap: true });
			assertType<StateProps>({ setPlain: true });
			assertType<StateProps>({ setInnerRs: true });
		});
	});

	describe('プリセット値を持つステートは、プリセット値のみを受け入れる', () => {
		it('isWrapper - プリセット値を受け入れる', () => {
			assertType<StateProps>({ isWrapper: 's' });
			assertType<StateProps>({ isWrapper: 'l' });
		});

		it('isWrapper - プリセット値以外は受け入れない', () => {
			// @ts-expect-error - プリセット値以外は受け入れない
			assertType<StateProps>({ isWrapper: 'custom' });
			// @ts-expect-error - プリセット値以外は受け入れない
			assertType<StateProps>({ isWrapper: '800px' });
			// @ts-expect-error - プリセット値以外は受け入れない
			assertType<StateProps>({ isWrapper: 100 });
		});
	});

	describe('setStyles を持つステートは string を受け入れる', () => {
		it('setMask - string を受け入れる', () => {
			assertType<StateProps>({ setMask: '<svg>...</svg>' });
			assertType<StateProps>({ setMask: 'url(image.png)' });
		});

		it('setMask - string 以外は受け入れない', () => {
			// @ts-expect-error - boolean は受け入れない
			assertType<StateProps>({ setMask: true });
			// @ts-expect-error - number は受け入れない
			assertType<StateProps>({ setMask: 123 });
		});
	});

	describe('複数のステートを同時に指定できる', () => {
		it('複数のステートを指定', () => {
			assertType<StateProps>({
				isContainer: true,
				isWrapper: 's',
				setMask: '<svg>...</svg>',
			});
		});
	});

	describe('すべてのプロパティはオプショナル', () => {
		it('空のオブジェクト', () => {
			assertType<StateProps>({});
		});

		it('undefined を明示的に指定できる', () => {
			assertType<StateProps>({ isContainer: undefined });
			assertType<StateProps>({ isWrapper: undefined });
			assertType<StateProps>({ setMask: undefined });
		});
	});
});
