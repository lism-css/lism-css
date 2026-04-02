import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Text<T extends ElementType = 'p'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'p'} {...props} />;
}
