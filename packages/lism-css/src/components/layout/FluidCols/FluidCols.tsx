import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { FluidColsProps } from '../../../lib/types/LayoutProps';

export default function FluidCols<T extends ElementType = 'div'>(props: LayoutComponentProps<T, FluidColsProps>) {
  return <Lism layout="fluidCols" {...props} />;
}
