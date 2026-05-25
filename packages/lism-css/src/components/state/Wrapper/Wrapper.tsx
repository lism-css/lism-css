import { Lism, type LismComponentProps } from '../../Lism';

type WrapperProps = LismComponentProps;

export default function Wrapper({ contentSize, ...props }: WrapperProps) {
  return <Lism isWrapper contentSize={contentSize} {...props} />;
}
