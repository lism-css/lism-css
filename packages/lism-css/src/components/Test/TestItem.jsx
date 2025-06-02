// import React from 'react';
import { Lism } from '../Lism';

const Item = (props) => {
	return <Lism data-lism='test-item' bd bds='dashed' {...props}></Lism>;
};

export default Item;
