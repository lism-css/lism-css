import React from 'react';
import { GridItem } from '../Grid';

export default function TabPanel({ tabId = 'tab', isActive = false, index = 0, ...props }) {
	const controlId = `${tabId}-${index}`;

	return (
		<GridItem
			id={controlId}
			role='tabpanel'
			aria-hidden={isActive ? 'false' : 'true'}
			lismClass='d--tabs__panel'
			{...props}
		/>
	);
}
