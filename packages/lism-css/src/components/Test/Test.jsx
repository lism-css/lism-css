// import React from 'react';
import { Lism } from '../Lism';

const Test = ({ ...props }) => {
	return <Lism data-lism='test' p='20' bd {...props} />;
};

const Item = (props) => {
	return <Lism data-lism='test-item' bd bds='dashed' {...props}></Lism>;
};

export default { Root: Test, Item };
