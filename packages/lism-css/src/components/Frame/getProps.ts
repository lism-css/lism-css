import atts from '../../lib/helper/atts';
export default function getBoxProps({ lismClass, ...props }) {
	props.lismClass = atts(lismClass, 'l--frame');

	return props;
}
