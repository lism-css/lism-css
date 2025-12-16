import { Lism } from '../Lism';

export default function Container({ size, ...props }) {
	return <Lism isContainer isWrapper={size} {...props} />;
}
