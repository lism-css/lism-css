import { Lism } from '../Lism';
import { defaultProps } from './getProps';

export default function ModalFooter({ layout, children, ...props }) {
	const Layout = layout || Lism;
	return (
		<Layout {...defaultProps.footer} {...props}>
			{children}
		</Layout>
	);
}
