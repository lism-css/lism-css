import { Stack } from '../Stack';
import { defaultProps } from './getProps';

export default function ModalInner({ children, ...props }) {
	return (
		<Stack {...defaultProps.inner} {...props}>
			{children}
		</Stack>
	);
}
