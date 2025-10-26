import atts from '../../lib/helper/atts';

export function getProps({ lismClass = '', duration, offset, style = {}, ...props }) {
	const theProps = {
		lismClass: atts(lismClass, 'd--modal'),
		setPlain: true,
	};
	if (duration) {
		style['--duration'] = duration;
	}
	if (offset) {
		style['--offset'] = offset;
	}

	return { tag: 'dialog', ...theProps, style, ...props };
}

export const defaultProps = {
	body: { lismClass: 'd--modal_body' },
	inner: { lismClass: 'd--modal_inner', layout: 'stack' },
	closeBtn: { tag: 'button', setPlain: true, hov: 'o', d: 'in-flex' },
	openBtn: { tag: 'button', setPlain: true, hov: 'o', d: 'in-flex' },
};
