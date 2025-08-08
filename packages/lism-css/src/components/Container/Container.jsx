import { Lism } from '../Lism';

export default function Container({ size, layout, ...props }) {
	const Layout = layout || Lism;
	return <Layout isContainer={size || true} {...props} />;
}
