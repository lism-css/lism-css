import React from 'react';
import { Lism } from '../Lism';

export default function Tab({ tabId = 'tab', index = 0, isActive = false, ...props }) {
	const controlId = `${tabId}-${index}`;

	return (
		<Lism
			tag='button'
			lismClass='d--tabs__tab'
			className='re--style'
			role='tab'
			aria-controls={controlId}
			aria-selected={isActive ? 'true' : 'false'}
			skipState
			{...props}
		/>
	);
}
