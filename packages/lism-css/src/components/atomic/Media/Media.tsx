import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../../Lism';
import getProps, { type MediaOwnProps } from './getProps';

type MediaComponentProps<T extends ElementType = 'img'> = LismComponentProps<T> & MediaOwnProps;

export default function Media<T extends ElementType = 'img'>(props: MediaComponentProps<T>) {
  return <Lism as="img" {...getProps(props)} />;
}
