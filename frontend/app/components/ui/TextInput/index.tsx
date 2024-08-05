import React, { forwardRef } from "react";
import cx from "classnames";
import { Icon, IconProps } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Typography";

export type TextInputProps = Omit<
  JSX.IntrinsicElements["input"],
  "disabled" | "size"
> & {
  leftIconName?: IconProps["name"];
  rightIconName?: IconProps["name"];
  rightSymbol?: string;
  isDisabled?: boolean;
  errorMessage?: string;
  variant?: "regular" | "colored";
  size?: "sm" | "lg" | "full";
  isSmallFont?: boolean;
  leftSymbol?: string;
  helperText?: string;
  wrapperClassName?: string;
  inputClassName?: string;
};

const variantClasses = {
  regular: {
    container: "bg-neutral-200 focus-within:border focus-within:border-green",
    input: "bg-neutral-200",
  },
  colored: {
    container:
      "bg-white border border-neutral-400 focus-within:border focus-within:border-green",
    input: "bg-white",
  },
};

const sizeClasses = {
  sm: "w-28",
  lg: "w-64",
  full: "w-full",
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      size,
      isSmallFont,
      leftIconName,
      leftSymbol,
      rightIconName,
      rightSymbol,
      isDisabled,
      errorMessage,
      wrapperClassName,
      inputClassName,
      variant = "regular",
      helperText,
      ...rest
    },
    ref
  ) => {
    return (
      <div>
        <div
          className={cx(
            "group inline-flex items-center dark:bg-black dark:border dark:border-neutral-800 focus-within:dark:border-green rounded-sm transition-all border border-transparent ease-linear duration-200 gap-2 overflow-hidden",
            variantClasses[variant].container,
            wrapperClassName,
            size && sizeClasses[size]
          )}
        >
          {leftIconName && (
            <div className="pointer-events-none flex items-center pl-3">
              <Icon
                name={leftIconName}
                size="sm"
                className="text-neutral-500"
              />
            </div>
          )}

          {leftSymbol && (
            <div className="pointer-events-none flex items-center pl-3">
              <Text className="text-basic-12-auto-regular text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-600 disabled:placeholder:text-neutral-400 text-ellipsis opacity-40 whitespace-nowrap">
                {leftSymbol}
              </Text>
            </div>
          )}

          <input
            disabled={isDisabled}
            className={cx(
              "block w-full rounded-sm pr-3 border-none focus:border-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed transition-all ease-linear duration-200",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-600 disabled:placeholder:text-neutral-400 text-ellipsis",
              "dark:bg-black",
              isSmallFont ? "text-h12 py-1" : "text-h14 leading-145 py-2",
              variantClasses[variant].input,
              inputClassName
            )}
            {...rest}
            ref={ref}
          />
          {rightIconName && (
            <div className="pointer-events-none flex items-center pr-3">
              <Icon
                name={rightIconName}
                size="sm"
                className="text-neutral-500"
              />
            </div>
          )}

          {rightSymbol && (
            <div className="pointer-events-none flex items-center pr-3">
              <Text className="text-basic-12-auto-regular text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-600 disabled:placeholder:text-neutral-400 text-ellipsis">
                {rightSymbol}
              </Text>
            </div>
          )}
        </div>
        {errorMessage && (
          <Text className="mt-1 text-basic-10-auto-regular text-accent-red">
            {errorMessage}
          </Text>
        )}
        {helperText && (
          <div
            className={cx("mt-1 flex items-center gap-1", {
              "text-neutral-400": isDisabled,
              "text-neutral-600": !isDisabled,
            })}
          >
            <Icon name="Info" size="sm" />
            <Text className="text-basic-10-auto-regular">{helperText}</Text>
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
