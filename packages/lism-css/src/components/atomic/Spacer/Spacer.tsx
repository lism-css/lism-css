import { Lism } from '../../Lism';
import type { LismComponentProps } from '../../Lism/Lism';

export default function Spacer(props: LismComponentProps) {
  return <Lism atomic="spacer" aria-hidden="true" {...props} />;
}
