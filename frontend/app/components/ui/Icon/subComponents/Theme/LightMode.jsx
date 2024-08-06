import * as React from 'react';
import { memo } from 'react';

const SvgLightMode = (props) => (
	<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<g clipPath="url(#LightMode_svg__a)">
			<path
				d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-18a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 12 0Zm0 19.5a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3a.75.75 0 0 1 .75-.75ZM24 12a.75.75 0 0 1-.75.75h-3a.75.75 0 1 1 0-1.5h3A.75.75 0 0 1 24 12ZM4.5 12a.75.75 0 0 1-.75.75h-3a.75.75 0 1 1 0-1.5h3a.75.75 0 0 1 .75.75Zm15.985-8.486a.75.75 0 0 1 0 1.061l-2.12 2.122a.75.75 0 1 1-1.061-1.061l2.121-2.122a.75.75 0 0 1 1.06 0ZM6.696 17.304a.75.75 0 0 1 0 1.06l-2.121 2.121a.75.75 0 0 1-1.06-1.06l2.12-2.121a.75.75 0 0 1 1.061 0Zm13.79 3.181a.75.75 0 0 1-1.061 0l-2.121-2.12a.75.75 0 0 1 1.06-1.061l2.121 2.121a.75.75 0 0 1 0 1.06ZM6.695 6.698a.75.75 0 0 1-1.06 0L3.514 4.574a.75.75 0 1 1 1.061-1.06l2.121 2.12a.75.75 0 0 1 0 1.063Z"
				fill="currentColor"
			/>
		</g>
		<defs>
			<clipPath id="LightMode_svg__a">
				<path fill="currentColor" d="M0 0h24v24H0z" />
			</clipPath>
		</defs>
	</svg>
);

const Memo = memo(SvgLightMode);
export default Memo;