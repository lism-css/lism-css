import { Lism } from 'lism-css/react';

export default function Card({ layout = 'withSide', ...props }) {
	const defaultProps = {
		c: 'text',
		bgc: 'base',
		bdrs: '20',
		bxsh: '20',
		ov: 'h',
	};

	// hrefが指定されていればlink化
	if (props.href) {
		defaultProps.tag = 'a';
		defaultProps.isLinkBox = true;
	}

	return <Lism lismClass='c--card' {...defaultProps} {...props} />;
}
