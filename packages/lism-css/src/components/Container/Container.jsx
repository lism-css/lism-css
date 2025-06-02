import { Lism } from '../Lism';

export default function Container({ size = true, layout, ...props }) {
	const Layout = layout || Lism;
	return <Layout isContainer={size} {...props} />;
}
