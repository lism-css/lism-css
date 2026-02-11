import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Stack<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='stack' {...(props as LismComponentProps)} />;
}
