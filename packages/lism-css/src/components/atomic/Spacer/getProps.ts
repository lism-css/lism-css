import atts from '../../../lib/helper/atts';
import getBpData from '../../../lib/getBpData';
import getMaybeCssVar from '../../../lib/getMaybeCssVar';
import type { LismComponentProps } from '../../Lism/Lism';

export default function getSpacerProps({ lismClass, ...props }: LismComponentProps): LismComponentProps {
	const defaultProps: LismComponentProps = {
		lismClass: atts(lismClass, `a--spacer`),
		'aria-hidden': 'true',
	};

	if (null != props.h) {
		let hObj = getBpData(props.h);

		// スペーストークンに変換
		hObj = Object.entries(hObj).reduce(
			(newObj, [key, val]) => {
				// BpValue は広い型のため getMaybeCssVar の CssValue にキャスト
				(newObj as Record<string, unknown>)[key] = getMaybeCssVar(val as string | number, 'space');
				return newObj;
			},
			{} as typeof hObj
		);
		props.h = hObj as LismComponentProps['h'];
	}
	if (null != props.w) {
		let wObj = getBpData(props.w);

		// スペーストークンに変換
		wObj = Object.entries(wObj).reduce(
			(newObj, [key, val]) => {
				// BpValue は広い型のため getMaybeCssVar の CssValue にキャスト
				(newObj as Record<string, unknown>)[key] = getMaybeCssVar(val as string | number, 'space');
				return newObj;
			},
			{} as typeof wObj
		);
		props.w = wObj as LismComponentProps['w'];
	}

	return { ...defaultProps, ...props };
}
