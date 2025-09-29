function isObj(value) {
	return value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 深いマージを行う関数
 * @param {Object} origin - マージ先となる元オブジェクト
 * @param {Object} source - マージするソース（このデータに更新される）
 * @returns {Object} マージされたオブジェクト
 */
export function objDeepMerge(origin, source) {
	// originとsourceがオブジェクトかどうかをチェック
	if (!origin || typeof origin !== 'object' || Array.isArray(origin)) {
		return source;
	}
	if (!source || typeof source !== 'object' || Array.isArray(source)) {
		return origin;
	}

	const result = { ...origin };

	for (const key in source) {
		if (Object.hasOwn(source, key)) {
			const originValue = result[key];
			const sourceValue = source[key];

			if (!originValue) {
				// origin側に存在しない新たなキーの場合はそのまま追加する
				result[key] = sourceValue;
			} else if (isObj(sourceValue) && isObj(originValue)) {
				// どちらもオブジェクトの場合は再帰的にマージ
				result[key] = objDeepMerge(originValue, sourceValue);
			} else {
				// どちらかのデータがobjectではない場合、そのまま上書き
				result[key] = sourceValue;
			}
		}
	}

	return result;
}

/**
 * オブジェクト内の配列を再帰的にSetに変換する関数
 * @param {any} obj - 変換対象のオブジェクト
 * @returns {any} 変換されたオブジェクト
 */
export function arrayConvertToSet(obj) {
	// 配列の場合はSetに変換
	if (Array.isArray(obj)) {
		return new Set(obj);
	}

	// オブジェクトの場合は再帰的に処理
	if (isObj(obj)) {
		const result = {};
		for (const key in obj) {
			if (Object.hasOwn(obj, key)) {
				result[key] = arrayConvertToSet(obj[key]);
			}
		}
		return result;
	}

	// その他の値はそのまま返す
	return obj;
}
