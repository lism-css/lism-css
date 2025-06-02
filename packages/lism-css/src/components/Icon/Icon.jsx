import getLismProps from '../../lib/getLismProps';
import getProps from './getProps';
import SVG from './SVG';

export default function Icon({ children, ...props }) {
	let { Component, lismProps, exProps } = getProps(props);

	if (Component === '_SVG_') {
		Component = SVG;
	}

	return (
		<Component {...getLismProps(lismProps)} {...exProps}>
			{children}
		</Component>
	);
}
