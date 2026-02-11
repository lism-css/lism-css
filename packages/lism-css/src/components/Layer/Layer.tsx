import { Lism, type LismComponentProps } from '../Lism';
import getFilterProps, { type FilterProps } from '../getFilterProps';

type LayerProps = LismComponentProps & FilterProps;

export default function Layer(props: LayerProps) {
	return <Lism isLayer {...getFilterProps(props, 'backdropFilter')} />;
}
