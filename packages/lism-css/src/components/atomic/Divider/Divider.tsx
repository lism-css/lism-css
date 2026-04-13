import { Lism } from '../../Lism';
import type { LismComponentProps } from '../../Lism/Lism';

export default function Divider(props: LismComponentProps) {
  return <Lism atomic="divider" aria-hidden="true" {...props} />;
}
