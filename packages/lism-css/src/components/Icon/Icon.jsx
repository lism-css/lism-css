import getLismProps from '../../lib/getLismProps';
import getProps from './getProps';
import SVG from './SVG';

export default function Icon({ children, ...props }) {
	let { Component, lismProps, exProps = {}, content } = getProps(props);

	if (Component === '_SVG_') {
		Component = SVG;
		if (content) {
			exProps.__html = content;
		}
	}

	return (
		<Component {...getLismProps(lismProps)} {...exProps}>
			{children}
		</Component>
	);
}
