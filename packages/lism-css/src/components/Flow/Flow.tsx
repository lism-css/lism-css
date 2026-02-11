import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Flow<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='flow' {...(props as LismComponentProps)} />;
}
