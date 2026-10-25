interface CardBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

interface Size {
  readonly width: number;
  readonly height: number;
}

type TooltipSide = "right" | "left" | "top" | "bottom";

interface TooltipPosition {
  readonly left: number;
  readonly top: number;
  readonly side: TooltipSide;
  readonly arrowOffset: number;
}

const TOOLTIP_GAP = 12;
const VIEWPORT_MARGIN = 12;
const ARROW_MARGIN = 14;

export function getIngredientTooltipPosition(
  card: CardBounds,
  tooltip: Size,
  viewport: Size,
): TooltipPosition {
  const rightSide = card.right + TOOLTIP_GAP;
  const leftSide = card.left - TOOLTIP_GAP - tooltip.width;
  const fitsOnRight =
    rightSide + tooltip.width <= viewport.width - VIEWPORT_MARGIN;
  const fitsOnLeft = leftSide >= VIEWPORT_MARGIN;
  let side: TooltipSide = fitsOnRight ? "right" : "left";
  let left = fitsOnRight ? rightSide : leftSide;
  let top = (card.top + card.bottom - tooltip.height) / 2;

  if (!fitsOnRight && !fitsOnLeft) {
    left = card.left;
    const above = card.top - TOOLTIP_GAP - tooltip.height;

    side = above >= VIEWPORT_MARGIN ? "top" : "bottom";
    top = side === "top" ? above : card.bottom + TOOLTIP_GAP;
  } else if (top + tooltip.height > viewport.height - VIEWPORT_MARGIN) {
    top = card.bottom - tooltip.height;
  }

  left = clamp(
    left,
    VIEWPORT_MARGIN,
    viewport.width - tooltip.width - VIEWPORT_MARGIN,
  );
  top = clamp(
    top,
    VIEWPORT_MARGIN,
    viewport.height - tooltip.height - VIEWPORT_MARGIN,
  );

  const isBesideCard = side === "right" || side === "left";
  const arrowTarget = isBesideCard
    ? (card.top + card.bottom) / 2 - top
    : (card.left + card.right) / 2 - left;
  const arrowLimit =
    (isBesideCard ? tooltip.height : tooltip.width) - ARROW_MARGIN;

  return {
    left,
    top,
    side,
    arrowOffset: clamp(arrowTarget, ARROW_MARGIN, arrowLimit),
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(value, maximum));
}
