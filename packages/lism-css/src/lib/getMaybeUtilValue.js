// ユーティリティ化できるキーワードのチェック
export default function getMaybeUtilValue(utils, value) {
	if (null == utils || typeof utils !== 'object') return '';

	// keyから検索
	if (value in utils) {
		return value; //utils[value];
	}

	// 値に一致するキーを検索
	for (const [key, val] of Object.entries(utils)) {
		if (val === value) {
			return key;
		}
	}

	return '';
}
