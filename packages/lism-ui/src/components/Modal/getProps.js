import atts from 'lism-css/lib/helper/atts';

export function getProps({ lismClass = '', duration, style = {}, ...props }) {
	const theProps = {
		lismClass: atts(lismClass, 'd--modal'),
		setPlain: true,
	};
	if (duration) {
		style['--duration'] = duration;
	}

	return { tag: 'dialog', ...theProps, style, ...props };
}

export function getInnerProps({ lismClass = '', offset, style = {}, ...props }) {
	if (offset) {
		style['--offset'] = offset;
	}
	return {
		lismClass: atts(lismClass, 'd--modal_inner'),
		style,
		...props,
	};
}

export const defaultProps = {
	body: { lismClass: 'd--modal_body' },
	closeBtn: { tag: 'button', setPlain: true, hov: 'o', d: 'in-flex' },
	openBtn: { tag: 'button', setPlain: true, hov: 'o', d: 'in-flex' },
};
