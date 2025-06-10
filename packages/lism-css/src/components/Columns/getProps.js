export default function getColumnsProps({ colSize, autoType, style = {}, ...props }) {
	if (colSize) {
		style['--colSize'] = colSize;
	}
	if (autoType) {
		style['--autoType'] = autoType;
	}
	props.style = style;
	return props;
}
