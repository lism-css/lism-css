import { Lism, type LismComponentProps } from '../../Lism';
import getProps, { type MediaOwnProps } from './getProps';

type MediaAllowedTag = 'img' | 'video' | 'iframe' | 'picture';
type MediaProps = LismComponentProps<'img', MediaAllowedTag> & MediaOwnProps;

export default function Media({ as = 'img', ...props }: MediaProps) {
  return <Lism as={as} {...getProps(props)} />;
}
