/**
 * Chat コンポーネントの共通プロパティ処理
 */

// 各サブ要素のデフォルトプロパティ
export const defaultProps = {
	avatar: {
		lismClass: 'c--chat_avatar',
		bgc: 'base',
		ar: '1/1',
		bdrs: '99',
		'aria-hidden': 'true',
	},
	name: {
		lismClass: 'c--chat_name',
		c: 'text-2',
		fs: 'italic',
		fz: '2xs',
		lh: '1',
		py: '5',
		px: '10',
		aslf: 'end',
	},
	body: {
		lismClass: 'c--chat_body',
		pos: 'rel',
	},
	deco: {
		lismClass: 'c--chat_deco',
		pos: 'abs',
	},
	content: {
		lismClass: 'c--chat_content',
		bdrs: '30',
		p: '20',
		lh: 's',
	},
};

/**
 * Chat コンポーネントのルートプロパティを生成
 */
export default function getChatProps({
	variant = 'speak',
	direction = 'start',
	keycolor = 'gray',
	...props
}) {
	return {
		lismClass: 'c--chat',
		variant,
		keycolor,
		'data-chat-dir': direction,
		ji: direction,
		...props,
	};
}
