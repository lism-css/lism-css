import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';
import type { ListItemAllowedTag } from '../../lib/types/allowedTags';

export default function ListItem<T extends ListItemAllowedTag | Exclude<ElementType, string> = 'li'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'li'} {...props} />;
}
