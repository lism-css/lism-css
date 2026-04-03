import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../../Lism';

type MediaAllowedTag = 'img' | 'video' | 'iframe' | 'picture';

export default function Media<T extends MediaAllowedTag | Exclude<ElementType, string> = 'img'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'img'} {...props} />;
}
