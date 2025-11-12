import { Lism } from '../../Lism';
import getProps from './getProps';

export default function Media(props) {
	return <Lism tag='img' {...getProps(props)} />;
}
