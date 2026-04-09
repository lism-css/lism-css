import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { SwitchColsProps } from '../../../lib/types/LayoutProps';

export default function SwitchCols<T extends ElementType = 'div'>(props: LayoutComponentProps<T, SwitchColsProps>) {
  return <Lism layout="switchCols" {...props} />;
}
