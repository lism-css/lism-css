export default function getInsetProps({ i_ = {}, ...props }) {
	['iis', 'iie', 'ibs', 'ibe'].forEach((key) => {
		if (null != props[key]) {
			i_[key] = props[key];
			delete props[key];
		}
	});

	props.i_ = i_;
	return props;
}
