import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Group<T extends ElementType = 'div'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'div'} {...props} />;
}
