import atts from '../../lib/helper/atts';

// duration: [s]
export function getAccProps({ lismClass, ...props }) {
	props.lismClass = atts(lismClass, 'd--accordion');
	return props; //mergeFlexContextProps(props);
}

export function getAccIconProps({ isTrigger, ...props }) {
	const defaultProps = {
		lismClass: 'd--accordion__icon',
		tag: 'span',
		d: 'inline-grid',
	};
	// isTrigger なら、buttun にする
	if (isTrigger) {
		defaultProps.tag = 'button';
		props['data-role'] = 'trigger';
	}

	return { ...defaultProps, ...props };
}

export const defaultProps = {
	header: { lismClass: 'd--accordion__header', ai: 'c' },
	label: { lismClass: 'd--accordion__label', tag: 'span', fx: '1' },
	body: {
		lismClass: 'd--accordion__body',
		// trs: true,
	},
	inner: {
		lismClass: 'd--accordion__inner',
		ov: 'hidden',
	},
};
