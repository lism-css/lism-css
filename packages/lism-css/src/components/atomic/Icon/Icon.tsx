import getLismProps from '../../../lib/getLismProps';
import { type LismComponentProps } from '../../Lism/Lism';
import getProps, { type IconOwnProps, type IconElementProps } from './getProps';
import type { TransformStyleProps } from '../../setMaybeTransformStyles';
import SVG from './SVG';
import type { ElementType, ReactNode } from 'react';

type IconComponentProps<T extends ElementType = 'svg'> = LismComponentProps<T> & TransformStyleProps & IconOwnProps & IconElementProps;

export default function Icon<T extends ElementType = 'svg'>({ children, ...props }: IconComponentProps<T> & { children?: ReactNode }) {
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
