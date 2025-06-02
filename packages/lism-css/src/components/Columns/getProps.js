export default function getColumnsProps({ colSize, colAuto, style = {}, ...props }) {
	if (colSize) {
		style['--col-size'] = colSize;
	}
	if (colAuto) {
		style['--col-auto'] = colAuto;
	}
	props.style = style;
	return props;
}
