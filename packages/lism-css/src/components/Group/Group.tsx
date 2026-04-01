import { Lism, type LismComponentProps } from '../Lism';

export default function Group(props: LismComponentProps<'div'>) {
  return <Lism as="div" {...props} />;
}
