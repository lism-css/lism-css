import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Frame<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='frame' {...(props as LismComponentProps)} />;
}
