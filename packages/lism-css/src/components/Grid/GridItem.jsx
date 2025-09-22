import { Lism } from '../Lism';
// import { getGridItemProps } from './getProps';

export default function GridItem({ children, layout, ...props }) {
	const LismComponent = layout || Lism;

	return <LismComponent {...props}>{children}</LismComponent>;
}
