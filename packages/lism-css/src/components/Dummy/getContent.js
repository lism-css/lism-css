import TEXTS from './texts';

// 文字列を句読点で split する。この時、配列の最後にはその句読点を残す。
// 例: hoge, foo. → ['hoge.','foo.']
const splitByPunctuation = (content) => {
	return (
		content
			.split(/([,.、。])/)
			.filter((item) => item !== '')
			// 偶数インデックスの要素（文章）と奇数インデックスの要素（句読点）を結合する
			.reduce((acc, curr, i, arr) => {
				if (i % 2 === 0) {
					// 偶数インデックスの場合、現在の要素（文章）と次の要素（句読点）を結合
					// 次の要素が存在しない場合は空文字列を使用
					acc.push(curr + (arr[i + 1] || ''));
				}
				return acc;
			}, [])
	);
};

export default function getContent({ tag = 'p', pre = '', length = 'm', lang = 'en', offset = 0 }) {
	let content = TEXTS[lang][length] || '';
	if (tag === 'ul' || tag === 'ol') {
		// 句読点でsplitして、ul にして返す
		content = splitByPunctuation(content)
			.map((item) => `<li>${item.trim()}</li>`)
			.join('');
		if (pre) {
			content = `<li>${pre}</li>` + content;
		}
	} else {
		if (offset) {
			// , . で split して、offset分だけ配列削除.
			content = splitByPunctuation(content).slice(offset).join('').trim();
			//１文字目を大文字にする
			content = content.charAt(0).toUpperCase() + content.slice(1);
		}
		if (pre) {
			content = pre + content;
		}
	}
	return content;
}
