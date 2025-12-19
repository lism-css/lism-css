import React from 'react';
import { Lism } from '../../Lism';
import { setEvent } from '../setModal';
import { getProps } from '../getProps';

// duration: [s]
const Modal = ({ children, ...props }) => {
	const ref = React.useRef(null);
	React.useEffect(() => {
		if (!ref?.current) return;
		return setEvent(ref?.current);
	}, [ref]);

	return (
		<Lism forwardedRef={ref} {...getProps(props)}>
			{children}
		</Lism>
	);
};
export default Modal;
