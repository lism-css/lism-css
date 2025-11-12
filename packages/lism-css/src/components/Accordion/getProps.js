import atts from '../../lib/helper/atts';

// duration: [s]
export function getAccProps({ lismClass, ...props }) {
	props.lismClass = atts(lismClass, 'd--accordion');
	return props;
}

export function getAccIconProps({ isTrigger, ...props }) {
	const defaultProps = {
		lismClass: 'd--accordion_icon',
		tag: 'span',
		// d: 'inline-grid',
	};
	// isTrigger なら、buttun にする
	if (isTrigger) {
		defaultProps.tag = 'button';
		props['data-role'] = 'trigger';
	}

	return { ...defaultProps, ...props };
}

export const defaultProps = {
	header: { lismClass: 'd--accordion_header' },
	label: { lismClass: 'd--accordion_label', tag: 'span' },
	body: {
		lismClass: 'd--accordion_body',
	},
	inner: {
		lismClass: 'd--accordion_inner',
	},
};
