import atts from '../../lib/helper/atts';

// gt + gtc, gtr の併用がなければ、コンテキストをセットして変数だけの出力にする
// export function getGridContext(gridProps = {}) {
// 	if (gridProps?.gt && (gridProps?.gtc || gridProps?.gtr)) {
// 		return null;
// 	}
// 	return 'grid';
// }

export function mergeGridContextProps(props) {
	if (null == props.grid) props.grid = {};

	['gd', 'gt', 'gta', 'gtc', 'gtr', 'gaf', 'gar', 'gac'].forEach((key) => {
		if (null != props[key]) {
			props.grid[key] = props[key];
			delete props[key];
		}
	});

	return props;
}

export function getGridProps({ _grid = 'grid', lismClass, ...props }) {
	// grid 系の props をまとめる
	props = mergeGridContextProps(props);
	props.lismClass = atts(lismClass, `l--${_grid}`);
	return props;
}

export function getGridItemProps(props) {
	if (null == props.gridItem) props.gridItem = {};
	[
		'ga',
		'gc',
		'gr',
		'gcs',
		'gce',
		'grs',
		'gre',
		//'aslf', 'jslf', 'pslf', 'ord'
	].forEach((key) => {
		if (null != props[key]) {
			props.gridItem[key] = props[key];
			delete props[key];
		}
	});

	return props;
}

// 1:2:3 → 1fr 2fr 3fr に変換
// function getMaybeFrs(value) {
// 	// ":" があれば分解して配列化し、"fr" を付けて連結して返す
// 	if (typeof value === 'string' && value.indexOf(':') !== -1) {
// 		const splitArray = value.split(':');

// 		if (isNumStr(splitArray[0])) {
// 			//splitArrayの 0番目の要素が数値に変換できるか確認してから fr に変換
// 			return splitArray.map((s) => `${s}fr`).join(' ');
// 		}
// 	}

// 	return value;
// }
