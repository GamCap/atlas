import * as React from 'react';
import { memo } from 'react';

const SvgExpandLeft = (props) => (
	<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M15.707 5.293a1 1 0 0 0-1.414 0l-6 6a1 1 0 0 0 0 1.414l6 6a1 1 0 0 0 1.414-1.414L10.414 12l5.293-5.293a1 1 0 0 0 0-1.414Z"
			fill="currentColor"
		/>
	</svg>
);

const Memo = memo(SvgExpandLeft);
export default Memo;