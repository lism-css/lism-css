import { Flow, Flex, Stack, Icon, Center } from 'lism-css/react';
import PRESETS from './presets.js';

export default function Note({ type = 'note', keycolor, icon, title, children, flow = 's', ...props }) {
	const presets = type ? PRESETS[type] : null;
	if (presets) {
		keycolor = keycolor || presets?.color || null;
		icon = icon || presets?.icon || null;
	}

	return (
		<Stack lismClass='c--note u-cbox set-shadow' keycolor={keycolor} p='20' g='10' bdc='keycolor' bd-x-s bdw='4px' bxsh='10' bdrs='5' {...props}>
			{title && (
				<Flex className='c--note_head' c='keycolor' fw='bold' ai='center' g='10'>
					<Center className='c--note_icon' fz='xl'>
						<Icon icon={icon} />
					</Center>
					<span className='c--note_title'>{title}</span>
				</Flex>
			)}
			<Flow className='c--note_body' flow={flow}>
				{children}
			</Flow>
		</Stack>
	);
}
