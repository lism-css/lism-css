import { Lism, type LismComponentProps } from '../../Lism';
import getProps, { type MediaOwnProps } from './getProps';

type MediaComponentProps = LismComponentProps<'img'> & MediaOwnProps;

export default function Media(props: MediaComponentProps) {
	return <Lism as='img' {...getProps(props)} />;
}
