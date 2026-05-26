import { Lism, type LismComponentProps } from '../../Lism';

type WrapperProps = LismComponentProps;

export default function Wrapper(props: WrapperProps) {
  return <Lism isWrapper {...props} />;
}
