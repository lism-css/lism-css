import { Lism, type LismComponentProps } from '../Lism';

export default function Text(props: LismComponentProps<'p'>) {
  return <Lism as="p" {...props} />;
}
