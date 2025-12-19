// import React from 'react';
import { Lism } from 'lism-css/react';

export default function TabPanel({ tabId = 'tab', isActive = false, index = 0, ...props }) {
	const controlId = `${tabId}-${index}`;

	return <Lism id={controlId} role='tabpanel' aria-hidden={isActive ? 'false' : 'true'} lismClass='d--tabs_panel' {...props} />;
}
