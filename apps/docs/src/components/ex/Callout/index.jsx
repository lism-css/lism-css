import { Flow, WithSide, Center, Icon } from 'lism-css/react';
import PRESETS from './presets';
import './style.css';

export default function Callout({ type = 'alert', keycolor, icon, flow, children, ...props }) {
	const presetData = type ? PRESETS[type] : null;
	const _icon = icon || presetData?.icon || 'info';
	const _color = keycolor || presetData?.color || 'currentColor';

	return (
		<WithSide lismClass='c--callout u-cbox' keycolor={_color} ai='center' p='15' g='15' bd bdrs='10' {...props}>
			<Center isSide c='keycolor' fz='xl'>
				<Icon icon={_icon} />
			</Center>
			<Flow flow={flow}>{children}</Flow>
		</WithSide>
	);
}
