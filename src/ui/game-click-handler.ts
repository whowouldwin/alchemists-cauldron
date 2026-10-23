export interface GameClickActions {
  readonly startGame: () => void;
  readonly brew: () => void;
  readonly addIngredient: (ingredientId: string) => void;
}

export function createGameClickHandler(
  actions: GameClickActions,
): (event: MouseEvent) => void {
  return (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const startButton = event.target.closest<HTMLButtonElement>(
      '[data-action="start-game"]',
    );

    if (startButton !== null) {
      actions.startGame();
      return;
    }

    const brewButton = event.target.closest<HTMLButtonElement>(
      '[data-action="brew"]',
    );

    if (brewButton !== null) {
      if (!brewButton.disabled) {
        actions.brew();
      }
      return;
    }

    const ingredientButton = event.target.closest<HTMLButtonElement>(
      "[data-ingredient-id]",
    );

    if (ingredientButton === null || ingredientButton.disabled) {
      return;
    }

    const ingredientId = ingredientButton.dataset.ingredientId;

    if (ingredientId !== undefined) {
      actions.addIngredient(ingredientId);
    }
  };
}
