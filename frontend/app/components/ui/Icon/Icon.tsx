import cx from "classnames";
import { IconName, IconMap } from "./iconMap";
import { Suspense } from "react";

export type IconSize = "sm" | "md" | "lg";

export type IconProps = {
  name: IconName;
  size?: IconSize;
  className?: string;
};

const sizeClasses: Record<IconSize, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const Icon = ({ size, name, className }: IconProps) => {
  const IconComponent = IconMap[name];

  return (
    <Suspense
      fallback={
        <div
          className={cx(
            "dark:bg-white bg-black animate-pulse rounded-full",
            size ? sizeClasses[size] : "",
            className
          )}
        />
      }
    >
      <IconComponent className={cx(size ? sizeClasses[size] : "", className)} />
    </Suspense>
  );
};
