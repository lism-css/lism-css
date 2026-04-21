import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { WithSideProps } from '../../../lib/types/LayoutProps';

export default function WithSide<T extends ElementType = 'div'>(props: LayoutComponentProps<T, WithSideProps>) {
  return <Lism layout="withSide" {...props} />;
}
