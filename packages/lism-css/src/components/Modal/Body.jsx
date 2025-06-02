import { Lism } from '../Lism';
import { defaultProps } from './getProps';

export default function ModalBody({ layout, children, ...props }) {
	const Layout = layout || Lism;
	return (
		<Layout {...defaultProps.body} {...props}>
			{children}
		</Layout>
	);
}
