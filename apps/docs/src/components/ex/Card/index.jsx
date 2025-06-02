import { WithSide } from 'lism-css/react';

export default function Card({ layout, ...props }) {
	const Layout = layout || WithSide;

	const defaultProps = {
		c: 'text',
		bgc: 'base',
		bdrs: '3',
		bxsh: '2',
		ov: 'h',
	};

	// hrefが指定されていればlink化
	if (props.href) {
		defaultProps.tag = 'a';
		defaultProps.isLinkBox = true;
	}

	return <Layout lismClass='c--card' {...defaultProps} {...props} />;
}
