import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';
import type { GroupAllowedTag } from '../../lib/types/allowedTags';

export default function Group<T extends GroupAllowedTag | Exclude<ElementType, string> = 'div'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'div'} {...props} />;
}
