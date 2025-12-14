export default function setMaybeTransformStyles(props) {
	const { style = {}, translate, rotate, scale, transform, ...rest } = props;

	if (translate) {
		style.translate = translate;
	}
	if (rotate) {
		style.rotate = rotate;
	}
	if (scale) {
		style.scale = scale;
	}
	if (transform) {
		style.transform = transform;
	}

	rest.style = style;
	return rest;
}
