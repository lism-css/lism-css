import { Lism } from '../Lism';
import getProps from './getProps';

export default function Frame({ ...props }) {
	return <Lism {...getProps(props)} />;
}
