import { Lism } from '../../Lism';
import getProps from './getProps';
import type { LismComponentProps } from '../../Lism/Lism';

export default function Spacer(props: LismComponentProps) {
  return <Lism {...getProps(props)} />;
}
