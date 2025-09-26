// import React from 'react';
import { Lism } from '../Lism';
import { getDividerProps } from './getProps';

export default function Divider(props) {
	return <Lism {...getDividerProps(props)} />;
}
