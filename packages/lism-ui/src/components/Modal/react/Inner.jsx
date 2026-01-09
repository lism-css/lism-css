import { Lism } from 'lism-css/react';
import { getInnerProps } from '../getProps';

export default function ModalInner({ children, ...props }) {
	return <Lism {...getInnerProps(props)}>{children}</Lism>;
}
