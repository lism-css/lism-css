import { Lism } from '../Lism';
import { defaultProps } from './getProps';

export default function ModalHeader({ children, layout, ...props }) {
	const Layout = layout || Lism;
	return (
		<Layout {...defaultProps.header} {...props}>
			{children}
		</Layout>
	);
}
