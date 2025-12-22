/**
 * '0', '10', など、数値を示す文字列かどうかを判定する
 */
export default function isNumStr(val: unknown): val is `${number}` {
	if (typeof val !== 'string') return false;
	return !isNaN(Number(val));
}

