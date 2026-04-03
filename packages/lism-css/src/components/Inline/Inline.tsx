import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

type InlineAllowedTag = 'span' | 'em' | 'strong' | 'small' | 'code' | 'time' | 'i' | 'b' | 'mark' | 'abbr' | 'cite' | 'kbd';

export default function Inline<T extends InlineAllowedTag | Exclude<ElementType, string> = 'span'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'span'} {...props} />;
}
