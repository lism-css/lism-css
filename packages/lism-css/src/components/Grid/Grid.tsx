import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../Lism';
import type { GridLayoutProps } from '../../lib/types/LayoutProps';

export default function Grid<T extends ElementType = 'div'>(props: LayoutComponentProps<T, GridLayoutProps>) {
	return <Lism layout='grid' {...props} />;
}
