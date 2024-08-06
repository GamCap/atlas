import * as React from 'react';
import { memo } from 'react';

const SvgSearch = (props) => (
	<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10 18a8 8 0 1 1 6.32-3.094l5.387 5.387-1.414 1.414-5.387-5.387A7.965 7.965 0 0 1 10 18Zm6-8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
			fill="currentColor"
		/>
	</svg>
);

const Memo = memo(SvgSearch);
export default Memo;