import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function FluidCols<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='fluidCols' {...(props as LismComponentProps)} />;
}
