import React from 'react';
import { Lism, Stack, Grid, Frame, Decorator } from 'lism-css/react';
import './style.css';

export default function Chat({ variant = 'speak', direction = 'start', name, avatar, keycolor = 'gray', flow = 's', children, ...props }) {
	return (
		<Grid lismClass='c--chat' variant={variant} keycolor={keycolor} data-chat-dir={direction} ji={direction} {...props}>
			{avatar && (
				<Frame lismClass='c--chat_avatar' src={avatar} alt='' bgc='base' ar='1/1' bdrs='99' aria-hidden='true'>
					<img src={avatar} alt='' width='60' height='60' decoding='async' />
				</Frame>
			)}
			{name && (
				<Lism lismClass='c--chat_name' c='text-2' fs='italic' fz='2xs' lh='1' py='5' px='10' aslf='end'>
					{name}
				</Lism>
			)}
			<Lism lismClass='c--chat_body' pos='rel'>
				<Decorator lismClass='c--chat_deco' className='u-cbox is--skipFlow' pos='abs' scale={direction === 'start' ? '' : '-X'} />
				<Stack lismClass='c--chat_content' className='u-cbox u-trimItems' bdrs='30' g='30' p='40' lh='s' flow={flow} jslf={direction}>
					{children}
				</Stack>
			</Lism>
		</Grid>
	);
}
