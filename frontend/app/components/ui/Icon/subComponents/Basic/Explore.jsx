import * as React from "react";
import { memo } from "react";

const SvgExplore = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M20 11C19.7348 11 19.4804 11.1054 19.2929 11.2929C19.1054 11.4804 19 11.7348 19 12V18C19 18.2652 18.8946 18.5196 18.7071 18.7071C18.5196 18.8946 18.2652 19 18 19H6C5.73478 19 5.48043 18.8946 5.29289 18.7071C5.10536 18.5196 5 18.2652 5 18V6C5 5.73478 5.10536 5.48043 5.29289 5.29289C5.48043 5.10536 5.73478 5 6 5H12C12.2652 5 12.5196 4.89464 12.7071 4.70711C12.8946 4.51957 13 4.26522 13 4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3H6C5.20435 3 4.44129 3.31607 3.87868 3.87868C3.31607 4.44129 3 5.20435 3 6V18C3 18.7956 3.31607 19.5587 3.87868 20.1213C4.44129 20.6839 5.20435 21 6 21H18C18.7956 21 19.5587 20.6839 20.1213 20.1213C20.6839 19.5587 21 18.7956 21 18V12C21 11.7348 20.8946 11.4804 20.7071 11.2929C20.5196 11.1054 20.2652 11 20 11Z"
      fill="currentColor"
    />
    <path
      d="M15.9999 5H17.5799L11.2899 11.28C11.1962 11.373 11.1218 11.4836 11.071 11.6054C11.0203 11.7273 10.9941 11.858 10.9941 11.99C10.9941 12.122 11.0203 12.2527 11.071 12.3746C11.1218 12.4964 11.1962 12.607 11.2899 12.7C11.3829 12.7937 11.4935 12.8681 11.6154 12.9189C11.7372 12.9697 11.8679 12.9958 11.9999 12.9958C12.132 12.9958 12.2627 12.9697 12.3845 12.9189C12.5064 12.8681 12.617 12.7937 12.7099 12.7L18.9999 6.42V8C18.9999 8.26522 19.1053 8.51957 19.2928 8.70711C19.4804 8.89464 19.7347 9 19.9999 9C20.2652 9 20.5195 8.89464 20.707 8.70711C20.8946 8.51957 20.9999 8.26522 20.9999 8V4C20.9999 3.73478 20.8946 3.48043 20.707 3.29289C20.5195 3.10536 20.2652 3 19.9999 3H15.9999C15.7347 3 15.4804 3.10536 15.2928 3.29289C15.1053 3.48043 14.9999 3.73478 14.9999 4C14.9999 4.26522 15.1053 4.51957 15.2928 4.70711C15.4804 4.89464 15.7347 5 15.9999 5Z"
      fill="currentColor"
    />
  </svg>
);

const Memo = memo(SvgExplore);
export default Memo;
