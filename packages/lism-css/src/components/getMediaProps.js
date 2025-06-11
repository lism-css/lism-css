import getFilterProps from './getFilterProps';

export default function getMediaProps({ obf, obp, css = {}, ...props }) {
	if (obf) css.obf = obf;
	if (obp) css.obp = obp;

	props.css = css;
	return getFilterProps(props);
}
