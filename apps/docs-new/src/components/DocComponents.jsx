import { HTML, Icon } from 'lism-css/react';
import Callout from '@/components/ex/Callout/index.jsx';
import Badge from '@/components/ex/Badge/index.jsx';
import ICON_PRESETS from '@/components/ex/Callout/presets.js';
import { BookOpenTextIcon as BookIcon } from '@phosphor-icons/react';

export const HelpText = ({ tag = 'p', children, ...props }) => {
	const _props = { tag, c: 'text-2', lh: 's', fz: 's' };
	if (tag === 'small') {
		_props.d = 'b';
		_props.fz = 'xs';
	} else {
		_props['my-s'] = '20';
	}
	return (
		<HTML.p {..._props} {...props}>
			{children}
		</HTML.p>
	);
};

export const IconBadge = ({ type = 'info' }) => {
	const presetData = type ? ICON_PRESETS[type] : null;
	return <Icon icon={presetData?.icon} variant='inline' c={presetData?.color} />;
};

export function Reference({ children }) {
	return (
		<Callout icon={BookIcon} keycolor='purple'>
			{children}
		</Callout>
	);
}

export const MemoBadge = ({ children, color = 'orange', ...props }) => {
	return (
		<Badge fz='s' lh='1' p='5' lismClass='u-cbox' bd keycolor={color} {...props}>
			{children}
		</Badge>
	);
};
export const PropBadge = ({ type = '', ...props }) => {
	let keycolor = 'blue';
	if (type === 'attr') {
		keycolor = 'green';
	} else if (type === 'cssvar') {
		keycolor = 'purple';
	}
	return <HTML.span lismClass='c--propBadge' className='u-cbox' fz='2xs' lh='s' ff='mono' bd px='10' bdrs='5' keycolor={keycolor} {...props} />;
};
