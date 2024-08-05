import * as React from 'react';
import { memo } from 'react';

const SvgLogo = (props) => (
	<svg
		width="100%"
		height="100%"
		viewBox="0 0 67 66"
		overflow="visible"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path d="M64.41 1 33.155 63.208 1.627 1h62.784Z" stroke="currentColor" strokeWidth={2} />
		<path d="M14.617 26.129L51.418 26.129" stroke="currentColor" strokeWidth={2} />
	</svg>
);

const Memo = memo(SvgLogo);
export default Memo;