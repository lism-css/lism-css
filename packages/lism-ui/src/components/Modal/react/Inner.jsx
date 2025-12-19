import { Lism } from '../../Lism';
import { getInnerProps } from '../getProps';

export default function ModalInner({ children, ...props }) {
	return <Lism {...getInnerProps(props)}>{children}</Lism>;
}
