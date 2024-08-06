import * as React from 'react';
import { memo } from 'react';

const SvgSorting = (props) => (
	<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path d="m12 19-5-6h10l-5 6Z" fill="currentColor" />
		<path d="m12 5-5 6h10l-5-6Z" fill="#CADFD9" />
	</svg>
);

const Memo = memo(SvgSorting);
export default Memo;