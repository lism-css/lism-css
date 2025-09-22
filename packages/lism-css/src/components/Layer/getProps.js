import getFilterProps from '../getFilterProps';

export function getLayerProps(props) {
	const layerProps = getFilterProps(props, 'bdfltr'); // filter系propsのマージ
	return layerProps;
}
