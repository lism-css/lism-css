import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Box<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='box' {...(props as LismComponentProps)} />;
}
