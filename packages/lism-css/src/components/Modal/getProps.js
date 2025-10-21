import atts from '../../lib/helper/atts';

export function getProps({ lismClass = '', setClass = '', duration, offset, style = {}, ...props }) {
	const theProps = {
		lismClass: atts(lismClass, 'd--modal'),
		setClass: atts(setClass, 'set-plain'),
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
	closeBtn: { tag: 'button', setClass: 'set-plain', hov: 'o', d: 'in-flex' },
	openBtn: { tag: 'button', setClass: 'set-plain', hov: 'o', d: 'in-flex' },
};
