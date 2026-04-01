import { Lism, type LismComponentProps } from '../Lism';

export default function Link(props: LismComponentProps<'a'>) {
  return <Lism as="a" {...props} />;
}
