import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function SwitchCols<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='switchCols' {...(props as LismComponentProps)} />;
}
