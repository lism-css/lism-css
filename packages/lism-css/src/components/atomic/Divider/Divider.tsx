import { Lism } from '../../Lism';
import { getDividerProps } from './getProps';
import type { LismComponentProps } from '../../Lism/Lism';

export default function Divider(props: LismComponentProps) {
  return <Lism {...getDividerProps(props)} />;
}
