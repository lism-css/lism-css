import { Grid } from 'lism-css/react';
import './style.css';

export default function Reel({ children, ...props }) {
	return (
		<Grid lismClass='c--reel' ov='auto' gaf='column' tabIndex='0' {...props}>
			{children}
		</Grid>
	);
}
