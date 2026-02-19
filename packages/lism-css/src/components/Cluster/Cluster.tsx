import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../Lism';
import type { ClusterProps } from '../../lib/types/LayoutProps';

export default function Cluster<T extends ElementType = 'div'>(props: LayoutComponentProps<T, ClusterProps>) {
	return <Lism layout='cluster' {...props} />;
}
