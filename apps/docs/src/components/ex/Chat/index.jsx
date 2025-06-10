import React from 'react';
import { Lism, GridItem, Grid, Frame, Media, Decorator } from 'lism-css/react';
import './style.css';

export default function Chat({ variant = 'speak', direction = 'start', name, avatar, isFlow, keycol = 'gray', children, ...props }) {
	let contentClass = 'u--colbox u--trimBox';
	if (variant === 'speak' && direction === 'start') {
		contentClass += ' -bdssrs:0';
	} else if (variant === 'speak' && direction === 'end') {
		contentClass += ' -bdsers:0';
	}

	return (
		<Grid lismClass='c--chat' variant={variant} keycol={keycol} bg='none' data-chat-dir={direction} ji={direction} {...props}>
			{avatar && (
				<GridItem
					layout={Frame}
					lismClass='c--chat__avatar'
					ga='u:avatar'
					src={avatar}
					alt=''
					bgc='base'
					ar='1/1'
					bdrs='99'
					aria-hidden='true'
				>
					<Media src={avatar} alt='' width='60' height='60' decoding='async' />
				</GridItem>
			)}
			{name && (
				<GridItem lismClass='c--chat__name' ga='u:header' c='text-2' fs='i' fz='2xs' lh='1' py='5' px='10' aslf='e'>
					{name}
				</GridItem>
			)}
			<GridItem lismClass='c--chat__body' ga='u:body' pos='r'>
				<Decorator lismClass='c--chat__deco' className='u--colbox u--skipFlow' pos='a' scale={direction === 'start' ? '' : '-X'} />
				<Lism lismClass='c--chat__content' className={contentClass} bdrs='30' p='30' isFlow={isFlow} jslf={direction}>
					{children}
				</Lism>
			</GridItem>
		</Grid>
	);
}
