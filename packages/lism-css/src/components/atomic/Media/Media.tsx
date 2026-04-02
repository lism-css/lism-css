import { Lism, type LismComponentProps } from '../../Lism';
import getProps, { type MediaOwnProps } from './getProps';

type MediaAllowedTag = 'img' | 'video' | 'iframe' | 'picture';
type MediaComponentProps<T extends MediaAllowedTag = 'img'> = LismComponentProps<T> & MediaOwnProps;

export default function Media<T extends MediaAllowedTag = 'img'>({ as, ...props }: MediaComponentProps<T>) {
  return <Lism as={as ?? 'img'} {...getProps(props)} />;
}
