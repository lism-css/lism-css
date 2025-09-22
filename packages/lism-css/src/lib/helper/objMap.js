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
