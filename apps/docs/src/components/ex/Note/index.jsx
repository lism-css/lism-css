import { Lism, Flex, Stack, Icon, Center } from 'lism-css/react';
import PRESETS from './presets.js';

export default function Note({ type = 'note', keycolor, icon, title, children, isFlow = 's', ...props }) {
	const presets = type ? PRESETS[type] : null;
	if (presets) {
		keycolor = keycolor || presets?.color || null;
		icon = icon || presets?.icon || null;
	}

	return (
		<Stack lismClass='c--note u--cbox' keycolor={keycolor} p='30' g='20' bd='is' bdw='4px' bdrs='5' {...props}>
			{title && (
				<Flex className='c--note_head' fw='bold' ai='c' g='20'>
					<Center className='c--note_icon' fz='l' c='keycolor'>
						<Icon icon={icon} scale='1.1' />
					</Center>
					<span className='c--note_title'>{title}</span>
				</Flex>
			)}
			<Lism className='c--note_body' isFlow={isFlow}>
				{children}
			</Lism>
		</Stack>
	);
}
