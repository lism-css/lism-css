import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';
import getFilterProps, { type FilterProps } from '../getFilterProps';

type LayerProps<T extends ElementType = 'div'> = LismComponentProps<T> & FilterProps;

export default function Layer<T extends ElementType = 'div'>(props: LayerProps<T>) {
  return <Lism isLayer {...getFilterProps(props, 'backdropFilter')} />;
}
