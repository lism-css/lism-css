import { Lism, WithSide, Center, Icon } from 'lism-css/react';
import PRESETS from './presets';

export default function Callout({ type = 'alert', keycol, icon, isFlow, children, ...props }) {
	const presetData = type ? PRESETS[type] : null;
	const _icon = icon || presetData?.icon || 'info';
	const _color = keycol || presetData?.color || 'currentColor';

	return (
		<WithSide
			lismClass='c--callout u--colbox'
			keycol={_color}
			p='20'
			g='20'
			bd
			bdrs='2'
			{...props}
		>
			<Center data-is-side lismClass='c--callout__icon' c='keycol' fz='xl' p='5'>
				<Icon icon={_icon} />
			</Center>
			<Lism lismClass='c--callout__body' isFlow={isFlow}>
				{children}
			</Lism>
		</WithSide>
	);
}
