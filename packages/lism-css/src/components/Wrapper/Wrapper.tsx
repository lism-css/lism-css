import { Lism, type LismComponentProps } from '../Lism';

type WrapperProps = LismComponentProps & {
	contentSize?: LismComponentProps['isWrapper'];
};

export default function Wrapper({ contentSize, ...props }: WrapperProps) {
	return <Lism isWrapper={contentSize || true} {...props} />;
}
