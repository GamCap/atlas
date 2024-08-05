import * as React from 'react';
import { memo } from 'react';

const SvgInfo = (props) => (
	<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path
			d="M11.999 2C17.522 2 22 6.477 22 12s-4.478 10-10.001 10S2 17.523 2 12C1.999 6.478 6.476 2 11.999 2Zm-.004 8.249a1 1 0 0 0-.992.885l-.007.116.004 5.5.006.118a1 1 0 0 0 1.987-.002l.006-.117-.004-5.5-.007-.117a1 1 0 0 0-.994-.882l.001-.001ZM12 6.5a1.252 1.252 0 1 0 .002 2.503 1.252 1.252 0 0 0-.003-2.503H12Z"
			fill="currentColor"
		/>
	</svg>
);

const Memo = memo(SvgInfo);
export default Memo;