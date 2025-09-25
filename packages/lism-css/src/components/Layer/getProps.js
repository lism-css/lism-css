import getFilterProps from '../getFilterProps';

export function getLayerProps(props) {
	const layerProps = getFilterProps(props, 'backdropFilter'); // filter系propsのマージ
	return layerProps;
}
