import React from 'react';
import { Lism } from '../Lism';

export default function Tab({ tabId = 'tab', index = 0, isActive = false, ...props }) {
	const controlId = `${tabId}-${index}`;

	return (
		<Lism
			tag='button'
			lismClass='d--tabs_tab'
			setClass='set-plain'
			role='tab'
			aria-controls={controlId}
			aria-selected={isActive ? 'true' : 'false'}
			{...props}
		/>
	);
}
