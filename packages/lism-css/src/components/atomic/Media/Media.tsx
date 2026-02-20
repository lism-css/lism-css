import { Lism } from '../../Lism';
import getProps, { type MediaProps } from './getProps';

export default function Media(props: MediaProps) {
	return <Lism as='img' {...getProps(props)} />;
}
