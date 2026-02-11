import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

export default function Cluster<T extends ElementType = 'div'>(props: LismComponentProps<T>) {
	return <Lism layout='cluster' {...(props as LismComponentProps)} />;
}
