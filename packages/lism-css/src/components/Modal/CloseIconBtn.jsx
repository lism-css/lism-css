import { Lism } from '../Lism';
import { Icon } from '../Icon';
import { defaultProps } from './getProps';
// duration: [s]
export default function DialogCloseIconBtn({
	children,
	modalId = '',
	icon,
	srText = 'Close',
	...props
}) {
	// const lismProps = getLismProps(getAccProps(props));

	return (
		<Lism data-modal-close={modalId} {...defaultProps.closeBtn} {...props}>
			{children ? (
				children
			) : (
				<>
					<Icon icon={icon || 'x'} />
					<span className='u--hidden'>{srText || 'Close'}</span>
				</>
			)}
		</Lism>
	);
}
