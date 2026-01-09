import { Lism, Flow, Grid, Frame, Decorator } from 'lism-css/react';
import '../_style.css';

/**
 * Chat コンポーネント
 * チャット形式の吹き出しUIを提供します。
 *
 * @param {string} variant - 吹き出しスタイル（'speak' | 'think'）
 * @param {string} direction - 吹き出しの方向（'start' | 'end'）
 * @param {string} name - 発言者名
 * @param {string} avatar - アバター画像URL
 * @param {string} keycolor - キーカラー
 * @param {string} flow - コンテンツのフロー間隔
 */
export default function Chat({ variant = 'speak', direction = 'start', name, avatar, keycolor = 'gray', flow = 's', children, ...props }) {
	return (
		<Grid lismClass='c--chat' variant={variant} keycolor={keycolor} data-chat-dir={direction} ji={direction} {...props}>
			{/* アバター画像 */}
			{avatar && (
				<Frame lismClass='c--chat_avatar' src={avatar} alt='' bgc='base' ar='1/1' bdrs='99' aria-hidden='true'>
					<img src={avatar} alt='' width='60' height='60' decoding='async' />
				</Frame>
			)}

			{/* 発言者名 */}
			{name && (
				<Lism lismClass='c--chat_name' c='text-2' fs='italic' fz='2xs' lh='1' py='5' px='10' aslf='end'>
					{name}
				</Lism>
			)}

			{/* 吹き出し本体 */}
			<Lism lismClass='c--chat_body' pos='rel'>
				{/* 装飾（吹き出しの尻尾） */}
				<Decorator lismClass='c--chat_deco' className='u-cbox is--skipFlow' pos='abs' />
				{/* コンテンツ */}
				<Flow lismClass='c--chat_content' className='u-cbox' bdrs='30' p='20' lh='s' flow={flow} jslf={direction}>
					{children}
				</Flow>
			</Lism>
		</Grid>
	);
}
