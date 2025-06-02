import { Lism } from '../Lism';
import { Icon } from '../Icon';
import { getAccIconProps } from './getProps';

export default function AccIcon({ icon = 'caret-down', viewBox, children = null, ...props }) {
	return (
		<Lism {...getAccIconProps(props)}>
			{children || <Icon viewBox={viewBox} icon={icon} />}
		</Lism>
	);
}
