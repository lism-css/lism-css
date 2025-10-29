import React from 'react';
import getLismProps from '../../lib/getLismProps';
import { getAccProps, defaultProps } from './getProps';
import { setEvent } from './setAccordion';
import { Lism } from '../Lism';

// import { AccContext } from './context';

// duration: [s]
export function Accordion({ children, ...props }) {
	const ref = React.useRef(null);

	React.useEffect(() => {
		if (!ref.current) return;
		return setEvent(ref.current);
	}, []);

	const lismProps = getLismProps(getAccProps(props));

	return (
		<details ref={ref} {...lismProps}>
			{/* <AccContext.Provider value={deliverState}>{children}</AccContext.Provider> */}
			{children}
		</details>
	);
}

export function Header({ children, ...props }) {
	return (
		<Lism tag='summary' {...defaultProps.header} {...props}>
			{children}
		</Lism>
	);
}
export function Label({ children, ...props }) {
	return (
		<Lism {...defaultProps.label} {...props}>
			{children}
		</Lism>
	);
}

export function Body({ children, flow, innerProps, ...props }) {
	return (
		<Lism {...defaultProps.body} {...props}>
			<Lism layout='flow' flow={flow} {...defaultProps.inner} {...innerProps}>
				{children}
			</Lism>
		</Lism>
	);
}
export function HeaderLabel({ children, ...props }) {
	return (
		<Header {...props}>
			<Label>{children}</Label>
			<Icon />
		</Header>
	);
}
