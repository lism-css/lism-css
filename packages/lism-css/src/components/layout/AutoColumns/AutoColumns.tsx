import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { AutoColumnsProps } from '../../../lib/types/LayoutProps';

export default function AutoColumns<T extends ElementType = 'div'>(props: LayoutComponentProps<T, AutoColumnsProps>) {
  return <Lism layout="autoColumns" {...props} />;
}
