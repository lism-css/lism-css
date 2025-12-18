import { Lism, Icon } from 'lism-css/react';
import { getAccIconProps } from './getProps';

export default function AccIcon({ icon = 'caret-down', viewBox, children = null, ...props }) {
	return <Lism {...getAccIconProps(props)}>{children || <Icon viewBox={viewBox} icon={icon} />}</Lism>;
}
