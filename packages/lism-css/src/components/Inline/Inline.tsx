import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';
import type { InlineAllowedTag } from '../../lib/types/allowedTags';

export default function Inline<T extends InlineAllowedTag | Exclude<ElementType, string> = 'span'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'span'} {...props} />;
}
