import getLismProps from '../../../lib/getLismProps';
import getProps, { type IconProps } from './getProps';
import SVG from './SVG';
import type { ElementType, ReactNode } from 'react';

export default function Icon({ children, ...props }: IconProps & { children?: ReactNode }) {
	const { Component, lismProps, exProps = {}, content } = getProps(props);

	let RenderComponent: ElementType;
	if (Component === '_SVG_') {
		RenderComponent = SVG;
		if (content) {
			exProps.__html = content;
		}
	} else {
		RenderComponent = Component;
	}

	return (
		<RenderComponent {...getLismProps(lismProps)} {...exProps}>
			{children}
		</RenderComponent>
	);
}
