import { Lism, type LismComponentProps } from '../Lism';

type ListItemAllowedTag = 'li' | 'dt' | 'dd';

export default function ListItem<T extends ListItemAllowedTag = 'li'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'li'} {...props} />;
}
