// import React from 'react';
import { Lism } from '../Lism';
// import { getFlexItemProps } from './getProps';

export default function FlexItem({ children, layout, ...props }) {
	// props = getFlexItemProps(props);

	const LismComponent = layout || Lism;
	return <LismComponent {...props}>{children}</LismComponent>;
}
