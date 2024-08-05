import * as React from 'react';
import { memo } from 'react';

const SvgDarkMode = (props) => (
	<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path
			d="M9.5 2.348a.96.96 0 0 1 .1 1.072 9.01 9.01 0 0 0-1.098 4.325c0 5.026 4.098 9.096 9.148 9.096.659 0 1.3-.068 1.916-.2a.984.984 0 0 1 1.013.395.917.917 0 0 1-.039 1.117A10.438 10.438 0 0 1 12.43 22C6.668 22 2 17.358 2 11.638 2 7.333 4.643 3.64 8.405 2.075a.94.94 0 0 1 1.095.273Z"
			fill="currentColor"
		/>
		<path
			d="M15.492 5.935a.271.271 0 0 1 .515 0l.484 1.453a2.17 2.17 0 0 0 1.372 1.37l1.452.485a.271.271 0 0 1 0 .515l-1.453.483a2.168 2.168 0 0 0-1.37 1.372l-.485 1.452a.27.27 0 0 1-.515 0l-.483-1.452a2.167 2.167 0 0 0-1.372-1.372l-1.452-.483a.271.271 0 0 1 0-.515l1.452-.484a2.167 2.167 0 0 0 1.372-1.371l.483-1.453Zm3.837-3.811a.18.18 0 0 1 .342 0l.323.967c.143.433.482.772.915.915l.967.323a.182.182 0 0 1 .089.276.182.182 0 0 1-.089.066l-.967.323a1.445 1.445 0 0 0-.915.915l-.323.967a.182.182 0 0 1-.342 0l-.323-.967a1.446 1.446 0 0 0-.915-.915l-.967-.323a.181.181 0 0 1 0-.342l.967-.323c.433-.143.771-.482.915-.915l.323-.966v-.001Z"
			fill="currentColor"
		/>
	</svg>
);

const Memo = memo(SvgDarkMode);
export default Memo;