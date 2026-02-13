import atts from 'lism-css/lib/helper/atts';

// duration: [s]
export function getAccProps({ lismClass, ...props }) {
	props.lismClass = atts(lismClass, 'c--accordion');
	return props;
}

export function getHeadingProps(props) {
	const defaultProps = {
		lismClass: 'c--accordion_heading',
		tag: 'div',
	};

	const returnProps = { ...defaultProps, ...props };

	// div の時は role 付与
	if (returnProps.tag === 'div') {
		returnProps.role = 'heading';
	}
	return returnProps;
}

export const defaultProps = {
	// header: { lismClass: 'c--accordion_header' },
	button: {
		lismClass: 'c--accordion_button',
		tag: 'button',
		layout: 'flex',
		setPlain: 1,
		g: '10',
		ai: 'center',
	},
	icon: {
		lismClass: 'c--accordion_icon a--icon',
		tag: 'span',
		'aria-hidden': 'true',
	},
	panel: {
		lismClass: 'c--accordion_panel',
	},
	content: {
		lismClass: 'c--accordion_content',
	},
};
