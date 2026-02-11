import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function SideMain<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='sideMain' {...(props as LismComponentProps)} />;
}
