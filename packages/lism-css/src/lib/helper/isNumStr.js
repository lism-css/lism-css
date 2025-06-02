// '0', '10', など、数値を示す文字列かどうかを判定する
export default function isNumStr(val) {
	if (typeof val !== 'string') return false;
	return !isNaN(Number(val));
}
