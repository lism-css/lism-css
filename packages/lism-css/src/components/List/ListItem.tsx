import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function ListItem<T extends ElementType = 'li'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'li'} {...props} />;
}
