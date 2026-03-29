import getLismProps from '../../../lib/getLismProps';
import { type LismComponentProps } from '../../Lism/Lism';
import getProps, { type IconProps } from './getProps';
import SVG from './SVG';
import type { ElementType, ReactNode, SVGAttributes, ImgHTMLAttributes } from 'react';

type IconElementProps = SVGAttributes<SVGSVGElement> & ImgHTMLAttributes<HTMLImageElement>;

type IconComponentProps<T extends ElementType = 'svg'> = LismComponentProps<T> & IconProps & IconElementProps;

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
