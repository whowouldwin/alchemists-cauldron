export function getFocusedGameButton(
  applicationRoot: HTMLElement,
): HTMLButtonElement | null {
  const button = document.activeElement;

  if (
    !(button instanceof HTMLButtonElement) ||
    !applicationRoot.contains(button) ||
    button.closest(".game-content") === null ||
    !button.matches(":focus-visible")
  ) {
    return null;
  }

  return button;
}

export function restoreGameButtonFocus(
  applicationRoot: HTMLElement,
  previousButton: HTMLButtonElement | null,
): void {
  const gameContent = applicationRoot.querySelector(
    ".game-content:not([inert])",
  );

  if (previousButton === null || gameContent === null) {
    return;
  }

  const buttons = Array.from(
    gameContent.querySelectorAll<HTMLButtonElement>("button"),
  );
  const previousIndex = buttons.findIndex((button) =>
    previousButton.dataset.ingredientId !== undefined
      ? button.dataset.ingredientId === previousButton.dataset.ingredientId
      : button.dataset.action === previousButton.dataset.action,
  );
  const replacement = buttons[previousIndex];

  if (replacement !== undefined && !replacement.disabled) {
    replacement.focus({ preventScroll: true });
    return;
  }

  const nextButton =
    buttons.find(
      (button, index) => index > previousIndex && isAvailableIngredient(button),
    ) ??
    buttons.find(isAvailableIngredient) ??
    buttons.find(
      (button) => button.dataset.action === "brew" && !button.disabled,
    );

  nextButton?.focus();
}

function isAvailableIngredient(button: HTMLButtonElement): boolean {
  return button.dataset.ingredientId !== undefined && !button.disabled;
}
