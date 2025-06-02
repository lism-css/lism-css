import { Lism } from 'lism-css/react';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import './style.scss';

function getTableProps({ thBgc, tdBgc, thC, tdC, bdwX, bdwY, style = {}, ...props }) {
	if (bdwX) style['--bdwX'] = bdwX;
	if (bdwY) style['--bdwY'] = bdwY;
	if (thC) style['--th-c'] = getMaybeCssVar(thC, 'color');
	if (tdC) style['--td-c'] = getMaybeCssVar(tdC, 'color');
	if (thBgc) style['--th-bgc'] = getMaybeCssVar(thBgc, 'color');
	if (tdBgc) style['--td-bgc'] = getMaybeCssVar(tdBgc, 'color');

	props.style = style;

	return props;
}

export default function Table({ children, ...props }) {
	return (
		<Lism tag='table' lismClass='c--table' {...getTableProps(props)}>
			{children}
		</Lism>
	);
}
