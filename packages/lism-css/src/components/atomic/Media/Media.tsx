import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../../Lism';

export default function Media<T extends ElementType = 'img'>(props: LismComponentProps<T>) {
  return <Lism as="img" {...props} />;
}
