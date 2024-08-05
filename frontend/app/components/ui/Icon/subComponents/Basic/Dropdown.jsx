import * as React from "react";
import { memo } from "react";

const SvgDropDown = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 16 5 9h14l-7 7Z" fill="currentColor" />
  </svg>
);

const Memo = memo(SvgDropDown);
export default Memo;
