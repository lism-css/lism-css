// ユーティリティ化できるキーワードのチェック
export default function getMaybeUtilValue(utils, value) {
	if (null == utils || typeof utils !== 'object') return '';

	// fullname
	if (utils?.[value]) {
		return utils[value];
	}

	// shortname
	if (Object.values(utils).includes(value)) {
		return value;
	}

	return '';
}
