/* eslint-disable */
import React from 'react';

import { Lism, Layer, Flex, Dummy } from 'lism-css/react';

export function AttsLabels({ atts = '', ...props }) {
	// attsを , で分割
	const attsArray = atts.split(',') || [];
	return (
		<Flex
			className='c--attsLabels is--skipFlow'
			w='100%'
			max-w='100%'
			jc='center'
			pos='abs'
			t='0'
			l='0'
			ta='center'
			lh='1'
			mt='-1.1em'
			ov='hidden'
			z='1'
			{...props}
		>
			{attsArray.map((att) => (
				<TipCode key={att} text={att} />
			))}
		</Flex>
	);
}

export function TipCode({
	text = '',
	color,
	children,
	...props
}: {
	text?: string;
	color?: string;
	children?: React.ReactNode;
	[key: string]: any;
}): JSX.Element {
	// <TipCode text='is--container' color='orange' />

	// text が "container:" を含むかどうかを判定
	if (!color) {
		if (text.includes('container:')) {
			color = 'blue';
		} else if (text.includes('container')) {
			color = 'green';
		} else if (text.includes('flow')) {
			color = 'orange';
		} else if (text.includes('gutter') || text.startsWith('-')) {
			color = 'purple';
		} else {
			color = 'gray';
		}
	}

	return (
		<Lism tag='code' bd d='in-flex' fz='s' lh='xs' px='10' m='5' bdrs='5' whspace='nowrap' className='u-cbox' keycolor={color} {...props}>
			{text || children}
		</Lism>
	);
}

export function GutterGuide(props?: any) {
	return <Layer className='has--gutterGuide' my-s='0' />;
}

export function WideContent(props: any) {
	const { children, ...atts } = props;
	return (
		<Lism max-sz='wide' ta='center' bg=':stripe' bgc='yellow:12%' {...atts}>
			<TipCode text='-max-sz:wide' color='yellow' m='5' />
			{children}
		</Lism>
	);
}

export function FullSizeContent(props: any) {
	const { children, ...atts } = props;
	return (
		<Lism max-sz='full' ta='center' bg=':stripe' bgc='orange:12%' {...atts}>
			<TipCode text='-max-sz:full' color='orange' m='5' />
			{children}
		</Lism>
	);
}

export function Overwide(props: any) {
	const { children, ...atts } = props;
	return (
		<Lism max-sz='outer' ta='center' bg=':stripe' bgc='pink:12%' {...atts}>
			<TipCode text='-max-sz:outer' color='pink' m='5' />
			{children}
		</Lism>
	);
}
export function LoremContent(props: any) {
	const { children, length = 'l', ...atts } = props;
	return <Dummy py='5' px='10' bg=':stripe' bgc='gray:4%' length={length} {...atts} />;
}
