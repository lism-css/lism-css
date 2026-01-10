import atts from 'lism-css/lib/helper/atts';

// duration: [s]
export function getAccProps({ lismClass, ...props }) {
	props.lismClass = atts(lismClass, 'c--accordion');
	return props;
}

export function getAccIconProps({ isTrigger, ...props }) {
	const defaultProps = {
		lismClass: 'c--accordion_icon',
		tag: 'span',
	};
	// isTrigger なら、buttun にする
	if (isTrigger) {
		defaultProps.tag = 'button';
		props['data-role'] = 'trigger';
	}

	return { ...defaultProps, ...props };
}

export const defaultProps = {
	header: { lismClass: 'c--accordion_header' },
	label: { lismClass: 'c--accordion_label', tag: 'span' },
	body: {
		lismClass: 'c--accordion_body',
	},
	inner: {
		lismClass: 'c--accordion_inner',
	},
};
