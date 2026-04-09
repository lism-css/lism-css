import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { TileGridProps } from '../../../lib/types/LayoutProps';

export default function TileGrid<T extends ElementType = 'div'>(props: LayoutComponentProps<T, TileGridProps>) {
  return <Lism layout="tileGrid" {...props} />;
}
