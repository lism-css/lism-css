import type { ReactNode } from 'react';
import { Flow, Lism, Center, Icon } from 'lism-css/react';
import getAlertProps, { type AlertProps } from '../getProps';

export default function Alert({ children, ...inputProps }: AlertProps & { children?: ReactNode }) {
	const { icon, layout, flow, ...alertProps } = getAlertProps(inputProps);

	return (
		<Lism layout={layout} {...alertProps}>
			<Center isSide={layout === 'sideMain'} c='keycolor' fz='xl' fxsh='0'>
				<Icon icon={icon} />
			</Center>
			<Flow flow={flow}>{children}</Flow>
		</Lism>
	);
}
