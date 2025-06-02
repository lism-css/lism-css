import { Lism } from '../Lism';
import { getWithSideProps } from './getProps';

export default function WithSide(props) {
	return <Lism {...getWithSideProps(props)} />;
}
