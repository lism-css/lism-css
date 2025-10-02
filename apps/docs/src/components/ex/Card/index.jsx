import { WithSide } from 'lism-css/react';

export default function Card({ layout, ...props }) {
	const Layout = layout || WithSide;

	const defaultProps = {
		c: 'text',
		bgc: 'base',
		bdrs: '20',
		bxsh: '20',
		ov: 'hidden',
	};

	// hrefが指定されていればlink化
	if (props.href) {
		defaultProps.tag = 'a';
		defaultProps.isLinkBox = true;
	}

	return <Layout lismClass='c--card' {...defaultProps} {...props} />;
}
