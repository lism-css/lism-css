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
	body: { lismClass: 'd--modal__body', ov: 'auto' },
	inner: { lismClass: 'd--modal__inner', pos: 'r', maxH: '100%', bgc: 'base' },
	closeBtn: { lismClass: 'd--modal__close', lismState: ['re--style'], tag: 'button' },
	header: { lismClass: 'd--modal__header' },
	footer: { lismClass: 'd--modal__footer' },
};
