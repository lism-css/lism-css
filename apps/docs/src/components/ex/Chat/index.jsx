import React from 'react';
import { Lism, Grid, Frame, Media, Decorator } from 'lism-css/react';
import './style.css';

export default function Chat({ variant = 'speak', direction = 'start', name, avatar, keycolor = 'gray', flowGap = 's', children, ...props }) {
	return (
		<Grid lismClass='c--chat' variant={variant} keycolor={keycolor} data-chat-dir={direction} ji={direction} {...props}>
			{avatar && (
				<Frame lismClass='c--chat_avatar' ga='u:avatar' src={avatar} alt='' bgc='base' ar='1/1' bdrs='99' aria-hidden='true'>
					<Media src={avatar} alt='' width='60' height='60' decoding='async' />
				</Frame>
			)}
			{name && (
				<Lism lismClass='c--chat_name' ga='u:header' c='text-2' fs='italic' fz='2xs' lh='1' py='5' px='10' aslf='end'>
					{name}
				</Lism>
			)}
			<Lism lismClass='c--chat_body' ga='u:body' pos='rel'>
				<Decorator lismClass='c--chat_deco' className='u--cbox -flow:skip' pos='abs' scale={direction === 'start' ? '' : '-X'} />
				<Lism lismClass='c--chat_content' layout='flow' className='u--cbox u--trimBox' bdrs='30' p='30' flowGap={flowGap} jslf={direction}>
					{children}
				</Lism>
			</Lism>
		</Grid>
	);
}
