// import React from 'react';
import { Lism } from '../Lism';
import { getGridProps } from './getProps';

export default function Grid(props) {
	// grid 系の props をまとめる
	props = getGridProps(props);

	return <Lism {...props} />;
}
