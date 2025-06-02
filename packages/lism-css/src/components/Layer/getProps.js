import getInsetProps from '../getInsetProps';
import getFilterProps from '../getFilterProps';

export function getLayerProps(props) {
	// positon から得られたデータを props とマージ
	// const positionProps = getLayerPositions(position);

	let layerProps = getInsetProps(props); // l,r,t,b などのコンテキストpropsのマージ
	layerProps = getFilterProps(layerProps, 'backdropFilter'); // filter系propsのマージ

	return layerProps;
}

/*
// l,r,t,b, translate をそのまま受け取れる
export function getLayerPositions(position) {
	const props = {};
	if (position === 'center' || position === 'center center') {
		props.inset = 'center';
		// props.left = '50%';
		// props.top = '50%';
		// props.translate = '-50% -50%';
	} else if (position) {
		let hasX = false;
		let hasY = false;

		if (position.indexOf('left') !== -1) {
			props.left = '0';
			hasX = true;
		} else if (position.indexOf('right') !== -1) {
			props.right = '0';
			hasX = true;
		}

		if (position.indexOf('top') !== -1) {
			props.top = '0';
			hasY = true;
		} else if (position.indexOf('bottom') !== -1) {
			props.bottom = '0';
			hasY = true;
		}

		if (position.indexOf('center') !== -1) {
			if (hasY) {
				props.inset = 'centerX';
				// props.left = '50%';
				// props.translate = '-50%';
			} else if (hasX) {
				props.inset = 'centerY';
				// props.top = '50%';
				// props.translate = '0 -50%';
			}
		}
	}

	// if ('contain' === size) {
	// 	props.maxW = '100%';
	// 	props.maxH = '100%';
	// 	props.ov = 'auto';
	// }

	return props;
}
 */
