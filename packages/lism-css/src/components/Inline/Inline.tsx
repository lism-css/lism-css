import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Inline<T extends ElementType = 'span'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'span'} {...props} />;
}
