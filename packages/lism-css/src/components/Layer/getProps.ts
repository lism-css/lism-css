import getFilterProps from '../getFilterProps';

type LayerProps = Parameters<typeof getFilterProps>[0];
type LayerOutput = ReturnType<typeof getFilterProps>;

export function getLayerProps(props: LayerProps): LayerOutput {
  return getFilterProps(props, 'backdropFilter');
}
