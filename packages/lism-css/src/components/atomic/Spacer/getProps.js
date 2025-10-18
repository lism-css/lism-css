import atts from 'lism-css/lib/helper/atts';
import getBpData from 'lism-css/lib/getBpData';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';

export default function getSpacerProps({ lismClass, ...props }) {
	const defaultProps = {
		lismClass: atts(lismClass, `a--spacer`),
		'aria-hidden': 'true',
	};

	if (null != props.h) {
		let hObj = getBpData(props.h);

		// スペーストークンに変換
		hObj = Object.entries(hObj).reduce((newObj, [key, h]) => {
			newObj[key] = getMaybeCssVar(h, 'space');
			return newObj;
		}, {});

		props.h = hObj;
	}
	if (null != props.w) {
		let wObj = getBpData(props.w);

		// スペーストークンに変換
		wObj = Object.entries(wObj).reduce((newObj, [key, w]) => {
			newObj[key] = getMaybeCssVar(w, 'space');
			return newObj;
		}, {});

		props.w = wObj;
	}

	return { ...defaultProps, ...props };
}
