import React from "react";

enum POSITION {
  TOP = "top",
  LEFT = "left",
  RIGHT = "right",
  BOTTOM = "bottom",
}

export interface PortalContentRenderProps<Strategy> {
  close: () => void;
  isOpen: boolean;
  isPositioned: boolean;
  strategy: Strategy;
  relatedWidth: number;
  relatedHeight: number;
  transitionStarted: () => void;
  transitionEnded: () => void;
}

export interface Props<Strategy> {
  children: React.ReactNode;
  portalElement?: React.ReactElement;
  portalContent:
    | React.ReactNode
    | ((params: PortalContentRenderProps<Strategy>) => React.ReactNode);
  onOpen?: () => void;
  onClose?: () => void;
  onShouldClose?: () => void;
  closeOnOutsideClick?: boolean;
  closeOnKeyDown?: (event: KeyboardEvent) => boolean;
  isOpen?: boolean;
  positionStrategy?: PositioningStrategy<Strategy>;
  rootNode?: HTMLElement;
}

export type PositioningStrategy<Strategy> = (
  parentRect: DOMRect,
  portalRect: DOMRect,
  props: Props<Strategy>
) => {
  top: number;
  left: number;
  strategy: Strategy;
};

export const positionStrategy: (
  preferredPosition: POSITION,
  additionalPadding?: number
) => PositioningStrategy<{
  position: POSITION;
  shift: number;
}> =
  (preferredPosition, additionalPadding = 15) =>
  (parentRect, portalRect) => {
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const body = window.document.documentElement || window.document.body;

    const horizontalCenter = (parentRect.width - portalRect.width) / 2;
    const verticalCenter = (parentRect.height - portalRect.height) / 2;
    //const additionalPadding = 15;

    const positions = {
      [POSITION.BOTTOM]: {
        position: POSITION.BOTTOM,
        top: parentRect.top + parentRect.height + scrollY + additionalPadding,
        left: parentRect.left + scrollX + horizontalCenter,
        enoughSpace:
          parentRect.top +
            parentRect.height +
            portalRect.height +
            additionalPadding <
          body.clientHeight,
      },
      [POSITION.TOP]: {
        position: POSITION.TOP,
        top: parentRect.top - portalRect.height + scrollY - additionalPadding,
        left: parentRect.left + scrollX + horizontalCenter,
        enoughSpace: parentRect.top - portalRect.height - additionalPadding > 0,
      },
      [POSITION.LEFT]: {
        position: POSITION.LEFT,
        top: parentRect.top + scrollY + verticalCenter,
        left: parentRect.left + scrollX - portalRect.width - additionalPadding,
        enoughSpace: parentRect.left - portalRect.width - additionalPadding > 0,
      },
      [POSITION.RIGHT]: {
        position: POSITION.RIGHT,
        top: parentRect.top + scrollY + verticalCenter,
        left: parentRect.left + scrollX + parentRect.width + additionalPadding,
        enoughSpace:
          parentRect.left +
            parentRect.width +
            portalRect.width +
            additionalPadding <
          body.clientWidth,
      },
    };

    // Horizontal fallback preferred
    let sortedPositions = [
      positions[preferredPosition],
      positions[POSITION.BOTTOM],
      positions[POSITION.TOP],
      positions[POSITION.RIGHT],
      positions[POSITION.LEFT],
    ];

    // Vertical fallback preferred
    if (
      preferredPosition === POSITION.LEFT ||
      preferredPosition === POSITION.RIGHT
    ) {
      sortedPositions = [
        positions[preferredPosition],
        positions[POSITION.RIGHT],
        positions[POSITION.LEFT],
        positions[POSITION.BOTTOM],
        positions[POSITION.TOP],
      ];
    }

    const pickedPosition =
      sortedPositions.find(({ enoughSpace }) => enoughSpace) ||
      positions[preferredPosition];

    const finalTop = Math.max(
      Math.min(
        pickedPosition.top,
        body.clientHeight + scrollY - portalRect.height
      ),
      scrollY
    );
    const shiftY = Math.max(
      Math.min(
        finalTop - pickedPosition.top,
        portalRect.height / 2 - additionalPadding
      ),
      portalRect.height / -2 + additionalPadding
    );

    const finalLeft = Math.max(
      Math.min(
        pickedPosition.left,
        body.clientWidth + scrollX - portalRect.width
      ),
      scrollX
    );
    const shiftX = Math.max(
      Math.min(
        finalLeft - pickedPosition.left,
        portalRect.width / 2 - additionalPadding
      ),
      portalRect.width / -2 + additionalPadding
    );

    return {
      top: Math.max(
        Math.min(
          pickedPosition.top,
          body.clientHeight + scrollY - portalRect.height
        ),
        scrollY
      ),
      left: Math.max(
        Math.min(
          pickedPosition.left,
          body.clientWidth + scrollX - portalRect.width
        ),
        scrollX
      ),
      strategy: {
        position: pickedPosition.position,
        shift:
          pickedPosition.position === "top" ||
          pickedPosition.position === "bottom"
            ? shiftX
            : shiftY,
      },
    };
  };
