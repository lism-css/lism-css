import { Lism, Flex, Stack, Icon, Center } from 'lism-css/react';
import PRESETS from './presets.js';

export default function Note({
	type = 'note',
	keycol,
	icon,
	title,
	children,
	isFlow = 's',
	...props
}) {
	const presets = type ? PRESETS[type] : null;
	if (presets) {
		keycol = keycol || presets?.color || null;
		icon = icon || presets?.icon || null;
	}

	return (
		<Stack
			lismClass='c--note u--colbox'
			keycol={keycol}
			p='30'
			g='20'
			bd='is'
			bdc='keycol'
			bdw='4px'
			bdrs='2px'
			{...props}
		>
			{title && (
				<Flex className='c--note__head' fw='bold' ai='c' g='20' skipState>
					<Center className='c--note__icon' fz='l' c='keycol' skipState>
						<Icon icon={icon} scale='1.25' />
					</Center>
					<span className='c--note__title'>{title}</span>
				</Flex>
			)}
			<Lism className='c--note__body' isFlow={isFlow}>
				{children}
			</Lism>
		</Stack>
	);
}
