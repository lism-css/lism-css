import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';
import type { TextAllowedTag } from '../../lib/types/allowedTags';

export default function Text<T extends TextAllowedTag | Exclude<ElementType, string> = 'p'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'p'} {...props} />;
}
