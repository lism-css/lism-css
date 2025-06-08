import React from 'react';
import { Lism, GridItem, Grid, Frame, Media, Decorator } from 'lism-css/react';
import './style.scss';

export default function Chat({ variant = 'speak', direction = 'start', name, avatar, isFlow, keycol = 'gray', children, ...props }) {
	return (
		<Grid lismClass='c--chat' variant={variant} keycol={keycol} bg='none' data-chat-direction={direction} ji={direction} {...props}>
			{avatar && (
				<GridItem layout={Frame} lismClass='c--chat__avatar' src={avatar} alt='' bgc='base' ar='1/1' bdrs='99' aria-hidden='true'>
					<Media src={avatar} alt='' width='60' height='60' decoding='async' />
				</GridItem>
			)}
			{name && (
				<GridItem lismClass='c--chat__name' c='text-2' fs='i' fz='2xs' lh='1' py='5' px='10' aslf='e'>
					{name}
				</GridItem>
			)}
			<GridItem lismClass='c--chat__body' pos='r'>
				<Decorator lismClass='c--chat__deco' className='u--colbox u--skipFlow' pos='a' scale={direction === 'start' ? '' : '-X'} />
				<Lism lismClass='c--chat__content' className='u--colbox u--trimBox' bdrs='30' p='30' isFlow={isFlow} jslf={direction}>
					{children}
				</Lism>
			</GridItem>
		</Grid>
	);
}
