// 文字列を , で分割し、各配列の中身に trim() をかける
export default function splitWithComma(str) {
	//すでに配列であればそのまま返す
	if (Array.isArray(str)) return str;

	//文字列じゃなければ空の配列を返す
	if (typeof str !== 'string') return [];

	return str.split(',').map((s) => s.trim());
}
