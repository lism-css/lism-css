import { Lism } from '../Lism';

export default function Wrapper({ contentSize, ...props }) {
	return <Lism isWrapper={contentSize || true} {...props} />;
}
