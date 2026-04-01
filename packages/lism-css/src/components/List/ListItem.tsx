import { Lism, type LismComponentProps } from '../Lism';

export default function ListItem(props: LismComponentProps<'li'>) {
  return <Lism as="li" {...props} />;
}
