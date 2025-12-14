import { Flow, Flex, Stack, Icon, Center } from 'lism-css/react';
import PRESETS from './presets.js';

export default function Note({ type = 'note', keycolor, icon, title, children, flow = 's', ...props }) {
	const presets = type ? PRESETS[type] : null;
	if (presets) {
		keycolor = keycolor || presets?.color || null;
		icon = icon || presets?.icon || null;
	}

	return (
		<Stack lismClass='c--note u-cbox' keycolor={keycolor} p='15' g='10' bd-x-s bdw='4px' bdrs='5' {...props}>
			{title && (
				<Flex className='c--note_head' fw='bold' ai='center' g='10'>
					<Center className='c--note_icon' fz='xl' c='keycolor'>
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
