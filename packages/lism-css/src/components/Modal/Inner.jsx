import { Lism } from '../Lism';
import { defaultProps } from './getProps';

export default function ModalInner({ children, ...props }) {
	return (
		<Lism {...defaultProps.inner} {...props}>
			{children}
		</Lism>
	);
}
