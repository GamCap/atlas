import React, { ComponentPropsWithoutRef, createElement } from "react";

type BaseTextProps = {
  className?: string;
  children: React.ReactNode;
};

type LabelProps = ComponentPropsWithoutRef<"label">;
type SpanProps = ComponentPropsWithoutRef<"span">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;

export type TextProps = BaseTextProps &
  (
    | ({ as: "label" } & LabelProps)
    | ({ as: "span" } & SpanProps)
    | ({ as?: "p" } & ParagraphProps)
  );

export const Text = ({ as = "p", className, children, ...rest }: TextProps) => {
  const props = {
    className,
    ...(as === "label"
      ? (rest as LabelProps)
      : as === "span"
        ? (rest as SpanProps)
        : (rest as ParagraphProps)),
  };

  return createElement(as, props, children);
};
