import React from 'react';
import { Lism } from '../Lism';
import { setEvent } from './setModal';
import { getProps } from './getProps';

// duration: [s]
const Modal = ({ children, layout, ...props }) => {
	const ref = React.useRef(null);
	React.useEffect(() => {
		if (!ref?.current) return;
		return setEvent(ref?.current);
	}, [ref]);

	const Layout = layout || Lism;

	return (
		<Layout tag='dialog' forwardedRef={ref} {...getProps(props)}>
			{children}
		</Layout>
	);
};
export default Modal;
