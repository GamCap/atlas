"use client";
import cx from "classnames";
import { Text } from "@/components/ui/Typography";
import { ReactNode } from "react";
import { PositioningPortalWithState } from "@codastic/react-positioning-portal";
import { positionStrategy } from "./TooltipPortal";

enum POSITION {
  TOP = "top",
  LEFT = "left",
  RIGHT = "right",
  BOTTOM = "bottom",
}

export type TooltipProps = {
  children: ReactNode;
  tooltipText: string;
  position?: "top" | "bottom";
  additionalPad?: number;
};

export const Tooltip = ({
  tooltipText,
  children,
  position = "top",
  additionalPad = 15,
}: TooltipProps) => {
  return (
    <div className="relative w-fit">
      <div className="group">
        <PositioningPortalWithState
          positionStrategy={positionStrategy(
            position === "top" ? POSITION.TOP : POSITION.BOTTOM,
            additionalPad
          )}
          portalContent={
            <Text
              //as="span"
              className={cx(
                "pointer-events-none absolute w-fit left-1/2 -translate-x-1/2 whitespace-pre rounded-sm bg-[#132820CC] dark:bg-neutral-700 px-1 py-[1px] text-white text-basic-10-auto-regular transition before:absolute before:left-1/2 before:-translate-x-1/2 before:border-2 before:border-transparent before:border-t-[#132820CC] dark:before:border-t-neutral-700 before:content-[''] opacity-100 z-[9999]",
                {
                  [`${top} before:top-full`]: position === "top",
                  "top-[calc(100%_+_0.4rem)] before:top-0":
                    position === "bottom",
                }
              )}
            >
              {tooltipText}
            </Text>
          }
        >
          {({ open, close }) => (
            <div
              onMouseEnter={open}
              onMouseLeave={close}
              className="flex items-center justify-center"
            >
              {children}
            </div>
          )}
        </PositioningPortalWithState>
      </div>
    </div>
  );
};
