import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Center<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='center' {...(props as LismComponentProps)} />;
}
