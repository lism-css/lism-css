import atts from '../../lib/helper/atts';

export function mergeFlexContextProps(props) {
	if (null == props.flex) props.flex = {};

	['fxf', 'fxd', 'fxw'].forEach((key) => {
		if (null != props[key]) {
			props.flex[key] = props[key];
			delete props[key];
		}
	});

	return props;
}

export function getFlexProps({ _flex = 'flex', lismClass, ...props }) {
	props.lismClass = atts(lismClass, `l--${_flex}`);

	return mergeFlexContextProps(props);
}

// export function getFlexItemProps(props) {
// 	if (null == props.flexItem) props.flexItem = {};
// 	[
// 		'fx',
// 		'fxg',
// 		'fxsh',
// 		'fxb',
// 		//'aslf', 'jslf', 'pslf', 'ord'
// 	].forEach((key) => {
// 		if (null != props[key]) {
// 			props.flexItem[key] = props[key];
// 			delete props[key];
// 		}
// 	});

// 	return props;
// }
