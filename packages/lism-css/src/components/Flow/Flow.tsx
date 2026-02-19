import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../Lism';
import type { FlowLayoutProps } from '../../lib/types/LayoutProps';

export default function Flow<T extends ElementType = 'div'>(props: LayoutComponentProps<T, FlowLayoutProps>) {
	return <Lism layout='flow' {...props} />;
}
