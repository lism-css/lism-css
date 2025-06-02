import { Grid } from '../Grid';
import getProps from './getProps';

export default function Columns(props) {
	return <Grid _grid='columns' {...getProps(props)} />;
}
