import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function List<T extends ElementType = 'ul'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'ul'} {...props} />;
}
