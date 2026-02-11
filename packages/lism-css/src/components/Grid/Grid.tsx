import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Grid<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='grid' {...(props as LismComponentProps)} />;
}
