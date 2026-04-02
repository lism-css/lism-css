import type { LismProps } from '../../../lib/getLismProps';

export type MediaProps = LismProps;

export default function getMediaProps({ lismClass, style = {}, ...rest }: MediaProps): LismProps {
  return { ...rest, lismClass, style };
}
