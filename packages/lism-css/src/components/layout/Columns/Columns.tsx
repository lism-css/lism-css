import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { ColumnsProps } from '../../../lib/types/LayoutProps';

export default function Columns<T extends ElementType = 'div'>(props: LayoutComponentProps<T, ColumnsProps>) {
  return <Lism layout="columns" {...props} />;
}
