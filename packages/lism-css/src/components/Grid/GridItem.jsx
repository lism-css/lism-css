// import React from 'react';
import { Lism } from '../Lism';
import { getGridItemProps } from './getProps';

export default function GridItem({ children, layout, ...props }) {
	const LismComponent = layout || Lism;

	return <LismComponent {...getGridItemProps(props)}>{children}</LismComponent>;
}
