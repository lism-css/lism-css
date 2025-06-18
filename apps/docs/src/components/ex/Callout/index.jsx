import { Lism, WithSide, Center, Icon } from 'lism-css/react';
import PRESETS from './presets';
import './style.css';

export default function Callout({ type = 'alert', keycolor, icon, isFlow, children, ...props }) {
	const presetData = type ? PRESETS[type] : null;
	const _icon = icon || presetData?.icon || 'info';
	const _color = keycolor || presetData?.color || 'currentColor';

	return (
		<WithSide lismClass='c--callout u--cbox' keycolor={_color} p='30' g='30' bd bdrs='10' {...props}>
			<Center data-is-side c='keycolor' fz='xl'>
				<Icon icon={_icon} />
			</Center>
			<Lism className='u--trimBox' isFlow={isFlow}>
				{children}
			</Lism>
		</WithSide>
	);
}
