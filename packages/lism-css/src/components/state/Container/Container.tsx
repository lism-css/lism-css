import { Lism, type LismComponentProps } from '../../Lism';

type ContainerProps = LismComponentProps & {
  size?: LismComponentProps['isWrapper'];
};

export default function Container({ size, ...props }: ContainerProps) {
  return <Lism isContainer isWrapper={size} {...props} />;
}
