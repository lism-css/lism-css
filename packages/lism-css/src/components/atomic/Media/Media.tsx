import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../../Lism';
import getProps, { type MediaProps } from './getProps';

type MediaComponentProps<T extends ElementType = 'img'> = LismComponentProps<T> & MediaProps;

export default function Media<T extends ElementType = 'img'>(props: MediaComponentProps<T>) {
  return <Lism as="img" {...getProps(props)} />;
}
