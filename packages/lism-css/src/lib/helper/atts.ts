type Primitive = string | number | boolean | null | undefined;
type AttsValue = Primitive | AttsValue[] | Set<string | number> | Record<string, Primitive>;

/**
 * 配列と文字列だけを受け取るようにしたclassnamesやclsxの代替関数。
 *   従来の使い方でObjectを渡したいようなケースが出てきた時は、以下のように書き換えて使える。
 *   atts({'foo': isFoo, 'bar': isBar });
 *     ↓
 *   atts(isFoo && 'foo', isBar && 'bar');
 *
 *   arguments&whileループとの差はなかった(結果が誤差の範囲 or その時によって反転する)
 *   flat()やfilter()を使うとシンプルになるが、処理速度が数倍になる。
 */
export default function atts(...args: AttsValue[]): string {
	let classes: (string | number)[] = [];
	for (let i = 0; i < args.length; i++) {
		const mix = args[i];

		if (!mix) continue;

		if (typeof mix === 'string') {
			classes.push(...mix.trim().split(' '));
		} else if (typeof mix === 'number') {
			classes.push(mix);
		} else if (Array.isArray(mix)) {
			// 0 残す
			classes.push(...mix.filter((v): v is string | number => null != v));
		} else if (mix instanceof Set) {
			classes.push(...mix);
		} else if (typeof mix === 'object') {
			classes.push(...Object.keys(mix).filter((k) => !!mix[k]));
		}
	}

	// 最後に重複削除
	classes = [...new Set(classes)];
	return classes.join(' ').trim();
}
