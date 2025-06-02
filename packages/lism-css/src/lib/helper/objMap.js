// Objectの各値に関数を通して返す。PHP の array_map 的な.

// 1. Object.keys() で keyの配列を取得
// 2. forEach() で その key に対する値に処理を加える。
// 3. 処理が加わったオブジェクトを返す
export default function objMap(obj, callback) {
	Object.keys(obj).forEach((key) => {
		obj[key] = callback(obj[key]);
	});
	return obj;
}

// 1. Object.entries() で {key: value, ... } → [[key, value], ...] に配列変換
// 2. map()でその配列のvalue側を処理
// 3. 再度、Object.fromEntries() で 配列から新しく object を生成
// export default function objMap(obj, callback) {
// 	return Object.fromEntries(
// 		Object.entries(obj).map(([key, value]) => [key, callback(value)])
// 	);
// }

// 1. Object.entries() で {key: value, ... } → [[key, value], ...] に配列変換
// 2. その配列をもとに、reduce() で処理を加えつつ objectを生成
// export default function objMap(obj, callback) {
// 	return Object.entries(obj).reduce((newObj, [key, r]) => {
// 		newObj[key] = callback(r);
// 		return newObj;
// 	}, {});
// }
