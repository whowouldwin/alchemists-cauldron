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

const TOOLTIP_GAP = 8;
const VIEWPORT_MARGIN = 12;

export function getIngredientTooltipPosition(
  card: CardBounds,
  tooltip: Size,
  viewport: Size,
): { left: number; top: number } {
  const rightSide = card.right + TOOLTIP_GAP;
  const leftSide = card.left - TOOLTIP_GAP - tooltip.width;
  const fitsOnRight =
    rightSide + tooltip.width <= viewport.width - VIEWPORT_MARGIN;
  const fitsOnLeft = leftSide >= VIEWPORT_MARGIN;
  let left = fitsOnRight ? rightSide : leftSide;
  let top = card.top;

  if (!fitsOnRight && !fitsOnLeft) {
    left = card.left;
    const above = card.top - TOOLTIP_GAP - tooltip.height;

    top = above >= VIEWPORT_MARGIN ? above : card.bottom + TOOLTIP_GAP;
  } else if (top + tooltip.height > viewport.height - VIEWPORT_MARGIN) {
    top = card.bottom - tooltip.height;
  }

  return {
    left: clampToViewport(left, tooltip.width, viewport.width),
    top: clampToViewport(top, tooltip.height, viewport.height),
  };
}

function clampToViewport(
  position: number,
  size: number,
  viewportSize: number,
): number {
  const maximum = Math.max(
    VIEWPORT_MARGIN,
    viewportSize - size - VIEWPORT_MARGIN,
  );

  return Math.min(Math.max(position, VIEWPORT_MARGIN), maximum);
}
