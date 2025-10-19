import React from 'react';
import getLismProps from '../../lib/getLismProps';
import { getAccProps, defaultProps } from './getProps';
import { setEvent } from './setAccordion';
import { Lism } from '../Lism';
// import { Flex } from '../Flex';
import { Grid } from '../Grid';

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
		<Grid tag='summary' {...defaultProps.header} {...props}>
			{children}
		</Grid>
	);
}
export function Label({ children, ...props }) {
	return (
		<Lism {...defaultProps.label} {...props}>
			{children}
		</Lism>
	);
}

export function Body({ children, flowGap, innerProps, ...props }) {
	return (
		<Grid {...defaultProps.body} {...props}>
			<Lism layout='flow' flowGap={flowGap} {...defaultProps.inner} {...innerProps}>
				{children}
			</Lism>
		</Grid>
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
