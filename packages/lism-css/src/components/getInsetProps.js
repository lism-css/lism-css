export default function getInsetProps(props) {
	if (null == props.insets) props.insets = {};

	['is', 'ie', 'bs', 'be'].forEach((key) => {
		if (null != props[key]) {
			props.insets[key] = props[key];
			delete props[key];
		}
	});

	return props;
}
