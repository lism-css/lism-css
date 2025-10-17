import { Lism } from '../Lism';
import getFilterProps from '../getFilterProps';

export default function Layer(props) {
	return <Lism isLayer {...getFilterProps(props, 'backdropFilter')} />;
}
