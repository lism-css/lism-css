import PRESETS from './presets';

export type CalloutProps = {
	type?: string;
	keycolor?: string;
	icon?: string;
	title?: string;
	flow?: string;
	[key: string]: unknown;
};

export default function getCalloutProps({ type = 'note', keycolor, icon, title, flow = 's', ...props }: CalloutProps) {
	const presetData = type ? PRESETS[type] : null;
	const _icon = icon || presetData?.icon || null;
	const _keycolor = keycolor || presetData?.color || null;

	return {
		icon: _icon,
		title,
		flow,
		lismClass: 'c--callout u-cbox',
		keycolor: _keycolor,
		p: '20',
		g: '10',
		bdc: 'keycolor',
		'bd-x-s': true,
		bdw: '4px',
		bxsh: '10',
		bdrs: '5',
		...props,
	};
}
