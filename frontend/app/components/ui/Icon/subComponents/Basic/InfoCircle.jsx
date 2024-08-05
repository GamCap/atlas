import * as React from "react";
import { memo } from "react";

const SvgInfoInCircle = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 3.818a8.182 8.182 0 1 0 0 16.364 8.182 8.182 0 0 0 0-16.364ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm10-.91a.91.91 0 0 1 .91.91v3.636a.91.91 0 0 1-1.82 0V12a.91.91 0 0 1 .91-.91Zm0-3.635a.91.91 0 1 0 0 1.818h.01a.91.91 0 1 0 0-1.818H12Z"
      fill="currentColor"
    />
  </svg>
);

const Memo = memo(SvgInfoInCircle);
export default Memo;
