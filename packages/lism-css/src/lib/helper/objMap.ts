// Objectの各値に関数を通して返す。PHP の array_map 的な.

// 1. Object.keys() で keyの配列を取得
// 2. forEach() で その key に対する値に処理を加える。
// 3. 処理が加わったオブジェクトを返す
export default function objMap<T extends Record<string, any>, U>(
	obj: T,
	callback: (value: T[keyof T]) => U
): Record<keyof T, U> {
	const result = obj as Record<string, any>;
	Object.keys(obj).forEach((key) => {
		result[key] = callback(obj[key]);
	});
	return result as Record<keyof T, U>;
}

