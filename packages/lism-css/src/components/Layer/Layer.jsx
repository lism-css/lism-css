import { Lism } from '../Lism';
import { getLayerProps } from './getProps';

export default function Layer({ layout, ...props }) {
	const Layout = layout || Lism;
	return <Layout isLayer {...getLayerProps(props)} />;
}
