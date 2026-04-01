import { Lism, type LismComponentProps } from '../Lism';

export default function List(props: LismComponentProps<'ul'>) {
  return <Lism as="ul" {...props} />;
}
