import { Lism } from '../../Lism';
import getProps from './getProps';

export default function Spacer(props) {
	return <Lism {...getProps(props)} />;
}
