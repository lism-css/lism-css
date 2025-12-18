import { Lism } from '../Lism';
import { defaultProps } from './getProps';

export default function ModalBody({ children, ...props }) {
	return (
		<Lism {...defaultProps.body} {...props}>
			{children}
		</Lism>
	);
}
