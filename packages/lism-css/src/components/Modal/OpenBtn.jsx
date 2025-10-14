import { Lism } from '../Lism';
import { defaultProps } from './getProps';
// duration: [s]
export default function OpenBtn({ children, modalId = '', ...props }) {
	return (
		<Lism data-modal-open={modalId} {...defaultProps.openBtn} {...props}>
			{children}
		</Lism>
	);
}
