import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Columns<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='columns' {...(props as LismComponentProps)} />;
}
