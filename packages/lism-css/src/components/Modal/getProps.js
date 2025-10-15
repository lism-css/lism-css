import atts from '../../lib/helper/atts';

export function getProps({ lismClass = '', duration, offset, style = {}, ...props }) {
	const theProps = {
		lismClass: atts(lismClass, 'd--modal'),
		lismState: ['re--style'],
	};
	if (duration) {
		style['--duration'] = duration;
	}
	if (offset) {
		style['--offset'] = offset;
	}

	return { ...theProps, style, ...props };
}

export const defaultProps = {
	body: { lismClass: 'd--modal_body' },
	inner: { lismClass: 'd--modal_inner' },
	closeBtn: { tag: 'button', lismState: ['re--style'], hov: 'o', d: 'in-flex' },
	openBtn: { tag: 'button', lismState: ['re--style'], hov: 'o', d: 'in-flex' },
};
