import { Stack } from '../Stack';
import { defaultProps } from './getProps';

export default function ModalInner({ children, layout, ...props }) {
	const Layout = layout || Stack;
	return (
		<Layout {...defaultProps.inner} {...props}>
			{children}
		</Layout>
	);
}
