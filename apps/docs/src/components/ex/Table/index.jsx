import { Lism } from 'lism-css/react';
import getMaybeCssVar from 'lism-css/lib/getMaybeCssVar';
import './style.css';

function getTableProps({ thBgc, tdBgc, thC, tdC, bdwX, bdwY, cellMinW, cellP, style = {}, ...props }) {
	if (bdwX) style['--bdwX'] = bdwX;
	if (bdwY) style['--bdwY'] = bdwY;
	if (thC) style['--th_c'] = getMaybeCssVar(thC, 'color');
	if (tdC) style['--td_c'] = getMaybeCssVar(tdC, 'color');
	if (thBgc) style['--th_bgc'] = getMaybeCssVar(thBgc, 'color');
	if (tdBgc) style['--td_bgc'] = getMaybeCssVar(tdBgc, 'color');
	if (cellMinW) style['--cell_minW'] = cellMinW;
	if (cellP) style['--cell_p'] = cellP;

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
