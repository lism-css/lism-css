/**
 * ユーティリティ化できるキーワードのチェック。
 *
 * utils: クラス自体が省略名を使って用意される { val: value } → -prop:val{property: value}
 * shorthand: クラスはpresetsで出力されてて、コンポーネント側でただ呼び出すための省略名リスト {val: value} → -prop:value{property: value}
 */
export default function getUtilKey(utils: Record<string, unknown> | undefined, value: string, isShorthand = false) {
	if (null == utils || typeof utils !== 'object') return '';

	// keyから検索
	if (value in utils) {
		return isShorthand ? utils[value] : value;
	}
	if (isShorthand) return '';

	// 値に一致するキーを検索
	for (const [key, val] of Object.entries(utils)) {
		if (val === value) {
			return key;
		}
	}

	return '';
}
