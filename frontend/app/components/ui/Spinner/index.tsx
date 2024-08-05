import cx from "classnames";

export type SpinnerProps = {
  wrapperClassName?: string;
  className?: string;
};

export const Spinner = ({
  wrapperClassName = "w-12 h-12",
  className = "w-12 h-12",
}: SpinnerProps) => {
  return (
    <div
      className={cx(
        "relative flex items-center justify-center",
        wrapperClassName
      )}
    >
      <div
        className={cx(
          "rounded-full absolute border-4 border-dashed border-neutral-300 dark:border-neutral-900",
          className,
          "inset-0 m-auto"
        )}
      />
      <div
        className={cx(
          "rounded-full animate-spin absolute border-4 border-dashed border-green-primary dark:border-green-primary-dark border-t-transparent",
          className,
          "inset-0 m-auto"
        )}
      />
    </div>
  );
};
