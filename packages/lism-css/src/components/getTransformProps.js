export default function getTransformProps(props) {
	if (null == props.css) props.css = {};
	['trf', 'trfo', 'trnslt', 'rotate', 'scale', 'clipPath'].forEach((key) => {
		if (null != props[key]) {
			props.css[key] = props[key];
			delete props[key];
		}
	});

	return props;
}
