import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';
import type { MediaAllowedTag } from '../../lib/types/allowedTags';

export default function Media<T extends MediaAllowedTag | Exclude<ElementType, string> = 'img'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'img'} {...props} />;
}
