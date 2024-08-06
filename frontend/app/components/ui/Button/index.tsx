import React from "react";
import cx from "classnames";
import { Icon, IconProps } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Typography";

export type ButtonSize = "xsmall" | "small" | "medium" | "large";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "active";

type ButtonBaseProps = {
  size?: ButtonSize;
  textClassName?: string;
  iconName?: IconProps["name"];
  iconPosition?: "leading" | "trailing";
};

type ButtonVariantProps = {
  variant?: ButtonVariant;
};
export type ButtonProps = ButtonBaseProps &
  ButtonVariantProps &
  JSX.IntrinsicElements["button"];

const variantClasses: Record<ButtonVariant, string> = {
  primary: cx(
    "bg-green-primary text-white disabled:bg-neutral-400 disabled:text-neutral-600 hover:bg-green-secondary",
    "dark:text-black dark:bg-green-primary-dark dark:disabled:text-neutral-400 dark:disabled:bg-neutral-600 dark:hover:bg-green-secondary-dark"
  ),
  secondary: cx(
    "bg-white border text-black border-black hover:bg-black hover:text-white disabled:text-neutral-500 disabled:border-neutral-500",
    "dark:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black dark:disabled:text-neutral-600 dark:disabled:border-neutral-600"
  ),
  subtle: cx(
    "text-black hover:text-green-primary disabled:text-neutral-500",
    "dark:text-white dark:hover:text-green-primary-dark dark:disabled:text-neutral-600"
  ),
  active: cx(
    "bg-white border text-black border-black hover:text-white hover:bg-green-primary hover:border-green-primary disabled:text-neutral-500 disabled:border-neutral-500 disabled:bg-white",
    "dark:bg-black dark:text-white dark:border-white dark:hover:bg-green-primary-dark dark:hover:text-black dark:hover:border-green-primary-dark dark:disabled:text-neutral-600 dark:disabled:bg-black dark:disabled:border-neutral-600"
  ),
};
//TODO: Look into size classes, paddings and gaps are not looking good
const sizeClasses: Record<ButtonSize, string> = {
  large: "px-7 py-3 gap-3",
  medium: "px-6 py-3 gap-2",
  small: "px-4 py-2 gap-1",
  xsmall: "px-3 py-1 gap-1",
};

const onlyIconSizeClasses: Record<ButtonSize, string> = {
  large: "px-[18px] py-3",
  medium: "px-4 py-[11px]",
  small: "px-3 py-[7px]",
  xsmall: "px-2 py-1",
};

const buttonTextClasses: Record<ButtonSize, string> = {
  xsmall: "text-basic-12-auto-medium",
  small: "text-basic-12-auto-medium",
  medium: "text-basic-12-auto-medium",
  large: "text-basic-16-auto-medium",
};

const buttonIconClasses: Record<ButtonSize, string> = {
  xsmall: "w-[14px] h-[14px]",
  small: "w-[18px] h-[18px]",
  medium: "w-[18px] h-[18px]",
  large: "w-6 h-6",
};

export const Button: React.FC<ButtonProps> = ({
  className,
  size = "large",
  variant = "primary",
  iconName,
  iconPosition = "leading",
  children,
  textClassName,
  ...props
}) => {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-sm transition-colors ease-linear duration-200 disabled:cursor-not-allowed",
        variantClasses[variant],
        children ? sizeClasses[size] : onlyIconSizeClasses[size],
        className
      )}
      {...props}
    >
      {iconName && iconPosition === "leading" && (
        <Icon name={iconName} className={buttonIconClasses[size]} />
      )}
      {children && (
        <Text as="span" className={cx(buttonTextClasses[size], textClassName)}>
          {children}
        </Text>
      )}
      {iconName && iconPosition === "trailing" && (
        <Icon name={iconName} className={buttonIconClasses[size]} />
      )}
    </button>
  );
};
