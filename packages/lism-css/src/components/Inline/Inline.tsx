import { Lism, type LismComponentProps } from '../Lism';

export default function Inline(props: LismComponentProps<'span'>) {
  return <Lism as="span" {...props} />;
}
