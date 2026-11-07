export function focusLaboratoryRecipe(root: HTMLElement): void {
  root.querySelector<HTMLSelectElement>("#laboratory-recipe")?.focus();
}

export function focusLaboratoryIngredient(
  root: HTMLElement,
  ingredientId?: string,
): void {
  const selector =
    ingredientId === undefined
      ? "[data-laboratory-ingredient-id]"
      : `[data-laboratory-ingredient-id="${ingredientId}"]`;
  const button = root.querySelector<HTMLButtonElement>(selector);

  if (button !== null && !button.disabled) {
    button.focus({ preventScroll: true });
    return;
  }

  root
    .querySelector<HTMLButtonElement>(
      '[data-action="clear-laboratory-mixture"]',
    )
    ?.focus();
}

export function focusLaboratoryReaction(root: HTMLElement): void {
  const selector = root.querySelector<HTMLSelectElement>(
    "#laboratory-reaction",
  );

  if (selector !== null && !selector.disabled) {
    selector.focus({ preventScroll: true });
    return;
  }

  root
    .querySelector<HTMLButtonElement>(
      '[data-action="remove-laboratory-reaction"]',
    )
    ?.focus();
}
