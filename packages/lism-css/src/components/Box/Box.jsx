import { Lism } from '../Lism';
import getProps from './getProps';

export default function Box({ children, ...props }) {
	return <Lism {...getProps(props)}>{children}</Lism>;
}
