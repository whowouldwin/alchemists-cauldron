import { getIngredientTooltipPosition } from "./ingredient-tooltip-position.ts";

const VISIBLE_CLASS = "ingredient-card--tooltip-visible";

export function initializeIngredientTooltips(root: HTMLElement): void {
  const showTooltip = (event: PointerEvent | FocusEvent): void => {
    const card = findIngredientCard(event.target);

    if (
      card === null ||
      card.closest("[inert]") !== null ||
      (event.relatedTarget instanceof Node &&
        card.contains(event.relatedTarget))
    ) {
      return;
    }

    if (card.querySelector(".ingredient-tooltip") === null) {
      return;
    }

    hideTooltips(root);
    card.classList.add(VISIBLE_CLASS);
    positionTooltip(card);
  };

  const hideInactiveTooltip = (event: PointerEvent | FocusEvent): void => {
    const card = findIngredientCard(event.target);

    if (
      card !== null &&
      !card.contains(document.activeElement) &&
      !card.matches(":hover")
    ) {
      card.classList.remove(VISIBLE_CLASS);
    }
  };

  const repositionTooltips = (): void => {
    root
      .querySelectorAll<HTMLElement>(`.${VISIBLE_CLASS}`)
      .forEach(positionTooltip);
  };

  root.addEventListener("pointerover", showTooltip);
  root.addEventListener("focusin", showTooltip);
  root.addEventListener("pointerout", hideInactiveTooltip);
  root.addEventListener("focusout", hideInactiveTooltip);
  root.addEventListener("dragstart", () => hideTooltips(root));
  root.addEventListener("click", preventTooltipClick, { capture: true });
  window.addEventListener("resize", repositionTooltips);
  window.addEventListener("scroll", repositionTooltips, {
    capture: true,
    passive: true,
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideTooltips(root);
    }
  });
}

function findIngredientCard(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest(".ingredient-card") : null;
}

function hideTooltips(root: HTMLElement): void {
  root.querySelectorAll(`.${VISIBLE_CLASS}`).forEach((card) => {
    card.classList.remove(VISIBLE_CLASS);
  });
}

function positionTooltip(card: HTMLElement): void {
  const tooltip = card.querySelector<HTMLElement>(".ingredient-tooltip");

  if (tooltip === null) {
    return;
  }

  const bounds = card.getBoundingClientRect();
  const viewport = {
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  };

  if (bounds.bottom <= 0 || bounds.top >= viewport.height) {
    card.classList.remove(VISIBLE_CLASS);
    return;
  }

  const position = getIngredientTooltipPosition(
    bounds,
    tooltip.getBoundingClientRect(),
    viewport,
  );

  tooltip.style.left = `${position.left - bounds.left - card.clientLeft}px`;
  tooltip.style.top = `${position.top - bounds.top - card.clientTop}px`;
}

function preventTooltipClick(event: MouseEvent): void {
  if (
    event.target instanceof Element &&
    event.target.closest(".ingredient-tooltip") !== null
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
}
