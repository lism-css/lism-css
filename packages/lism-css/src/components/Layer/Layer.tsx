import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

type LayerProps<T extends ElementType = 'div'> = LismComponentProps<T>;

export default function Layer<T extends ElementType = 'div'>(props: LayerProps<T>) {
  return <Lism isLayer {...props} />;
}
